import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { memo, useCallback, useEffect, useState } from 'react'
import { OptionType } from '../SearchForm'
import {
	GetBurntBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'
import { IconLayer, PolygonLayer } from '@deck.gl/layers'

import { getPinHotSpot } from '@/utils/pin'
import { CountViewerIcon, RegionPinIcon } from '@/components/svg/AppIcon'
import { mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import booleanPointInPolygon from '@turf/boolean-point-in-polygon'
import { Languages } from '@/enum'
import { enSuffix } from '@/config/app.config'

interface BurntMapMainProps {
	className?: string
	mapTypeArray: mapTypeCode[]
	currentAdmOption: OptionType | null
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
	hotspotBurntAreaData,
	burntBurntAreaData,
	plantBurntAreaData,
	isHotspotBurntAreaDataLoading,
	isBurntBurntAreaDataLoading,
	isPlantBurntAreaDataLoading,
	onMapExtentChange,
}) => {
	const { data: session } = useSession()
	const { mapLibre, overlay } = useMapStore()
	const { t, i18n } = useTranslation(['map-analyze', 'common'])
	const language = i18n.language as keyof ResponseLanguage
	const [currentRegion, setCurrentRegion] = useState('')
	const [isCurrentRegionOpen, setIsCurrentRegionOpen] = useState<boolean>(true)

	const { data: regionData, isPending: isRegionLoading } = useQuery({
		queryKey: ['getRegion'],
		queryFn: () => service.lookup.getRegion(),
	})

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

	// update layer
	useEffect(() => {
		if (mapLibre && overlay) {
			// if (hotspotBurntAreaData?.length) {
			const layers = [
				new PolygonLayer({
					id: 'plant',
					beforeId: 'custom-referer-layer',
					data: plantBurntAreaData,
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
					data: burntBurntAreaData,
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
					data: hotspotBurntAreaData,
					pickable: true,
					sizeScale: 1,
					getPosition: (d) => d.geometry.coordinates,
					getSize: 14,
					getIcon: () => ({ url: getPinHotSpot(), width: 14, height: 14, mask: false }),
				}),
			]

			// set overlay
			overlay.setProps({ layers: [layers] })
			// }
		}
	}, [mapLibre, overlay, hotspotBurntAreaData, burntBurntAreaData, plantBurntAreaData])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen(!isCurrentRegionOpen)
	}, [isCurrentRegionOpen])

	return (
		<Box className={classNames('', className)}>
			<Box className='relative flex h-full grow'>
				<Box className='absolute bottom-12 left-3 z-10 flex items-end gap-4'>
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
				<Box className='absolute bottom-3 left-3 z-10 flex items-end gap-4'>
					<IconButton className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {})}>
						<CountViewerIcon color='white' />
					</IconButton>
				</Box>

				<Box
					className={classNames(
						'absolute bottom-3 left-[52px] z-10 flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3',
						{ '!hidden': mapTypeArray.length === 0 },
					)}
				>
					<Box
						className={classNames('hidden shrink-0 items-center gap-1.5', {
							'!flex': mapTypeArray.includes(mapTypeCode.hotspots),
						})}
					>
						<Box className='h-3 w-3 rounded-full bg-[#FF0000]'></Box>
						<Typography className='!text-2xs text-black'>{t('hotspot')}</Typography>
					</Box>
					<Box
						className={classNames('hidden shrink-0 items-center gap-1.5', {
							'!flex': mapTypeArray.includes(mapTypeCode.burnArea),
						})}
					>
						<Box className='h-2 w-3 bg-[#F9B936]'></Box>
						<Typography className='!text-2xs text-black'>{t('burntScar')}</Typography>
					</Box>
					<Box
						className={classNames('hidden shrink-0 items-center gap-1.5', {
							'!flex': mapTypeArray.includes(mapTypeCode.plant),
						})}
					>
						<Box className='h-3 w-3 rounded-full bg-[#8AB62D]'></Box>
						<Typography className='!text-2xs text-black'>{t('plantingArea')}</Typography>
					</Box>
				</Box>

				<MapView
					loading={
						isHotspotBurntAreaDataLoading || isBurntBurntAreaDataLoading || isPlantBurntAreaDataLoading
					}
				/>
			</Box>
		</Box>
	)
}

export default memo(BurntMapMain)
