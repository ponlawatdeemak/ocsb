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
import { GeoJsonLayer, IconLayer } from '@deck.gl/layers'

import { getPinHotSpot } from '@/utils/pin'
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
import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf'
import { Feature, GeoJsonProperties, Polygon } from 'geojson'
import PrintMapExportMain, {
	EndBoundsType,
	LATITUDE_OFFSET,
	LONGITUDE_OFFSET,
	MapLegendType,
} from '@/components/shared/PrintMap'
import { MVTLayer, TileLayer } from '@deck.gl/geo-layers'
import { endOfDay, isEqual, isWithinInterval, startOfDay } from 'date-fns'
import { getRound } from '@/utils/date'

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

	// map extent effect
	useEffect(() => {
		if (burntMap) {
			let prevPolygon: Feature<Polygon, GeoJsonProperties> | null = null
			burntMap.on('moveend', () => {
				const currentBound = burntMap.getBounds()
				const sw = currentBound.getSouthWest()
				const ne = currentBound.getNorthEast()
				const extent = [
					[sw.lng, sw.lat],
					[ne.lng, sw.lat],
					[ne.lng, ne.lat],
					[sw.lng, ne.lat],
					[sw.lng, sw.lat],
				]

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

				const turfPolygon = polygon([extent])
				if (prevPolygon) {
					if (!booleanContains(prevPolygon, turfPolygon)) {
						onMapExtentChange(extent)
						prevPolygon = turfPolygon
					}
				} else {
					onMapExtentChange(extent)
					prevPolygon = turfPolygon
				}
			})
		}
	}, [burntMap, onMapExtentChange, i18n])

	// current region effect
	useEffect(() => {
		if (burntMap && regionData?.length) {
			burntMap.on('moveend', () => {
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
	}, [burntMap, onMapExtentChange, regionData, i18n])

	// zoom to default user region
	useEffect(() => {
		if (burntMap && regionData && session?.user.geometry) {
			const userGeometry = session?.user?.geometry as LngLatBoundsLike
			if (userGeometry && !defaultZoomComplete) {
				burntMap.fitBounds(userGeometry, { padding: 100 })
				setDefaultZoomComplete(true)
				setUserRegionGeometry(userGeometry)
			}
		}
	}, [burntMap, regionData, session?.user?.geometry, defaultZoomComplete])

	// zoom to search area
	useEffect(() => {
		if (burntMap) {
			const userGeometry = currentAdmOption?.geometry ?? userRegionGeometry
			if (userGeometry) {
				burntMap.fitBounds(userGeometry, { padding: 100 })
			}
		}
	}, [burntMap, currentAdmOption?.geometry, userRegionGeometry])

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
		if (burntMap && burntOverlay) {
			const layers = [
				new MVTLayer({
					id: 'plant',
					beforeId: 'custom-referer-layer',
					data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_ds_yield_pred/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
					getFillColor: [139, 182, 45, 180],
					getLineColor: [139, 182, 45, 180],
					getLineWidth: 1,
					stroked: true,
					filled: true,
					pointType: 'circle',
					pointRadiusMinPixels: 2,
					pickable: true,
					visible: mapTypeArray.includes(mapTypeCode.plant),
					binary: false,
					renderSubLayers: (props) => {
						const tempData = (props.data || []) as any[]

						const filteredFeatures = tempData.filter((item) => {
							const props = item.properties
							let visible = false
							if (props.cls_edate) {
								const endDate = selectedDateRange[1].toISOString()
								const dataSplit = endDate.split('-')
								const month = Number(dataSplit[1])
								const year = Number(dataSplit[0])
								const round = getRound(month, year)

								const isMatchRound = round.round === props.cls_round

								const isWithin =
									isMatchRound && props.cls_sdate >= round.sDate && props.cls_edate <= round.eDate

								let conditionAdm = false
								if (currentAdmOption?.id) {
									if (currentAdmOption.id.length === 2) {
										// user select province
										conditionAdm = Number(currentAdmOption.id) === props.o_adm1c
									} else if (currentAdmOption.id.length === 4) {
										// user select district
										conditionAdm = Number(currentAdmOption.id) === props.o_adm2c
									} else if (currentAdmOption.id.length === 6) {
										// user select sub-district
										conditionAdm = Number(currentAdmOption.id) === props.o_adm3c
									}
								} else {
									conditionAdm = true
								}
								visible = isWithin && conditionAdm
							}

							return visible
						})

						return new GeoJsonLayer({
							...props,
							data: filteredFeatures,
						})
					},
				}),
				new MVTLayer({
					id: 'burnt',
					beforeId: 'custom-referer-layer',
					data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_ds_burn_area_daily/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
					getFillColor: [255, 204, 0, 180],
					getLineColor: [255, 204, 0, 180],
					getLineWidth: 1,
					stroked: true,
					filled: true,
					pointType: 'circle',
					pointRadiusMinPixels: 2,
					pickable: true,
					visible: mapTypeArray.includes(mapTypeCode.burnArea),
					binary: false,
					renderSubLayers: (props) => {
						const tempData = (props.data || []) as any[]
						const filteredFeatures = tempData.filter((item) => {
							const props = item.properties
							let visible = false
							if (props.detected_d) {
								const acqDate = startOfDay(new Date(props.detected_d))
								const dateStart = startOfDay(selectedDateRange[0])
								const dateEnd = endOfDay(selectedDateRange[1])
								const isWithin = isWithinInterval(acqDate, { start: dateStart, end: dateEnd })

								let conditionAdm = false
								if (currentAdmOption?.id) {
									if (currentAdmOption.id.length === 2) {
										// user select province
										conditionAdm = Number(currentAdmOption.id) === props.o_adm1c
									} else if (currentAdmOption.id.length === 4) {
										// user select district
										conditionAdm = Number(currentAdmOption.id) === props.o_adm2c
									} else if (currentAdmOption.id.length === 6) {
										// user select sub-district
										conditionAdm = Number(currentAdmOption.id) === props.o_adm3c
									}
								} else {
									conditionAdm = true
								}
								visible = isWithin && conditionAdm
							}

							return visible
						})

						return new GeoJsonLayer({
							...props,
							data: filteredFeatures,
						})
					},
				}),

				new MVTLayer({
					id: 'hotspot',
					beforeId: 'custom-referer-layer',
					data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_hotspot/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
					pickable: true,
					sizeScale: 1,
					getPosition: (d: any) => d.geometry.coordinates,
					getSize: 14,
					getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
					updateTriggers: { renderSubLayers: [selectedDateRange] },
					binary: false,
					renderSubLayers: (props) => {
						const tempData = (props.data || []) as any[]
						const filteredFeatures = tempData.filter((item) => {
							const props = item.properties
							let visible = false
							if (selectedHotspots?.length) {
								if (props.acq_date) {
									const acqDate = startOfDay(new Date(props.acq_date))
									const dateStart = startOfDay(selectedDateRange[0])
									const dateEnd = endOfDay(selectedDateRange[1])
									const isWithin = isWithinInterval(acqDate, { start: dateStart, end: dateEnd })
									let conditionInSugarcane = false
									if (selectedHotspots.length === 1) {
										if (selectedHotspots[0] === 'inSugarcane') {
											conditionInSugarcane = props.in_sugarcane === true
										} else {
											conditionInSugarcane = props.in_sugarcane === false
										}
									} else {
										conditionInSugarcane = true
									}
									let conditionAdm = false
									if (currentAdmOption?.id) {
										if (currentAdmOption.id.length === 2) {
											// user select province
											conditionAdm = Number(currentAdmOption.id) === props.o_adm1c
										} else if (currentAdmOption.id.length === 4) {
											// user select district
											conditionAdm = Number(currentAdmOption.id) === props.o_adm2c
										} else if (currentAdmOption.id.length === 6) {
											// user select sub-district
											conditionAdm = Number(currentAdmOption.id) === props.o_adm3c
										}
									} else {
										conditionAdm = true
									}
									visible = isWithin && conditionInSugarcane && conditionAdm
								}
							}
							return visible
						})

						return new IconLayer({
							...props,
							data: filteredFeatures,
						})
					},
				}),

				// new GeoJsonLayer({
				// 	id: 'plant',
				// 	beforeId: 'custom-referer-layer',
				// 	data: plantBurntAreaData as any,
				// 	pickable: true,
				// 	stroked: true,
				// 	filled: true,
				// 	lineWidthMinPixels: 1,
				// 	getPolygon: (d: any) => d.geometry.coordinates,
				// 	getFillColor: () => [139, 182, 45, 180],
				// 	getLineColor: () => [139, 182, 45, 180],
				// }),

				// new GeoJsonLayer({
				// 	id: 'burnt',
				// 	beforeId: 'custom-referer-layer',
				// 	data: burntBurntAreaData as any,
				// 	pickable: true,
				// 	stroked: true,
				// 	filled: true,
				// 	lineWidthMinPixels: 1,
				// 	getPolygon: (d: any) => d.geometry.coordinates,
				// 	getFillColor: () => [255, 204, 0, 180],
				// 	getLineColor: () => [255, 204, 0, 180],
				// }),
				// new IconLayer({
				// 	id: 'hotspot',
				// 	beforeId: 'custom-referer-layer',
				// 	data: hotspotBurntAreaData,
				// 	pickable: true,
				// 	sizeScale: 1,
				// 	getPosition: (d) => d.geometry.coordinates,
				// 	getSize: 14,
				// 	getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
				// }),
			]

			burntOverlay.setProps({
				layers: [layers],
				onClick: onMapClick,
				getCursor: (state) => (state.isHovering ? 'pointer' : 'default'),
			})
		}
	}, [
		burntMap,
		burntOverlay,
		hotspotBurntAreaData,
		burntBurntAreaData,
		plantBurntAreaData,
		onMapClick,
		session?.user.accessToken,
		selectedDateRange,
		mapTypeArray,
		currentAdmOption,
		selectedHotspots,
	])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen(!isCurrentRegionOpen)
	}, [isCurrentRegionOpen])

	const mapBurntData: MapBurntDataType = useMemo(() => {
		return { type: 'burnt', hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData }
	}, [hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData])

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
						isHotspotBurntAreaDataLoading ||
						isBurntBurntAreaDataLoading ||
						isPlantBurntAreaDataLoading ||
						isRegionLoading
					}
				/>

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
		</Box>
	)
}

export default memo(BurntMapMain)
