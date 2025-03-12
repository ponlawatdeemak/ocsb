import { CsvIcon, MiniMapCompassIcon, PdfIcon } from '@/components/svg/MenuIcon'
import { Close } from '@mui/icons-material'
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
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { EndBoundsType, LATITUDE_OFFSET, LONGITUDE_OFFSET, MapLegendType } from '..'
import useMapStore from '@/components/common/map/store/map'
import { BasemapType } from '@/components/common/map/interface/map'
import { hotspotTypeCode, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import { Languages } from '@/enum'
import { defaultNumber } from '@/utils/text'
import useAreaUnit from '@/store/area-unit'
import { formatDate } from '@/utils/date'
import MapView from '@/components/common/map/MapView'
import { captureMapControlImage, captureMapWithControl } from '@/utils/capture'
import { GeoJsonLayer, IconLayer, PolygonLayer } from '@deck.gl/layers'
import { getPinHotSpot } from '@/utils/pin'
import {
	GetBurntBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'
import { Feature, MultiPolygon, Point, Polygon } from 'geojson'
import { findPointsInsideBoundary, findPolygonsInsideBoundary } from '@/utils/geometry'
import { LngLatBoundsLike } from 'maplibre-gl'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import { exportPdf } from '@/utils/export-pdf'
import { axiosInstance } from '@/api/core'
import useQuantityUnit from '@/store/quantity-unit'
import { OptionType } from '../../SearchForm'
import { thaiExtent } from '@/config/app.config'
import { useSession } from 'next-auth/react'
pdfMake.vfs = pdfFonts.vfs

interface NavigatorWithSaveBlob extends Navigator {
	msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean
}

const BURNT_MAP_EXPORT = 'burnt-map-export'
const BURNT_MINI_MAP_EXPORT = 'burnt-mini-map-export'

const GRID_COLS = 4
const GRID_ROWS = 3

const BURNT_MAP_WIDTH = 688
const BURNT_MAP_HEIGHT = 423
const BURNT_MINI_MAP_WIDTH = 215
const BURNT_MINI_MAP_HEIGHT = 287

interface PrintBurntMapDialogProps {
	className?: string
	open: boolean
	currentAdmOption: OptionType | null
	selectedHotspots: hotspotTypeCode[]
	defaultMapEndBounds: EndBoundsType
	mapTypeArray: mapTypeCode[]
	mapLegendArray: MapLegendType[]
	selectedDateRange: Date[]
	hotspotBurntAreaData: GetHotspotBurntAreaDtoOut[]
	burntBurntAreaData: GetBurntBurntAreaDtoOut[]
	plantBurntAreaData: GetPlantBurntAreaDtoOut[]
	defaultMiniMapExtent: number[][] | null
	burntMapGeometry: number[][] | null
	loading?: boolean
	onClose: () => void
}

const PrintBurntMapDialog: React.FC<PrintBurntMapDialogProps> = ({
	className = '',
	open,
	currentAdmOption,
	selectedHotspots,
	defaultMapEndBounds,
	mapTypeArray,
	mapLegendArray,
	selectedDateRange,
	hotspotBurntAreaData,
	burntBurntAreaData,
	plantBurntAreaData,
	defaultMiniMapExtent,
	burntMapGeometry,
	loading = false,
	onClose,
}) => {
	const { mapLibre, overlays, basemap } = useMapStore()
	const { data: session } = useSession()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const { t, i18n } = useTranslation(['common', 'map-anlyze'])
	const language = i18n.language as keyof ResponseLanguage

	const [mapEndBounds, setMapEndBounds] = useState<EndBoundsType>(defaultMapEndBounds)
	const [mapExtent, setMapExtent] = useState<number[][]>([])
	const [miniMapExtent, setMiniMapExtent] = useState<number[][] | null>(defaultMiniMapExtent)
	const [isCapturing, setIsCapturing] = useState<boolean>(false)

	const [hotspotData, setHotspotData] = useState<Feature<Point>[]>([])
	const [burntAreaData, setBurntAreaData] = useState<Feature<Polygon | MultiPolygon>[]>([])
	const [plantingData, setPlantingData] = useState<Feature<Polygon | MultiPolygon>[]>([])

	const burntMapExport = useMemo(() => mapLibre[BURNT_MAP_EXPORT], [mapLibre])
	const burntOverlayExport = useMemo(() => overlays[BURNT_MAP_EXPORT], [overlays])
	const burntMiniMapExport = useMemo(() => mapLibre[BURNT_MINI_MAP_EXPORT], [mapLibre])
	const burntMiniOverlayExport = useMemo(() => overlays[BURNT_MINI_MAP_EXPORT], [overlays])

	// map event
	useEffect(() => {
		if (burntMapExport) {
			burntMapExport.on('moveend', () => {
				const bound = burntMapExport.getBounds()
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

				const currentCenter = burntMapExport.getCenter()
				const miniMapExtent = [
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
				]
				setMiniMapExtent(miniMapExtent)

				const hotspotData = findPointsInsideBoundary(hotspotBurntAreaData as any, extent)
				const burntAreaData = findPolygonsInsideBoundary(burntBurntAreaData as any, extent)
				const plantingData = findPolygonsInsideBoundary(plantBurntAreaData as any, extent)

				setHotspotData(hotspotData)
				setBurntAreaData(burntAreaData)
				setPlantingData(plantingData)

				setMapEndBounds({
					xmin: bound.getWest(),
					xmax: bound.getEast(),
					ymin: bound.getSouth(),
					ymax: bound.getNorth(),
				})
			})
		}
	}, [burntMapExport, hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData])

	// initial burnt map zoom
	useEffect(() => {
		if (burntMapExport) {
			if (burntMapGeometry) {
				burntMapExport.fitBounds(burntMapGeometry as LngLatBoundsLike, { padding: 0 })
			}
		}
	}, [burntMapExport, burntMapGeometry])

	// initial burnt mini map zoom
	useEffect(() => {
		if (burntMiniMapExport) {
			burntMiniMapExport.fitBounds(thaiExtent, { padding: 0 })
		}
	}, [burntMiniMapExport])

	// update layer
	useEffect(() => {
		if (burntMapExport && burntOverlayExport) {
			const layers = [
				new GeoJsonLayer({
					id: 'plant-export',
					beforeId: 'custom-referer-layer',
					data: plantBurntAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [139, 182, 45, 180],
					getLineColor: () => [139, 182, 45, 180],
				}),

				new GeoJsonLayer({
					id: 'burnt-export',
					beforeId: 'custom-referer-layer',
					data: burntBurntAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [255, 204, 0, 180],
					getLineColor: () => [255, 204, 0, 180],
				}),
				new IconLayer({
					id: 'hotspot-export',
					beforeId: 'custom-referer-layer',
					data: hotspotBurntAreaData,
					pickable: true,
					sizeScale: 1,
					getPosition: (d) => d.geometry.coordinates,
					getSize: 14,
					getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
				}),
			]

			burntOverlayExport.setProps({ layers: [layers] })
		}
	}, [burntMapExport, burntOverlayExport, hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData])

	useEffect(() => {
		if (burntMiniMapExport && burntMiniOverlayExport && miniMapExtent) {
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

			burntMiniOverlayExport.setProps({ layers: [layers] })
		}
	}, [burntMiniMapExport, burntMiniOverlayExport, miniMapExtent])

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
				return t('and') + (language === Languages.EN ? ' ' : '') + item.title
			}

			return item.title
		})

		return t('mapDisplayData') + (language === Languages.EN ? ' ' : '') + mapType.join(' ')
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

	const handleBurntMapPdfExport = useCallback(async () => {
		try {
			setIsCapturing(true)

			const style = document.createElement('style')
			document.head.appendChild(style)
			style.sheet?.insertRule('body > div:last-child img { display: inline-block; }')

			const burntMap = mapLibre[BURNT_MAP_EXPORT]
			const burntMiniMap = mapLibre[BURNT_MINI_MAP_EXPORT]
			const burntMapElement = document.getElementById('burnt-map-export-container')
			const burntMiniMapElement = document.getElementById('burnt-mini-map-export-container')
			if (!burntMapElement || !burntMiniMapElement) {
				console.error('Burnt map export container not found!')
				return
			}
			const burntMapControlElement = burntMapElement.querySelector('.maplibregl-ctrl-bottom-right') as HTMLElement
			const burntMiniMapControlElement = burntMiniMapElement.querySelector(
				'.maplibregl-ctrl-bottom-right',
			) as HTMLElement

			if (burntMap && burntMiniMap && burntMapControlElement && burntMiniMapControlElement) {
				const [mapImage, miniMapImage, burntMapControlImage, burntMiniMapControlImage] = await Promise.all([
					burntMap.getCanvas().toDataURL('image/png'),
					burntMiniMap.getCanvas().toDataURL('image/png'),
					captureMapControlImage(burntMapControlElement),
					captureMapControlImage(burntMiniMapControlElement),
				])

				const burntMapImage = await captureMapWithControl(
					mapImage,
					burntMapControlImage ?? '',
					BURNT_MAP_WIDTH,
					BURNT_MAP_HEIGHT,
				)

				const burntMiniMapImage = await captureMapWithControl(
					miniMapImage,
					burntMiniMapControlImage ?? '',
					BURNT_MINI_MAP_WIDTH,
					BURNT_MINI_MAP_HEIGHT,
				)

				const capturedBurntMapElement = document.querySelector('.captured-map-image') as HTMLImageElement
				const capturedBurntMiniMapElement = document.querySelector(
					'.captured-mini-map-image',
				) as HTMLImageElement

				if (capturedBurntMapElement && capturedBurntMiniMapElement) {
					capturedBurntMapElement.src = burntMapImage
					capturedBurntMiniMapElement.src = burntMiniMapImage
					await new Promise((resolve) => setTimeout(resolve, 100))
				} else {
					console.error('Image element not found!')
				}

				const dialogDiv: HTMLDivElement | null = document.querySelector('.hidden-dialog .MuiDialog-paper')

				if (dialogDiv) {
					await exportPdf({ dialogDiv: dialogDiv, fileName: 'burnt_map' })
				}
			} else {
				console.error('Map is not loaded yet!')
			}
		} catch (error) {
			console.error('Error capturing burnt map:', error)
		} finally {
			setIsCapturing(false)
		}
	}, [mapLibre])

	const handleBurntMapCsvExport = useCallback(async () => {
		const uri = axiosInstance.getUri()
		const query = new URLSearchParams()

		query.append('accessToken', session?.user.accessToken ?? '')
		if (selectedDateRange[0]) query.append('startDate', selectedDateRange[0].toISOString().split('T')[0])
		if (selectedDateRange[1]) query.append('endDate', selectedDateRange[1].toISOString().split('T')[0])
		if (currentAdmOption !== null) query.append('admC', currentAdmOption.id)
		if (areaUnit !== null) query.append('area', areaUnit)
		if (quantityUnit !== null) query.append('weight', quantityUnit)
		if (mapExtent.length !== 0) query.append('polygon', JSON.stringify(mapExtent))
		if (mapTypeArray.length !== 0) mapTypeArray.forEach((item) => query.append('mapType', item))
		if (selectedHotspots.length !== 0) selectedHotspots.forEach((item) => query.append('inSugarcan', item))

		const url = `${uri}/export/hotspot-burnt-area?${query}`
		window.open(url, '_blank')
	}, [
		session?.user.accessToken,
		selectedDateRange,
		currentAdmOption,
		areaUnit,
		quantityUnit,
		mapExtent,
		mapTypeArray,
		selectedHotspots,
	])

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
										id='burnt-map-export-container'
										className='flex h-full w-full [&_.map-tools]:hidden [&_.maplibregl-compact]:max-sm:!box-border [&_.maplibregl-compact]:max-sm:!h-4 [&_.maplibregl-compact]:max-sm:!min-h-0 [&_.maplibregl-compact]:max-sm:!pr-4 [&_.maplibregl-ctrl-attrib-button]:max-sm:!h-4 [&_.maplibregl-ctrl-attrib-button]:max-sm:!w-4 [&_.maplibregl-ctrl-attrib-button]:max-sm:!bg-contain [&_.maplibregl-ctrl-attrib-inner]:max-sm:text-[8px] [&_.maplibregl-ctrl-attrib-inner]:max-sm:leading-3 [&_.maplibregl-ctrl-bottom-right]:!z-[0] [&_.maplibregl-ctrl-bottom-right]:max-sm:!mb-[22px] [&_.maplibregl-ctrl-scale]:!mb-0'
									>
										<MapView mapId={BURNT_MAP_EXPORT} />
									</Box>

									{/* Map's legend */}
									<Box
										className={classNames(
											'z-1 absolute bottom-[22px] left-[22px] flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-[5px] pr-[7px] sm:pl-2 sm:pr-3 lg:bottom-8 lg:left-8',
											{ '!hidden': mapLegendArray.length === 0 },
										)}
									>
										{mapLegendArray.map((mapLegend) => {
											return (
												<Box key={mapLegend.key} className='flex shrink-0 items-center gap-1.5'>
													{mapLegend.type === mapTypeCode.burnArea ? (
														<Box className='h-1 w-2 bg-[#F9B936] sm:h-2 sm:w-3'></Box>
													) : (
														<Box
															className={classNames(
																'h-2 w-2 rounded-full sm:h-3 sm:w-3',
																{
																	'bg-[#FF0000]':
																		mapLegend.type === mapTypeCode.hotspots,
																	'bg-[#8AB62D]':
																		mapLegend.type === mapTypeCode.plant,
																},
															)}
														></Box>
													)}
													<Typography className='!text-[8px] text-black max-sm:!leading-none sm:!text-2xs'>
														{mapLegend.title}
													</Typography>
												</Box>
											)
										})}
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
										id='burnt-mini-map-export-container'
										className='flex h-full w-full [&_.map-tools]:hidden [&_.maplibregl-ctrl-attrib-inner]:text-[6px] [&_.maplibregl-ctrl-scale]:hidden'
									>
										<MapView mapId={BURNT_MINI_MAP_EXPORT} isInteractive={false} />
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
												{t('date')}
											</Typography>
											<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
												{formatDate(Date.now(), 'dd MMMM yyyy', language)}
											</Typography>
										</Box>
										{mapTypeArray.includes(mapTypeCode.hotspots) && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
													{t('map-analyze:hotspot')}
												</Typography>
												<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
													{`${defaultNumber(hotspotData.length)} ${t('point')}`}
												</Typography>
											</Box>
										)}
										{mapTypeArray.includes(mapTypeCode.burnArea) && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
													{t('map-analyze:burntScar')}
												</Typography>
												<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
													{`${defaultNumber(burntAreaData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
												</Typography>
											</Box>
										)}
										{mapTypeArray.includes(mapTypeCode.plant) && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
													{t('map-analyze:plantingArea')}
												</Typography>
												<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
													{`${defaultNumber(plantingData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
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
												onClick={handleBurntMapPdfExport}
												disabled={isCapturing}
											>
												<Box className='!text-xs text-primary'>{'PDF'}</Box>
											</Button>
											<Button
												className={classNames(
													'flex h-[38px] w-[84px] items-center gap-1.5 !rounded-[5px] !px-5 !py-2.5 !shadow-none hover:!shadow-none [&_.MuiButton-icon]:m-0',
													{
														'!bg-white': mapTypeArray.length > 0,
														'!bg-background': mapTypeArray.length === 0,
													},
												)}
												variant='contained'
												startIcon={
													<CsvIcon fill={mapTypeArray.length === 0 ? '#d6d6d6' : ''} />
												}
												onClick={handleBurntMapCsvExport}
												disabled={mapTypeArray.length === 0 || isCapturing}
											>
												<Box
													className={classNames('!text-xs text-primary', {
														'!text-gray': mapTypeArray.length === 0,
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
									alt='Burnt Map Image'
								/>

								{/* Map's legend */}
								<Box
									className={classNames(
										'z-1 absolute bottom-8 left-8 flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3',
										{ '!hidden': mapLegendArray.length === 0 },
									)}
								>
									{mapLegendArray.map((mapLegend) => {
										return (
											<Box key={mapLegend.key} className='flex shrink-0 items-center gap-1.5'>
												{mapLegend.type === mapTypeCode.burnArea ? (
													<Box className='h-2 w-3 bg-[#F9B936]'></Box>
												) : (
													<Box
														className={classNames('h-3 w-3 rounded-full', {
															'bg-[#FF0000]': mapLegend.type === mapTypeCode.hotspots,
															'bg-[#8AB62D]': mapLegend.type === mapTypeCode.plant,
														})}
													></Box>
												)}
												<Typography className='!text-2xs text-black'>
													{mapLegend.title}
												</Typography>
											</Box>
										)
									})}
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
									alt='Burnt Mini Map Image'
								/>

								<Box className='absolute right-[5px] top-[5px]'>
									<MiniMapCompassIcon fill={basemap === BasemapType.CartoLight ? 'black' : 'white'} />
								</Box>
							</Box>
							<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
								<Box className='flex w-full flex-col gap-1.5'>
									<Box className='flex w-full'>
										<Typography className='w-[50%] !text-2xs text-black'>{t('date')}</Typography>
										<Typography className='flex-1 !text-2xs !font-bold text-black'>
											{formatDate(Date.now(), 'dd MMMM yyyy', language)}
										</Typography>
									</Box>
									{mapTypeArray.includes(mapTypeCode.hotspots) && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('map-analyze:hotspot')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{`${defaultNumber(hotspotData.length)} ${t('point')}`}
											</Typography>
										</Box>
									)}
									{mapTypeArray.includes(mapTypeCode.burnArea) && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('map-analyze:burntScar')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{`${defaultNumber(burntAreaData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)}
									{mapTypeArray.includes(mapTypeCode.plant) && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('map-analyze:plantingArea')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{`${defaultNumber(plantingData.reduce((total, item) => total + (item.properties?.area?.[areaUnit] ?? 0), 0))} ${t('common:' + areaUnit)}`}
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

export default PrintBurntMapDialog
