import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'

const LineExportPage = () => {
	const { data: session } = useSession()
	const searchParams = useSearchParams()
	const appCallbackUrl = useMemo(() => searchParams?.get('app_callback'), [searchParams])
	const [init, setInit] = useState(false)

	useEffect(() => {
		if (!init && appCallbackUrl && session?.user.accessToken) {
			const url = `${appCallbackUrl}?accessToken=${session?.user.accessToken}`
			window.open(url, '_blank')
			setInit(true)
		}
	}, [init, appCallbackUrl, session?.user.accessToken])

	return <></>
}

export default LineExportPage
