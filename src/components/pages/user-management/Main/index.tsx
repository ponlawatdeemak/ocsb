import { AppPath } from '@/config/app.config'
import { Box, Button, Typography } from '@mui/material'
import { useRouter } from 'next/navigation'
import React from 'react'

interface UserManagementMainProps {
	className?: string
}

export const UserManagementMain: React.FC<UserManagementMainProps> = ({ className = '' }) => {
	const router = useRouter()

	return (
		<Box className='flex flex-col gap-6 p-6'>
			<Typography className='flex-1 !text-xl !font-semibold' color='primary'>
				{'การจัดการสิทธ์ผู้ใช้งาน'}
			</Typography>
			<Box className='flex flex-row items-center'>
				<Button
					variant='contained'
					className='h-[45px] w-[140px] !rounded-[10px]'
					onClick={() => router.push(AppPath.UserManagementForm)}
				>
					<Typography className='!text-md !normal-case !text-white'>{'เพิ่มผู้ใช้งาน'}</Typography>
				</Button>
			</Box>
		</Box>
	)
}
