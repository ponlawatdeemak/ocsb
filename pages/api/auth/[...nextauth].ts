import service from '@/api'
import { refreshAccessToken, updateAccessToken } from '@/api/core'
import { AppPath } from '@/config/app.config'
import type { NextAuthOptions } from 'next-auth'
import NextAuth from 'next-auth'
import { JWT } from 'next-auth/jwt'
import { UserSession } from '@/types/next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const parseJwt = (token: string) => {
	return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
}

export const authOptions: NextAuthOptions = {
	pages: {
		signIn: AppPath.Login,
	},

	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				username: { label: 'Username', type: 'text', placeholder: 'jsmith' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const { username, password } = credentials as any
					const res = await service.login.login({ username, password })
					if (res.data?.id) return { ...res.data, tokens: res.tokens }
					return null
				} catch (error: any) {
					throw new Error(JSON.stringify(error))
				}
			},
		}),
	],

	session: {
		// Choose how you want to save the user session.
		// The default is `"jwt"`, an encrypted JWT (JWE) stored in the session cookie.
		// If you use an `adapter` however, we default it to `"database"` instead.
		// You can still force a JWT session by explicitly defining `"jwt"`.
		// When using `"database"`, the session cookie will only contain a `sessionToken` value,
		// which is used to look up the session in the database.
		strategy: 'jwt',

		// Seconds - How long until an idle session expires and is no longer valid.
		maxAge: 60 * 60 * 24 * 30, // 30 days

		// Seconds - Throttle how frequently to write to database to extend a session.
		// Use it to limit write operations. Set to 0 to always update the database.
		// Note: This option is ignored if using JSON Web Tokens
		updateAge: 24 * 60 * 60, // 24 hours
	},

	jwt: {
		// The maximum age of the NextAuth.js issued JWT in seconds.
		// Defaults to `session.maxAge`.
		maxAge: 60 * 60 * 24 * 30,
	},

	callbacks: {
		async jwt({ token, user, session, trigger }) {
			delete token.error
			if (trigger === 'update' && session) {
				// เมื่อมีการแก้ไข profile ต้องเอาค่าจาก session เข้าไปด้วย
				return { ...token, ...user, ...session } as JWT
			}
			const accessToken = token?.tokens?.accessToken
			const jwt = { ...token, ...user }
			if (accessToken) {
				try {
					const data = parseJwt(accessToken)
					const expiredTime = data?.exp
					const currentTime = Math.floor(Date.now() / 1000)
					if (currentTime >= expiredTime) {
						const newToken = await refreshAccessToken()
						if (newToken?.accessToken) jwt.tokens.accessToken = newToken?.accessToken
						if (newToken?.refreshToken) jwt.tokens.refreshToken = newToken?.refreshToken
					}
				} catch (error) {
					jwt.error = 'RefreshAccessTokenError'
				}
			}
			return jwt as JWT
		},

		async session({ session, token }) {
			const userId = token?.id
			const accessToken = token?.tokens?.accessToken
			const refreshToken = token?.tokens?.refreshToken
			const { error, ...user } = token
			session.user = user as UserSession
			if (accessToken) {
				updateAccessToken({ accessToken, refreshToken, userId, accessType: session.user ? 'Login' : 'Guest' })
				session.user.tokens.accessToken = accessToken
				session.user.tokens.refreshToken = refreshToken
			}
			session.error = error
			return session
		},
	},
}

export default NextAuth(authOptions)
