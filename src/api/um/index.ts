import { api } from '@/api/core'
import { APIService, ResponseDto } from '@/api/interface'
import {
	DeleteImageUserDtoOut,
	DeleteUMDtoOut,
	GetUMDtoOut,
	PostImageUserDtoOut,
	PostImportCsvUMDtoOut,
	PostUMDtoOut,
	PostValidateCsvUMDtoOut,
	PutUMDtoOut,
	SearchUMDtoOut,
} from '@interface/dto/um/um.dto-out'
import {
	DeleteImageUserDtoIn,
	DeleteUMDtoIn,
	GetUMDtoIn,
	PostActiveUMDtoIn,
	PostImageUserDtoIn,
	PostUMDtoIn,
	PutUMDtoIn,
	SearchUMDtoIn,
} from '@interface/dto/um/um.dto.in'

const um = {
	getSearchUM: async (payload: SearchUMDtoIn): Promise<ResponseDto<SearchUMDtoOut[]>> => {
		const params = new URLSearchParams()

		if (payload.region?.length !== 0) payload.region?.forEach((item) => params.append('region', item))
		if (payload.role?.length !== 0) payload.role?.forEach((item) => params.append('role', item))
		if (payload.position?.length !== 0) payload.position?.forEach((item) => params.append('position', item))
		if (payload.keyword) params.append('keyword', payload.keyword)
		if (payload.page !== undefined) params.append('page', payload.page.toString())
		if (payload.limit !== undefined) params.append('limit', payload.limit.toString())
		if (payload.orderBy) params.append('orderBy', payload.orderBy)
		if (payload.order) params.append('order', payload.order)

		return await api.get(`/um/search?${params}`)
	},

	getUM: async (payload: GetUMDtoIn): Promise<ResponseDto<GetUMDtoOut>> => await api.get(`/um/${payload.userId}`),
	postUM: async (payload: PostUMDtoIn): Promise<ResponseDto<PostUMDtoOut>> => (await api.post('/um', payload)).data,
	putUM: async (userId: string, payload: PutUMDtoIn): Promise<ResponseDto<PutUMDtoOut>> =>
		(await api.put(`/um/${userId}`, payload)).data,
	deleteUM: async (payload: DeleteUMDtoIn): Promise<ResponseDto<DeleteUMDtoOut>> =>
		await api.delete(`/um/${payload.userId}`),
	postImage: async (file: File, payload: PostImageUserDtoIn): Promise<ResponseDto<PostImageUserDtoOut>> => {
		const formData = new FormData()
		formData.append('file', file)

		return (
			await api.post(`/um/img/${payload.userId}`, formData, APIService.WebAPI, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		).data
	},
	deleteImage: async (payload: DeleteImageUserDtoIn): Promise<ResponseDto<DeleteImageUserDtoOut>> =>
		await api.delete(`/um/img/${payload.userId}`),

	postActiveUM: async (payload: PostActiveUMDtoIn): Promise<ResponseDto<{}>> =>
		(await api.post('/um/active', payload)).data,

	postImportValidate: async (file: File): Promise<ResponseDto<PostValidateCsvUMDtoOut>> => {
		const formData = new FormData()
		formData.append('file', file)
		return (
			await api.post(`/um/validate/csv`, formData, APIService.WebAPI, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		).data
	},

	postImportData: async (file: File): Promise<ResponseDto<PostImportCsvUMDtoOut>> => {
		const formData = new FormData()
		formData.append('file', file)
		return (
			await api.post(`/um/import/csv`, formData, APIService.WebAPI, {
				headers: {
					'Content-Type': 'multipart/form-data',
				},
			})
		).data
	},
}

export default um
