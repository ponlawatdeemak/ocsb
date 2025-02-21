import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'
import { GetDashBoardBurntAreaDtoIn } from '@interface/dto/brunt-area/brunt-area.dto-in'
import { GetDashBoardBurntAreaDtoOut } from '@interface/dto/brunt-area/brunt-area.dto.out'

const mapAnalyze = {
	getBurnAreaCalendar: async (): Promise<ResponseDto<string[]>> => await api.get('/brunt-area/burn-area-calendar'),
	getDashBoardBurntArea: async (
		payload: GetDashBoardBurntAreaDtoIn,
	): Promise<ResponseDto<GetDashBoardBurntAreaDtoOut>> => {
		const mapType = payload.mapType?.map((type) => `&mapType=${type}`).join('')
		const inSugarcan = payload.inSugarcan?.map((hotspotTypeCode) => `&inSugarcan=${hotspotTypeCode}`).join('')
		const admC = `&admC=${payload.admC}`

		return await api.get(
			`/brunt-area/dashboard?startDate=${payload.startDate}&endDate=${payload.endDate}${admC ?? ''}${mapType ?? ''}${inSugarcan ?? ''}`,
		)
	},
}

export default mapAnalyze
