import AppLogo from '@/components/svg/AppLogo'
import { Box, Link, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import { APP_TITLE_EN, APP_TITLE_TH } from '../../../../../../webapp.config'
import PasswordInput from '@/components/common/input/PasswordInput'
import FormInput from '@/components/common/input/FormInput'
import { AppPath } from '@/config/app.config'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import { ResponseDto } from '@/api/interface'
import { ResetPasswordDtoOut } from '@/api/login/dto-out.dto'
import { AxiosError } from 'axios'
import { ResetPasswordDtoIn } from '@/api/login/dto-in.dto'
import service from '@/api'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import ActionButton from '@/components/common/button/ActionButton'

interface ResetPasswordMainProps {
	className?: string
}

export const ResetPasswordMain: React.FC<ResetPasswordMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t } = useTranslation(['common', 'auth'])
	const [busy, setBusy] = useState<boolean>(false)
	const [alertResetPasswordInfo, setAlertResetPasswordInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const validationSchema = yup.object({
		email: yup.string().required(),
		password: yup
			.string()
			.required(t('auth:warning.inputNewPassword'))
			.min(8, t('auth:warning.minPasswordCharacters'))
			.matches(/^(?=.*\d)/, t('auth:warning.minPasswordNumber'))
			.matches(/^(?=.*[a-z])/, t('auth:warning.minPasswordLowercaseLetter'))
			.matches(/^(?=.*[A-Z])/, t('auth:warning.minPasswordUppercaseLetter'))
			.matches(/^(?=.*[!@#$%^&*()_+\-=[\]{};:\\|,.<>~/?])/, t('auth:warning.minPasswordSymbol')),
		confirmPassword: yup
			.string()
			.required(t('auth:warning.inputConfirmPassword'))
			.oneOf([yup.ref('password')], t('auth:warning.invalidPasswordMatch')),
		confirmationCode: yup.string().required(t('auth:warning.inputVerificationCode')),
	})

	type ResetPasswordFormType = yup.InferType<typeof validationSchema>

	const email = useMemo(() => {
		const email = searchParams?.get('email')
		const isEmail = yup.string().email().required().isValidSync(email)
		if (!isEmail) return null
		return email
	}, [searchParams])

	const { isPending, mutateAsync: mutateResetPassword } = useMutation<
		ResponseDto<ResetPasswordDtoOut>,
		AxiosError,
		ResetPasswordDtoIn,
		unknown
	>({
		mutationFn: service.login.resetPassword,
	})

	const onSubmit = useCallback(
		async (values: ResetPasswordFormType) => {
			try {
				setBusy(true)
				await mutateResetPassword(values)
				setAlertResetPasswordInfo({ open: true, severity: 'success', message: t('auth:success.resetPassword') })
				setTimeout(() => {
					router.push(AppPath.Login)
					setBusy(false)
				}, 3000)
			} catch (error) {
				console.error('Reset password failed', error)
				setAlertResetPasswordInfo({ open: true, severity: 'error', message: t('auth:error.resetPassword') })
				setBusy(false)
			}
		},
		[mutateResetPassword, router, t],
	)

	const formik = useFormik<ResetPasswordFormType>({
		initialValues: {
			email: email ?? '',
			password: '',
			confirmPassword: '',
			confirmationCode: '',
		},
		validationSchema: validationSchema,
		onSubmit,
	})

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
				<Box className='flex w-full flex-1 flex-col items-center gap-6 rounded-[20px] bg-primary pb-[50px] pt-[40px] shadow-[0_-3px_6px_0_rgba(0,0,0,0.15)]'>
					<Typography className='!text-lg text-white'>{t('auth:login')}</Typography>
					<form onSubmit={formik.handleSubmit} className='flex w-[250px] flex-col items-center gap-5'>
						<Box className='flex w-full flex-col items-center gap-3'>
							<PasswordInput
								className='[&_.MuiFormLabel-root]:hidden [&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white [&_input]:box-border [&_input]:h-10 [&_input]:text-sm'
								disabled={isPending || busy}
								name='password'
								value={''}
								label={''}
								formik={formik}
								placeholder={t('auth:specifyPassword')}
							/>
							<PasswordInput
								className='[&_.MuiFormLabel-root]:hidden [&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white [&_input]:box-border [&_input]:h-10 [&_input]:text-sm'
								disabled={isPending || busy}
								name='confirmPassword'
								value={''}
								label={''}
								formik={formik}
								placeholder={t('auth:specifyConfirmPassword')}
							/>
							<FormInput
								className='[&_.MuiFormLabel-root]:hidden [&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white [&_input]:box-border [&_input]:h-10 [&_input]:text-sm'
								disabled={isPending || busy}
								name='confirmationCode'
								value={''}
								label={''}
								formik={formik}
								placeholder={t('auth:specifyVerificationCode')}
							/>
						</Box>
						<ActionButton
							className='h-10 !rounded-[5px] !bg-secondary [&_.MuiBox-root]:text-sm [&_.MuiBox-root]:font-normal'
							fullWidth
							title={t('auth:resetPassword')}
							type='submit'
							loading={isPending || busy}
						/>
						<Link className='!text-sm !text-white' onClick={() => router.push(AppPath.Login)}>
							{t('auth:returnLogin')}
						</Link>
					</form>
				</Box>
			</Box>

			<AlertSnackbar
				alertInfo={alertResetPasswordInfo}
				onClose={() => setAlertResetPasswordInfo({ ...alertResetPasswordInfo, open: false })}
			/>
		</Box>
	)
}
