import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { OptionType } from '../../SearchForm'
import { ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
import { EndBoundsType, LATITUDE_OFFSET, LONGITUDE_OFFSET, MapLegendType } from '..'
import {
	GetPlantYieldAreaDtoOut,
	GetProductYieldAreaDtoOut,
	GetReplantYieldAreaDtoOut,
} from '@interface/dto/yield-area/yield-area.dto-out'
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material'
import classNames from 'classnames'
import { Close } from '@mui/icons-material'
import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { useSession } from 'next-auth/react'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { useTranslation } from 'next-i18next'
import { Feature, GeoJsonProperties, Geometry, MultiPolygon, Polygon } from 'geojson'
import { Languages } from '@/enum'
import { formatDate } from '@/utils/date'
import { defaultNumber } from '@/utils/text'
import { GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import { CsvIcon, MiniMapCompassIcon, PdfIcon } from '@/components/svg/MenuIcon'
import { BasemapType } from '@/components/common/map/interface/map'
import { findPolygonsInsideBoundary } from '@/utils/geometry'
import { LngLatBoundsLike } from 'maplibre-gl'
import { thaiExtent } from '@/config/app.config'
import { GeoJsonLayer, PolygonLayer } from '@deck.gl/layers'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { captureMapControlImage, captureMapWithControl } from '@/utils/capture'
import { exportPdf } from '@/utils/export-pdf'
import { FillStyleExtension } from '@deck.gl/extensions'
import { centroid } from '@turf/turf'
pdfMake.vfs = pdfFonts.vfs

const PLANT_MAP_EXPORT = 'plant-map-export'
const PLANT_MINI_MAP_EXPORT = 'plant-mini-map-export'

const GRID_COLS = 4
const GRID_ROWS = 3

const PLANT_MAP_WIDTH = 688
const PLANT_MAP_HEIGHT = 423
const PLANT_MINI_MAP_WIDTH = 215
const PLANT_MINI_MAP_HEIGHT = 287

interface PrintPlantMapDialogProps {
	className?: string
	open: boolean
	currentAdmOption: OptionType | null
	selectedRepeatArea: GetRepeatAreaLookupDtoOut | undefined
	defaultMapEndBounds: EndBoundsType
	mapTypeArray: yieldMapTypeCode[]
	mapLegendArray: MapLegendType[]
	yieldLegendNumber: any
	selectedDateRange: Date[]
	plantYieldAreaData: GetPlantYieldAreaDtoOut[]
	productYieldAreaData: GetProductYieldAreaDtoOut[]
	replantYieldAreaData: GetReplantYieldAreaDtoOut[]
	defaultMiniMapExtent: number[][] | null
	plantMapGeometry: number[][] | null
	loading?: boolean
	onClose: () => void
}

const PrintPlantMapDialog: React.FC<PrintPlantMapDialogProps> = ({
	className = '',
	open,
	currentAdmOption,
	selectedRepeatArea,
	defaultMapEndBounds,
	mapTypeArray,
	mapLegendArray,
	yieldLegendNumber,
	selectedDateRange,
	plantYieldAreaData,
	productYieldAreaData,
	replantYieldAreaData,
	defaultMiniMapExtent,
	plantMapGeometry,
	loading,
	onClose,
}) => {
	const { mapLibre, overlays, basemap } = useMapStore()
	const { data: session } = useSession()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const quantityLang = `common:${quantityUnit}`
	const areaLang = `common:${areaUnit}`
	const { t, i18n } = useTranslation(['map-analyze', 'common'])
	const language = i18n.language as keyof ResponseLanguage

	const [mapEndBounds, setMapEndBounds] = useState<EndBoundsType>(defaultMapEndBounds)
	const [mapExtent, setMapExtent] = useState<number[][]>([])
	const [miniMapExtent, setMiniMapExtent] = useState<number[][] | null>(defaultMiniMapExtent)
	const [isCapturing, setIsCapturing] = useState<boolean>(false)

	const [plantData, setPlantData] = useState<Feature<Polygon | MultiPolygon>[]>([])
	const [productData, setProductData] = useState<Feature<Polygon | MultiPolygon>[]>([])
	const [replantData, setReplantData] = useState<Feature<Polygon | MultiPolygon>[]>([])

	const plantMapExport = useMemo(() => mapLibre[PLANT_MAP_EXPORT], [mapLibre])
	const plantOverlayExport = useMemo(() => overlays[PLANT_MAP_EXPORT], [overlays])
	const plantMiniMapExport = useMemo(() => mapLibre[PLANT_MINI_MAP_EXPORT], [mapLibre])
	const plantMiniOverlayExport = useMemo(() => overlays[PLANT_MINI_MAP_EXPORT], [overlays])

	// map event
	useEffect(() => {
		if (plantMapExport) {
			plantMapExport.on('moveend', () => {
				const bound = plantMapExport.getBounds()
				const sw = bound.getSouthWest()
				const ne = bound.getNorthEast()
				const extent = [
					[sw.lng, sw.lat],
					[ne.lng, sw.lat],
					[ne.lng, ne.lat],
					[sw.lng, ne.lat],
					[sw.lng, sw.lat],
				]
				setMapExtent(extent)

				const currentCenter = plantMapExport.getCenter()
				const miniMapExtent = [
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
				]
				setMiniMapExtent(miniMapExtent)

				const plantData = findPolygonsInsideBoundary(plantYieldAreaData as any, extent)
				const productData = findPolygonsInsideBoundary(productYieldAreaData as any, extent)
				const replantData = findPolygonsInsideBoundary(replantYieldAreaData as any, extent)

				setPlantData(plantData)
				setProductData(productData)
				setReplantData(replantData)

				setMapEndBounds({
					xmin: bound.getWest(),
					xmax: bound.getEast(),
					ymin: bound.getSouth(),
					ymax: bound.getNorth(),
				})
			})
		}
	}, [plantMapExport, plantYieldAreaData, productYieldAreaData, replantYieldAreaData])

	// initial plant map zoom
	useEffect(() => {
		if (plantMapExport) {
			if (plantMapGeometry) {
				plantMapExport.fitBounds(plantMapGeometry as LngLatBoundsLike, { padding: 0 })
			}
		}
	}, [plantMapExport, plantMapGeometry])

	// initial plant mini map zoom
	useEffect(() => {
		if (plantMiniMapExport) {
			plantMiniMapExport.fitBounds(thaiExtent, { padding: 0 })
		}
	}, [plantMiniMapExport])

	// update layer
	useEffect(() => {
		if (plantMapExport && plantOverlayExport) {
			//#region deck.gl layer
			const layers = [
				new GeoJsonLayer({
					id: 'plant-export',
					beforeId: 'custom-referer-layer',
					data: plantYieldAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [138, 182, 45, 180],
					getLineColor: () => [138, 182, 45, 180],
				}),

				new GeoJsonLayer({
					id: 'product-export',
					beforeId: 'custom-referer-layer',
					data: productYieldAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: (d: any) => {
						if (d.properties.product.ton.rai > 15) {
							return [0, 52, 145, 180]
						} else if (d.properties.product.ton.rai >= 10 && d.properties.product.ton.rai <= 15) {
							return [29, 178, 64, 180]
						} else if (d.properties.product.ton.rai >= 5 && d.properties.product.ton.rai < 10) {
							return [240, 233, 39, 180]
						} else if (d.properties.product.ton.rai < 5) {
							return [255, 149, 0, 180]
						} else {
							return [0, 0, 0, 0]
						}
					},
					getLineColor: (d: any) => {
						if (d.properties.product.ton.rai > 15) {
							return [0, 52, 145, 180]
						} else if (d.properties.product.ton.rai >= 10 && d.properties.product.ton.rai <= 15) {
							return [29, 178, 64, 180]
						} else if (d.properties.product.ton.rai >= 5 && d.properties.product.ton.rai < 10) {
							return [240, 233, 39, 180]
						} else if (d.properties.product.ton.rai < 5) {
							return [255, 149, 0, 180]
						} else {
							return [0, 0, 0, 0]
						}
					},
				}),

				new GeoJsonLayer({
					id: 'replant-export',
					beforeId: 'custom-referer-layer',
					data: replantYieldAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [138, 182, 45, 180],
					getLineColor: () => [138, 182, 45, 180],

					fillPatternMask: true,
					fillPatternAtlas: '/images/map/pattern.png',
					fillPatternMapping: {
						pattern: {
							x: 4,
							y: 4,
							width: 120,
							height: 120,
							mask: true,
						},
					},
					getFillPattern: () => 'pattern',
					getFillPatternScale: 1,
					getFillPatternOffset: [0, 0],
					extensions: [new FillStyleExtension({ pattern: true })],
				}),
			]

			plantOverlayExport.setProps({ layers: [layers] })
			//#endregion
		}
	}, [plantYieldAreaData, productYieldAreaData, replantYieldAreaData, plantMapExport, plantOverlayExport])

	useEffect(() => {
		if (plantMapExport) {
			//#region heatmap layer

			//update heat data
			if (plantMapExport?.getSource('heat') && plantMapExport?.getLayer('heat-layer-export')) {
				plantMapExport.removeLayer('heat-layer-export')
				plantMapExport.removeSource('heat')
			}

			if (!plantMapExport.getSource('heat') && productYieldAreaData.length > 0) {
				plantMapExport.addSource('heat', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: productYieldAreaData.map((item) => {
							return {
								...item,
								geometry: {
									type: 'Point',
									coordinates: centroid(item.geometry as any).geometry.coordinates,
								},
							}
						}) as Feature<Geometry, GeoJsonProperties>[],
					},
				})
			}
			if (!plantMapExport.getLayer('heat-layer-export') && productYieldAreaData.length > 0) {
				plantMapExport.addLayer({
					id: 'heat-layer-export',
					type: 'heatmap',
					source: 'heat',
					maxzoom: 9,
					paint: {
						'heatmap-color': [
							'interpolate',
							['linear'],
							['heatmap-density'],
							0,
							'rgba(33,102,172,0)',
							0.2,
							'rgb(103,169,207)',
							0.4,
							'rgb(209,229,240)',
							0.6,
							'rgb(253,219,199)',
							0.8,
							'rgb(239,138,98)',
							1,
							'rgb(178,24,43)',
						],
						'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 1, 6, 3, 9, 8],
						'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1, 9, 0],
					},
				})
			}
			//#endregion
		}
	}, [plantYieldAreaData, plantMapExport, plantOverlayExport, productYieldAreaData, replantYieldAreaData])

	useEffect(() => {
		if (plantMiniMapExport && plantMiniOverlayExport && miniMapExtent) {
			const layers = [
				new PolygonLayer({
					id: 'mini-map-export',
					data: [
						{
							type: 'Feature',
							geometry: {
								type: 'Polygon',
								coordinates: [miniMapExtent],
							},
						},
					],
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 2,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [255, 255, 255, 0],
					getLineColor: () => [255, 204, 0, 180],
				}),
			]

			plantMiniOverlayExport.setProps({ layers: [layers] })
		}
	}, [plantMiniMapExport, plantMiniOverlayExport, miniMapExtent])

	const gridColsArray = useMemo(
		() =>
			Array.from({ length: GRID_COLS - 1 }).map((_, index) => {
				const gap = mapEndBounds.xmax - mapEndBounds.xmin
				return {
					key: 'col' + index,
					percent: ((index + 1) / GRID_COLS) * 100,
					value: (mapEndBounds.xmin + ((index + 1) / GRID_COLS) * gap).toFixed(5),
				}
			}),
		[mapEndBounds.xmax, mapEndBounds.xmin],
	)

	const gridRowsArray = useMemo(
		() =>
			Array.from({ length: GRID_ROWS - 1 }).map((_, index) => {
				const gap = mapEndBounds.ymax - mapEndBounds.ymin
				return {
					key: 'row' + index,
					percent: ((index + 1) / GRID_ROWS) * 100,
					value: (mapEndBounds.ymin + ((index + 1) / GRID_ROWS) * gap).toFixed(5),
				}
			}),
		[mapEndBounds.ymax, mapEndBounds.ymin],
	)

	const displayDialogTitle = useMemo(() => {
		const mapType = mapLegendArray.map((item, index) => {
			if (mapLegendArray.length > 1 && index === mapLegendArray.length - 1) {
				return t('common:and') + (language === Languages.EN ? ' ' : '') + item.title
			}

			return item.title
		})

		return t('common:mapDisplayData') + (language === Languages.EN ? ' ' : '') + mapType.join(' ')
	}, [mapLegendArray, t, language])

	const displaySelectedDateRange = useMemo(() => {
		if (selectedDateRange[0].toString() === selectedDateRange[1].toString()) {
			return selectedDateRange[0] ? formatDate(selectedDateRange[0], 'dd MMMM yyyy', language) : ''
		} else {
			const startDate = selectedDateRange[0] ? formatDate(selectedDateRange[0], 'dd MMMM yyyy', language) : ''
			const endDate = selectedDateRange[1] ? formatDate(selectedDateRange[1], 'dd MMMM yyyy', language) : ''
			return `${startDate} - ${endDate}`
		}
	}, [selectedDateRange, language])

	const handlePlantMapPdfExport = useCallback(async () => {
		try {
			setIsCapturing(true)

			const style = document.createElement('style')
			document.head.appendChild(style)
			style.sheet?.insertRule('body > div:last-child img { display: inline-block; }')

			const plantMap = mapLibre[PLANT_MAP_EXPORT]
			const plantMiniMap = mapLibre[PLANT_MINI_MAP_EXPORT]
			const plantMapElement = document.getElementById('plant-map-export-container')
			const plantMiniMapElement = document.getElementById('plant-mini-map-export-container')
			if (!plantMapElement || !plantMiniMapElement) {
				console.error('Plant map export container not found!')
				return
			}
			const plantMapControlElement = plantMapElement.querySelector('.maplibregl-ctrl-bottom-right') as HTMLElement
			const plantMiniMapControlElement = plantMiniMapElement.querySelector(
				'.maplibregl-ctrl-bottom-right',
			) as HTMLElement

			if (plantMap && plantMiniMap && plantMapControlElement && plantMiniMapControlElement) {
				const [mapImage, miniMapImage, plantMapControlImage, plantMiniMapControlImage] = await Promise.all([
					plantMap.getCanvas().toDataURL('image/png'),
					plantMiniMap.getCanvas().toDataURL('image/png'),
					captureMapControlImage(plantMapControlElement),
					captureMapControlImage(plantMiniMapControlElement),
				])

				const plantMapImage = await captureMapWithControl(
					mapImage,
					plantMapControlImage ?? '',
					PLANT_MAP_WIDTH,
					PLANT_MAP_HEIGHT,
				)

				const plantMiniMapImage = await captureMapWithControl(
					miniMapImage,
					plantMiniMapControlImage ?? '',
					PLANT_MINI_MAP_WIDTH,
					PLANT_MINI_MAP_HEIGHT,
				)

				const capturedPlantMapElement = document.querySelector('.captured-map-image') as HTMLImageElement
				const capturedPlantMiniMapElement = document.querySelector(
					'.captured-mini-map-image',
				) as HTMLImageElement

				if (capturedPlantMapElement && capturedPlantMiniMapElement) {
					capturedPlantMapElement.src = plantMapImage
					capturedPlantMiniMapElement.src = plantMiniMapImage
					await new Promise((resolve) => setTimeout(resolve, 100))
				} else {
					console.error('Image element not found!')
				}

				const dialogDiv: HTMLDivElement | null = document.querySelector('.hidden-dialog .MuiDialog-paper')

				if (dialogDiv) {
					await exportPdf({ dialogDiv: dialogDiv, fileName: 'plant_map' })
				}
			} else {
				console.error('Map is not loaded yet!')
			}
		} catch (error) {
			console.error('Error capturing plant map:', error)
		} finally {
			setIsCapturing(false)
		}
	}, [mapLibre])

	return (
		<div className='relative'>
			<Dialog
				className={classNames('', className)}
				open={open}
				onClose={(_event, reason) => {
					if (reason !== 'backdropClick') {
						onClose()
					}
				}}
				PaperProps={{
					className: 'w-[1025px] !max-w-none lg:h-[627px] !m-6 !rounded-[15px] !bg-primary',
				}}
			>
				<DialogTitle className='flex items-center gap-2 !py-3 max-lg:!px-5'>
					<Typography className='flex-1 !text-md !leading-5 text-white'>{displayDialogTitle}</Typography>
					<IconButton className='!p-1.5' aria-label='close' onClick={onClose}>
						<Close className='text-white' />
					</IconButton>
				</DialogTitle>
				<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !py-4 max-lg:!px-4'>
					{loading ? (
						<div className='flex h-full w-full items-center justify-center'>
							<CircularProgress />
						</div>
					) : (
						<Box className='flex h-full w-full items-center gap-5 max-lg:flex-col lg:gap-6'>
							<Box className='flex h-full flex-1 flex-col gap-4 max-lg:w-full'>
								<Box className='relative aspect-[738/473] w-full border border-solid border-black p-4 lg:p-6'>
									<Box
										id='plant-map-export-container'
										className='flex h-full w-full [&_.map-tools]:hidden [&_.maplibregl-compact]:!mb-[42px] [&_.maplibregl-compact]:max-sm:!box-border [&_.maplibregl-compact]:max-sm:!h-4 [&_.maplibregl-compact]:max-sm:!min-h-0 [&_.maplibregl-compact]:max-sm:!pr-4 [&_.maplibregl-ctrl-attrib-button]:max-sm:!h-4 [&_.maplibregl-ctrl-attrib-button]:max-sm:!w-4 [&_.maplibregl-ctrl-attrib-button]:max-sm:!bg-contain [&_.maplibregl-ctrl-attrib-inner]:max-sm:text-[8px] [&_.maplibregl-ctrl-attrib-inner]:max-sm:leading-3 [&_.maplibregl-ctrl-bottom-right]:!z-[0] [&_.maplibregl-ctrl-scale]:!mb-0'
									>
										<MapView mapId={PLANT_MAP_EXPORT} />
									</Box>

									{/* Map's legend */}
									<Box
										className={classNames(
											'z-1 absolute bottom-[22px] left-[22px] flex max-w-[calc(100%-48px)] items-center gap-3 overflow-auto rounded-[5px] bg-white py-1 pl-[5px] pr-[7px] sm:pl-2 sm:pr-3 lg:bottom-8 lg:left-8 lg:max-w-[calc(100%-68px)]',
											{
												'!hidden':
													mapTypeArray.length === 0 && selectedRepeatArea === undefined,
											},
										)}
									>
										<Box
											className={classNames('hidden shrink-0 items-center gap-1.5', {
												'!flex': mapTypeArray.includes(yieldMapTypeCode.plant),
											})}
										>
											<Box className='h-3 w-3 rounded-full bg-[#8AB62D]'></Box>
											<Typography className='!text-2xs text-black'>
												{t('plantingArea')}
											</Typography>
										</Box>
										<Box
											className={classNames('hidden shrink-0 items-center gap-3', {
												'!flex': mapTypeArray.includes(yieldMapTypeCode.product),
											})}
										>
											<Box className={'flex items-center gap-1.5'}>
												<Box className='h-3 w-3 rounded-full bg-[#003491]'></Box>
												<Typography className='!text-2xs text-black'>{`${t('moreThan')} ${defaultNumber(yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
											</Box>
											<Box className={'flex items-center gap-1.5'}>
												<Box className='h-3 w-3 rounded-full bg-[#1DB240]'></Box>
												<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber.ten, 6)}-${defaultNumber(yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
											</Box>
											<Box className={'flex items-center gap-1.5'}>
												<Box className='h-3 w-3 rounded-full bg-[#F0E927]'></Box>
												<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber.five, 6)}-${defaultNumber(yieldLegendNumber.nine, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
											</Box>
											<Box className={'flex items-center gap-1.5'}>
												<Box className='h-3 w-3 rounded-full bg-[#FF9500]'></Box>
												<Typography className='!text-2xs text-black'>{`${t('lessThan')} ${defaultNumber(yieldLegendNumber.five, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
											</Box>
										</Box>
										<Box
											className={classNames('hidden shrink-0 items-center gap-1.5', {
												'!flex': selectedRepeatArea,
											})}
										>
											<Box className='h-3 w-3 rotate-[45deg] rounded-full bg-[repeating-linear-gradient(to_right,#8AB62D_0px,#8AB62D_1px,#ffffff_1px,#ffffff_2px)]'></Box>
											<Typography className='!text-2xs text-black'>{`${t('replantingArea')} ${selectedRepeatArea?.name ?? '-'} ${t('common:year')}`}</Typography>
										</Box>
									</Box>

									{/* Vertical Lines */}
									{gridColsArray.map((gridCol) => {
										return (
											<React.Fragment key={gridCol.key}>
												<div
													className='absolute top-0 h-full w-[1px] bg-black'
													style={{ left: gridCol.percent + '%' }}
												/>

												{/* Top Label */}
												<span
													className='absolute -top-4 -translate-x-1/2 text-2xs text-black'
													style={{ left: gridCol.percent + '%' }}
												>
													{gridCol.value}
												</span>

												{/* Bottom Label */}
												<span
													className='absolute -bottom-4 -translate-x-1/2 text-2xs text-black'
													style={{ left: gridCol.percent + '%' }}
												>
													{gridCol.value}
												</span>
											</React.Fragment>
										)
									})}

									{/* Horizontal Lines */}
									{gridRowsArray.map((gridRow) => {
										return (
											<React.Fragment key={gridRow.key}>
												<div
													className='absolute left-0 h-[1px] w-full bg-black'
													style={{ bottom: gridRow.percent + '%' }}
												/>

												{/* Left Label */}
												<span
													className='absolute -left-2 -translate-x-1/2 translate-y-1/2 -rotate-90 transform text-2xs text-black'
													style={{ bottom: gridRow.percent + '%' }}
												>
													{gridRow.value}
												</span>

												{/* Right Label */}
												<span
													className='absolute -right-2 translate-x-1/2 translate-y-1/2 rotate-90 transform text-2xs text-black'
													style={{ bottom: gridRow.percent + '%' }}
												>
													{gridRow.value}
												</span>
											</React.Fragment>
										)
									})}
								</Box>
								<Typography className='w-full flex-1 !text-2xs !leading-5 text-[#707070] max-lg:hidden'>
									{(language === Languages.TH
										? 'จุดความร้อนจากดาวเทียม  VIIRS, MODIS / ร่องรอยเผาไหม้จากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-2 / พื้นที่ปลูกอ้อยจากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-1, Sentinel-2'
										: 'Hotspots from VIIRS, MODIS satellites / Burn scars analyzed from Sentinel-2 satellite data / Sugarcane plantation areas analyzed from Sentinel-1, Sentinel-2 satellite data') +
										` (${displaySelectedDateRange})`}
								</Typography>
							</Box>
							<Box className='flex h-full w-full flex-col items-center lg:w-[22%]'>
								<Box className='relative aspect-[215/287] w-full'>
									<Box
										id='plant-mini-map-export-container'
										className='flex h-full w-full [&_.map-tools]:hidden [&_.maplibregl-ctrl-attrib-inner]:text-[6px] [&_.maplibregl-ctrl-scale]:hidden'
									>
										<MapView mapId={PLANT_MINI_MAP_EXPORT} isInteractive={false} />
									</Box>

									<Box className='absolute right-[5px] top-[5px]'>
										<MiniMapCompassIcon
											fill={basemap === BasemapType.CartoLight ? 'black' : 'white'}
										/>
									</Box>
								</Box>
								<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
									<Box className='flex w-full flex-col gap-2 lg:gap-1.5'>
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
												{t('common:date')}
											</Typography>
											<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
												{formatDate(Date.now(), 'dd MMMM yyyy', language)}
											</Typography>
										</Box>
										{mapLegendArray.map((item) => item.type).includes(yieldMapTypeCode.plant) && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
													{t('plantingArea')}
												</Typography>
												<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
													{`${defaultNumber(plantData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
												</Typography>
											</Box>
										)}
										{mapLegendArray.map((item) => item.type).includes(yieldMapTypeCode.product) && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
													{t('sugarCaneYield')}
												</Typography>
												<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
													{`${defaultNumber(productData.reduce((total, item) => total + (item.properties?.volumn?.[quantityUnit] ?? 0), 0))} ${t('common:' + quantityUnit)}`}
												</Typography>
											</Box>
										)}
										{mapLegendArray.map((item) => item.type).includes(yieldMapTypeCode.repeat) && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
													{t('replantingArea')}
												</Typography>
												<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
													{`${defaultNumber(replantData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
												</Typography>
											</Box>
										)}
									</Box>
									<Box className='flex w-full flex-col gap-6 lg:gap-3'>
										<Typography className='!text-sm text-[#707070] lg:!text-2xs'>
											{language === Languages.TH
												? 'กลุ่มเทคโนโลยีสารสนเทศและการสื่อสาร  0-2430-6813 ต่อ 3825'
												: 'Information and Communication Technology Group, Office of the Cane and Sugar Board, 0-2430-6813 extension 3825'}
										</Typography>
										<Box className='flex w-full items-center justify-between'>
											<Button
												className='flex h-[38px] w-[84px] items-center gap-1.5 !rounded-[5px] !bg-white !px-5 !py-2.5 !shadow-none hover:!shadow-none [&_.MuiButton-icon]:m-0'
												variant='contained'
												startIcon={<PdfIcon />}
												onClick={handlePlantMapPdfExport}
												disabled={isCapturing}
											>
												<Box className='!text-xs text-primary'>{'PDF'}</Box>
											</Button>
											<Button
												className={classNames(
													'flex h-[38px] w-[84px] items-center gap-1.5 !rounded-[5px] !px-5 !py-2.5 !shadow-none hover:!shadow-none [&_.MuiButton-icon]:m-0',
													{
														'!bg-white': mapLegendArray.length > 0,
														'!bg-background': mapLegendArray.length === 0,
													},
												)}
												variant='contained'
												startIcon={
													<CsvIcon fill={mapLegendArray.length === 0 ? '#d6d6d6' : ''} />
												}
												// onClick={handleBurntMapCsvExport}
												disabled={mapLegendArray.length === 0 || isCapturing}
											>
												<Box
													className={classNames('!text-xs text-primary', {
														'!text-gray': mapLegendArray.length === 0,
													})}
												>
													{'CSV'}
												</Box>
											</Button>
										</Box>
									</Box>
								</Box>
							</Box>
						</Box>
					)}
				</DialogContent>
			</Dialog>

			{/* hidden Dialog for PDF image */}
			<Dialog
				className={classNames(
					'hidden-dialog !z-[-9999] [&_.MuiBackdrop-root]:!opacity-0 [&_.MuiDialog-container]:!absolute [&_.MuiDialog-container]:!left-[-9999px] [&_.MuiDialog-container]:!top-[-9999px]',
					className,
				)}
				open={open}
				onClose={(_event, reason) => {
					if (reason !== 'backdropClick') {
						onClose()
					}
				}}
				PaperProps={{
					className:
						'!max-w-[1025px] !min-w-[1025px] !w-[1025px] !min-h-[627px] !max-h-[627px] !h-[627px] !m-6 !rounded-[15px] !bg-primary',
				}}
			>
				<DialogTitle className='flex items-center gap-2 !py-3'>
					<Typography className='flex-1 !text-md !leading-5 text-white'>{displayDialogTitle}</Typography>
					<IconButton className='!p-1.5' aria-label='close' onClick={onClose}>
						<Close className='!invisible text-white' />
					</IconButton>
				</DialogTitle>
				<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !py-4'>
					<Box className='flex h-full w-full items-center gap-6'>
						<Box className='flex h-full flex-1 flex-col gap-4'>
							<Box className='relative aspect-[738/473] w-full border border-solid border-black p-6'>
								<Box
									className='captured-map-image aspect-[688/423] w-full bg-contain'
									component='img'
									alt='Plant Map Image'
								/>

								{/* Map's legend */}
								<Box
									className={classNames(
										'z-1 absolute bottom-8 left-8 flex max-w-[calc(100%-68px)] items-center gap-3 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3',
										{
											'!hidden': mapTypeArray.length === 0 && selectedRepeatArea === undefined,
										},
									)}
								>
									<Box
										className={classNames('hidden shrink-0 items-center gap-1.5', {
											'!flex': mapTypeArray.includes(yieldMapTypeCode.plant),
										})}
									>
										<Box className='h-3 w-3 rounded-full bg-[#8AB62D]'></Box>
										<Typography className='!text-2xs text-black'>{t('plantingArea')}</Typography>
									</Box>
									<Box
										className={classNames('hidden shrink-0 items-center gap-3', {
											'!flex': mapTypeArray.includes(yieldMapTypeCode.product),
										})}
									>
										<Box className={'flex items-center gap-1.5'}>
											<Box className='h-3 w-3 rounded-full bg-[#003491]'></Box>
											<Typography className='!text-2xs text-black'>{`${t('moreThan')} ${defaultNumber(yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
										</Box>
										<Box className={'flex items-center gap-1.5'}>
											<Box className='h-3 w-3 rounded-full bg-[#1DB240]'></Box>
											<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber.ten, 6)}-${defaultNumber(yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
										</Box>
										<Box className={'flex items-center gap-1.5'}>
											<Box className='h-3 w-3 rounded-full bg-[#F0E927]'></Box>
											<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber.five, 6)}-${defaultNumber(yieldLegendNumber.nine, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
										</Box>
										<Box className={'flex items-center gap-1.5'}>
											<Box className='h-3 w-3 rounded-full bg-[#FF9500]'></Box>
											<Typography className='!text-2xs text-black'>{`${t('lessThan')} ${defaultNumber(yieldLegendNumber.five, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
										</Box>
									</Box>
									<Box
										className={classNames('hidden shrink-0 items-center gap-1.5', {
											'!flex': selectedRepeatArea,
										})}
									>
										<Box className='h-3 w-3 rotate-[45deg] rounded-full bg-[repeating-linear-gradient(to_right,#8AB62D_0px,#8AB62D_1px,#ffffff_1px,#ffffff_2px)]'></Box>
										<Typography className='!text-2xs text-black'>{`${t('replantingArea')} ${selectedRepeatArea?.name ?? '-'} ${t('common:year')}`}</Typography>
									</Box>
								</Box>

								{/* Vertical Lines */}
								{gridColsArray.map((gridCol) => {
									return (
										<React.Fragment key={gridCol.key}>
											<div
												className='absolute top-0 h-full w-[1px] bg-black'
												style={{ left: gridCol.percent + '%' }}
											/>

											{/* Top Label */}
											<span
												className='absolute -top-4 -translate-x-1/2 text-2xs text-black'
												style={{ left: gridCol.percent + '%' }}
											>
												{gridCol.value}
											</span>

											{/* Bottom Label */}
											<span
												className='absolute -bottom-4 -translate-x-1/2 text-2xs text-black'
												style={{ left: gridCol.percent + '%' }}
											>
												{gridCol.value}
											</span>
										</React.Fragment>
									)
								})}

								{/* Horizontal Lines */}
								{gridRowsArray.map((gridRow) => {
									return (
										<React.Fragment key={gridRow.key}>
											<div
												className='absolute left-0 h-[1px] w-full bg-black'
												style={{ bottom: gridRow.percent + '%' }}
											/>

											{/* Left Label */}
											<span
												className='absolute -left-2 -translate-x-1/2 translate-y-1/2 -rotate-90 transform text-2xs text-black'
												style={{ bottom: gridRow.percent + '%' }}
											>
												{gridRow.value}
											</span>

											{/* Right Label */}
											<span
												className='absolute -right-2 translate-x-1/2 translate-y-1/2 rotate-90 transform text-2xs text-black'
												style={{ bottom: gridRow.percent + '%' }}
											>
												{gridRow.value}
											</span>
										</React.Fragment>
									)
								})}
							</Box>
							<Typography className='w-full flex-1 !text-2xs !leading-5 text-[#707070]'>
								{(language === Languages.TH
									? 'จุดความร้อนจากดาวเทียม  VIIRS, MODIS / ร่องรอยเผาไหม้จากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-2 / พื้นที่ปลูกอ้อยจากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-1, Sentinel-2'
									: 'Hotspots from VIIRS, MODIS satellites / Burn scars analyzed from Sentinel-2 satellite data / Sugarcane plantation areas analyzed from Sentinel-1, Sentinel-2 satellite data') +
									` (${displaySelectedDateRange})`}
							</Typography>
						</Box>
						<Box className='flex h-full w-[22%] flex-col items-center'>
							<Box className='relative aspect-[215/287]'>
								<Box
									className='captured-mini-map-image h-full w-full bg-contain'
									component='img'
									alt='Plant Mini Map Image'
								/>

								<Box className='absolute right-[5px] top-[5px]'>
									<MiniMapCompassIcon fill={basemap === BasemapType.CartoLight ? 'black' : 'white'} />
								</Box>
							</Box>
							<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
								<Box className='flex w-full flex-col gap-1.5'>
									<Box className='flex w-full'>
										<Typography className='w-[50%] !text-2xs text-black'>
											{t('common:date')}
										</Typography>
										<Typography className='flex-1 !text-2xs !font-bold text-black'>
											{formatDate(Date.now(), 'dd MMMM yyyy', language)}
										</Typography>
									</Box>
									{mapLegendArray.map((item) => item.type).includes(yieldMapTypeCode.plant) && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('plantingArea')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{`${defaultNumber(plantData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)}
									{mapLegendArray.map((item) => item.type).includes(yieldMapTypeCode.product) && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('sugarCaneYield')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{`${defaultNumber(productData.reduce((total, item) => total + (item.properties?.volumn?.[quantityUnit] ?? 0), 0))} ${t('common:' + quantityUnit)}`}
											</Typography>
										</Box>
									)}
									{mapLegendArray.map((item) => item.type).includes(yieldMapTypeCode.repeat) && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('replantingArea')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{`${defaultNumber(replantData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)}
								</Box>
								<Box className='flex w-full'>
									<Typography className='!text-2xs text-[#707070]'>
										{language === Languages.TH
											? 'กลุ่มเทคโนโลยีสารสนเทศและการสื่อสาร  0-2430-6813 ต่อ 3825'
											: 'Information and Communication Technology Group, Office of the Cane and Sugar Board, 0-2430-6813 extension 3825'}
									</Typography>
								</Box>
							</Box>
						</Box>
					</Box>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default PrintPlantMapDialog
