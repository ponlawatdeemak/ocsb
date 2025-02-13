import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import { GetLookupDtoIn } from '@interface/dto/lookup/lookup.dto-in'
import { GetLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import * as _ from 'lodash'

const lookup = {
	get: async (payload: GetLookupDtoIn) => {
		const res = await api.get(`/lookup?name=${payload.name}${payload.where ? `&where=${payload.where}` : ''}`)
		const data = res?.data?.map((el: any) => _.mapKeys(el, (val, key) => _.camelCase(key)))
		return data
	},
}

export default lookup
