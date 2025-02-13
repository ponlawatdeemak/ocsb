import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../next-i18next.config.js'
import MainLayout from '@/components/layout/MainLayout'
import { ProfileMain } from '@/components/pages/profile'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'auth', 'um'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const ProfilePage = () => {
	return (
		<MainLayout>
			<ProfileMain />
		</MainLayout>
	)
}

export default ProfilePage
