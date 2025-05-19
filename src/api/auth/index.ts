import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import {
	ForgotPasswordAuthDtoIn,
	LoginAuthDtoIn,
	RefreshTokenAuthDtoIn,
	ResetPasswordAuthDtoIn,
	VerifyTokenAuthDtoIn,
} from '@interface/dto/auth/auth.dto-in'
import {
	ForgotPasswordAuthDtoOut,
	LoginAuthDtoOut,
	RefreshTokenAuthDtoOut,
	ResetPasswordAuthDtoOut,
	VerifyTokenAuthDtoOut,
} from '@interface/dto/auth/auth.dto-out'

const auth = {
	login: async (payload: LoginAuthDtoIn): Promise<ResponseDto<LoginAuthDtoOut>> =>
		(await api.post('/auth/login', payload))?.data,
	refreshToken: async (payload: RefreshTokenAuthDtoIn): Promise<ResponseDto<RefreshTokenAuthDtoOut>> =>
		(await api.post('/auth/refresh-token', payload))?.data,
	forgetPassword: async (payload: ForgotPasswordAuthDtoIn): Promise<ResponseDto<ForgotPasswordAuthDtoOut>> =>
		(await api.post('/auth/forget-password', payload))?.data,
	verifyToken: async (payload: VerifyTokenAuthDtoIn): Promise<ResponseDto<VerifyTokenAuthDtoOut>> =>
		(await api.post('/auth/verify-token', payload))?.data,
	resetPassword: async (payload: ResetPasswordAuthDtoIn): Promise<ResponseDto<ResetPasswordAuthDtoOut>> =>
		(await api.put('/auth/reset-password', payload))?.data,
}

export default auth
