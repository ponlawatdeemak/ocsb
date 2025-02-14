import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'
import {
	GetBurntOverviewDtoIn,
	GetHeatPointsOverviewDtoIn,
	GetHeatPointsSugarcaneOverviewDtoIn,
	GetPlantOverviewDtoIn,
	GetProductOverviewDtoIn,
	GetProductPredictOverviewDtoIn,
	GetSummaryOverviewDtoIn,
} from '@interface/dto/overview/overview.dto-in'
import {
	GetBurntOverviewDtoOut,
	GetHeatPointsOverviewDtoOut,
	GetHeatPointsSugarcaneOverviewDtoOut,
	GetPlantOverviewDtoOut,
	GetProductOverviewDtoOut,
	GetProductPredictOverviewDtoOut,
	GetSummaryOverviewDtoOut,
} from '@interface/dto/overview/overview.dto-out'

const overview = {
	getSummaryOverview: async (payload: GetSummaryOverviewDtoIn): Promise<ResponseDto<GetSummaryOverviewDtoOut>> =>
		await api.get(`/overview/summary?${payload.id && `id=${payload.id}`}`),
	getHeatPointsOverview: async (
		payload: GetHeatPointsOverviewDtoIn,
	): Promise<ResponseDto<GetHeatPointsOverviewDtoOut[]>> =>
		await api.get(`/overview/heat-points?${payload.id && `id=${payload.id}`}`),
	getHeatPointsSugarcaneOverview: async (
		payload: GetHeatPointsSugarcaneOverviewDtoIn,
	): Promise<ResponseDto<GetHeatPointsSugarcaneOverviewDtoOut[]>> =>
		await api.get(`/overview/heat-points-sugarcane?${payload.id && `id=${payload.id}`}`),
	getBurntOverview: async (payload: GetBurntOverviewDtoIn): Promise<ResponseDto<GetBurntOverviewDtoOut[]>> =>
		await api.get(`/overview/burnt?${payload.id && `id=${payload.id}`}`),
	getPlantOverview: async (payload: GetPlantOverviewDtoIn): Promise<ResponseDto<GetPlantOverviewDtoOut>> =>
		await api.get(`/overview/plant?${payload.id && `id=${payload.id}`}`),
	getProductOverview: async (payload: GetProductOverviewDtoIn): Promise<ResponseDto<GetProductOverviewDtoOut[]>> =>
		await api.get(`/overview/product?${payload.id && `id=${payload.id}`}`),
	getProductPredictOverview: async (
		payload: GetProductPredictOverviewDtoIn,
	): Promise<ResponseDto<GetProductPredictOverviewDtoOut[]>> =>
		await api.get(`/overview/product-predict?${payload.id && `id=${payload.id}`}`),
}

export default overview
