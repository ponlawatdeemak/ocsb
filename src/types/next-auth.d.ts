import NextAuth from 'next-auth'

interface Role {
	roleId: number
	roleName: string
	description?: string | null
}

interface Region {
	regionId: number
	regionName: string
	regionNameEn: string
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

interface Tokens {
	idToken: string
	accessToken: string
	refreshToken: string
	expiresIn: number
}

interface UserSession {
	id: string
	userId: string
	firstName: string
	lastName: string
	email: string
	image: string
	phone: string
	isActive: boolean
	role: Role
	regions: Region[]
	posiion: Position
	region: Region
	province: Province
	tokens: Tokens
	hasImage: boolean
}

declare module 'next-auth' {
	interface Session {
		user: UserSession
		error?: string
	}
}

declare module 'next-auth/jwt' {
	/** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
	interface JWT extends UserSession {
		error?: string
	}
}
