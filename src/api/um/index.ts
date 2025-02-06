import { api } from '@/api/core'
import { APIService, ResponseDto } from '@/api/interface'
import {
	DeleteImageUserDtoOut,
	DeleteUMDtoOut,
	GetImageUserDtoOut,
	GetUMDtoOut,
	PostImageUserDtoOut,
	PostUMDtoOut,
	PutUMDtoOut,
} from '@interface/dto/um/um.dto-out'
import {
	DeleteImageUserDtoIn,
	DeleteUMDtoIn,
	GetImageUserDtoIn,
	GetUMDtoIn,
	PostImageUserDtoIn,
	PostUMDtoIn,
	PutUMDtoIn,
} from '@interface/dto/um/um.dto.in'

const um = {
	getUM: async (payload: GetUMDtoIn): Promise<ResponseDto<GetUMDtoOut>> => await api.get(`/um/${payload.userId}`),
	postUM: async (payload: PostUMDtoIn): Promise<ResponseDto<PostUMDtoOut>> => await api.post('/um', payload),
	putUM: async (userId: string, payload: PutUMDtoIn): Promise<ResponseDto<PutUMDtoOut>> =>
		await api.put(`/um/${userId}`, payload),
	deleteUM: async (payload: DeleteUMDtoIn): Promise<ResponseDto<DeleteUMDtoOut>> =>
		await api.delete(`/um/${payload.userId}`),

	getImage: async (payload: GetImageUserDtoIn): Promise<ResponseDto<GetImageUserDtoOut>> =>
		await api.get(`/um/img/${payload.userId}`),
	postImage: async (file: File, payload: PostImageUserDtoIn): Promise<ResponseDto<PostImageUserDtoOut>> => {
		const formData = new FormData()
		formData.append('file', file)

		return await api.post(`/um/img/${payload.userId}`, formData, APIService.WebAPI, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
	},
	deleteImage: async (payload: DeleteImageUserDtoIn): Promise<ResponseDto<DeleteImageUserDtoOut>> =>
		await api.delete(`/um/img/${payload.userId}`),
}

export default um
