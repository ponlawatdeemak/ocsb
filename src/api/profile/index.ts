import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import { ChangePasswordProfileDtoOut, GetProfileDtoOut } from './dto-out.dto'
import { ChangePasswordProfileDtoIn } from './dto-in.dto'

const profile = {
	getProfile: async (): Promise<ResponseDto<GetProfileDtoOut>> => await api.get('/profile'),
	changePasswordProfile: async (
		payload: ChangePasswordProfileDtoIn,
	): Promise<ResponseDto<ChangePasswordProfileDtoOut>> => await api.put('/profile/change-password', payload),
}

export default profile
