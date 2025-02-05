import AppLogo from '@/components/svg/AppLogo'
import { Box, Link, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import { APP_TITLE_EN, APP_TITLE_TH } from '../../../../../../webapp.config'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import { useMutation } from '@tanstack/react-query'
import { ResponseDto } from '@/api/interface'
import { AxiosError } from 'axios'
import service from '@/api'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { AppPath } from '@/config/app.config'
import FormInput from '@/components/common/input/FormInput'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import ActionButton from '@/components/common/button/ActionButton'
import { passwordStore } from '../../context'
import { ForgotPasswordAuthDtoOut } from '@interface/dto/auth/auth.dto-out'
import { ForgotPasswordAuthDtoIn } from '@interface/dto/auth/auth.dto-in'

interface ForgetPasswordMainProps {
	className?: string
}

export const ForgetPasswordMain: React.FC<ForgetPasswordMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { t } = useTranslation(['common', 'auth'])
	const setDataForgetPassword = passwordStore((state) => state.setDataForgetPassword)
	const [busy, setBusy] = useState<boolean>(false)
	const [alertForgetPasswordInfo, setAlertForgetPasswordInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const { isPending, mutateAsync: mutateForgotPassword } = useMutation<
		ResponseDto<ForgotPasswordAuthDtoOut>,
		AxiosError,
		ForgotPasswordAuthDtoIn,
		unknown
	>({
		mutationFn: service.auth.forgetPassword,
	})

	const validationSchema = yup.object({
		email: yup
			.string()
			.email(t('auth:warning.invalidEmailFormat'))
			.required(t('auth:warning.inputEmail'))
			.max(255, t('auth:warning.maxInputEmail')),
	})

	const onSubmit = useCallback(
		async (values: ForgotPasswordAuthDtoIn) => {
			try {
				setBusy(true)
				await mutateForgotPassword(values)
				setAlertForgetPasswordInfo({
					open: true,
					severity: 'success',
					message: t('auth:success.forgotPassword'),
				})
				setTimeout(() => {
					setDataForgetPassword({ isSuccess: true, email: values.email, type: 'email' })
					router.push(AppPath.AuthStatus)
					setBusy(false)
				}, 3000)
			} catch (error) {
				console.error('Verify email failed', error)
				setAlertForgetPasswordInfo({
					open: true,
					severity: 'error',
					message: t('auth:error.forgotPassword'),
				})
				setBusy(false)
			}
		},
		[mutateForgotPassword, setDataForgetPassword, router, t],
	)

	const formik = useFormik<ForgotPasswordAuthDtoIn>({
		initialValues: {
			email: '',
		},
		validationSchema: validationSchema,
		onSubmit,
	})

	return (
		<Box className={classNames('flex h-full items-center justify-center bg-black/[0.5] px-6', className)}>
			<Box className='flex min-h-[412px] w-[466px] flex-col items-center gap-[18px] rounded-[20px] bg-white pt-6 shadow-[0_3px_6px_0_rgba(0,0,0,0.25)]'>
				<Box className='flex items-center'>
					<AppLogo />
					<Box className='flex flex-col'>
						<Typography className='!text-xs text-primary'>{APP_TITLE_TH}</Typography>
						<Typography className='!text-xs text-[#049334]'>{APP_TITLE_EN}</Typography>
					</Box>
				</Box>
				<Box className='flex w-full flex-1 flex-col items-center gap-6 rounded-[20px] bg-primary pb-[50px] pt-[40px] shadow-[0_-3px_6px_0_rgba(0,0,0,0.15)]'>
					<Typography className='!text-lg text-white'>{t('auth:forgotPassword')}</Typography>
					<form onSubmit={formik.handleSubmit} className='flex w-[250px] flex-col items-center gap-4'>
						<FormInput
							disabled={isPending || busy}
							name='email'
							value={''}
							formik={formik}
							placeholder={t('auth:specifyEmail')}
							inputProps={{ maxLength: 255 }}
						/>
						<ActionButton
							className='h-10 !rounded-[5px] !bg-secondary [&_.MuiBox-root]:text-sm [&_.MuiBox-root]:font-normal'
							fullWidth
							title={t('auth:forgotPassword')}
							type='submit'
							loading={isPending || busy}
						/>
					</form>
					<Link className='!text-sm !text-white' onClick={() => router.back()}>
						{t('back')}
					</Link>
				</Box>
			</Box>

			<AlertSnackbar
				alertInfo={alertForgetPasswordInfo}
				onClose={() => setAlertForgetPasswordInfo({ ...alertForgetPasswordInfo, open: false })}
			/>
		</Box>
	)
}
