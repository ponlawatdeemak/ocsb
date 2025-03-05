import { create } from 'zustand'
import { Layer } from '@deck.gl/core'
import type { MapboxOverlay } from '@deck.gl/mapbox'

export type MapStore = {
	mapLibre: Record<string, maplibregl.Map | null>
	setMapLibre: (id: string, value: maplibregl.Map | null) => void

	overlays: Record<string, MapboxOverlay | null>
	setOverlay: (id: string, overlay: MapboxOverlay | null) => void

	layers: Record<string, Layer[]>
	addLayer: (id: string, layer: Layer) => void
	setLayers: (id: string, layers: Layer[]) => void
	getLayer: (id: string) => Layer | undefined
	removeLayer: (id: string, layerId: string) => void
}

export const useMapStore = create<MapStore>()((set, get) => ({
	mapLibre: {},
	setMapLibre: (id, value) => set((state) => ({ ...state, mapLibre: { ...state.mapLibre, [id]: value } })),

	overlays: {},
	setOverlay: (id, overlay) => set((state) => ({ ...state, overlays: { ...state.overlays, [id]: overlay } })),

	layers: {},
	addLayer: (id, layer) =>
		set((state) => ({ ...state, layers: { ...state.layers, [id]: [...(state.layers[id] || []), layer] } })),
	setLayers: (id, layers) => set((state) => ({ ...state, layers: { ...state.layers, [id]: layers } })),
	getLayer: (id) => {
		const layers = get().layers[id]
		return layers ? layers[0] : undefined
	},

	removeLayer: (id, layerId) =>
		set((state) => ({
			...state,
			layers: { ...state.layers, [id]: (state.layers[id] || []).filter((layer) => layer.id !== layerId) },
		})),
}))

export default useMapStore
