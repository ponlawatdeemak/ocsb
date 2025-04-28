import { MapExportIcon } from '@/components/svg/MenuIcon'
import { Box, IconButton, Tooltip } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PrintMapDialog from './PrintMapDialog'
import { BurntMapExportParamType, MapBurntDataType } from '@/components/pages/map-analyze/burnt-area/Main/BurntMap'
import { MapPlantDataType, PlantMapExportParamType } from '@/components/pages/map-analyze/planting-area/Main/PlantMap'
import useMapStore from '@/components/common/map/store/map'
import { useSession } from 'next-auth/react'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { mapTypeCode, ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
import { LngLatBoundsLike } from 'maplibre-gl'
import { thaiExtent } from '@/config/app.config'
import { GeoJsonLayer, IconLayer, PolygonLayer } from '@deck.gl/layers'
import { getPinHotSpot } from '@/utils/pin'
import { FillStyleExtension } from '@deck.gl/extensions'
import { centroid } from '@turf/turf'
import { Feature, GeoJsonProperties, Geometry, MultiPolygon, Point, Polygon } from 'geojson'
import { Languages } from '@/enum'
import { formatDate } from '@/utils/date'
import { captureMapControlImage, captureMapWithControl } from '@/utils/capture'
import { exportPdf } from '@/utils/export-pdf'
import { axiosInstance } from '@/api/core'
import { findPointsInsideBoundary, findPolygonsInsideBoundary } from '@/utils/geometry'

interface MapDetailType {
	details: Feature<Point | Polygon | MultiPolygon>[]
}

export interface BurntMapDetailType {
	type: 'burnt'
	hotspots: MapDetailType
	burnArea: MapDetailType
	plant: MapDetailType
	factory: MapDetailType
}

export interface PlantMapDetailType {
	type: 'plant'
	plant: MapDetailType
	product: MapDetailType
	repeat: MapDetailType
	factory: MapDetailType
}

export interface MapLegendType {
	key: mapTypeCode | yieldMapTypeCode
	type: mapTypeCode | yieldMapTypeCode
	title: string
}

export interface GridType {
	key: string
	percent: number
	value: string
}

export interface EndBoundsType {
	xmin: number
	xmax: number
	ymin: number
	ymax: number
}

export const MAP_EXPORT = 'map-export'
export const MINI_MAP_EXPORT = 'mini-map-export'

export const LONGITUDE_OFFSET = 0.5
export const LATITUDE_OFFSET = 0.25

const GRID_COLS = 4
const GRID_ROWS = 3

const BURNT_MAP_WIDTH = 688
const BURNT_MAP_HEIGHT = 423
const BURNT_MINI_MAP_WIDTH = 215
const BURNT_MINI_MAP_HEIGHT = 287

interface PrintMapExportMainProps {
	className?: string
	id: 'burnt' | 'plant'
	mapData: MapBurntDataType | MapPlantDataType
	mapLegendArray: MapLegendType[]
	mapExportParam: BurntMapExportParamType | PlantMapExportParamType
	defaultMapEndBounds: EndBoundsType
	defaultMiniMapExtent: number[][] | null
	mapGeometry: number[][] | null
	loading?: boolean
	disabled?: boolean
}

const PrintMapExportMain: React.FC<PrintMapExportMainProps> = ({
	className = '',
	id,
	mapData,
	mapLegendArray,
	mapExportParam,
	defaultMapEndBounds,
	defaultMiniMapExtent,
	mapGeometry,
	loading,
	disabled = false,
}) => {
	const { mapLibre, overlays } = useMapStore()
	const { data: session } = useSession()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const { t, i18n } = useTranslation(['common', 'map-anlyze'])
	const language = i18n.language as keyof ResponseLanguage

	const [openPrintMapDialog, setOpenPrintMapDialog] = useState<boolean>(false)

	const [mapEndBounds, setMapEndBounds] = useState<EndBoundsType>(defaultMapEndBounds)
	const [mapExtent, setMapExtent] = useState<number[][]>([])
	const [miniMapExtent, setMiniMapExtent] = useState<number[][] | null>(defaultMiniMapExtent)
	const [isCapturing, setIsCapturing] = useState<boolean>(false)

	const [mapDetail, setMapDetail] = useState<BurntMapDetailType | PlantMapDetailType | null>(null)

	const mapExport = useMemo(() => mapLibre[`${id}-${MAP_EXPORT}`], [id, mapLibre])
	const overlayExport = useMemo(() => overlays[`${id}-${MAP_EXPORT}`], [id, overlays])
	const miniMapExport = useMemo(() => mapLibre[`${id}-${MINI_MAP_EXPORT}`], [id, mapLibre])
	const miniOverlayExport = useMemo(() => overlays[`${id}-${MINI_MAP_EXPORT}`], [id, overlays])

	// map event
	useEffect(() => {
		if (mapExport) {
			mapExport.on('moveend', () => {
				const bound = mapExport.getBounds()
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

				const currentCenter = mapExport.getCenter()
				const miniMapExtent = [
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
				]
				setMiniMapExtent(miniMapExtent)

				if (id === 'burnt' && mapData.type === 'burnt') {
					const burntMapDetail: BurntMapDetailType = {
						type: 'burnt',
						hotspots: { details: findPointsInsideBoundary(mapData.hotspotBurntAreaData as any, extent) },
						burnArea: { details: findPolygonsInsideBoundary(mapData.burntBurntAreaData as any, extent) },
						plant: { details: findPolygonsInsideBoundary(mapData.plantBurntAreaData as any, extent) },
						factory: { details: findPointsInsideBoundary(mapData.hotspotBurntAreaData as any, extent) },
					}

					setMapDetail((prevDetail) => ({ ...prevDetail, ...burntMapDetail }))
				} else if (id === 'plant' && mapData.type === 'plant') {
					const plantMapDetail: PlantMapDetailType = {
						type: 'plant',
						plant: { details: findPolygonsInsideBoundary(mapData.plantYieldAreaData as any, extent) },
						product: { details: findPolygonsInsideBoundary(mapData.productYieldAreaData as any, extent) },
						repeat: { details: findPolygonsInsideBoundary(mapData.replantYieldAreaData as any, extent) },
						factory: { details: findPointsInsideBoundary(mapData.plantYieldAreaData as any, extent) },
					}

					setMapDetail((prevDetail) => ({ ...prevDetail, ...plantMapDetail }))
				}

				setMapEndBounds({
					xmin: bound.getWest(),
					xmax: bound.getEast(),
					ymin: bound.getSouth(),
					ymax: bound.getNorth(),
				})
			})
		}
	}, [mapExport, id, mapData])

	// initial map zoom
	useEffect(() => {
		if (mapExport) {
			if (mapGeometry) {
				mapExport.fitBounds(mapGeometry as LngLatBoundsLike, { padding: 0 })
			}
		}
	}, [mapExport, mapGeometry])

	// initial mini map zoom
	useEffect(() => {
		if (miniMapExport) {
			miniMapExport.fitBounds(thaiExtent, { padding: 0 })
		}
	}, [miniMapExport])

	useEffect(() => {
		if (mapExport && overlayExport) {
			if (id === 'burnt' && mapData.type === 'burnt') {
				const layers = [
					new GeoJsonLayer({
						id: 'plant-export',
						beforeId: 'custom-referer-layer',
						data: mapData.plantBurntAreaData as any,
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
						data: mapData.burntBurntAreaData as any,
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
						data: mapData.hotspotBurntAreaData,
						pickable: true,
						sizeScale: 1,
						getPosition: (d) => d.geometry.coordinates,
						getSize: 14,
						getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
					}),
				]

				overlayExport.setProps({ layers: [layers] })
			} else if (id === 'plant' && mapData.type === 'plant') {
				const layers = [
					new GeoJsonLayer({
						id: 'plant-export',
						beforeId: 'custom-referer-layer',
						data: mapData.plantYieldAreaData as any,
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
						data: mapData.productYieldAreaData as any,
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
						data: mapData.replantYieldAreaData as any,
						pickable: true,
						stroked: true,
						filled: true,
						lineWidthMinPixels: 1,
						getPolygon: (d: any) => d.geometry.coordinates,
						getFillColor: () => [255, 255, 255],
						getLineColor: () => [255, 255, 255],

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

				overlayExport.setProps({ layers: [layers] })
			}
		}
	}, [mapExport, overlayExport, id, mapData])

	useEffect(() => {
		if (mapExport && id === 'plant' && mapData.type === 'plant') {
			//#region heatmap layer

			//update heat data
			if (mapExport?.getSource('heat') && mapExport?.getLayer('heat-layer-export')) {
				mapExport.removeLayer('heat-layer-export')
				mapExport.removeSource('heat')
			}

			if (!mapExport.getSource('heat') && mapData.productYieldAreaData.length > 0) {
				mapExport.addSource('heat', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: mapData.productYieldAreaData as Feature<Geometry, GeoJsonProperties>[],
					},
				})
			}
			if (!mapExport.getLayer('heat-layer-export') && mapData.productYieldAreaData.length > 0) {
				mapExport.addLayer({
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
	}, [mapExport, id, mapData])

	useEffect(() => {
		if (miniMapExport && miniOverlayExport && miniMapExtent) {
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

			miniOverlayExport.setProps({ layers: [layers] })
		}
	}, [miniMapExport, miniOverlayExport, miniMapExtent])

	const gridColsArray: GridType[] = useMemo(
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

	const gridRowsArray: GridType[] = useMemo(
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
		if (mapExportParam.selectedDateRange[0].toString() === mapExportParam.selectedDateRange[1].toString()) {
			return mapExportParam.selectedDateRange[0]
				? formatDate(mapExportParam.selectedDateRange[0], 'dd MMMM yyyy', language)
				: ''
		} else {
			const startDate = mapExportParam.selectedDateRange[0]
				? formatDate(mapExportParam.selectedDateRange[0], 'dd MMMM yyyy', language)
				: ''
			const endDate = mapExportParam.selectedDateRange[1]
				? formatDate(mapExportParam.selectedDateRange[1], 'dd MMMM yyyy', language)
				: ''
			return `${startDate} - ${endDate}`
		}
	}, [mapExportParam.selectedDateRange, language])

	const handleMapPdfExport = useCallback(async () => {
		try {
			setIsCapturing(true)

			const style = document.createElement('style')
			document.head.appendChild(style)
			style.sheet?.insertRule('body > div:last-child img { display: inline-block; }')

			const mapElement = document.getElementById(`${id}-map-export-container`)
			const miniMapElement = document.getElementById(`${id}-mini-map-export-container`)
			if (!mapElement || !miniMapElement) {
				console.error('Map export container not found!')
				return
			}
			const mapControlElement = mapElement.querySelector('.maplibregl-ctrl-bottom-right') as HTMLElement
			const miniMapControlElement = miniMapElement.querySelector('.maplibregl-ctrl-bottom-right') as HTMLElement

			if (mapExport && miniMapExport && mapControlElement && miniMapControlElement) {
				const [mapImage, miniMapImage, mapControlImage, miniMapControlImage] = await Promise.all([
					mapExport.getCanvas().toDataURL('image/png'),
					miniMapExport.getCanvas().toDataURL('image/png'),
					captureMapControlImage(mapControlElement),
					captureMapControlImage(miniMapControlElement),
				])

				const mapCapturedImage = await captureMapWithControl(
					mapImage,
					mapControlImage ?? '',
					BURNT_MAP_WIDTH,
					BURNT_MAP_HEIGHT,
				)

				const miniMapCapturedImage = await captureMapWithControl(
					miniMapImage,
					miniMapControlImage ?? '',
					BURNT_MINI_MAP_WIDTH,
					BURNT_MINI_MAP_HEIGHT,
				)

				const capturedMapElement = document.querySelector('.captured-map-image') as HTMLImageElement
				const capturedMiniMapElement = document.querySelector('.captured-mini-map-image') as HTMLImageElement

				if (capturedMapElement && capturedMiniMapElement) {
					capturedMapElement.src = mapCapturedImage
					capturedMiniMapElement.src = miniMapCapturedImage
					await new Promise((resolve) => setTimeout(resolve, 100))
				} else {
					console.error('Image element not found!')
				}

				const dialogDiv: HTMLDivElement | null = document.querySelector('.hidden-dialog .MuiDialog-paper')

				if (dialogDiv) {
					await exportPdf({ dialogDiv: dialogDiv, fileName: `${id}_map` })
				}
			} else {
				console.error('Map is not loaded yet!')
			}
		} catch (error) {
			console.error('Error capturing map:', error)
		} finally {
			setIsCapturing(false)
		}
	}, [mapExport, miniMapExport, id])

	const mapCsvExportParams = useMemo(() => {
		const query = new URLSearchParams()

		query.append('accessToken', session?.user.accessToken ?? '')
		if (mapExportParam.selectedDateRange[0])
			query.append('startDate', mapExportParam.selectedDateRange[0].toISOString().split('T')[0])
		if (mapExportParam.selectedDateRange[1])
			query.append('endDate', mapExportParam.selectedDateRange[1].toISOString().split('T')[0])
		if (mapExportParam.currentAdmOption !== null) query.append('admC', mapExportParam.currentAdmOption.id)
		if (areaUnit !== null) query.append('area', areaUnit)
		if (quantityUnit !== null) query.append('weight', quantityUnit)
		if (mapExtent.length !== 0) query.append('polygon', JSON.stringify(mapExtent))
		if (mapExportParam.mapTypeArray.length !== 0)
			mapExportParam.mapTypeArray.forEach((item) => query.append('mapType', item))

		if (id === 'burnt' && mapExportParam.type === 'burnt') {
			if (mapExportParam.selectedHotspots.length !== 0)
				mapExportParam.selectedHotspots.forEach((item) => query.append('inSugarcan', item))
		} else if (id === 'plant' && mapExportParam.type === 'plant') {
			if (mapExportParam.selectedRepeatArea) {
				query.append('mapType', yieldMapTypeCode.repeat)
				query.append('repeat', mapExportParam.selectedRepeatArea?.name ?? '')
			}
		}

		return query
	}, [session?.user.accessToken, mapExportParam, areaUnit, quantityUnit, mapExtent, id])

	const handleMapCsvExport = useCallback(async () => {
		const uri = axiosInstance.getUri()

		let url = ''
		if (id === 'burnt') {
			url = `${uri}/export/hotspot-burnt-area?${mapCsvExportParams}`
		} else if (id === 'plant') {
			url = `${uri}/export/yield-area?${mapCsvExportParams}`
		}

		window.open(url, '_blank')
	}, [id, mapCsvExportParams])

	return (
		<Box
			className={classNames(
				'absolute right-4 top-[356px] z-10 flex md:right-6 md:top-[226px] [&_button]:bg-white',
				className,
			)}
		>
			<Tooltip
				title={t('tools.export')}
				componentsProps={{
					tooltip: {
						className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
					},
					arrow: {
						className: '!text-white',
					},
				}}
				placement='left'
				arrow
			>
				<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
					<IconButton
						className='!h-6 !w-6 grow !rounded-none !p-1.5 [&_path]:stroke-black'
						onClick={() => setOpenPrintMapDialog(true)}
						disabled={disabled}
					>
						<MapExportIcon />
					</IconButton>
				</Box>
			</Tooltip>

			<PrintMapDialog
				id={id}
				open={openPrintMapDialog}
				mapDetail={mapDetail}
				mapLegendArray={mapLegendArray}
				mapExportParam={mapExportParam}
				gridColsArray={gridColsArray}
				gridRowsArray={gridRowsArray}
				displayDialogTitle={displayDialogTitle}
				displaySelectedDateRange={displaySelectedDateRange}
				loading={loading}
				disabled={isCapturing}
				handleMapPdfExport={handleMapPdfExport}
				handleMapCsvExport={handleMapCsvExport}
				onClose={() => setOpenPrintMapDialog(false)}
			/>
		</Box>
	)
}

export default PrintMapExportMain
