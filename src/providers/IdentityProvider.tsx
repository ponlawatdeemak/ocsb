import { updateAccessToken } from '@/api/core'
import { allowGuestPages, AppPath } from '@/config/app.config'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ReactNode, useEffect, useMemo, useState } from 'react'

interface Props {
	readonly children: ReactNode
}

export default function IdentityProvider(props: Props) {
	const { children } = props
	const { data: session, status } = useSession()
	const [initial, setInital] = useState(false)
	const router = useRouter()

	const requireLogin = useMemo(() => {
		return !allowGuestPages.some((path) => router.pathname.includes(path))
	}, [router.pathname])

	useEffect(() => {
		// session is undefined mean session not successfully loaded yet
		if (session?.user?.tokens?.accessToken) {
			updateAccessToken({
				accessToken: session.user.tokens.accessToken,
				refreshToken: session?.user?.tokens.refreshToken ?? undefined,
				accessType: 'Login',
			})
		} else if (session === null || session?.error) {
			updateAccessToken({
				accessToken: '',
				refreshToken: '',
				accessType: 'Guest',
			})
		}
	}, [session])

	useEffect(() => {
		if (requireLogin && !session && status != 'loading') {
			router?.push(AppPath.Login)
		} else {
			setInital(true)
		}
	}, [requireLogin, status, session, router])

	return initial ? children : <></>
}
