import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'
import { GetDashBoardBurntAreaDtoIn } from '@interface/dto/brunt-area/brunt-area.dto-in'
import { GetDashBoardBurntAreaDtoOut } from '@interface/dto/brunt-area/brunt-area.dto.out'

const mapAnalyze = {
	getBurnAreaCalendar: async (): Promise<ResponseDto<string[]>> => await api.get('/brunt-area/burn-area-calendar'),
	getDashBoardBurntArea: async (
		payload: GetDashBoardBurntAreaDtoIn,
	): Promise<ResponseDto<GetDashBoardBurntAreaDtoOut>> => {
		return await api.get(
			`/brunt-area/dashboard?startDate=${payload.startDate}&endDate=${payload.endDate}${payload.admC ? `&admC=${payload.admC}` : ''}${payload.mapType ? `&mapType=${payload.mapType}` : ''}${payload.inSugarcan?.length ? `&inSugarcan=${payload.inSugarcan}` : ''}`,
		)
	},
}

export default mapAnalyze
