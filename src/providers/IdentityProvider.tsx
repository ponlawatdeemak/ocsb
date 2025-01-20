import service from '@/api'
import { updateAccessToken } from '@/api/core'
import { allowGuestPages, AppPath } from '@/config/app.config'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import LoadingScreen from '@/components/common/loading/LoadingScreen'

interface Props {
	readonly children: ReactNode
}

export default function IdentityProvider(props: Props) {
	const { children } = props
	const { data: session, status } = useSession()
	const [loading, setLoading] = useState<boolean>(false)
	const [token, setToken] = useState<string>()
	const router = useRouter()

	const requireLogin = useMemo(() => {
		return !allowGuestPages.some((path) => router.pathname.includes(path))
	}, [router.pathname])

	/** get access token for guest user */
	const getGuestAccessToken = useCallback(async () => {
		if (loading) return
		setLoading(true)
		try {
			const { data } = await service.auth.loginGuest()
			if (data) {
				const accessToken = data.tokens?.idToken ?? ''
				if (accessToken) {
					updateAccessToken({ accessToken, refreshToken: data.tokens?.refreshToken, accessType: 'Guest' })
					setToken(accessToken)
				}
			}
		} catch (err) {
			console.error(err)
		} finally {
			setLoading(false)
		}
	}, [loading])

	useEffect(() => {
		if (token) return
		// session is undefined mean session not successfully loaded yet
		if (session?.user?.tokens.accessToken) {
			updateAccessToken({
				accessToken: session.user.tokens.accessToken,
				refreshToken: session?.user?.tokens.refreshToken ?? undefined,
				accessType: 'Login',
			})
			setToken(session.user.tokens.accessToken)
		} else if (session === null) {
			getGuestAccessToken()
		}
	}, [getGuestAccessToken, session, token])

	if (requireLogin && !session && status != 'loading') {
		router?.push(AppPath.Login)
		return null
	}
	if (token) {
		return children
	}

	return <LoadingScreen />
}
