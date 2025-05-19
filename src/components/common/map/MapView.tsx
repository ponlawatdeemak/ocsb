import { memo, PropsWithChildren, useCallback, useMemo } from 'react'
import classNames from 'classnames'
import { BasemapType } from './interface/map'
import MapLibre from './MapLibre'
import { CircularProgress } from '@mui/material'
import useMapStore from './store/map'
import { layerIdConfig } from '@/config/app.config'
import { BASEMAP } from '@deck.gl/carto'
import { IconLayer } from '@deck.gl/layers'
import { createGoogleStyle } from '@/utils/google'
import MapTools from './tools'
import { getPin } from '@/utils/pin'
import Image from 'next/image'

const CURRENT_LOCATION_ZOOM = 14

export interface MapViewProps extends PropsWithChildren {
	mapId: string
	loading?: boolean
	isInteractive?: boolean
	isPaddingGoogle?: boolean
	isHideAttributionControl?: boolean
}

export function MapView({
	children,
	mapId,
	loading,
	isInteractive = true,
	isPaddingGoogle = false,
	isHideAttributionControl = false,
}: Readonly<MapViewProps>) {
	const { getLayer, addLayer, removeLayer, mapLibre, basemap, setBasemap } = useMapStore()

	const mapStyle = useMemo(() => {
		if (basemap === BasemapType.CartoLight) {
			return BASEMAP.VOYAGER
		} else if (basemap === BasemapType.CartoDark) {
			return BASEMAP.DARK_MATTER
		} else if (basemap === BasemapType.Google) {
			return createGoogleStyle('google', 'satellite', process.env.GOOGLE_MAPS_API_KEY)
		} else {
			return BASEMAP.VOYAGER
		}
	}, [basemap])

	const onBasemapChanged = useCallback(
		(selectedBasemap: BasemapType) => {
			setBasemap(selectedBasemap)
		},
		[setBasemap],
	)

	const onGetLocation = useCallback(
		(coords: GeolocationCoordinates) => {
			const layer = getLayer(layerIdConfig.toolCurrentLocation)
			if (layer) {
				removeLayer(mapId, layerIdConfig.toolCurrentLocation)
			} else {
				const { latitude, longitude } = coords
				const iconLayer = new IconLayer({
					id: layerIdConfig.toolCurrentLocation,
					data: [{ coordinates: [longitude, latitude] }],
					pickable: true,
					getIcon: () => {
						return {
							url: getPin('#3fb0ff'),
							anchorY: 69,
							width: 58,
							height: 69,
							mask: false,
						}
					},
					getPosition: (d: any) => d.coordinates,
					getSize: 40,
					getColor: [255, 0, 0],
				})
				addLayer(mapId, iconLayer)
				mapLibre[mapId]?.flyTo({ center: [longitude, latitude], zoom: CURRENT_LOCATION_ZOOM, duration: 3000 })
			}
		},
		[getLayer, mapLibre, addLayer, removeLayer, mapId],
	)

	return (
		<div className={classNames('relative flex flex-1 overflow-hidden')}>
			{loading && (
				<CircularProgress
					size={16}
					className={classNames('absolute right-[50px] top-[145px] z-20 md:right-16 md:top-3', {
						'!text-[#fff]': basemap === BasemapType.Google || basemap === BasemapType.CartoDark,
					})}
				/>
			)}
			<MapTools
				mapId={mapId}
				onBasemapChanged={onBasemapChanged}
				onGetLocation={onGetLocation}
				currentBaseMap={basemap}
			/>

			{basemap === BasemapType.Google && (
				<Image
					src={'/images/map/google_on_non_white_hdpi.png'}
					width={59}
					height={18}
					className={classNames(
						`absolute z-[9] md:bottom-3 ${isPaddingGoogle ? 'left-[calc(50%+38px)]' : 'left-[calc(50%-29.5px)]'} ${isHideAttributionControl ? 'bottom-2' : 'bottom-[52px]'}`,
					)}
					alt={`Google Logo`}
				/>
			)}
			<MapLibre
				mapId={mapId}
				mapStyle={mapStyle}
				isInteractive={isInteractive}
				isHideAttributionControl={isHideAttributionControl}
			/>

			{children}
		</div>
	)
}

export default memo(MapView)
