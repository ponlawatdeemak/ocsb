import { api } from '@/api/core'
import { APIService, ResponseDto } from '@/api/interface'
import {
	DeleteImageDtoIn,
	DeleteUMDtoIn,
	GetImageDtoIn,
	GetUMDtoIn,
	PostImageDtoIn,
	PostUMDtoIn,
	PutUMDtoIn,
} from './dto-in.dto'
import {
	DeleteImageDtoOut,
	DeleteUMDtoOut,
	GetImageDtoOut,
	GetUMDtoOut,
	PostImageDtoOut,
	PostUMDtoOut,
	PutUMDtoOut,
} from './dto-out.dto'

const um = {
	getUM: async (payload: GetUMDtoIn): Promise<ResponseDto<GetUMDtoOut>> => await api.get(`/um/${payload.userId}`),
	postUM: async (payload: PostUMDtoIn): Promise<ResponseDto<PostUMDtoOut>> => await api.post('/um', payload),
	putUM: async (payload: PutUMDtoIn): Promise<ResponseDto<PutUMDtoOut>> =>
		await api.put(`/um/${payload.userId}`, payload),
	deleteUM: async (payload: DeleteUMDtoIn): Promise<ResponseDto<DeleteUMDtoOut>> =>
		await api.delete(`/um/${payload.userId}`),

	getImage: async (payload: GetImageDtoIn): Promise<ResponseDto<GetImageDtoOut>> =>
		await api.get(`/um/img/${payload.userId}`),
	postImage: async (payload: PostImageDtoIn): Promise<ResponseDto<PostImageDtoOut>> => {
		const formData = new FormData()
		formData.append('file', payload.file)

		return await api.post(`/um/img/${payload.userId}`, formData, APIService.WebAPI, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		})
	},
	deleteImage: async (payload: DeleteImageDtoIn): Promise<ResponseDto<DeleteImageDtoOut>> =>
		await api.delete(`/um/img/${payload.userId}`),
}

export default um
