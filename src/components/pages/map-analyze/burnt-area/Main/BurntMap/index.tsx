import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { memo, useEffect } from 'react'
import { OptionType } from '../SearchForm'
import {
	GetBurntBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'
import { IconLayer, PolygonLayer } from '@deck.gl/layers'

import { getPinHotSpot } from '@/utils/pin'

interface BurntMapMainProps {
	className?: string
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

	return (
		<Box className={classNames('', className)}>
			<Box className='flex h-full grow'>
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
