import { api } from '@/api/core'
import { GetLookupDtoIn, GetSearchAdmLookupDtoIn } from '@interface/dto/lookup/lookup.dto-in'
import { GetLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import * as _ from 'lodash'

const lookup = {
	get: async (payload: GetLookupDtoIn) => {
		const where = `&where=${payload?.where || ''}`
		const sort = `&sort=${payload?.sort || ''}`
		const order = `&order=${payload?.order || ''}`

		const res = await api.get(`/lookup?name=${payload.name}${where ?? ''}${sort ?? ''}${order ?? ''}`)
		const data = res?.data?.map((el: any) => _.mapKeys(el, (val, key) => _.camelCase(key)))
		return data
	},
	getSearchAdm: async (payload: GetSearchAdmLookupDtoIn) => {
		const res = await api.get(`/lookup/search-adm?keyword=${payload.keyword}`)
		const data = res?.data?.map((el: any) => _.mapKeys(el, (val, key) => _.camelCase(key)))
		return data
	},
	getRegion: async (): Promise<GetLookupDtoOut[]> => {
		const res = await api.get(`/lookup/region`)
		const data = res?.data?.map((el: any) => _.mapKeys(el, (val, key) => _.camelCase(key)))
		return data
	},
}

export default lookup
