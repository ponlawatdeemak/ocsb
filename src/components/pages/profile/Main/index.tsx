import { AppPath } from '@/config/app.config'
import { Box, Button, Typography } from '@mui/material'
import { signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'

interface ProfileMainProps {
	className?: string
}

export const ProfileMain: React.FC<ProfileMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { t } = useTranslation('common')

	const logout = useCallback(() => signOut({ callbackUrl: AppPath.Overview }), [])

	return (
		<Box className='flex h-full flex-col justify-between gap-6 p-6'>
			<Typography className='flex-1 !text-xl !font-semibold' color='primary'>
				{'ข้อมูลผู้ใช้งาน'}
			</Typography>
			<Box className='flex flex-row items-center justify-between'>
				<Button
					variant='contained'
					className='h-[45px] w-[140px] !rounded-[10px] !bg-gray'
					onClick={() => router.back()}
				>
					<Typography className='!text-md !normal-case !text-black'>{t('back')}</Typography>
				</Button>
				<Button variant='contained' className='h-[45px] w-[140px] !rounded-[10px] !bg-error' onClick={logout}>
					<Typography className='!text-md !normal-case !text-white'>{t('logout')}</Typography>
				</Button>
			</Box>
		</Box>
	)
}
