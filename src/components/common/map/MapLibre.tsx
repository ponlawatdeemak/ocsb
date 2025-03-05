import 'maplibre-gl/dist/maplibre-gl.css'
import React, { FC, memo, useCallback, useEffect } from 'react'
import { Map, ScaleControl, useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay } from '@deck.gl/mapbox'
import useMapStore from './store/map'
import maplibregl, { MapLibreEvent, MapStyleDataEvent, StyleSpecification } from 'maplibre-gl'
import { googleProtocol } from '@/utils/google'
import { viewState } from './interface/map'

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
}

const MapLibre: FC<MapLibreProps> = ({ mapId, mapStyle }) => {
	const { setMapLibre } = useMapStore()

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

	return (
		<Map
			antialias
			initialViewState={viewState}
			mapStyle={mapStyle}
			onLoad={onLoad}
			onStyleData={onStyleData}
			touchZoomRotate={true}
			touchPitch={false}
			dragRotate={true}
			maxPitch={0}
			minPitch={0}
		>
			<ScaleControl position='bottom-right' />
			<DeckGLOverlay mapId={mapId} />
		</Map>
	)
}

export default memo(MapLibre)
