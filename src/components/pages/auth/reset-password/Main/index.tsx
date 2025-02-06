import AppLogo from '@/components/svg/AppLogo'
import { Box, FormControl, IconButton, InputAdornment, Link, OutlinedInput, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { APP_TITLE_EN, APP_TITLE_TH } from '../../../../../../webapp.config'
import { AppPath } from '@/config/app.config'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'next-i18next'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { useMutation } from '@tanstack/react-query'
import { ResponseDto } from '@/api/interface'
import { AxiosError } from 'axios'
import service from '@/api'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import ActionButton from '@/components/common/button/ActionButton'
import { useSession } from 'next-auth/react'
import { passwordStore } from '../../context'
import { ResetPasswordAuthDtoOut } from '@interface/dto/auth/auth.dto-out'
import { ResetPasswordAuthDtoIn } from '@interface/dto/auth/auth.dto-in'
import { CheckCircle } from '@mui/icons-material'
import Icon from '@mdi/react'
import { mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js'

interface ResetPasswordMainProps {
	className?: string
	token?: string
}

export const ResetPasswordMain: React.FC<ResetPasswordMainProps> = ({ className = '', token }) => {
	const router = useRouter()
	const { status }: any = useSession()
	const setDataForgetPassword = passwordStore((state) => state.setDataForgetPassword)
	const { t } = useTranslation(['common', 'auth'])
	const [busy, setBusy] = useState<boolean>(false)
	const [alertResetPasswordInfo, setAlertResetPasswordInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
	const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false)

	const verifyTokenChangePassword = useCallback(async () => {
		try {
			setBusy(true)
			const responseVerify = await service.auth.verifyToken({ token: token ?? '' })
			if (!responseVerify.data?.isValid) {
				setDataForgetPassword({ isSuccess: false, type: 'token' })
				router.push(AppPath.AuthStatus)
			}
			return
		} catch (error) {
			setDataForgetPassword({ isSuccess: false, type: 'token' })
			router.push(AppPath.AuthStatus)
		} finally {
			setBusy(false)
		}
	}, [router, setDataForgetPassword, token])

	useEffect(() => {
		if (status !== 'loading') {
			setBusy(true)
			if (token) {
				verifyTokenChangePassword()
			} else {
				setBusy(false)
				router.push(AppPath.Overview)
			}
			setBusy(false)
		}
	}, [status, token, verifyTokenChangePassword, router])

	const validationSchema = yup.object({
		newPassword: yup
			.string()
			.required(t('auth:warning.inputNewPassword'))
			.min(8, t('auth:warning.minPasswordCharacters'))
			.matches(/^(?=.*[A-Z])/, t('auth:warning.minPasswordUppercaseLetter'))
			.matches(/^(?=.*[a-z])/, t('auth:warning.minPasswordLowercaseLetter'))
			.matches(/^(?=.*\d)/, t('auth:warning.minPasswordNumber'))
			.matches(/^(?=.*[!@#$%^&*()_+\-=[\]{};:\\|,.<>~/?])/, t('auth:warning.minPasswordSymbol')),
		confirmNewPassword: yup.string(),
	})

	type ResetPasswordFormType = yup.InferType<typeof validationSchema>

	const { isPending, mutateAsync: mutateResetPassword } = useMutation<
		ResponseDto<ResetPasswordAuthDtoOut>,
		AxiosError,
		ResetPasswordAuthDtoIn,
		unknown
	>({
		mutationFn: service.auth.resetPassword,
	})

	const onSubmit = useCallback(
		async (values: ResetPasswordFormType) => {
			try {
				setBusy(true)
				if (values.newPassword !== values.confirmNewPassword) {
					setAlertResetPasswordInfo({
						open: true,
						severity: 'error',
						message: t('auth:error.invalidPasswordMatch'),
					})
					setTimeout(() => {
						router.push(AppPath.Login)
						setBusy(false)
					}, 3000)
					return
				}
				await mutateResetPassword({ token: token ?? '', newPassword: values.newPassword })
				setAlertResetPasswordInfo({ open: true, severity: 'success', message: t('auth:success.resetPassword') })
				setTimeout(() => {
					router.push(AppPath.Login)
					setBusy(false)
				}, 3000)
			} catch (error) {
				console.error('Reset password failed', error)
				setAlertResetPasswordInfo({ open: true, severity: 'error', message: t('auth:error.resetPassword') })
				setTimeout(() => {
					router.push(AppPath.Login)
					setBusy(false)
				}, 3000)
			}
		},
		[mutateResetPassword, token, router, t],
	)

	const formik = useFormik<ResetPasswordFormType>({
		initialValues: {
			newPassword: '',
			confirmNewPassword: '',
		},
		validationSchema: validationSchema,
		onSubmit,
		validateOnChange: true,
	})

	const passwordValidationRules = useMemo(() => {
		return [
			{ test: (value: string) => value.length >= 8, message: t('auth:warning.minPasswordCharacters') },
			{
				test: (value: string) => /^(?=.*[A-Z])/.test(value),
				message: t('auth:warning.minPasswordUppercaseLetter'),
			},
			{
				test: (value: string) => /^(?=.*[a-z])/.test(value),
				message: t('auth:warning.minPasswordLowercaseLetter'),
			},
			{ test: (value: string) => /^(?=.*\d)/.test(value), message: t('auth:warning.minPasswordNumber') },
			{
				test: (value: string) => /^(?=.*[!@#$%^&*()_+\-=[\]{};:\\|,.<>~/?])/.test(value),
				message: t('auth:warning.minPasswordSymbol'),
			},
		]
	}, [t])

	const handleClickShowNewPassword = useCallback(() => setShowNewPassword((show) => !show), [])

	const handleClickShowConfirmNewPassword = useCallback(() => setShowConfirmNewPassword((show) => !show), [])

	const handleMouseDownPassword = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
	}, [])

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
					<Typography className='!text-lg text-white'>{t('auth:resetPassword')}</Typography>
					<form onSubmit={formik.handleSubmit} className='flex w-[250px] flex-col items-center gap-5'>
						<Box className='flex w-full flex-col items-center gap-3'>
							<FormControl
								fullWidth={true}
								className={classNames(
									'[&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white',
									className,
								)}
							>
								<OutlinedInput
									id='newPassword-input'
									className='[&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
									endAdornment={
										<InputAdornment position='end'>
											<IconButton
												aria-label='toggle password visibility'
												onClick={handleClickShowNewPassword}
												onMouseDown={handleMouseDownPassword}
												edge='end'
											>
												{showNewPassword ? (
													<Icon path={mdiEyeOffOutline} size={1} />
												) : (
													<Icon path={mdiEyeOutline} size={1} />
												)}
											</IconButton>
										</InputAdornment>
									}
									type={showNewPassword ? 'text' : 'password'}
									name='newPassword'
									size='small'
									value={formik?.values['newPassword'] || ''}
									onChange={formik?.handleChange}
									error={formik?.touched['newPassword'] && Boolean(formik?.errors['newPassword'])}
									disabled={isPending || busy}
									placeholder={t('auth:specifyPassword')}
								/>
							</FormControl>
							<FormControl
								fullWidth={true}
								className={classNames(
									'[&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white',
									className,
								)}
							>
								<OutlinedInput
									id='confirmNewPassword-input'
									className='[&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
									endAdornment={
										<InputAdornment position='end'>
											<IconButton
												aria-label='toggle password visibility'
												onClick={handleClickShowConfirmNewPassword}
												onMouseDown={handleMouseDownPassword}
												edge='end'
											>
												{showConfirmNewPassword ? (
													<Icon path={mdiEyeOffOutline} size={1} />
												) : (
													<Icon path={mdiEyeOutline} size={1} />
												)}
											</IconButton>
										</InputAdornment>
									}
									type={showConfirmNewPassword ? 'text' : 'password'}
									name='confirmNewPassword'
									size='small'
									value={formik?.values['confirmNewPassword'] ?? ''}
									onChange={formik?.handleChange}
									error={
										formik?.touched['confirmNewPassword'] &&
										Boolean(formik?.errors['confirmNewPassword'])
									}
									disabled={isPending || busy}
									placeholder={t('auth:specifyConfirmPassword')}
								/>
							</FormControl>
						</Box>
						<Box className='flex w-full flex-col gap-1'>
							{passwordValidationRules.map((rule) => {
								const isValid = rule.test(formik.values.newPassword)
								return (
									<Box
										key={rule.message}
										className={classNames('flex items-center gap-[5px] text-white', {
											'!text-[#C5E71E]': isValid,
										})}
									>
										<CheckCircle className='!h-[15px] !w-[15px]' />
										<Typography className='!text-xs'>{rule.message}</Typography>
									</Box>
								)
							})}
						</Box>
						<ActionButton
							className='h-10 !rounded-[5px] !bg-secondary [&_.MuiBox-root]:text-sm [&_.MuiBox-root]:font-normal'
							fullWidth
							title={t('auth:resetPasswordBtn')}
							type='submit'
							loading={isPending || busy}
						/>
						<Link
							className='!text-sm !text-white hover:cursor-pointer'
							onClick={() => router.push(AppPath.Login)}
						>
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
