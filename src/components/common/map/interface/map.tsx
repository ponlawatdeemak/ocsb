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
