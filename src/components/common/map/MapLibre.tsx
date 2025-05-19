import 'maplibre-gl/dist/maplibre-gl.css'
import React, { FC, memo, useCallback, useEffect } from 'react'
import { Map, useControl } from 'react-map-gl/maplibre'
import { MapboxOverlay } from '@deck.gl/mapbox'
import useMapStore from './store/map'
import { MapInterface } from './interface/map'
import maplibregl, { MapLibreEvent, MapStyleDataEvent, StyleSpecification } from 'maplibre-gl'
import { googleProtocol } from '@/utils/google'
import { IconLayer } from '@deck.gl/layers'
import { MVTLayer } from '@deck.gl/geo-layers'
import { Layer } from '@deck.gl/core'

export const recreateLayer = (layerList: Layer[]) => {
	return layerList.map((item) => {
		// const spliter = '---'
		// let id = item.id?.split(spliter)?.[0] || ''
		// id = `${id}${spliter}${new Date().getTime()}`
		const newProp = {
			...item.props,
			// id,
			beforeId: 'custom-referer-layer',
		} as any

		if (item instanceof IconLayer) {
			newProp.data = item.props.data
			return new IconLayer(newProp)
		}

		if (item instanceof MVTLayer) {
			return new MVTLayer(newProp)
		}
		return item
	})
}

const DeckGLOverlay: FC = () => {
	const { layers } = useMapStore()
	const setOverlay = useMapStore((state) => state.setOverlay)
	const overlay = useControl<MapboxOverlay>(() => new MapboxOverlay({ interleaved: true }))

	// set all layer to deck.gl instance
	useEffect(() => {
		if (overlay instanceof MapboxOverlay) {
			const temp = recreateLayer(layers)
			overlay.setProps({ layers: temp })
		}
	}, [layers, overlay])

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

interface MapLibreProps extends MapInterface {
	mapStyle: string | StyleSpecification
}

const MapLibre: FC<MapLibreProps> = ({ viewState, mapStyle }) => {
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
			dragRotate={false}
		>
			<DeckGLOverlay />
		</Map>
	)
}

export default memo(MapLibre)
