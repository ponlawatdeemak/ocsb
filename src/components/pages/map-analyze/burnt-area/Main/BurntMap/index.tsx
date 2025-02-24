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
import { RegionPinIcon } from '@/components/svg/AppIcon'
import { mapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'

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
	const { t } = useTranslation(['map-analyze', 'common'])

	const [currentRegion, setCurrentRegion] = useState(['ภาค 1', 'ภาค 2', 'ภาค 3', 'ภาค 4'])
	const [isCurrentRegionOpen, setIsCurrentRegionOpen] = useState<boolean>(true)

	// map event
	useEffect(() => {
		if (mapLibre) {
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
			})
		}
	}, [mapLibre, onMapExtentChange])

	// zoom to search area or default user region
	useEffect(() => {
		if (mapLibre) {
			// mapLibre.fitBounds(currentAdmOption?.geometry ?? session?.user.geometry, { padding: 100 })
		}
	}, [mapLibre, currentAdmOption?.geometry, session?.user.geometry])

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
					{isCurrentRegionOpen && (
						<Box className='flex flex-col gap-1 rounded-[5px] bg-white p-2'>
							{currentRegion.map((region) => {
								return (
									<Typography
										key={region}
										className='!text-2xs text-black'
									>{`${t('common:currentRegion')} : ${region}`}</Typography>
								)
							})}
						</Box>
					)}
				</Box>

				<Box
					className={classNames(
						'absolute bottom-3 left-3 z-10 flex items-center gap-2 rounded-[5px] bg-white py-1 pl-2 pr-3',
						{ '!hidden': mapTypeArray.length === 0 },
					)}
				>
					<Box
						className={classNames('hidden items-center gap-1.5', {
							'!flex': mapTypeArray.includes(mapTypeCode.hotspots),
						})}
					>
						<Box className='h-3 w-3 rounded-full bg-[#FF0000]'></Box>
						<Typography className='!text-2xs text-black'>{t('hotspot')}</Typography>
					</Box>
					<Box
						className={classNames('hidden items-center gap-1.5', {
							'!flex': mapTypeArray.includes(mapTypeCode.burnArea),
						})}
					>
						<Box className='h-2 w-3 bg-[#F9B936]'></Box>
						<Typography className='!text-2xs text-black'>{t('burntScar')}</Typography>
					</Box>
					<Box
						className={classNames('hidden items-center gap-1.5', {
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
