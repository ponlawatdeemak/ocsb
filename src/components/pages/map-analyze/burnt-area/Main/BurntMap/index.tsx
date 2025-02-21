import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { useEffect } from 'react'
import { OptionType } from '../SearchForm'
import {
	GetBurntBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'
import { IconLayer } from '@deck.gl/layers'

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

	const geoJsonLayer = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.09888, 14.63038],
				},
				properties: {
					id: 11970,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.07821, 14.63322],
				},
				properties: {
					id: 11971,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [100.85167, 14.67654],
				},
				properties: {
					id: 12071,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'PHRAPHUTTHABAT',
						th: 'พระพุทธบาท',
					},
					adm3: {
						en: 'เขาวง',
						th: 'เขาวง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.0741, 14.63018],
				},
				properties: {
					id: 12502,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.07521, 14.63487],
				},
				properties: {
					id: 12503,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.04071, 14.6463],
				},
				properties: {
					id: 12707,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'บ้านป่า',
						th: 'บ้านป่า',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [100.85405, 14.67673],
				},
				properties: {
					id: 12879,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'PHRAPHUTTHABAT',
						th: 'พระพุทธบาท',
					},
					adm3: {
						en: 'เขาวง',
						th: 'เขาวง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.07845, 14.63246],
				},
				properties: {
					id: 14261,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.07585, 14.63488],
				},
				properties: {
					id: 14612,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [101.12353, 14.64187],
				},
				properties: {
					id: 14613,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'KAENG KHOI',
						th: 'แก่งคอย',
					},
					adm3: {
						en: 'ทับกวาง',
						th: 'ทับกวาง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
			{
				type: 'Feature',
				geometry: {
					type: 'Point',
					coordinates: [100.85323, 14.67647],
				},
				properties: {
					id: 14681,
					adm1: {
						en: 'SARABURI',
						th: 'สระบุรี',
					},
					adm2: {
						en: 'PHRAPHUTTHABAT',
						th: 'พระพุทธบาท',
					},
					adm3: {
						en: 'เขาวง',
						th: 'เขาวง',
					},
					date: '2025-02-14T00:00:00',
					regionId: 1,
				},
			},
		],
	}

	useEffect(() => {
		if (mapLibre && overlay) {
			mapLibre.fitBounds(currentAdmOption?.geometry ?? session?.user.geometry, { padding: 100 })

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

				const layers = [
					new IconLayer({
						id: 'hotspot' + `-${new Date().getTime()}`,
						data: geoJsonLayer.features.map((data) => data.geometry),
						pickable: true,
						sizeScale: 1,
						getPosition: (d) => {
							return d.geometry.coordinates
						},
						// beforeId: 'custom-referer-layer',
						getSize: 15,
						getIcon: (d) => {
							return {
								url: `<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="7" cy="7" r="7" fill="#FF0000" fill-opacity="0.4"/>
                                    <circle cx="7" cy="7" r="4" fill="#FF0000"/>
                                    </svg>
                                `,
								width: 120,
								height: 120,
								mask: false,
							}
						},
					}),
				]
				// load hotspot if open
				// load burnt if open
				// load plant if open

				// set overlay
				overlay.setProps({ layers: [layers] })
			})
		}
	}, [mapLibre, overlay, session?.user.geometry, currentAdmOption?.geometry])

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

export default BurntMapMain
