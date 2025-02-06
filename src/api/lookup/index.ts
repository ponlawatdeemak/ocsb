import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import { GetLookupDtoIn } from '@interface/dto/lookup/lookup.dto-in'
import { GetLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'

const lookup = {
	get: async (payload: GetLookupDtoIn): Promise<ResponseDto<GetLookupDtoOut[]>> => {
		return await api.get(`/lookup/${payload.name}`)
	},
}

export default lookup
