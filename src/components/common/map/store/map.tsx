import { create } from 'zustand'
import { Layer } from '@deck.gl/core'
import type { MapboxOverlay } from '@deck.gl/mapbox'
import { MapInfoWindow } from '../interface/map'

export type MapStore = {
	mapLibre: maplibregl.Map | null
	setMapLibre: (value: maplibregl.Map | null) => void
	infoWindow: MapInfoWindow | null
	setInfoWindow: (value: MapInfoWindow | null) => void

	overlay?: MapboxOverlay
	setOverlay: (value: MapboxOverlay) => void
	layers: Layer[]
	addLayer: (value: Layer) => void
	setLayers: (value: Layer[]) => void
	getLayer: (value: string) => Layer | undefined
	removeLayer: (value: string) => void
}

export const useMapStore = create<MapStore>()((set, get) => ({
	mapLibre: null,
	setMapLibre: (value) => set((state) => ({ ...state, mapLibre: value })),
	infoWindow: null,
	setInfoWindow: (value) => set((state) => ({ ...state, infoWindow: value })),
	overlay: undefined,
	setOverlay: (overlay) => set((state) => ({ ...state, overlay })),
	layers: [],
	addLayer: (layer) => set((state) => ({ ...state, layers: [...state.layers, layer] })),
	setLayers: (layers) => set((state) => ({ ...state, layers })),
	getLayer: (layerId: string): Layer | undefined => {
		const layer = get().layers.find((layer) => layer instanceof Layer && layer.id === layerId)
		return layer instanceof Layer ? layer : undefined
	},

	removeLayer: (layerId) =>
		set((state) => ({
			...state,
			layers: state.layers.filter((layer) => !(layer instanceof Layer && layer.id === layerId)),
		})),
}))

export default useMapStore
