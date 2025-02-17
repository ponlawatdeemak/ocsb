import { PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react'
import classNames from 'classnames'
import { BasemapType, MapInfoWindow, MapLayer, MapViewState } from './interface/map'
import MapLibre from './MapLibre'
import { Paper } from '@mui/material'
import useMapStore from './store/map'
import { layerIdConfig } from '@/config/app.config'
import { BASEMAP } from '@deck.gl/carto'
import { IconLayer } from '@deck.gl/layers'
import useResponsive from '@/hook/responsive'
import { createGoogleStyle } from '@/utils/google'
import MapTools from './tools'
import { getPin } from '@/utils/pin'

const CURRENT_LOCATION_ZOOM = 14
const DEFAULT = {
	viewState: {
		longitude: 100,
		latitude: 13,
		zoom: 5,
		bearing: 0,
		pitch: 0,
	},

	basemap: BasemapType.Google,
}

export interface MapViewProps extends PropsWithChildren {
	className?: string
	initialLayer?: MapLayer[]
}

export default function MapView({ className = '', initialLayer, children }: Readonly<MapViewProps>) {
	const { getLayer, addLayer, removeLayer, setLayers, infoWindow, setInfoWindow, mapLibre } = useMapStore()

	const [viewState, setViewState] = useState<MapViewState>(DEFAULT.viewState)
	const [basemap, setBasemap] = useState(DEFAULT.basemap)

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

	useEffect(() => {
		return () => {
			setInfoWindow(null)
		}
	}, [setInfoWindow])

	useEffect(() => {
		if (initialLayer?.length) {
			const layers = initialLayer.map((item) => item.layer)
			setLayers(layers)
		}
	}, [setLayers, initialLayer])

	const onViewStateChange = useCallback((viewState: MapViewState) => {
		setViewState(viewState)
	}, [])

	const onBasemapChanged = useCallback((basemap: BasemapType) => {
		setBasemap(basemap)
	}, [])

	const onGetLocation = useCallback(
		(coords: GeolocationCoordinates) => {
			const layer = getLayer(layerIdConfig.toolCurrentLocation)
			if (layer) {
				removeLayer(layerIdConfig.toolCurrentLocation)
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
				addLayer(iconLayer)
				mapLibre?.flyTo({ center: [longitude, latitude], zoom: CURRENT_LOCATION_ZOOM, duration: 3000 })
			}
		},
		[getLayer, mapLibre, addLayer, removeLayer],
	)

	return (
		<div className={classNames('relative flex flex-1 overflow-hidden', className)}>
			<MapTools onBasemapChanged={onBasemapChanged} onGetLocation={onGetLocation} currentBaseMap={basemap} />
			<MapLibre viewState={viewState} mapStyle={mapStyle} onViewStateChange={onViewStateChange} />

			{infoWindow && (
				<InfoWindow positon={infoWindow.positon} onClose={() => setInfoWindow(null)}>
					{infoWindow.children}
				</InfoWindow>
			)}
			{children}
		</div>
	)
}

export interface InfoWindowProps extends MapInfoWindow, PropsWithChildren {
	onClose?: () => void
}

const InfoWindow: React.FC<InfoWindowProps> = ({ children }) => {
	const { isDesktop } = useResponsive()

	return (
		<Paper
			className={classNames(
				'absolute top-12 z-10 !rounded-[8px]',
				isDesktop ? 'right-20' : 'left-[50%] -translate-x-1/2',
			)}
		>
			{children}
		</Paper>
	)
}
