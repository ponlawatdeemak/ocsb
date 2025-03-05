import { updateAccessToken } from '@/api/core'
import LoadingScreen from '@/components/common/loading/LoadingScreen'
import TokenExpiredDialog from '@/components/shared/TokenExpiredDialog.tsx'
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
	const [initial, setInitial] = useState(false)
	const router = useRouter()

	const requireLogin = useMemo(() => {
		return !allowGuestPages.some((path) => router.pathname.includes(path))
	}, [router.pathname])

	useEffect(() => {
		// session is undefined mean session not successfully loaded yet

		if (session !== undefined) {
			if (session?.user?.accessToken) {
				updateAccessToken({
					accessToken: session.user.accessToken,
					refreshToken: session?.user?.refreshToken ?? undefined,
					accessType: 'Login',
				})
			} else if (session === null || session?.error) {
				updateAccessToken({
					accessToken: '',
					refreshToken: '',
					accessType: 'Guest',
				})
			}
		}
	}, [session])

	useEffect(() => {
		if (session !== undefined) {
			if (requireLogin && !session && status != 'loading') {
				router?.push(AppPath.Login)
			} else {
				setInitial(true)
			}
		}
	}, [requireLogin, status, session, router])

	if (status === 'authenticated' && session.error) {
		return (
			<>
				<LoadingScreen />
				<TokenExpiredDialog />
			</>
		)
	}

	return initial ? children : <></>
}
