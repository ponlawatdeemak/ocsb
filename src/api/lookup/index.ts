import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import { GetLookupOutDto } from '@/api/lookup/dto-out.dto'

const lookup = {
	get: async (lookupName: string): Promise<ResponseDto<GetLookupOutDto[]>> => {
		return await api.get(`/lookup/${lookupName}`)
	},
}

export default lookup
