import 'maplibre-gl/dist/maplibre-gl.css'
import React, { FC, memo, useCallback, useEffect, useMemo } from 'react'
import { AttributionControl, Map, ScaleControl, useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay } from '@deck.gl/mapbox'
import useMapStore from './store/map'
import maplibregl, { LngLatBoundsLike, MapLibreEvent, MapStyleDataEvent, StyleSpecification } from 'maplibre-gl'
import { googleProtocol } from '@/utils/google'
import { useSession } from 'next-auth/react'

interface DeckGLOverlayProps {
	mapId: string
}

const DeckGLOverlay: React.FC<DeckGLOverlayProps> = ({ mapId }) => {
	const setOverlay = useMapStore((state) => state.setOverlay)
	const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay({ interleaved: true }))

	useEffect(() => {
		if (overlay instanceof MapboxOverlay) {
			setOverlay(mapId, overlay)
		}
		return () => {
			overlay.finalize()
		}
	}, [overlay, setOverlay, mapId])

	return null
}

interface MapLibreProps {
	mapId: string
	mapStyle: string | StyleSpecification
	isInteractive: boolean
	isHideAttributionControl?: boolean
}

const MapLibre: FC<MapLibreProps> = ({ mapId, mapStyle, isInteractive = true, isHideAttributionControl = false }) => {
	const { setMapLibre } = useMapStore()
	const { data: session } = useSession()
	// initial google basemap style
	useEffect(() => {
		maplibregl.addProtocol('google', googleProtocol)
	}, [])

	// remove map instance in context
	useEffect(() => {
		return () => {
			setMapLibre(mapId, null)
		}
	}, [setMapLibre, mapId])

	const onLoad = useCallback(
		(event: MapLibreEvent) => {
			const map = event.target
			setMapLibre(mapId, map)

			const attributionControl = new maplibregl.AttributionControl({
				compact: true, // ขอให้มันเริ่มแบบ compact
			})
			map.addControl(attributionControl, 'bottom-right')
			if (isHideAttributionControl) {
				;(attributionControl as any)._updateCompactMinimize()
			}

			const scaleControl = new maplibregl.ScaleControl()
			map.addControl(scaleControl, 'bottom-right')
		},
		[setMapLibre, mapId],
	)

	const onStyleData = (event: MapStyleDataEvent) => {
		// add reference layer for all deck.gl layer under this layer and display draw layer to top
		const map = event.target

		const refSource = map.getSource('custom-referer-source')
		if (!refSource) {
			map.addSource('custom-referer-source', {
				type: 'geojson',
				data: { type: 'FeatureCollection', features: [] },
			})
		}
		const refLayer = map.getLayer('custom-referer-layer')
		if (!refLayer) {
			map.addLayer({
				id: 'custom-referer-layer',
				type: 'symbol',
				source: 'custom-referer-source',
				layout: { visibility: 'none' },
			})
		}
	}

	const viewState = useMemo(() => {
		return { bounds: session?.user?.geometry as LngLatBoundsLike, fitBoundsOptions: { padding: 100 } }
	}, [session?.user?.geometry])

	return session?.user?.geometry ? (
		<Map
			antialias
			initialViewState={viewState}
			mapStyle={mapStyle}
			preserveDrawingBuffer={true}
			onLoad={onLoad}
			onStyleData={onStyleData}
			interactive={isInteractive}
			touchZoomRotate={true}
			touchPitch={false}
			dragRotate={true}
			maxPitch={0}
			minPitch={0}
			attributionControl={false}
		>
			{/* <ScaleControl position='bottom-right' /> */}
			<DeckGLOverlay mapId={mapId} />
		</Map>
	) : (
		<></>
	)
}

export default memo(MapLibre)
