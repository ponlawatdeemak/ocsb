import { api } from '@/api/core'
import {
	ChangePasswordDtoIn,
	ForgotPasswordDtoIn,
	LoginDtoIn,
	RefreshTokenDtoIn,
	ResetPasswordDtoIn,
} from './dto-in.dto'
import { ForgotPasswordDtoOut, LoginDtoOut, RefreshTokenDtoOut, ResetPasswordDtoOut } from './dto-out.dto'
import { APIService, ResponseDto } from '@/api/interface'

const login = {
	login: async (payload: LoginDtoIn): Promise<ResponseDto<LoginDtoOut>> =>
		(await api.post('/auth/login', payload, APIService.AuthAPI))?.data,
	refreshToken: async (payload: RefreshTokenDtoIn): Promise<ResponseDto<RefreshTokenDtoOut>> =>
		(await api.post('/auth/refresh-tokens', payload, APIService.AuthAPI))?.data,
	forgotPassword: async (payload: ForgotPasswordDtoIn): Promise<ResponseDto<ForgotPasswordDtoOut>> =>
		(await api.post('/auth/forgot-password', payload, APIService.AuthAPI))?.data,
	resetPassword: async (payload: ResetPasswordDtoIn): Promise<ResponseDto<ResetPasswordDtoOut>> =>
		(await api.put('/auth/reset-password', payload, APIService.AuthAPI))?.data,
	changePassword: async (payload: ChangePasswordDtoIn): Promise<ResponseDto<ChangePasswordDtoIn>> =>
		(await api.put('/auth/change-password', payload, APIService.AuthAPI))?.data,
}

export default login
