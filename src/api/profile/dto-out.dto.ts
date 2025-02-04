interface Role {
	roleId: number
	roleName: string
	description?: string | null
}

interface Region {
	regionId: number
	regionName: string
	description?: string | null
}

interface Position {
	positionId: number
	positionName: string
}

interface Province {
	adm1Code: number
	provinceName: string
	description?: string | null
}

export interface GetProfileDtoOut {
	userId: string
	firstName: string
	lastName: string
	email: string
	phone: string
	isActive: boolean
	role: Role
	regions: Region[]
	posiion: Position
	region: Region
	province: Province
}

export interface ChangePasswordProfileDtoOut {
	success: boolean
}
