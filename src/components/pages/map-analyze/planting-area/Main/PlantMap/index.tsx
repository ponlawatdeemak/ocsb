import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionType } from '../SearchForm'
import { CountViewerIcon, RegionPinIcon } from '@/components/svg/AppIcon'
import { yieldMapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import { booleanContains, booleanPointInPolygon, polygon } from '@turf/turf'
import { AreaUnitKey, Languages, QuantityUnitKey } from '@/enum'
import { enSuffix } from '@/config/app.config'
import { LngLatBoundsLike, Popup } from 'maplibre-gl'
import { PickingInfo } from '@deck.gl/core'
import CloseIcon from '@mui/icons-material/Close'
import { GetLookupDtoOut, GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { defaultNumber } from '@/utils/text'
import {
	GetPlantYieldAreaDtoOut,
	GetProductYieldAreaDtoOut,
	GetReplantYieldAreaDtoOut,
} from '@interface/dto/yield-area/yield-area.dto-out'
import PopupPlant from './PopupPlant'
import { DataFilterExtension, FillStyleExtension } from '@deck.gl/extensions'

import { Feature, GeoJsonProperties, Polygon } from 'geojson'
import PrintMapExportMain, { EndBoundsType, LATITUDE_OFFSET, LONGITUDE_OFFSET } from '@/components/shared/PrintMap'
import { MVTLayer } from '@deck.gl/geo-layers'
import { getPinFactory } from '@/utils/pin'
import { getRound } from '@/utils/date'
import { addDays, endOfDay, endOfMonth, formatISO, getUnixTime, subMonths } from 'date-fns'

export interface MapPlantDataType {
	type: 'plant'
	plantYieldAreaData: GetPlantYieldAreaDtoOut[]
	productYieldAreaData: GetProductYieldAreaDtoOut[]
	replantYieldAreaData: GetReplantYieldAreaDtoOut[]
}

export interface YieldLegendNumberType {
	fifteen: number | string
	ten: number | string
	five: number | string
	nine: number | string
}

export interface PlantMapExportParamType {
	type: 'plant'
	selectedDateRange: Date[]
	currentAdmOption: OptionType | null
	mapTypeArray: yieldMapTypeCode[]
	selectedRepeatArea: GetRepeatAreaLookupDtoOut | undefined
	yieldLegendNumber: YieldLegendNumberType
}

const endBoundsDefault: EndBoundsType = {
	xmin: 0,
	xmax: 0,
	ymin: 0,
	ymax: 0,
}

export const PLANTING_MAP_ID = 'planting-map'

interface PlantingMapMainProps {
	className?: string
	mapTypeArray: yieldMapTypeCode[]
	currentAdmOption: OptionType | null
	selectedRepeatArea: GetRepeatAreaLookupDtoOut | undefined
	selectedDateRange: Date[]
	// plantYieldAreaData: GetPlantYieldAreaDtoOut[]
	// productYieldAreaData: GetProductYieldAreaDtoOut[]
	// replantYieldAreaData: GetReplantYieldAreaDtoOut[]
	// isPlantYieldAreaDataLoading: boolean
	// isProductYieldAreaDataLoading: boolean
	// isReplantYieldAreaDataLoading: boolean
	onMapExtentChange: (polygon: number[][]) => void
}

const PlantingMapMain: React.FC<PlantingMapMainProps> = ({
	className = '',
	mapTypeArray,
	selectedRepeatArea,
	selectedDateRange,
	currentAdmOption,
	// plantYieldAreaData,
	// productYieldAreaData,
	// replantYieldAreaData,
	// isPlantYieldAreaDataLoading,
	// isProductYieldAreaDataLoading,
	// isReplantYieldAreaDataLoading,
	onMapExtentChange,
}) => {
	const { data: session } = useSession()
	const { mapLibre, overlays } = useMapStore()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const quantityLang = `common:${quantityUnit}`
	const areaLang = `common:${areaUnit}`
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
	const [plantMapGeometry, setPlantMapGeometry] = useState<number[][] | null>(null)

	const { data: regionData, isPending: isRegionLoading } = useQuery({
		queryKey: ['getRegion'],
		queryFn: () => service.lookup.getRegion(),
	})

	const plantingMap = useMemo(() => mapLibre[PLANTING_MAP_ID], [mapLibre])
	const plantingOverlay = useMemo(() => overlays[PLANTING_MAP_ID], [overlays])

	const tonPerSqm = useMemo(() => ({ fifteen: 0.009375, ten: 0.00625, five: 0.003125, nine: 0.005625 }), [])
	const tonPerSqkm = useMemo(() => ({ fifteen: 9375, ten: 6250, five: 3125, nine: 5625 }), [])
	const tonPerRai = useMemo(() => ({ fifteen: 15, ten: 10, five: 5, nine: 9 }), [])
	const tonPerHexa = useMemo(() => ({ fifteen: 93.75, ten: 62.5, five: 31.25, nine: 56.25 }), [])

	const kgPerSqm = useMemo(() => ({ fifteen: 9.375, ten: 6.25, five: 3.125, nine: 5.625 }), [])
	const kgPerSqkm = useMemo(() => ({ fifteen: 9375000, ten: 6250000, five: 3125000, nine: 5625000 }), [])
	const kgPerRai = useMemo(() => ({ fifteen: 15000, ten: 10000, five: 5000, nine: 9000 }), [])
	const kgPerHexa = useMemo(() => ({ fifteen: 93750, ten: 62500, five: 31250, nine: 56250 }), [])

	const yieldLegendNumber: YieldLegendNumberType = useMemo(() => {
		if (quantityUnit === QuantityUnitKey.Ton) {
			if (areaUnit === AreaUnitKey.Sqm) {
				return tonPerSqm
			} else if (areaUnit === AreaUnitKey.Sqkm) {
				return tonPerSqkm
			} else if (areaUnit === AreaUnitKey.Rai) {
				return tonPerRai
			} else if (areaUnit === AreaUnitKey.Hexa) {
				return tonPerHexa
			} else {
				return { fifteen: '-', ten: '-', five: '-', nine: '-' }
			}
		} else if (quantityUnit === QuantityUnitKey.Kilogram) {
			if (areaUnit === AreaUnitKey.Sqm) {
				return kgPerSqm
			} else if (areaUnit === AreaUnitKey.Sqkm) {
				return kgPerSqkm
			} else if (areaUnit === AreaUnitKey.Rai) {
				return kgPerRai
			} else if (areaUnit === AreaUnitKey.Hexa) {
				return kgPerHexa
			} else {
				return { fifteen: '-', ten: '-', five: '-', nine: '-' }
			}
		} else {
			return { fifteen: '-', ten: '-', five: '-', nine: '-' }
		}
	}, [areaUnit, kgPerHexa, kgPerRai, kgPerSqkm, kgPerSqm, quantityUnit, tonPerHexa, tonPerRai, tonPerSqkm, tonPerSqm])

	const dateEnd = useMemo(() => endOfDay(selectedDateRange[1]), [selectedDateRange])
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
	const isVisiblePlant = useMemo(() => mapTypeArray.includes(yieldMapTypeCode.plant), [mapTypeArray])
	const isVisibleProduct = useMemo(() => mapTypeArray.includes(yieldMapTypeCode.product), [mapTypeArray])
	const isVisibleRepeat = useMemo(() => mapTypeArray.includes(yieldMapTypeCode.repeat), [mapTypeArray])
	const isVisibleFactory = useMemo(() => mapTypeArray.includes(yieldMapTypeCode.factory), [mapTypeArray])
	const plantDateRound = useMemo(() => getRound(dateEnd.getMonth() + 1, dateEnd.getFullYear()), [dateEnd])
	const replantDateRound = useMemo(() => {
		const round = { ...plantDateRound }
		if (round.round !== 1) {
			// ถ้าได้รอบ 2,3 ให้ไปใช้รอบ 1 ของปีนั้น
			let monthDown = 0
			if (round.round === 2) {
				monthDown = 4
			} else if (round.round === 3) {
				monthDown = 8
			}

			let sDate = formatISO(subMonths(new Date(round.sDate), monthDown), {
				representation: 'date',
			})
			const sDateSpliter = sDate.split('-')
			const isEndMonth = Number(sDateSpliter[2]) === 31
			if (isEndMonth) {
				sDate = formatISO(addDays(new Date(sDate), 2), { representation: 'date' })
			}

			const eDate = formatISO(endOfMonth(subMonths(new Date(round.eDate), monthDown)), {
				representation: 'date',
			})
			round.round = 1
			round.sDate = `${sDate} 00:00:00`
			round.eDate = `${eDate} 00:00:00`
		}
		return round
	}, [plantDateRound])

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

	// map extent effect
	useEffect(() => {
		if (plantingMap) {
			let prevPolygon: Feature<Polygon, GeoJsonProperties> | null = null
			plantingMap.on('moveend', () => {
				const currentBound = plantingMap.getBounds()
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

				const currentCenter = plantingMap.getCenter()
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
				setPlantMapGeometry(geometry)

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
	}, [plantingMap, onMapExtentChange, i18n])

	// current region effect
	useEffect(() => {
		if (plantingMap && regionData?.length) {
			plantingMap.on('moveend', () => {
				const center = plantingMap.getCenter()
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
	}, [plantingMap, onMapExtentChange, regionData, i18n])

	// zoom to default user region
	useEffect(() => {
		if (defaultZoomComplete) {
			return
		}
		if (plantingMap && regionData && session?.user.geometry) {
			const userGeometry = session?.user?.geometry as LngLatBoundsLike
			if (userGeometry) {
				plantingMap.fitBounds(userGeometry, { padding: 100 })
				setDefaultZoomComplete(true)
				setUserRegionGeometry(userGeometry)
			}
		}
	}, [plantingMap, regionData, session?.user?.geometry, defaultZoomComplete])

	// zoom to search area
	useEffect(() => {
		if (plantingMap) {
			const userGeometry = currentAdmOption?.geometry ?? userRegionGeometry
			if (userGeometry) {
				plantingMap.fitBounds(userGeometry, { padding: 100 })
			}
		}
	}, [plantingMap, currentAdmOption?.geometry, userRegionGeometry])

	const onMapClick = useCallback(
		(info: PickingInfo) => {
			if (plantingMap && plantingOverlay) {
				const pickItem = plantingOverlay.pickMultipleObjects(info)
				if (popupNode.current && pickItem.length) {
					popup
						?.setLngLat(info.coordinate as [number, number])
						.setDOMContent(popupNode.current)
						.addTo(plantingMap)

					setPopupData(pickItem)
				}
			}
		},
		[plantingMap, plantingOverlay, popup],
	)

	// update layer
	useEffect(() => {
		if (!plantingOverlay) {
			return
		}
		//#region deck.gl layer
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
				pickable: true,
				visible: isVisiblePlant,
				updateTriggers: {
					data: [session?.user.accessToken],
					visible: [isVisiblePlant],
					getFilterValue: [checkAdmCondition, plantDateRound.round],
					filterRange: [plantDateRound.sDate, plantDateRound.eDate],
				},
				extensions: [new DataFilterExtension({ filterSize: 1 })],
				getFilterValue: (item: any) => {
					const props = item.properties
					if (!props.cls_edate) {
						return 0
					}
					if (plantDateRound.round !== props.cls_round) {
						return 0
					}
					if (!checkAdmCondition(item)) {
						return 0
					}
					return getUnixTime(new Date(props.cls_edate))
				},
				filterRange: [getUnixTime(new Date(plantDateRound.sDate)), getUnixTime(new Date(plantDateRound.eDate))],
			}),
			new MVTLayer({
				id: 'product',
				beforeId: 'custom-referer-layer',
				data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_ds_yield_pred/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
				lineWidthMinPixels: 1,
				stroked: true,
				filled: true,
				pickable: true,
				visible: isVisibleProduct,
				updateTriggers: {
					data: [session?.user.accessToken],
					visible: [isVisibleProduct],
					getFilterValue: [checkAdmCondition, plantDateRound.round],
					filterRange: [plantDateRound.sDate, plantDateRound.eDate],
				},
				extensions: [new DataFilterExtension({ filterSize: 1 })],
				getFilterValue: (item: any) => {
					const props = item.properties
					if (!props.cls_edate) {
						return 0
					}
					if (plantDateRound.round !== props.cls_round) {
						return 0
					}
					if (!checkAdmCondition(item)) {
						return 0
					}
					return getUnixTime(new Date(props.cls_edate))
				},
				filterRange: [getUnixTime(new Date(plantDateRound.sDate)), getUnixTime(new Date(plantDateRound.eDate))],
				getFillColor: (d: any) => {
					const value = d.properties.yield_mean_ton_rai
					if (value > 15) {
						return [0, 52, 145, 180]
					} else if (value >= 10 && value <= 15) {
						return [29, 178, 64, 180]
					} else if (value >= 5 && value < 10) {
						return [240, 233, 39, 180]
					} else if (value < 5) {
						return [255, 149, 0, 180]
					} else {
						return [0, 0, 0, 0]
					}
				},
				getLineColor: (d: any) => {
					const value = d.properties.yield_mean_ton_rai
					if (value > 15) {
						return [0, 52, 145, 180]
					} else if (value >= 10 && value <= 15) {
						return [29, 178, 64, 180]
					} else if (value >= 5 && value < 10) {
						return [240, 233, 39, 180]
					} else if (value < 5) {
						return [255, 149, 0, 180]
					} else {
						return [0, 0, 0, 0]
					}
				},
			}),
			new MVTLayer({
				id: 'replant',
				beforeId: 'custom-referer-layer',
				data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_ds_repeat_area/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
				pickable: true,
				stroked: true,
				filled: true,
				lineWidthMinPixels: 1,
				getFillColor: [255, 255, 255],
				getLineColor: [255, 255, 255],
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
				extensions: [new FillStyleExtension({ pattern: true }), new DataFilterExtension({ filterSize: 1 })],
				visible: isVisibleRepeat,
				updateTriggers: {
					data: [session?.user.accessToken],
					visible: [isVisibleRepeat],
					getFilterValue: [checkAdmCondition, replantDateRound.round],
					filterRange: [replantDateRound.sDate, replantDateRound.eDate],
				},
				getFilterValue: (item: any) => {
					const props = item.properties
					if (!props.cls_edate) {
						return 0
					}
					if (replantDateRound.round !== props.cls_round) {
						return 0
					}
					if (!checkAdmCondition(item)) {
						return 0
					}
					return getUnixTime(new Date(props.cls_edate))
				},
				filterRange: [
					getUnixTime(new Date(replantDateRound.sDate)),
					getUnixTime(new Date(replantDateRound.eDate)),
				],
			}),
			new MVTLayer({
				id: 'factory',
				beforeId: 'custom-referer-layer',
				data: `${process.env.NEXT_PUBLIC_API_HOSTNAME_MIS}/tiles/sugarcane_ds_factory/{z}/{x}/{y}?accessToken=${session?.user.accessToken}`,
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
			}),
		]

		plantingOverlay.setProps({
			layers: [layers],
			onClick: onMapClick,
			getCursor: (state) => (state.isHovering ? 'pointer' : 'default'),
		})
		//#endregion
	}, [
		onMapClick,
		plantingOverlay,
		selectedDateRange,
		selectedRepeatArea,
		session?.user.accessToken,
		currentAdmOption,
		mapTypeArray,
		checkAdmCondition,
		plantDateRound,
		replantDateRound,
		isVisiblePlant,
		isVisibleProduct,
		isVisibleRepeat,
		isVisibleFactory,
	])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen((prev) => !prev)
	}, [])

	const mapPlantData: MapPlantDataType = useMemo(() => {
		return { type: 'plant', plantYieldAreaData: [], productYieldAreaData: [], replantYieldAreaData: [] }
	}, [])

	const mapLegendArray: any[] = useMemo(() => {
		const typeArray = [...mapTypeArray]
		if (selectedRepeatArea) {
			typeArray.push(yieldMapTypeCode.repeat)
		}
		return typeArray.map((mapType) => {
			let key, type, title
			switch (mapType) {
				case yieldMapTypeCode.plant:
					key = yieldMapTypeCode.plant
					type = yieldMapTypeCode.plant
					title = t('plantingArea')
					break
				case yieldMapTypeCode.product:
					key = yieldMapTypeCode.product
					type = yieldMapTypeCode.product
					title = t('sugarCaneYield')
					break
				case yieldMapTypeCode.repeat:
					key = yieldMapTypeCode.repeat
					type = yieldMapTypeCode.repeat
					title = t('replantingArea')
					break
			}
			return { key, type, title }
		})
	}, [mapTypeArray, selectedRepeatArea, t])

	const plantMapExportParam: PlantMapExportParamType = useMemo(() => {
		return {
			type: 'plant',
			selectedDateRange,
			currentAdmOption,
			mapTypeArray,
			selectedRepeatArea,
			yieldLegendNumber,
		}
	}, [selectedDateRange, currentAdmOption, mapTypeArray, selectedRepeatArea, yieldLegendNumber])

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
						'absolute bottom-[52px] left-[52px] z-10 flex max-w-[60%] items-center gap-3 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3 md:bottom-3',
						{ '!hidden': mapTypeArray.length === 0 && selectedRepeatArea === undefined },
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

				<PrintMapExportMain
					id='plant'
					mapData={mapPlantData}
					mapLegendArray={mapLegendArray}
					defaultMapEndBounds={endBounds}
					defaultMiniMapExtent={miniMapExtent}
					mapGeometry={plantMapGeometry}
					mapExportParam={plantMapExportParam}
					disabled={
						// isPlantYieldAreaDataLoading ||
						// isProductYieldAreaDataLoading ||
						// isReplantYieldAreaDataLoading ||
						isRegionLoading
					}
				/>

				<MapView
					mapId={PLANTING_MAP_ID}
					loading={
						// isPlantYieldAreaDataLoading ||
						// isProductYieldAreaDataLoading ||
						// isReplantYieldAreaDataLoading ||
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
					<PopupPlant popupData={popupData} />
				</div>
			</Box>
		</Box>
	)
}

export default memo(PlantingMapMain)
