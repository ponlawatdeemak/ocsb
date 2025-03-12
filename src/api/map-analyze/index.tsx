import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'
import {
	GetBurntBurntAreaDtoIn,
	GetDashBoardBurntAreaDtoIn,
	GetHotspotBurntAreaDtoIn,
	GetPlantBurntAreaDtoIn,
} from '@interface/dto/brunt-area/brunt-area.dto-in'
import {
	GetBurntBurntAreaDtoOut,
	GetDashBoardBurntAreaDtoOut,
	GetHotspotBurntAreaDtoOut,
	GetPlantBurntAreaDtoOut,
} from '@interface/dto/brunt-area/brunt-area.dto.out'
import {
	GetDashboardYieldAreaDtoIn,
	GetPlantYieldAreaDtoIn,
	GetProductYieldAreaDtoIn,
	GetReplantYieldAreaDtoIn,
} from '@interface/dto/yield-area/yield-area.dto-in'
import {
	GetDashboardYieldAreaDtoOut,
	GetPlantYieldAreaDtoOut,
	GetProductYieldAreaDtoOut,
	GetReplantYieldAreaDtoOut,
} from '@interface/dto/yield-area/yield-area.dto-out'
import { AxiosRequestConfig } from 'axios'

const mapAnalyze = {
	getBurnAreaCalendar: async (): Promise<ResponseDto<string[]>> => await api.get('/brunt-area/burn-area-calendar'),
	getDashBoardBurntArea: async (
		payload: GetDashBoardBurntAreaDtoIn,
	): Promise<ResponseDto<GetDashBoardBurntAreaDtoOut>> => {
		const mapType = payload.mapType?.map((type) => `&mapType=${type}`).join('')
		const inSugarcan = payload.inSugarcan?.map((hotspotTypeCode) => `&inSugarcan=${hotspotTypeCode}`).join('')
		const admC = `&admC=${payload.admC ?? ''}`

		return await api.get(
			`/brunt-area/dashboard?startDate=${payload.startDate}&endDate=${payload.endDate}${payload.admC ? admC : ''}${mapType ?? ''}${inSugarcan ?? ''}`,
		)
	},
	getHotspotBurntArea: async (
		payload: GetHotspotBurntAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetHotspotBurntAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.inSugarcan.length !== 0) params.append('inSugarcan', JSON.stringify(payload.inSugarcan))
		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/hotspot?${params}`, undefined, axiosOption)
	},
	getBurntBurntArea: async (
		payload: GetBurntBurntAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetBurntBurntAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/burnt?${params}`, undefined, axiosOption)
	},
	getPlantBurntArea: async (
		payload: GetPlantBurntAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetPlantBurntAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/plant?${params}`, undefined, axiosOption)
	},

	getDashBoardYieldArea: async (
		payload: GetDashboardYieldAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetDashboardYieldAreaDtoOut>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.mapType?.length !== 0) payload.mapType?.forEach((item) => params.append('mapType', item))

		return await api.get(`/yield-area/dashboard?${params}`, undefined, axiosOption)
	},
	getPlantYieldArea: async (
		payload: GetPlantYieldAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetPlantYieldAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/plant?${params}`, undefined, axiosOption)
	},
	getProductYieldArea: async (
		payload: GetProductYieldAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetProductYieldAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/yield-area/product?${params}`, undefined, axiosOption)
	},
	getReplantYieldArea: async (
		payload: GetReplantYieldAreaDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetReplantYieldAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)
		if (payload.repeat) params.append('repeat', payload.repeat.toString())

		return await api.get(`/yield-area/replant?${params}`, undefined, axiosOption)
	},
}

export default mapAnalyze
