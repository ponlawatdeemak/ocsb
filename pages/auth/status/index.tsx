import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../../next-i18next.config'
import AuthLayout from '@/components/layout/AuthLayout'
import { AuthStatusMain } from '@/components/pages/auth'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'auth'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const AuthStatusPage = () => {
	return (
		<AuthLayout>
			<AuthStatusMain />
		</AuthLayout>
	)
}

export default AuthStatusPage
