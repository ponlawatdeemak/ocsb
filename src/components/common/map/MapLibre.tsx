import 'maplibre-gl/dist/maplibre-gl.css'
import React, { FC, memo, useCallback, useEffect } from 'react'
import { Map, useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay } from '@deck.gl/mapbox'
import useMapStore from './store/map'
import maplibregl, { MapLibreEvent, MapStyleDataEvent, StyleSpecification } from 'maplibre-gl'
import { googleProtocol } from '@/utils/google'
import { viewState } from './interface/map'

const DeckGLOverlay: FC = () => {
	const setOverlay = useMapStore((state) => state.setOverlay)
	const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay({ interleaved: true }))

	useEffect(() => {
		if (overlay instanceof MapboxOverlay) {
			setOverlay(overlay)
		}
		return () => {
			overlay.finalize()
		}
	}, [overlay, setOverlay])

	return null
}

interface MapLibreProps {
	mapStyle: string | StyleSpecification
}

const MapLibre: FC<MapLibreProps> = ({ mapStyle }) => {
	const { setMapLibre } = useMapStore()

	// initial google basemap style
	useEffect(() => {
		maplibregl.addProtocol('google', googleProtocol)
	}, [])

	// remove map instance in context
	useEffect(() => {
		return () => {
			setMapLibre(null)
		}
	}, [setMapLibre])

	const onLoad = useCallback(
		(event: MapLibreEvent) => {
			const map = event.target
			setMapLibre(map)
		},
		[setMapLibre],
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
			<DeckGLOverlay />
		</Map>
	)
}

export default memo(MapLibre)
