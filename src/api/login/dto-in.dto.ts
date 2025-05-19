export interface LoginDtoIn {
	username: string
	password: string
}

export interface RefreshTokenDtoIn {
	userId: string
	refreshToken: string
}

export interface ForgotPasswordDtoIn {
	email: string
}

export interface ResetPasswordDtoIn {
	email: string
	password: string
	confirmationCode: string
}

export interface ChangePasswordDtoIn {
	userId: string
	password: string
	newPassword: string
}
