import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../next-i18next.config.js'
import { AboutMain } from '@/components/pages/about'
import MainLayout from '@/components/layout/MainLayout'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'auth'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const AboutPage = () => {
	return (
		<MainLayout>
			<AboutMain />
		</MainLayout>
	)
}

export default AboutPage
