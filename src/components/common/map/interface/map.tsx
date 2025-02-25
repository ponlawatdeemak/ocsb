export interface BaseMap {
	value: BasemapType
	image: string
	label: string
}

export enum BasemapType {
	Google,
	CartoLight,
	CartoDark,
}

export const viewState = {
	longitude: 100,
	latitude: 13,
	zoom: 5,
	bearing: 0,
	pitch: 0,
}
