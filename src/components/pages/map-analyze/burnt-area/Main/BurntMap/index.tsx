import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box, CircularProgress, IconButton, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionType } from '../SearchForm'
import {
	GetBurntBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers'

import { getPinHotSpot } from '@/utils/pin'
import { CountViewerIcon, RegionPinIcon } from '@/components/svg/AppIcon'
import { hotspotTypeCode, mapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { Languages } from '@/enum'
import { enSuffix } from '@/config/app.config'
import { Popup } from 'maplibre-gl'
import { PickingInfo } from '@deck.gl/core'
import PopupBurnt from './PopupBurnt'
import CloseIcon from '@mui/icons-material/Close'
import { MapExportIcon } from '@/components/svg/MenuIcon'
import PrintMapDialog from './PrintMapDialog'
import { captureMapImage } from '@/utils/capture'

export interface MapLegendType {
	key: mapTypeCode
	type: mapTypeCode
	title: string
}

export interface EndBoundsType {
	xmin: number
	xmax: number
	ymin: number
	ymax: number
}

const endBoundsDefault: EndBoundsType = {
	xmin: 0,
	xmax: 0,
	ymin: 0,
	ymax: 0,
}

export const BURNT_MAP_ID = 'burnt-map'
const BURNT_MINI_MAP_ID = 'burnt-mini-map'

interface BurntMapMainProps {
	className?: string
	mapTypeArray: mapTypeCode[]
	currentAdmOption: OptionType | null
	selectedHotspots: hotspotTypeCode[]
	selectedDateRange: Date[]
	hotspotBurntAreaData: GetHotspotBurntAreaDtoOut[]
	burntBurntAreaData: GetBurntBurntAreaDtoOut[]
	plantBurntAreaData: GetPlantBurntAreaDtoOut[]
	isHotspotBurntAreaDataLoading: boolean
	isBurntBurntAreaDataLoading: boolean
	isPlantBurntAreaDataLoading: boolean
	onMapExtentChange: (polygon: number[][]) => void
}

const BurntMapMain: React.FC<BurntMapMainProps> = ({
	className = '',
	mapTypeArray,
	currentAdmOption,
	selectedHotspots,
	selectedDateRange,
	hotspotBurntAreaData,
	burntBurntAreaData,
	plantBurntAreaData,
	isHotspotBurntAreaDataLoading,
	isBurntBurntAreaDataLoading,
	isPlantBurntAreaDataLoading,
	onMapExtentChange,
}) => {
	const { data: session } = useSession()
	const { mapLibre, overlays } = useMapStore()
	const { t, i18n } = useTranslation(['map-analyze', 'common'])

	const [currentRegion, setCurrentRegion] = useState('')
	const [isCurrentRegionOpen, setIsCurrentRegionOpen] = useState<boolean>(true)

	const popupNode = useRef<HTMLDivElement>(null)
	const [popupData, setPopupData] = useState<any[]>([])
	const popup = useMemo(() => new Popup({ closeOnClick: false, closeButton: false }), [])

	const [openPrintMapDialog, setOpenPrintMapDialog] = useState<boolean>(false)
	const [isCapturing, setIsCapturing] = useState<boolean>(false)

	const burntMapRef = useRef<HTMLDivElement | null>(null)
	const burntMiniMapRef = useRef<HTMLDivElement | null>(null)
	const [burntMapImage, setBurntMapImage] = useState<string>('')
	const [burntMiniMapImage, setBurntMiniMapImage] = useState<string>('')

	const [endBounds, setEndBounds] = useState<EndBoundsType>(endBoundsDefault)

	const { data: regionData, isPending: isRegionLoading } = useQuery({
		queryKey: ['getRegion'],
		queryFn: () => service.lookup.getRegion(),
	})

	const burntMap = useMemo(() => mapLibre[BURNT_MAP_ID], [mapLibre])
	const burntOverlay = useMemo(() => overlays[BURNT_MAP_ID], [overlays])

	// map event
	useEffect(() => {
		if (burntMap && regionData?.length) {
			let previousZoom = 0
			burntMap.on('moveend', () => {
				const bound = burntMap.getBounds()
				const sw = bound.getSouthWest()
				const ne = bound.getNorthEast()
				const polygon = [
					[sw.lng, sw.lat],
					[ne.lng, sw.lat],
					[ne.lng, ne.lat],
					[sw.lng, ne.lat],
					[sw.lng, sw.lat],
				]

				setEndBounds({
					xmin: bound.getWest(),
					xmax: bound.getEast(),
					ymin: bound.getSouth(),
					ymax: bound.getNorth(),
				})

				const currentZoom = burntMap.getZoom()

				if (previousZoom) {
					if (currentZoom <= previousZoom) {
						onMapExtentChange(polygon)
					}
				} else {
					onMapExtentChange(polygon)
				}

				previousZoom = currentZoom
				const center = burntMap.getCenter()

				const insideRegion = regionData.find((reg) => {
					let result = false
					if (reg.geometry) {
						result = booleanPointInPolygon(
							{ type: 'Point', coordinates: [center.lng, center.lat] },
							reg.geometry as any,
						)
					}
					return result
				})
				if (insideRegion) {
					const regionName = insideRegion[
						`regionName${Languages.TH === i18n.language ? '' : enSuffix}`
					] as string

					setCurrentRegion(regionName)
				}
			})
		}
	}, [burntMap, onMapExtentChange, regionData, i18n])

	// zoom to search area or default user region
	useEffect(() => {
		const userGeometry = currentAdmOption?.geometry || session?.user?.geometry
		if (burntMap && userGeometry) {
			burntMap.fitBounds(userGeometry, { padding: 100 })
		}
	}, [burntMap, currentAdmOption?.geometry, session?.user?.geometry])

	const onMapClick = useCallback(
		(info: PickingInfo) => {
			if (burntMap && burntOverlay) {
				const pickItem = burntOverlay.pickMultipleObjects(info)
				if (popupNode.current && pickItem.length) {
					popup
						?.setLngLat(info.coordinate as [number, number])
						.setDOMContent(popupNode.current)
						.addTo(burntMap)

					setPopupData(pickItem)
				}
			}
		},
		[burntMap, burntOverlay, popup],
	)

	// update layer
	useEffect(() => {
		if (mapLibre && burntOverlay) {
			const layers = [
				new GeoJsonLayer({
					id: 'plant',
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
					id: 'burnt',
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
					id: 'hotspot',
					beforeId: 'custom-referer-layer',
					data: hotspotBurntAreaData,
					pickable: true,
					sizeScale: 1,
					getPosition: (d) => d.geometry.coordinates,
					getSize: 14,
					getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
				}),
			]

			burntOverlay.setProps({
				layers: [layers],
				onClick: onMapClick,
				getCursor: (state) => (state.isHovering ? 'pointer' : 'default'),
			})
		}
	}, [mapLibre, burntOverlay, hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData, onMapClick])

	const handlePrintMapDialogOpen = useCallback(async () => {
		try {
			setIsCapturing(true)

			const burntMapElement = document.getElementById('burnt-map-container')

			if (burntMapElement) {
				const burntMapToolsElement: HTMLElement | null = burntMapElement.querySelector('.map-tools')
				const printMapToolElement: HTMLElement | null = burntMapElement.querySelector('.print-map-tool')
				const currentRegionElement: HTMLElement | null = burntMapElement.querySelector('.current-region')
				const countViewerElement: HTMLElement | null = burntMapElement.querySelector('.count-viewer')
				const mapLegendElement: HTMLElement | null = burntMapElement.querySelector('.map-legend')

				if (burntMapToolsElement) burntMapToolsElement.style.visibility = 'hidden'
				if (printMapToolElement) printMapToolElement.style.visibility = 'hidden'
				if (currentRegionElement) currentRegionElement.style.visibility = 'hidden'
				if (countViewerElement) countViewerElement.style.visibility = 'hidden'
				if (mapLegendElement) mapLegendElement.style.left = '12px'
			}

			await new Promise((resolve) => setTimeout(resolve, 300)) // Ensure maps are rendered

			// Capture parent divs of both maps
			const [burntMapImage, burntMiniMapImage] = await Promise.all([
				captureMapImage(burntMapRef),
				captureMapImage(burntMiniMapRef),
			])

			// Store captured images in state
			setBurntMapImage(burntMapImage ?? '')
			setBurntMiniMapImage(burntMiniMapImage ?? '')

			setOpenPrintMapDialog(true)
		} catch (error) {
			console.error('Export failed!', error)
		} finally {
			const burntMapElement = document.getElementById('burnt-map-container')

			if (burntMapElement) {
				const burntMapToolsElement: HTMLElement | null = burntMapElement.querySelector('.map-tools')
				const printMapToolElement: HTMLElement | null = burntMapElement.querySelector('.print-map-tool')
				const currentRegionElement: HTMLElement | null = burntMapElement.querySelector('.current-region')
				const countViewerElement: HTMLElement | null = burntMapElement.querySelector('.count-viewer')
				const mapLegendElement: HTMLElement | null = burntMapElement.querySelector('.map-legend')

				if (burntMapToolsElement) burntMapToolsElement.style.visibility = ''
				if (printMapToolElement) printMapToolElement.style.visibility = ''
				if (currentRegionElement) currentRegionElement.style.visibility = ''
				if (countViewerElement) countViewerElement.style.visibility = ''
				if (mapLegendElement) mapLegendElement.style.left = ''
			}

			setIsCapturing(false)
		}
	}, [])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen(!isCurrentRegionOpen)
	}, [isCurrentRegionOpen])

	const mapLegendArray: MapLegendType[] = useMemo(() => {
		return mapTypeArray.map((mapType) => {
			let key, type, title
			switch (mapType) {
				case mapTypeCode.hotspots:
					key = mapTypeCode.hotspots
					type = mapTypeCode.hotspots
					title = t('hotspot')
					break
				case mapTypeCode.burnArea:
					key = mapTypeCode.burnArea
					type = mapTypeCode.burnArea
					title = t('burntScar')
					break
				case mapTypeCode.plant:
					key = mapTypeCode.plant
					type = mapTypeCode.plant
					title = t('plantingArea')
					break
			}
			return { key, type, title }
		})
	}, [mapTypeArray, t])

	return (
		<Box className={classNames('', className)}>
			{isCapturing && (
				<div className='flex h-full w-full items-center justify-center'>
					<CircularProgress size={60} />
				</div>
			)}

			<Box
				id='burnt-map-container'
				ref={burntMapRef}
				className={classNames('relative flex h-full w-full grow', {
					'!absolute left-[-9999px] top-[-9999px]': isCapturing,
				})}
			>
				<Box className='current-region absolute bottom-[88px] left-3 z-10 flex items-end gap-4 md:bottom-12'>
					<IconButton
						className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {
							'!bg-white': !isCurrentRegionOpen,
						})}
						onClick={handleCurrentRegionToggle}
					>
						<RegionPinIcon color={isCurrentRegionOpen ? 'white' : '#003491'} />
					</IconButton>

					{isCurrentRegionOpen && currentRegion && (
						<Box className='flex flex-col gap-1 rounded-[5px] bg-white p-2'>
							<Typography className='!text-2xs text-black'>{`${t('common:currentRegion')} : ${currentRegion}`}</Typography>
						</Box>
					)}
				</Box>

				<Box className='count-viewer absolute bottom-[52px] left-3 z-10 flex items-end gap-4 md:bottom-3'>
					<IconButton className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {})}>
						<CountViewerIcon color='white' />
					</IconButton>
				</Box>

				<Box
					className={classNames(
						'map-legend absolute bottom-[52px] left-[52px] z-10 flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3 md:bottom-3',
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
								<Typography className='!text-2xs text-black'>{mapLegend.title}</Typography>
							</Box>
						)
					})}
				</Box>

				<Box className='print-map-tool absolute right-4 top-[356px] z-10 flex md:right-6 md:top-[226px] [&_button]:bg-white'>
					<Tooltip title={t('common:tools.export')} placement='left' arrow>
						<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
							<IconButton
								className='!h-6 !w-6 grow !rounded-none !p-1.5 [&_path]:stroke-black'
								onClick={handlePrintMapDialogOpen}
								disabled={
									isHotspotBurntAreaDataLoading ||
									isBurntBurntAreaDataLoading ||
									isPlantBurntAreaDataLoading ||
									isRegionLoading
								}
							>
								<MapExportIcon />
							</IconButton>
						</Box>
					</Tooltip>

					<PrintMapDialog
						open={openPrintMapDialog}
						burntMapImage={burntMapImage}
						burntMiniMapImage={burntMiniMapImage}
						endBounds={endBounds}
						mapTypeArray={mapTypeArray}
						mapLegendArray={mapLegendArray}
						currentAdmOption={currentAdmOption}
						selectedDateRange={selectedDateRange}
						selectedHotspots={selectedHotspots}
						loading={isCapturing}
						onClose={() => setOpenPrintMapDialog(false)}
					/>
				</Box>

				<MapView
					mapId={BURNT_MAP_ID}
					loading={
						isHotspotBurntAreaDataLoading ||
						isBurntBurntAreaDataLoading ||
						isPlantBurntAreaDataLoading ||
						isRegionLoading
					}
				/>

				<div
					ref={popupNode}
					className={`relative w-full min-w-[300px] flex-col ${popupData?.length ? 'flex' : 'hidden'}`}
				>
					<Box className='absolute right-1 top-1 flex justify-end'>
						<IconButton
							onClick={() => {
								setPopupData([])
								popup.remove()
							}}
							className='mr-2 p-0'
						>
							<CloseIcon className='text-white' sx={{ fontSize: 12 }} />
						</IconButton>
					</Box>
					<PopupBurnt popupData={popupData} />
				</div>
			</Box>

			{/* Static hidden divs for maps */}
			<Box
				ref={burntMiniMapRef}
				className='absolute left-[-9999px] top-[-9999px] flex aspect-[215/287] w-full grow [&_.map-tools]:hidden [&_.maplibregl-control-container]:hidden'
			>
				<MapView mapId={BURNT_MINI_MAP_ID} />
			</Box>
		</Box>
	)
}

export default memo(BurntMapMain)
