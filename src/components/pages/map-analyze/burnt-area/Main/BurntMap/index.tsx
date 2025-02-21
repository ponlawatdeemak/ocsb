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
import { temp } from './mockup'
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
			mapLibre.fitBounds(currentAdmOption?.geometry ?? session?.user.geometry, { padding: 100 })
		}
	}, [mapLibre, currentAdmOption?.geometry, session?.user.geometry])

	// update layer
	useEffect(() => {
		if (mapLibre && overlay) {
			// mapLibre.fitBounds(currentAdmOption?.geometry ?? session?.user.geometry, { padding: 100 })
			if (hotspotBurntAreaData?.length) {
				const layers = [
					new IconLayer({
						id: 'hotspot' + `-${new Date().getTime()}`,
						data: hotspotBurntAreaData,
						pickable: true,
						sizeScale: 1,
						getPosition: (d) => d.geometry.coordinates,
						beforeId: 'custom-referer-layer',
						getSize: 28,
						getIcon: (d) => {
							return {
								url: getPinHotSpot(14),
								width: 28,
								height: 28,
								mask: false,
							}
						},
					}),
					// new PolygonLayer({
					// 	id: 'polygon-layer',
					// 	data: DATA,
					// 	pickable: true,
					// 	stroked: true,
					// 	filled: true,
					// 	lineWidthMinPixels: 1,
					// 	getPolygon: (d) => d.polygon,
					// 	getFillColor: (d) => d.color,
					// 	getLineColor: [0, 0, 0], // Black outline
					// 	// Interactive props
					// }),
				]
				// load hotspot if open
				// load burnt if open
				// load plant if open

				// set overlay
				overlay.setProps({ layers: [layers] })
			}
		}
	}, [mapLibre, overlay, hotspotBurntAreaData])

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
