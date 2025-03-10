import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../../next-i18next.config'
import { PlantingAreaMain } from '@/components/pages/map-analyze'
import MainLayout from '@/components/layout/MainLayout'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'map-analyze', 'overview', 'auth'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const PlantingAreaPage = () => {
	return (
		<MainLayout>
			<PlantingAreaMain />
		</MainLayout>
	)
}

export default PlantingAreaPage
