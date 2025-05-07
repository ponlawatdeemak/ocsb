import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionType } from '../SearchForm'
import {
	GetBurntBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'

import { getPinFactory, getPinHotSpot } from '@/utils/pin'
import { CountViewerIcon, RegionPinIcon } from '@/components/svg/AppIcon'
import { hotspotTypeCode, mapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import { Languages } from '@/enum'
import { enSuffix } from '@/config/app.config'
import { LngLatBoundsLike, Popup } from 'maplibre-gl'
import { PickingInfo } from '@deck.gl/core'
import PopupBurnt from './PopupBurnt'
import CloseIcon from '@mui/icons-material/Close'
import { GetLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import { booleanPointInPolygon } from '@turf/turf'
import PrintMapExportMain, {
	EndBoundsType,
	LATITUDE_OFFSET,
	LONGITUDE_OFFSET,
	MapLegendType,
} from '@/components/shared/PrintMap'
import { endOfDay, getUnixTime, isWithinInterval, startOfDay } from 'date-fns'
import { getRound } from '@/utils/date'
import Image from 'next/image'
import { MVTLayer } from '@deck.gl/geo-layers'
import { DataFilterExtension } from '@deck.gl/extensions'

async function fetchWithRetry(url: string, options = {}, retries = 3, delay = 1000) {
	try {
		const response = await fetch(url, options)
		if ([408, 403, 401].includes(response.status)) {
			if (retries <= 0) throw new Error(`Failed after retries: ${response.status}`)
			await new Promise((res) => setTimeout(res, delay))
			return fetchWithRetry(url, options, retries - 1, delay)
		}
		if (!response.ok) throw new Error(`HTTP error ${response.status}`)
		return response
	} catch (err) {
		if (retries <= 0) throw err
		await new Promise((res) => setTimeout(res, delay))
		return fetchWithRetry(url, options, retries - 1, delay)
	}
}

export interface MapBurntDataType {
	type: 'burnt'
	hotspotBurntAreaData: GetHotspotBurntAreaDtoOut[]
	burntBurntAreaData: GetBurntBurntAreaDtoOut[]
	plantBurntAreaData: GetPlantBurntAreaDtoOut[]
}

export interface BurntMapExportParamType {
	type: 'burnt'
	selectedDateRange: Date[]
	currentAdmOption: OptionType | null
	mapTypeArray: mapTypeCode[]
	selectedHotspots: hotspotTypeCode[]
}

const endBoundsDefault: EndBoundsType = {
	xmin: 0,
	xmax: 0,
	ymin: 0,
	ymax: 0,
}

export const BURNT_MAP_ID = 'burnt-map'

interface BurntMapMainProps {
	className?: string
	mapTypeArray: mapTypeCode[]
	currentAdmOption: OptionType | null
	selectedHotspots: hotspotTypeCode[]
	selectedDateRange: Date[]
	// hotspotBurntAreaData: GetHotspotBurntAreaDtoOut[]
	// burntBurntAreaData: GetBurntBurntAreaDtoOut[]
	// plantBurntAreaData: GetPlantBurntAreaDtoOut[]
	// isHotspotBurntAreaDataLoading: boolean
	// isBurntBurntAreaDataLoading: boolean
	// isPlantBurntAreaDataLoading: boolean
	// onMapExtentChange: (polygon: number[][]) => void
}

const BurntMapMain: React.FC<BurntMapMainProps> = ({
	className = '',
	mapTypeArray,
	currentAdmOption,
	selectedHotspots,
	selectedDateRange,
	// hotspotBurntAreaData,
	// burntBurntAreaData,
	// plantBurntAreaData,
	// isHotspotBurntAreaDataLoading,
	// isBurntBurntAreaDataLoading,
	// isPlantBurntAreaDataLoading,
	// onMapExtentChange,
}) => {
	const { data: session } = useSession()
	const { mapLibre, overlays } = useMapStore()
	const { t, i18n } = useTranslation(['map-analyze', 'common'])

	const currentRegionLanguageKey = `regionName${Languages.TH === i18n.language ? '' : enSuffix}`
	const [currentRegion, setCurrentRegion] = useState<GetLookupDtoOut>()
	const [isCurrentRegionOpen, setIsCurrentRegionOpen] = useState(true)

	const [defaultZoomComplete, setDefaultZoomComplete] = useState(false)
	const [userRegionGeometry, setUserRegionGeometry] = useState<LngLatBoundsLike | null>(null)

	const popupNode = useRef<HTMLDivElement>(null)
	const [popupData, setPopupData] = useState<PickingInfo[]>([])
	const popup = useMemo(() => new Popup({ closeOnClick: false, closeButton: false }), [])

	const [endBounds, setEndBounds] = useState<EndBoundsType>(endBoundsDefault)
	const [miniMapExtent, setMiniMapExtent] = useState<number[][] | null>(null)
	const [burntMapGeometry, setBurntMapGeometry] = useState<number[][] | null>(null)

	const { data: regionData, isPending: isRegionLoading } = useQuery({
		queryKey: ['getRegion'],
		queryFn: () => service.lookup.getRegion(),
	})

	const burntMap = useMemo(() => mapLibre[BURNT_MAP_ID], [mapLibre])
	const burntOverlay = useMemo(() => overlays[BURNT_MAP_ID], [overlays])
	const dateStart = useMemo(() => startOfDay(selectedDateRange[0]), [selectedDateRange])
	const dateEnd = useMemo(() => endOfDay(selectedDateRange[1]), [selectedDateRange])
	const isShowHotspotInSugarcane = useMemo(
		() => selectedHotspots?.includes(hotspotTypeCode.inSugarcan),
		[selectedHotspots],
	)
	const isShowHotspotAll = useMemo(() => selectedHotspots?.length > 1, [selectedHotspots])
	const admId = useMemo(() => Number(currentAdmOption?.id), [currentAdmOption?.id])
	const admLevelKey = useMemo(() => {
		if (currentAdmOption?.id.length === 2) {
			return 'o_adm1c'
		} else if (currentAdmOption?.id.length === 4) {
			return 'o_adm2c'
		} else if (currentAdmOption?.id.length === 6) {
			return 'o_adm3c'
		}
	}, [currentAdmOption?.id])
	const isVisiblePlant = useMemo(() => mapTypeArray.includes(mapTypeCode.plant), [mapTypeArray])
	const isVisibleBurnArea = useMemo(() => mapTypeArray.includes(mapTypeCode.burnArea), [mapTypeArray])
	const isVisibleFactory = useMemo(() => mapTypeArray.includes(mapTypeCode.factory), [mapTypeArray])
	const isVisibleHotspot = useMemo(() => mapTypeArray.includes(mapTypeCode.hotspots), [mapTypeArray])
	const plantDateRound = useMemo(() => getRound(dateEnd.getMonth() + 1, dateEnd.getFullYear()), [dateEnd])
	// const startTimestamp = useMemo(() => getUnixTime(dateStart), [dateStart])
	// const endTimestamp = useMemo(() => getUnixTime(dateEnd), [dateEnd])

	// map extent effect
	useEffect(() => {
		let listener: any
		if (burntMap) {
			// let prevPolygon: Feature<Polygon, GeoJsonProperties> | null = null
			listener = burntMap.on('moveend', () => {
				const currentBound = burntMap.getBounds()
				const sw = currentBound.getSouthWest()
				const ne = currentBound.getNorthEast()
				// const extent = [
				// 	[sw.lng, sw.lat],
				// 	[ne.lng, sw.lat],
				// 	[ne.lng, ne.lat],
				// 	[sw.lng, ne.lat],
				// 	[sw.lng, sw.lat],
				// ]

				const geometry = [
					[sw.lng, sw.lat],
					[ne.lng, ne.lat],
				]

				const currentCenter = burntMap.getCenter()
				const miniMapExtent = [
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
					[currentCenter.lng + LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat + LATITUDE_OFFSET],
					[currentCenter.lng - LONGITUDE_OFFSET, currentCenter.lat - LATITUDE_OFFSET],
				]
				setMiniMapExtent(miniMapExtent)

				setEndBounds({
					xmin: currentBound.getWest(),
					xmax: currentBound.getEast(),
					ymin: currentBound.getSouth(),
					ymax: currentBound.getNorth(),
				})
				setBurntMapGeometry(geometry)

				// const turfPolygon = polygon([extent])
				// if (prevPolygon) {
				// 	if (!booleanContains(prevPolygon, turfPolygon)) {
				// 		onMapExtentChange(extent)
				// 		prevPolygon = turfPolygon
				// 	}
				// } else {
				// 	onMapExtentChange(extent)
				// 	prevPolygon = turfPolygon
				// }
			})
		}
		return () => {
			burntMap?.off('moveend', listener)
		}
	}, [
		burntMap,
		// , onMapExtentChange
		i18n,
	])

	// current region effect
	useEffect(() => {
		let listener: any
		if (burntMap && regionData?.length) {
			listener = burntMap.on('moveend', () => {
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
				setCurrentRegion(insideRegion)
			})
		}
		return () => {
			burntMap?.off('moveend', listener)
		}
	}, [
		burntMap,
		// , onMapExtentChange
		regionData,
		i18n,
	])

	// zoom to default user region
	useEffect(() => {
		if (defaultZoomComplete) {
			return
		}
		if (burntMap && regionData && session?.user.geometry) {
			const userGeometry = session?.user?.geometry as LngLatBoundsLike
			if (userGeometry) {
				burntMap.fitBounds(userGeometry, { padding: 100 })
				setDefaultZoomComplete(true)
				setUserRegionGeometry(userGeometry)
			}
		}
	}, [burntMap, regionData, session?.user?.geometry, defaultZoomComplete])

	// zoom to search area
	useEffect(() => {
		if (!defaultZoomComplete) {
			return
		}
		if (burntMap) {
			const userGeometry = currentAdmOption?.geometry ?? userRegionGeometry
			if (userGeometry) {
				burntMap.fitBounds(userGeometry, { padding: 100 })
			}
		}
	}, [burntMap, currentAdmOption?.geometry, userRegionGeometry, defaultZoomComplete])

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

	const checkAdmCondition = useCallback(
		(item: any) => {
			const props = item.properties
			if (!!admLevelKey && admId !== props[admLevelKey]) {
				return false
			}
			return true
		},
		[admId, admLevelKey],
	)

	const plantLayer = useMemo(() => {
		return new MVTLayer({
			id: 'plant',
			beforeId: 'custom-referer-layer',
			data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/fn_sugarcane_ds_yield_pred/{z}/{x}/{y}?accessToken=${session?.user.accessToken}&cls_sdate=${plantDateRound.sDate}&cls_edate=${plantDateRound.eDate}&round=${plantDateRound.round}&admC=${currentAdmOption?.id ?? ''}`,
			loadOptions: { fetch: fetchWithRetry },
			getFillColor: [139, 182, 45, 180],
			getLineColor: [139, 182, 45, 180],
			getLineWidth: 1,
			stroked: true,
			filled: true,
			pickable: true,
			visible: isVisiblePlant,
			updateTriggers: {
				data: [session?.user.accessToken],
				visible: [isVisiblePlant],
				// getFilterValue: [checkAdmCondition, plantDateRound.round],
				// filterRange: [plantDateRound.sDate, plantDateRound.eDate],
			},
			// extensions: [new DataFilterExtension({ filterSize: 1 })],
			// getFilterValue: (item: any) => {
			// 	const props = item.properties
			// 	if (!props.cls_edate) {
			// 		return 0
			// 	}
			// 	if (plantDateRound.round !== props.cls_round) {
			// 		return 0
			// 	}
			// 	if (!checkAdmCondition(item)) {
			// 		return 0
			// 	}
			// 	return getUnixTime(new Date(props.cls_edate))
			// },
			// filterRange: [getUnixTime(new Date(plantDateRound.sDate)), getUnixTime(new Date(plantDateRound.eDate))],
		})
	}, [
		// checkAdmCondition,
		plantDateRound,
		isVisiblePlant,
		session?.user.accessToken,
		// admId,
		currentAdmOption,
	])

	const burntLayer = useMemo(() => {
		let dTemp = new Date(dateStart.toISOString())
		dTemp.setHours(dTemp.getHours() + 7)
		const dStart = dTemp.toISOString().split('T')[0]
		const dEnd = dateEnd.toISOString().split('T')[0]
		return new MVTLayer({
			id: 'burnt',
			beforeId: 'custom-referer-layer',
			data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/fn_sugarcane_ds_burn/{z}/{x}/{y}?accessToken=${session?.user.accessToken}&detected_d_s=${dStart}&detected_d_e=${dEnd}&admC=${currentAdmOption?.id ?? ''}`,
			loadOptions: { fetch: fetchWithRetry },
			getFillColor: [255, 204, 0, 180],
			getLineColor: [255, 204, 0, 180],
			getLineWidth: 1,
			stroked: true,
			filled: true,
			pickable: true,
			visible: isVisibleBurnArea,
			updateTriggers: {
				data: [session?.user.accessToken],
				visible: [isVisibleBurnArea],
				// getFilterValue: [checkAdmCondition],
				// filterRange: [startTimestamp, endTimestamp],
			},

			// extensions: [new DataFilterExtension({ filterSize: 1 })],
			// getFilterValue: (item: any) => {
			// 	if (!checkAdmCondition(item)) {
			// 		return 0
			// 	}
			// 	return getUnixTime(new Date(item.properties.detected_d))
			// },
			// filterRange: [startTimestamp, endTimestamp],
		})
	}, [
		// checkAdmCondition,
		// startTimestamp,
		// endTimestamp,
		isVisibleBurnArea,
		session?.user.accessToken,
		dateStart,
		dateEnd,
		// admId,
		currentAdmOption,
	])

	const factoryLayer = useMemo(() => {
		return new MVTLayer({
			id: 'factory',
			beforeId: 'custom-referer-layer',
			data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_ds_factory/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
			loadOptions: { fetch: fetchWithRetry },
			pickable: true,
			visible: isVisibleFactory,
			updateTriggers: {
				data: [session?.user.accessToken],
				visible: [isVisibleFactory],
				getFilterValue: [checkAdmCondition],
			},
			pointType: 'icon',
			iconAtlas: getPinFactory(),
			iconMapping: {
				marker: { width: 35, height: 35, mask: false },
			},
			sizeScale: 1,
			getIconSize: 35,
			getIcon: () => 'marker',
			extensions: [new DataFilterExtension({ filterSize: 1 })],
			getFilterValue: (item: any) => {
				if (!checkAdmCondition(item)) {
					return 0
				}
				return 1
			},
			filterRange: [1, 1],
		})
	}, [checkAdmCondition, isVisibleFactory, session?.user.accessToken])

	const hotspotLayer = useMemo(() => {
		let dTemp = new Date(dateStart.toISOString())
		dTemp.setHours(dTemp.getHours() + 7)
		const dStart = dTemp.toISOString().split('T')[0]
		const dEnd = dateEnd.toISOString().split('T')[0]
		const paramInSugarcane = isShowHotspotInSugarcane ? 1 : 0
		const inSugarcane = isShowHotspotAll ? 'null' : paramInSugarcane
		console.log('👻 isShowHotspotInSugarcane: ', isShowHotspotInSugarcane)
		return new MVTLayer({
			id: 'hotspot',
			beforeId: 'custom-referer-layer',
			data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/fn_sugarcane_hotspot/{z}/{x}/{y}?accessToken=${session?.user.accessToken}&acq_date_s=${dStart}&acq_date_e=${dEnd}&admC=${currentAdmOption?.id ?? ''}&in_sugarcane=${inSugarcane}`,
			loadOptions: { fetch: fetchWithRetry },
			pickable: true,
			pointType: 'icon',
			visible: isVisibleHotspot,
			updateTriggers: {
				data: [session?.user.accessToken],
				visible: [isVisibleHotspot],
				// getFilterValue: [checkAdmCondition, isShowHotspotAll, isShowHotspotInSugarcane],
				// filterRange: [startTimestamp, endTimestamp],
			},
			sizeScale: 1,
			getIconSize: 14,
			getIcon: () => 'marker',
			iconAtlas: getPinHotSpot(),
			iconMapping: {
				marker: { width: 14, height: 14, mask: false },
			},
			minZoom: 5,
			// extensions: [new DataFilterExtension({ filterSize: 1 })],
			// getFilterValue: (item: any) => {
			// 	const props = item.properties
			// 	if (!props.acq_date) {
			// 		return 0
			// 	}
			// 	if (!isShowHotspotAll && isShowHotspotInSugarcane && props.in_sugarcane === false) {
			// 		return 0
			// 	}
			// 	if (!isShowHotspotAll && !isShowHotspotInSugarcane && props.in_sugarcane === true) {
			// 		return 0
			// 	}
			// 	if (!checkAdmCondition(item)) {
			// 		return 0
			// 	}
			// 	return getUnixTime(new Date(props.acq_date))
			// },
			// filterRange: [startTimestamp, endTimestamp],
		})
	}, [
		session?.user.accessToken,
		// startTimestamp,
		// endTimestamp,
		// checkAdmCondition,
		isVisibleHotspot,
		isShowHotspotAll,
		isShowHotspotInSugarcane,
		dateStart,
		dateEnd,
		// admId,
		currentAdmOption,
	])

	// update layer
	useEffect(() => {
		if (burntOverlay) {
			burntOverlay.setProps({
				onClick: onMapClick,
				getCursor: (state) => (state.isHovering ? 'pointer' : 'default'),
			})
		}
	}, [burntOverlay, onMapClick])

	// update layer
	useEffect(() => {
		if (burntOverlay) {
			burntOverlay.setProps({
				layers: [plantLayer, burntLayer, factoryLayer, hotspotLayer],
			})
		}
	}, [plantLayer, burntLayer, factoryLayer, hotspotLayer, burntOverlay])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen((prev) => !prev)
	}, [])

	const mapBurntData: MapBurntDataType = useMemo(() => {
		return { type: 'burnt', hotspotBurntAreaData: [], burntBurntAreaData: [], plantBurntAreaData: [] }
	}, [])

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
				case mapTypeCode.factory:
					key = mapTypeCode.factory
					type = mapTypeCode.factory
					title = t('sugarcaneFactory')
					break
			}
			return { key, type, title }
		})
	}, [mapTypeArray, t])

	const burntMapExportParam: BurntMapExportParamType = useMemo(() => {
		return { type: 'burnt', selectedDateRange, currentAdmOption, mapTypeArray, selectedHotspots }
	}, [selectedDateRange, currentAdmOption, mapTypeArray, selectedHotspots])

	return (
		<Box className={classNames('', className)}>
			<Box className='relative flex h-full w-full grow [&_.maplibregl-ctrl-bottom-right]:max-sm:mb-[90px]'>
				<Box className='absolute bottom-[88px] left-3 z-10 flex items-end gap-4 md:bottom-12'>
					<IconButton
						className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {
							'!bg-white': !isCurrentRegionOpen,
						})}
						onClick={handleCurrentRegionToggle}
					>
						<RegionPinIcon color={isCurrentRegionOpen ? 'white' : '#003491'} />
					</IconButton>

					{isCurrentRegionOpen && currentRegion && (
						<Box className='flex flex-col gap-1 rounded-[5px] bg-white px-2 py-1'>
							<Typography className='!text-2xs text-black'>{`${t('common:currentRegion')} : ${currentRegion[currentRegionLanguageKey]}`}</Typography>
						</Box>
					)}
				</Box>

				<Box className='absolute bottom-[52px] left-3 z-10 flex items-end gap-4 md:bottom-3'>
					<IconButton className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {})}>
						<CountViewerIcon color='white' />
					</IconButton>
				</Box>

				<Box
					className={classNames(
						'absolute bottom-[52px] left-[52px] z-10 flex max-w-[60%] items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3 md:bottom-3',
						{ '!hidden': mapTypeArray.length === 0 },
					)}
				>
					{mapLegendArray.map((mapLegend) => {
						return (
							<Box key={mapLegend.key} className='flex shrink-0 items-center gap-1.5'>
								{mapLegend.type === mapTypeCode.burnArea ? (
									<Box className='h-2 w-3 bg-[#F9B936]'></Box>
								) : mapLegend.type === mapTypeCode.factory ? (
									<Image src={getPinFactory()} height={16} width={16} alt={t('sugarcaneFactory')} />
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

				<PrintMapExportMain
					id='burnt'
					mapData={mapBurntData}
					mapLegendArray={mapLegendArray}
					defaultMapEndBounds={endBounds}
					defaultMiniMapExtent={miniMapExtent}
					mapGeometry={burntMapGeometry}
					mapExportParam={burntMapExportParam}
					disabled={
						// isHotspotBurntAreaDataLoading ||
						// isBurntBurntAreaDataLoading ||
						// isPlantBurntAreaDataLoading ||
						isRegionLoading
					}
				/>

				<MapView
					mapId={BURNT_MAP_ID}
					loading={
						// isHotspotBurntAreaDataLoading ||
						// isBurntBurntAreaDataLoading ||
						// isPlantBurntAreaDataLoading ||
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
		</Box>
	)
}

export default memo(BurntMapMain)
