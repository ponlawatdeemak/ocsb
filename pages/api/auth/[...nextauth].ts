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
	pages: { signIn: AppPath.Login },

	providers: [
		CredentialsProvider({
			name: 'Credentials',
			credentials: {
				email: { label: 'Email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials) {
				try {
					const { email, password } = credentials as any
					const res = await service.auth.login({ email, password })
					if (res.data?.id) {
						return {
							...res.data,
							tokens: { accessToken: res.data.accessToken, refreshToken: res.data.refreshToken },
						}
					}
					return null
				} catch (error: any) {
					throw new Error(JSON.stringify(error))
				}
			},
		}),
	],
	secret: process.env.NEXTAUTH_SECRET,
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
				return { ...token, ...user, ...session } as JWT
			}
			const accessToken = token?.accessToken as string
			const refreshToken = token?.refreshToken as string
			const jwt = { ...token, ...user } as any

			if (accessToken) {
				try {
					const data = parseJwt(accessToken)
					const dataRefresh = parseJwt(refreshToken)
					const expiredTime = data?.exp
					const expiredRefreshTime = dataRefresh?.exp
					const currentTime = Math.floor(Date.now() / 1000)
					if (expiredTime < currentTime) {
						if (expiredRefreshTime > currentTime) {
							const newToken = await refreshAccessToken()
							if (newToken?.accessToken) jwt.accessToken = newToken?.accessToken
							if (newToken?.refreshToken) jwt.refreshToken = newToken?.refreshToken
						} else {
							jwt.error = 'RefreshAccessTokenError'
						}
					}
				} catch (error) {
					jwt.error = 'RefreshAccessTokenError'
				}
			}
			return jwt as JWT
		},
		async session({ session, token }) {
			const { error, ...user } = token
			session.user = user as UserSession
			session.error = error
			return session
		},
	},
}

export default NextAuth(authOptions)
