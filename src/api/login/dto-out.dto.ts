export interface LoginDtoOut {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: string
	orgCode: string
	role: string
	responsibleProvinceCode: any
	responsibleDistrictCode: any
	flagStatus: string
	createdAt: string
	updatedAt: string
}

export interface RefreshTokenDtoOut {
	id: string
}

export interface ForgotPasswordDtoOut {
	success: boolean
}

export interface ResetPasswordDtoOut {
	success: boolean
}

export interface ChangePasswordDtoOut {
	success: boolean
}
