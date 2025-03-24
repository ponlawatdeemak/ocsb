import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'
import {
	GetBurntOverviewDtoIn,
	GetHeatPointsOverviewDtoIn,
	GetHeatPointsSugarcaneOverviewDtoIn,
	GetOverviewUsageDtoIn,
	GetPlantOverviewDtoIn,
	GetProductOverviewDtoIn,
	GetProductPredictOverviewDtoIn,
	GetReplantOverviewDtoIn,
	GetSummaryOverviewDtoIn,
} from '@interface/dto/overview/overview.dto-in'
import {
	GetBurntOverviewDtoOut,
	GetHeatPointsOverviewDtoOut,
	GetHeatPointsSugarcaneOverviewDtoOut,
	GetOverviewUsageDtoOut,
	GetPlantOverviewDtoOut,
	GetProductOverviewDtoOut,
	GetProductPredictOverviewDtoOut,
	GetReplantOverviewDtoOut,
	GetSummaryOverviewDtoOut,
} from '@interface/dto/overview/overview.dto-out'

const overview = {
	getSummaryOverview: async (payload: GetSummaryOverviewDtoIn): Promise<ResponseDto<GetSummaryOverviewDtoOut>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/summary?${payload.id && id}`)
	},
	getHeatPointsOverview: async (
		payload: GetHeatPointsOverviewDtoIn,
	): Promise<ResponseDto<GetHeatPointsOverviewDtoOut[]>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/heat-points?${payload.id && id}`)
	},
	getHeatPointsSugarcaneOverview: async (
		payload: GetHeatPointsSugarcaneOverviewDtoIn,
	): Promise<ResponseDto<GetHeatPointsSugarcaneOverviewDtoOut[]>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/heat-points-sugarcane?${payload.id && id}`)
	},
	getBurntOverview: async (payload: GetBurntOverviewDtoIn): Promise<ResponseDto<GetBurntOverviewDtoOut[]>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/burnt?${payload.id && id}`)
	},
	getPlantOverview: async (payload: GetPlantOverviewDtoIn): Promise<ResponseDto<GetPlantOverviewDtoOut>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/plant?${payload.id && id}`)
	},
	getProductOverview: async (payload: GetProductOverviewDtoIn): Promise<ResponseDto<GetProductOverviewDtoOut[]>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/product?${payload.id && id}`)
	},
	getProductPredictOverview: async (
		payload: GetProductPredictOverviewDtoIn,
	): Promise<ResponseDto<GetProductPredictOverviewDtoOut[]>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/product-predict?${payload.id && id}`)
	},
	getReplantOverview: async (payload: GetReplantOverviewDtoIn): Promise<ResponseDto<GetReplantOverviewDtoOut[]>> => {
		const id = `id=${payload.id}`
		return await api.get(`/overview/replant?${payload.id && id}`)
	},

	getUsage: async (payload: GetOverviewUsageDtoIn): Promise<ResponseDto<GetOverviewUsageDtoOut>> => {
		const update = `update=${payload.update}`
		return await api.get(`/overview/usage?${payload.update ? update : ''}`)
	},
}

export default overview
