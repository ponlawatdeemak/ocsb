import { api } from '@/api/core'
import { ResponseDto } from '@interface/config/app.config'

const mapAnalyze = {
	getBurnAreaCalendar: async (): Promise<ResponseDto<string[]>> => await api.get('/brunt-area/burn-area-calendar'),
}

export default mapAnalyze
