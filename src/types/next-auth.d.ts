import NextAuth from 'next-auth'

interface Tokens {
	idToken: string
	accessToken: string
	refreshToken: string
	expiresIn: number
}

interface UserSession {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: string
	picture: string
	sub: string
	orgCode: string
	role: string
	responsibleProvinceCode: string
	responsibleDistrictCode: string
	flagStatus: string
	createdAt: string
	updatedAt: string
	tokens: Tokens
	iat: number
	exp: number
	jti: string
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
