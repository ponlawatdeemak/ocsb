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

const mapAnalyze = {
	getBurnAreaCalendar: async (): Promise<ResponseDto<string[]>> => await api.get('/brunt-area/burn-area-calendar'),
	getDashBoardBurntArea: async (
		payload: GetDashBoardBurntAreaDtoIn,
	): Promise<ResponseDto<GetDashBoardBurntAreaDtoOut>> => {
		return await api.get(
			`/brunt-area/dashboard?startDate=${payload.startDate}&endDate=${payload.endDate}${payload.admC ? `&admC=${payload.admC}` : ''}${payload.mapType ? `&mapType=${payload.mapType}` : ''}${payload.inSugarcan ? `&inSugarcan=${payload.inSugarcan}` : ''}`,
		)
	},
	getHotspotBurntArea: async (
		payload: GetHotspotBurntAreaDtoIn,
	): Promise<ResponseDto<GetHotspotBurntAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.inSugarcan.length !== 0) params.append('inSugarcan', JSON.stringify(payload.inSugarcan))
		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/hotspot?${params}`)
	},
	getBurntBurntArea: async (payload: GetBurntBurntAreaDtoIn): Promise<ResponseDto<GetBurntBurntAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/burnt?${params}`)
	},
	getPlantBurntArea: async (payload: GetPlantBurntAreaDtoIn): Promise<ResponseDto<GetPlantBurntAreaDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC !== undefined) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)

		return await api.get(`/brunt-area/plant?${params}`)
	},
}

export default mapAnalyze
