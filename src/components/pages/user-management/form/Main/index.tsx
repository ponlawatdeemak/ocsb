import { Box, Button, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import React from 'react'

interface UserManagementFormMainProps {
	className?: string
}

export const UserManagementFormMain: React.FC<UserManagementFormMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { t } = useTranslation('common')

	return (
		<Box className='flex h-full flex-col justify-between gap-6 p-6'>
			<Typography className='flex-1 !text-xl !font-semibold' color='primary'>
				{'เพิ่มผู้ใช้งาน'}
			</Typography>
			<Box className='flex flex-row items-center justify-between'>
				<Button
					variant='contained'
					className='h-[45px] w-[140px] !rounded-[10px] !bg-gray'
					onClick={() => router.back()}
				>
					<Typography className='!text-md !normal-case !text-black'>{t('back')}</Typography>
				</Button>
			</Box>
		</Box>
	)
}
