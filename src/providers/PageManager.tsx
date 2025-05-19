import { AppPath } from '@/config/app.config'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect, useState } from 'react'

interface PageManagerProps extends PropsWithChildren {}

const PageManager: React.FC<PageManagerProps> = ({ children }) => {
	const router = useRouter()
	const [display, setDisplay] = useState(false)

	useEffect(() => {
		if (Object.values(AppPath).some((path) => path === router.pathname)) {
			setDisplay(true)
		} else {
			router?.push(AppPath.Overview)
		}
	}, [router])

	if (display) {
		return children
	}
	return null
}

export default PageManager
