import { DEFAULT_LOCALE } from '@/../webapp.config'
import { GetServerSideProps } from 'next'
import { UserConfig } from 'next-i18next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../../next-i18next.config'
import { UserManagementMain } from '@/components/pages/user-management'
import MainLayout from '@/components/layout/MainLayout'
import { useSession } from 'next-auth/react'
import { useEffect } from 'react'
import { UserRole } from '@interface/config/um.config'
import { useRouter } from 'next/router'
import { PublicPath } from '@/config/app.config'

export const getServerSideProps: GetServerSideProps = async (context) => ({
	props: {
		...(await serverSideTranslations(
			context.locale ?? DEFAULT_LOCALE,
			['common', 'um'],
			nextI18NextConfig as UserConfig,
		)),
	},
})

const UserManagementPage = () => {
	const { data: session } = useSession()
	const router = useRouter()

	useEffect(() => {
		if (session?.user) {
			if (session.user.role.roleId !== UserRole.SuperAdmin && session.user.role.roleId !== UserRole.Admin) {
				router.replace(PublicPath.Overview)
			}
		}
	}, [session?.user, router])
	return (
		<MainLayout>
			<UserManagementMain />
		</MainLayout>
	)
}

export default UserManagementPage
