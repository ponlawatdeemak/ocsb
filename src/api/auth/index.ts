import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import {
	ForgetPasswordDtoOut,
	LoginDtoOut,
	RefreshTokenDtoOut,
	ResetPasswordDtoOut,
	VerifyTokenDtoOut,
} from './dto-out.dto'
import { ForgetPasswordDtoIn, LoginDtoIn, RefreshTokenDtoIn, ResetPasswordDtoIn, VerifyTokenDtoIn } from './dto-in.dto'

const auth = {
	login: async (payload: LoginDtoIn): Promise<ResponseDto<LoginDtoOut>> =>
		(await api.post('/auth/login', payload))?.data,
	refreshToken: async (payload: RefreshTokenDtoIn): Promise<ResponseDto<RefreshTokenDtoOut>> =>
		(await api.post('/auth/refresh-token', payload))?.data,
	forgetPassword: async (payload: ForgetPasswordDtoIn): Promise<ResponseDto<ForgetPasswordDtoOut>> =>
		(await api.post('/auth/forget-password', payload))?.data,
	verifyToken: async (payload: VerifyTokenDtoIn): Promise<ResponseDto<VerifyTokenDtoOut>> =>
		(await api.post('/auth/verify-token', payload))?.data,
	resetPassword: async (payload: ResetPasswordDtoIn): Promise<ResponseDto<ResetPasswordDtoOut>> =>
		(await api.put('/auth/reset-password', payload))?.data,
}

export default auth
