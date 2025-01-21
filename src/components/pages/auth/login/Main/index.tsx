import { LoginDtoIn } from '@/api/login/dto-in.dto'
import FormInput from '@/components/common/input/FormInput'
import PasswordInput from '@/components/common/input/PasswordInput'
import AppLogo from '@/components/svg/AppLogo'
import { AppPath } from '@/config/app.config'
import { Box, Link, Typography } from '@mui/material'
import classNames from 'classnames'
import { signIn } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { APP_TITLE_EN, APP_TITLE_TH } from '../../../../../../webapp.config'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import ActionButton from '@/components/common/button/ActionButton'

interface LoginMainProps {
	className?: string
}

export const LoginMain: React.FC<LoginMainProps> = ({ className = '' }) => {
	const searchParams = useSearchParams()
	const router = useRouter()
	const callbackUrl = useMemo(() => searchParams?.get('callbackUrl'), [searchParams])
	const [busy, setBusy] = useState<boolean>(false)
	const { t } = useTranslation(['common', 'auth'])
	const [alertLoginInfo, setAlertLoginInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const validationSchema = useMemo(
		() =>
			yup.object({
				username: yup.string().required(t('auth:warning.inputEmail')),
				password: yup.string().required(t('auth:warning.inputPassword')),
			}),
		[t],
	)

	const onSubmit = useCallback(
		async (values: LoginDtoIn) => {
			try {
				setBusy(true)
				const res = await signIn('credentials', {
					username: values.username,
					password: values.password,
					redirect: false,
				})
				if (!res?.ok) {
					setAlertLoginInfo({ open: true, severity: 'error', message: t('auth:error.login') })
					setBusy(false)
					return
				}
				setAlertLoginInfo({ open: true, severity: 'success', message: t('auth:success.login') })
				setTimeout(() => {
					router.push(callbackUrl ?? AppPath.Overview)
					setBusy(false)
				}, 3000)
			} catch (error) {
				console.error('Login failed', error)
			}
		},
		[callbackUrl, router, t],
	)

	const formik = useFormik<LoginDtoIn>({
		initialValues: {
			username: '',
			password: '',
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
					<form onSubmit={formik.handleSubmit} className='flex w-[250px] flex-col items-center'>
						<Box className='flex w-full flex-col items-center gap-3'>
							<FormInput
								disabled={busy}
								name='username'
								value={''}
								formik={formik}
								placeholder={t('auth:userName')}
								required
							/>
							<PasswordInput
								disabled={busy}
								name='password'
								value={''}
								formik={formik}
								placeholder={t('auth:password')}
								required
							/>
						</Box>
						<Link
							className='!mt-2 self-end !text-xs !text-white'
							onClick={() => router.push(AppPath.ForgetPassword)}
						>
							{t('auth:forgotPassword')}
						</Link>
						<ActionButton
							className='!mt-2 h-10 !rounded-[5px] !bg-secondary [&_.MuiBox-root]:text-sm [&_.MuiBox-root]:font-normal'
							fullWidth
							title={t('auth:login')}
							type='submit'
							loading={busy}
						/>
					</form>
					<Link className='!text-sm !text-white' onClick={() => router.push(AppPath.Overview)}>
						{t('back')}
					</Link>
				</Box>
			</Box>

			<AlertSnackbar
				alertInfo={alertLoginInfo}
				onClose={() => setAlertLoginInfo({ ...alertLoginInfo, open: false })}
			/>
		</Box>
	)
}
