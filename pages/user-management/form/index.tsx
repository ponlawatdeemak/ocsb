import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../../next-i18next.config'
import MainLayout from '@/components/layout/MainLayout'
import { UserManagementMain } from '@/components/pages/user-management'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const UserManagementFormPage = () => {
	return (
		<MainLayout>
			<UserManagementMain />
		</MainLayout>
	)
}

export default UserManagementFormPage
