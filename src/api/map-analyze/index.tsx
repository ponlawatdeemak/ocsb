import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'
import { GetDashBoardBurntAreaDtoIn, GetPrintInfoBurntDtoIn } from '@interface/dto/burnt-area/burnt-area.dto-in'
import { GetDashBoardBurntAreaDtoOut, GetPrintInfoBurntDtoOut } from '@interface/dto/burnt-area/burnt-area.dto.out'
import { GetDashboardYieldAreaDtoIn } from '@interface/dto/yield-area/yield-area.dto-in'
import { GetDashboardYieldAreaDtoOut } from '@interface/dto/yield-area/yield-area.dto-out'
import { AxiosRequestConfig } from 'axios'

const mapAnalyze = {
	getBurnAreaCalendar: async (): Promise<ResponseDto<string[]>> => await api.get('/burnt-area/burn-area-calendar'),
	getDashBoardBurntArea: async (
		payload: GetDashBoardBurntAreaDtoIn,
	): Promise<ResponseDto<GetDashBoardBurntAreaDtoOut>> => {
		const mapType = payload.mapType?.map((type) => `&mapType=${type}`).join('')
		const inSugarcan = payload.inSugarcan?.map((hotspotTypeCode) => `&inSugarcan=${hotspotTypeCode}`).join('')
		const admC = `&admC=${payload.admC ?? ''}`

		return await api.get(
			`/burnt-area/dashboard?startDate=${payload.startDate}&endDate=${payload.endDate}${payload.admC ? admC : ''}${mapType ?? ''}${inSugarcan ?? ''}`,
		)
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
	getPrintInfo: async (
		payload: GetPrintInfoBurntDtoIn,
		axiosOption?: AxiosRequestConfig,
	): Promise<ResponseDto<GetPrintInfoBurntDtoOut>> => {
		const params = new URLSearchParams()
		if (payload.startDate) params.append('startDate', payload.startDate)
		if (payload.endDate) params.append('endDate', payload.endDate)
		if (payload.admC) params.append('admC', payload.admC.toString())
		if (payload.polygon) params.append('polygon', payload.polygon)
		if (payload.repeat) params.append('repeat', payload.repeat.toString())
		if (payload.mapType?.length) payload.mapType?.forEach((item) => params.append('mapType', item))
		if (payload.inSugarcan?.length) payload.inSugarcan?.forEach((item) => params.append('inSugarcan', item))
		return await api.get(`/burnt-area/print-info?${params}`, undefined, axiosOption)
	},
}

export default mapAnalyze
