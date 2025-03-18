import { useSession } from 'next-auth/react'
import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { DEFAULT_LOCALE } from '../../webapp.config'
import nextI18NextConfig from '../../next-i18next.config.js'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'glossary', 'um', 'auth'],
			nextI18NextConfig as UserConfig,
		)),
	},
})
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
