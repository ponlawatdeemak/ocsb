import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import { ChangePasswordProfileDtoIn } from '@interface/dto/profile/profile.dto-in'
import { ChangePasswordProfileDtoOut, GetProfileDtoOut } from '@interface/dto/profile/profile.dto-out'

const profile = {
	getProfile: async (): Promise<ResponseDto<GetProfileDtoOut>> => await api.get('/profile'),
	changePasswordProfile: async (
		payload: ChangePasswordProfileDtoIn,
	): Promise<ResponseDto<ChangePasswordProfileDtoOut>> => await api.put('/profile/change-password', payload),
}

export default profile
