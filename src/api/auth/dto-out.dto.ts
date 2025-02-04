import UserAccountResponse from '@/models/UserAccountResponse'
import UserTokens from '@/models/UserTokens'

export interface LoginGuestDtoOut extends UserAccountResponse {
	tokens?: UserTokens
}

export interface LoginDtoOut {
	id: string
	accessToken: string
	refreshToken: string
}

export interface RefreshTokenDtoOut {
	accessToken: string
	refreshToken: string
}

export interface ForgetPasswordDtoOut {
	success: boolean
}

export interface VerifyTokenDtoOut {
	isValid: boolean
}

export interface ResetPasswordDtoOut {
	success: boolean
}
