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
import { IconLayer, PolygonLayer } from '@deck.gl/layers'

import { getPinHotSpot } from '@/utils/pin'
import { CountViewerIcon, RegionPinIcon } from '@/components/svg/AppIcon'
import { mapTypeCode, ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { AreaUnitKey, Languages, QuantityUnitKey } from '@/enum'
import { enSuffix } from '@/config/app.config'
import { Popup } from 'maplibre-gl'
import { PickingInfo } from '@deck.gl/core'
import PopupBurnt from './PopupBurnt'
import CloseIcon from '@mui/icons-material/Close'
import { GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { defaultNumber } from '@/utils/text'

interface PlantingMapMainProps {
	className?: string
	mapTypeArray: yieldMapTypeCode[]
	currentAdmOption: OptionType | null
	selectedRepeatArea: GetRepeatAreaLookupDtoOut | undefined
	// hotspotBurntAreaData: GetHotspotBurntAreaDtoOut[]
	// burntBurntAreaData: GetBurntBurntAreaDtoOut[]
	// plantBurntAreaData: GetPlantBurntAreaDtoOut[]
	// isHotspotBurntAreaDataLoading: boolean
	// isBurntBurntAreaDataLoading: boolean
	// isPlantBurntAreaDataLoading: boolean
	onMapExtentChange: (polygon: number[][]) => void
}

const PlantingMapMain: React.FC<PlantingMapMainProps> = ({
	className = '',
	mapTypeArray,
	selectedRepeatArea,
	currentAdmOption,
	// hotspotBurntAreaData,
	// burntBurntAreaData,
	// plantBurntAreaData,
	// isHotspotBurntAreaDataLoading,
	// isBurntBurntAreaDataLoading,
	// isPlantBurntAreaDataLoading,
	onMapExtentChange,
}) => {
	const { data: session } = useSession()
	const { mapLibre, overlay } = useMapStore()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const quantityLang = `common:${quantityUnit}`
	const areaLang = `common:${areaUnit}`
	const { t, i18n } = useTranslation(['map-analyze', 'common'])
	const language = i18n.language as keyof ResponseLanguage

	const [currentRegion, setCurrentRegion] = useState('')
	const [isCurrentRegionOpen, setIsCurrentRegionOpen] = useState<boolean>(true)

	const popupNode = useRef<HTMLDivElement>(null)
	const [popupData, setPopupData] = useState<any[]>([])
	const popup = useMemo(() => new Popup({ closeOnClick: false, closeButton: false }), [])

	const { data: regionData, isPending: isRegionLoading } = useQuery({
		queryKey: ['getRegion'],
		queryFn: () => service.lookup.getRegion(),
	})

	const yieldLegendNumber = useMemo(() => {
		if (quantityUnit === QuantityUnitKey.Ton) {
			if (areaUnit === AreaUnitKey.Sqm) {
				return { 15: 0.009375, 10: 0.00625, 5: 0.003125, 9: 0.005625 }
			} else if (areaUnit === AreaUnitKey.Sqkm) {
				return { 15: 9375, 10: 6250, 5: 3125, 9: 5625 }
			} else if (areaUnit === AreaUnitKey.Rai) {
				return { 15: 15, 10: 10, 5: 5, 9: 9 }
			} else if (areaUnit === AreaUnitKey.Hexa) {
				return { 15: 93.75, 10: 62.5, 5: 31.25, 9: 56.25 }
			}
		} else if (quantityUnit === QuantityUnitKey.Kilogram) {
			if (areaUnit === AreaUnitKey.Sqm) {
				return { 15: 9.375, 10: 6.25, 5: 3.125, 9: 5.625 }
			} else if (areaUnit === AreaUnitKey.Sqkm) {
				return { 15: 9375000, 10: 6250000, 5: 3125000, 9: 5625000 }
			} else if (areaUnit === AreaUnitKey.Rai) {
				return { 15: 15000, 10: 10000, 5: 5000, 9: 9000 }
			} else if (areaUnit === AreaUnitKey.Hexa) {
				return { 15: 93750, 10: 62500, 5: 31250, 9: 56250 }
			}
		} else {
			return { 15: '-', 10: '-', 5: '-', 9: '-' }
		}
	}, [areaUnit, quantityUnit])

	// map event
	useEffect(() => {
		if (mapLibre && regionData?.length) {
			mapLibre.on('moveend', () => {
				const bound = mapLibre.getBounds()
				const sw = bound.getSouthWest()
				const ne = bound.getNorthEast()
				const polygon = [
					[sw.lng, sw.lat],
					[ne.lng, sw.lat],
					[ne.lng, ne.lat],
					[sw.lng, ne.lat],
					[sw.lng, sw.lat],
				]
				onMapExtentChange(polygon)

				const center = mapLibre.getCenter()

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
	}, [mapLibre, onMapExtentChange, regionData, i18n])

	// zoom to search area or default user region
	useEffect(() => {
		if (mapLibre) {
			const userGeometry = currentAdmOption?.geometry || session?.user?.geometry
			if (userGeometry) {
				mapLibre.fitBounds(userGeometry, { padding: 100 })
			}
		}
	}, [mapLibre, currentAdmOption?.geometry, session?.user?.geometry])

	const onMapClick = useCallback(
		(info: PickingInfo) => {
			if (mapLibre && overlay) {
				const pickItem = overlay.pickMultipleObjects(info)
				if (popupNode.current && pickItem.length) {
					popup
						?.setLngLat(info.coordinate as [number, number])
						.setDOMContent(popupNode.current)
						.addTo(mapLibre)

					setPopupData(pickItem)
				}
			}
		},
		[mapLibre, overlay, popup],
	)

	// update layer
	useEffect(() => {
		if (mapLibre && overlay) {
			const layers = [
				new PolygonLayer({
					id: 'plant',
					beforeId: 'custom-referer-layer',
					// data: plantBurntAreaData,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d) => d.geometry.coordinates,
					getFillColor: () => [139, 182, 45, 180],
					getLineColor: () => [139, 182, 45, 180],
				}),

				new PolygonLayer({
					id: 'burnt',
					beforeId: 'custom-referer-layer',
					// data: burntBurntAreaData,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d) => d.geometry.coordinates,
					getFillColor: () => [255, 204, 0, 180],
					getLineColor: () => [255, 204, 0, 180],
				}),
				new IconLayer({
					id: 'hotspot',
					beforeId: 'custom-referer-layer',
					// data: hotspotBurntAreaData,
					pickable: true,
					sizeScale: 1,
					getPosition: (d) => d.geometry.coordinates,
					getSize: 14,
					getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
				}),
			]

			overlay.setProps({
				layers: [layers],
				onClick: onMapClick,
				getCursor: (state) => (state.isHovering ? 'pointer' : 'default'),
			})
		}
	}, [
		mapLibre,
		overlay,
		//  hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData,
		onMapClick,
	])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen(!isCurrentRegionOpen)
	}, [isCurrentRegionOpen])

	return (
		<Box className={classNames('', className)}>
			<Box className='relative flex h-full grow'>
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
						<Box className='flex flex-col gap-1 rounded-[5px] bg-white p-2'>
							<Typography className='!text-2xs text-black'>{`${t('common:currentRegion')} : ${currentRegion}`}</Typography>
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
						'absolute bottom-[52px] left-[52px] z-10 flex items-center gap-3 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3 md:bottom-3',
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
							<Typography className='!text-2xs text-black'>{`${t('moreThan')} ${defaultNumber(yieldLegendNumber![15], 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#1DB240]'></Box>
							<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber![10], 6)}-${defaultNumber(yieldLegendNumber![15], 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#F0E927]'></Box>
							<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber![5], 6)}-${defaultNumber(yieldLegendNumber![9], 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#FF9500]'></Box>
							<Typography className='!text-2xs text-black'>{`${t('lessThan')} ${defaultNumber(yieldLegendNumber![5], 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
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

				<MapView
					loading={
						// isHotspotBurntAreaDataLoading ||
						// isBurntBurntAreaDataLoading ||
						// isPlantBurntAreaDataLoading ||
						isRegionLoading
					}
				/>
				<div
					ref={popupNode}
					className={`relative w-full min-w-[300px] flex-col ${!!popupData?.length ? 'flex' : 'hidden'}`}
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

export default memo(PlantingMapMain)
