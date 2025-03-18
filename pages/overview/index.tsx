import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../next-i18next.config'
import { OverviewMain } from '@/components/pages/overview'
import MainLayout from '@/components/layout/MainLayout'
import { DndProvider } from 'react-dnd'
import { TouchBackend } from 'react-dnd-touch-backend'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'overview', 'auth'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const OverviewPage = () => {
	return (
		<DndProvider backend={TouchBackend} options={{ enableMouseEvents: true }}>
			<MainLayout>
				<OverviewMain />
			</MainLayout>
		</DndProvider>
	)
}

export default OverviewPage
