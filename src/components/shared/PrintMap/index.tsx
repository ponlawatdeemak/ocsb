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
import { hotspotTypeCode, mapTypeCode, ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
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
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { OptionType } from '@/components/pages/map-analyze/burnt-area/Main/SearchForm'
import service from '@/api'

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
	layers: any[]
	selectedDateRange: Date[]
	currentAdmOption: OptionType | null
	mapTypeArray: string[]
	selectedHotspots: hotspotTypeCode[]
	repeat: number | null
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
	layers,
	selectedDateRange,
	currentAdmOption,
	mapTypeArray,
	selectedHotspots,
	repeat,
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

	const {
		data: printData,
		isFetching: isPrintDataLoading,
		refetch: refetchPrintData,
	} = useQuery({
		queryKey: [
			'getPrintData',
			selectedHotspots,
			selectedDateRange,
			currentAdmOption,
			mapExtent,
			repeat,
			mapTypeArray,
		],
		queryFn: ({ signal }) => {
			const params = {
				inSugarcan: selectedHotspots,
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: currentAdmOption?.id ? Number(currentAdmOption.id) : undefined,
				polygon: mapExtent ? JSON.stringify(mapExtent ?? '') : '',
				repeat: repeat,
				mapType: mapTypeArray,
			}

			return service.mapAnalyze.getPrintInfo(params, { signal })
		},
		enabled: openPrintMapDialog,
		placeholderData: keepPreviousData,
	})

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
				refetchPrintData()
			})
		}
	}, [mapExport, id, mapData, refetchPrintData])

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
		if (overlayExport) {
			overlayExport.setProps({ layers: layers })
		}
	}, [overlayExport, layers])

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
					tooltip: { className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5' },
					arrow: { className: '!text-white' },
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
				mapData={printData?.data}
			/>
		</Box>
	)
}

export default PrintMapExportMain
