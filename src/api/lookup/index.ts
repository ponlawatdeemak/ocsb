import { api } from '@/api/core'
import { GetLookupDtoIn, GetSearchAdmLookupDtoIn } from '@interface/dto/lookup/lookup.dto-in'
import * as _ from 'lodash'

const lookup = {
	get: async (payload: GetLookupDtoIn) => {
		const res = await api.get(
			`/lookup?name=${payload.name}${payload.where ? `&where=${payload.where}` : ''}${payload.sort ? `&sort=${payload.sort}` : ''}${payload.order ? `&order=${payload.order}` : ''}`,
		)
		const data = res?.data?.map((el: any) => _.mapKeys(el, (val, key) => _.camelCase(key)))
		return data
	},
	getSearchAdm: async (payload: GetSearchAdmLookupDtoIn) => {
		const res = await api.get(`/lookup/search-adm?keyword=${payload.keyword}`)
		return res.data
	},
}

export default lookup
