export interface LoginDtoIn {
	email: string
	password: string
}

export interface RefreshTokenDtoIn {
	refreshToken: string
}

export interface ForgetPasswordDtoIn {
	email: string
}

export interface VerifyTokenDtoIn {
	token: string
}

export interface ResetPasswordDtoIn {
	token: string
	newPassword: string
}
