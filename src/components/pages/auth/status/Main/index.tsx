import AppLogo from '@/components/svg/AppLogo'
import { Box, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useEffect } from 'react'
import { APP_TITLE_EN, APP_TITLE_TH } from '../../../../../../webapp.config'
import { passwordStore } from '../../context'
import { useRouter } from 'next/navigation'
import { AppPath } from '@/config/app.config'
import ActionButton from '@/components/common/button/ActionButton'
import { useTranslation } from 'next-i18next'
import { Cancel, CheckCircle } from '@mui/icons-material'

interface AuthStatusMainProps {
	className?: string
}

export const AuthStatusMain: React.FC<AuthStatusMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { forgetPassword, setDataForgetPassword } = passwordStore()
	const { t } = useTranslation(['common', 'auth'])

	useEffect(() => {
		if (!forgetPassword) {
			router.replace(AppPath.Login)
		}
	}, [forgetPassword, router])

	const handleBack = useCallback(() => {
		setDataForgetPassword(null)
		router.push(AppPath.Overview)
	}, [setDataForgetPassword, router])

	return (
		<Box className={classNames('flex h-full items-center justify-center bg-black/[0.5]', className)}>
			<Box className='flex min-h-[412px] w-[466px] flex-col items-center gap-[18px] rounded-[20px] bg-white pt-6 shadow-[0_3px_6px_0_rgba(0,0,0,0.25)]'>
				<Box className='flex items-center'>
					<AppLogo />
					<Box className='flex flex-col'>
						<Typography className='!text-xs text-primary'>{APP_TITLE_TH}</Typography>
						<Typography className='!text-xs text-[#049334]'>{APP_TITLE_EN}</Typography>
					</Box>
				</Box>
				<Box className='flex w-full flex-1 flex-col items-center justify-between gap-4 rounded-[20px] bg-primary pb-[50px] pt-[40px] shadow-[0_-3px_6px_0_rgba(0,0,0,0.15)]'>
					<Typography className='!text-lg text-white'>
						{forgetPassword?.isSuccess ? 'ดำเนินการสำเร็จ' : 'ดำเนินการไม่สำเร็จ'}
					</Typography>
					<Box className='flex w-[250px] flex-col gap-4'>
						{forgetPassword?.type === 'email' && (
							<Box className='flex flex-col items-center gap-4'>
								<CheckCircle className='!h-12 !w-12 !fill-success' />
								<Typography className='text-center !text-sm text-white'>
									{'เราได้ส่งอีเมลสำหรับตั้งค่ารหัสผ่านใหม่ให้เรียบร้อยแล้ว'}
								</Typography>
							</Box>
						)}
						{forgetPassword?.type === 'token' && (
							<Box className='flex flex-col items-center gap-4'>
								<Cancel className='!h-12 !w-12 !fill-error' />
								<Typography className='text-center !text-sm text-white'>
									{'ข้อมูล token ไม่ถูกต้อง หรือหมดอายุ กรุณาดำเนินการจากอีเมลล่าสุด'}
								</Typography>
							</Box>
						)}
						<ActionButton
							className='h-10 !rounded-[5px] !bg-secondary [&_.MuiBox-root]:text-sm [&_.MuiBox-root]:font-normal'
							fullWidth
							title={t('auth:returnLogin')}
							type='submit'
							onClick={handleBack}
						/>
					</Box>
				</Box>
			</Box>
		</Box>
	)
}
