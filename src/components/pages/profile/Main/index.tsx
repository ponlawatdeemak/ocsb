import ProfileForm from '@/components/shared/ProfileForm'
import service from '@/api'
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputAdornment,
	OutlinedInput,
	Typography,
} from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import CloseIcon from '@mui/icons-material/Close'
import classNames from 'classnames'
import Icon from '@mdi/react'
import { mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js'
import { AxiosError } from 'axios'
import { AlertInfoType } from '@/components/shared/ProfileForm/interface'
import { ChangePasswordProfileDtoOut } from '@interface/dto/profile/profile.dto-out'
import { ChangePasswordProfileDtoIn } from '@interface/dto/profile/profile.dto-in'
import { CheckCircle } from '@mui/icons-material'
import AlertSnackbar from '@/components/common/snackbar/AlertSnackbar'
import { PositionEntity, ProvincesEntity, RegionsEntity, RolesEntity } from '@interface/entities'
import { ResponseDto } from '@interface/config/app.config'

interface ProfileMainProps {
	className?: string
}

interface UMFormValues {
	image: File | null
	firstName: string
	lastName: string
	position: number | null
	region: number | null
	province: number | null
	phone: string
	email: string
	role: number | null
	regions: number[]
	isActive: boolean
}

export const ProfileMain: React.FC<ProfileMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { t } = useTranslation(['common', 'auth', 'um'])

	const [openChangePw, setOpenChangePw] = useState(false)
	const [showCurrentPassword, setShowCurrentPassword] = useState<boolean>(false)
	const [showNewPassword, setShowNewPassword] = useState<boolean>(false)
	const [showConfirmNewPassword, setShowConfirmNewPassword] = useState<boolean>(false)

	const [busy, setBusy] = useState<boolean>(false)
	const [alertInfo, setAlertInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const { data: profileData, isLoading: isProfileDataLoading } = useQuery({
		queryKey: ['getProfile'],
		queryFn: async () => {
			const response = await service.profile.getProfile()
			if (response.data) {
				formik.setFieldValue('firstName', response.data.firstName)
				formik.setFieldValue('lastName', response.data.lastName)
				formik.setFieldValue('position', response.data.position?.positionId)
				formik.setFieldValue('region', response.data.region?.regionId)
				formik.setFieldValue('province', response.data.province?.adm1Code)
				formik.setFieldValue('phone', response.data.phone)
				formik.setFieldValue('email', response.data.email)
				formik.setFieldValue('role', response.data.role?.roleId)
				formik.setFieldValue(
					'regions',
					response.data.regions?.flatMap((item) => item.regionId),
				)
			}
			return response
		},
	})

	/// how to display img ?
	const { data: imgData, isLoading: isimgLoading } = useQuery({
		queryKey: ['getImgProfile'],
		queryFn: async () => {
			const response = await service.um.getImage({ userId: profileData?.data.userId ?? '' })
			return response
		},
		enabled: !!profileData,
	})

	const defaultFormValues: UMFormValues = {
		image: null,
		firstName: '',
		lastName: '',
		position: null,
		region: null,
		province: null,
		phone: '',
		email: '',
		role: null,
		regions: [],
		isActive: true,
	}

	const validationSchema = yup.object({
		firstName: yup.string().required(`${t('required')} ${t('firstName')}`),
		lastName: yup.string().required(`${t('required')} ${t('lastName')}`),
		position: yup.number().required(`${t('required')} ${t('position')}`),
		region: yup.number().required(`${t('required')} ${t('region')}`),
		province: yup.number().required(`${t('required')} ${t('province')}`),
		phone: yup
			.number()
			.typeError(' warning.invalidPhoneFormat')
			.required(`${t('required')} ${t('phone')}`),
		email: yup
			.string()
			.email(t('warning.invalidEmailFormat'))
			.required(`${t('required')} ${t('email')}`),
		role: yup.number().required(`${t('required')} ${t('role')}`),
		regions: yup.array().min(1, `${t('required')} ${t('regions')}`),
	})

	const onSubmit = useCallback(
		async (values: UMFormValues) => {
			try {
				await service.um.putUM(profileData?.data?.userId ?? '', {
					firstName: values.firstName,
					lastName: values.lastName,
					position: values.position as PositionEntity,
					region: values.region as RegionsEntity,
					province: values.province as ProvincesEntity,
					phone: values.phone,
					email: values.email,
					role: values.role as RolesEntity,
					regions: values.regions as RegionsEntity[],
				})

				if (values.image) {
					let formData = new FormData()
					formData.append('file', values.image)
					await service.um.postImage(values.image, {
						userId: profileData?.data.userId ?? '',
					})
				}

				setAlertInfo({
					open: true,
					severity: 'success',
					message: t('auth:success.saveProfile'),
				})

				setBusy(false)
			} catch (error: any) {
				console.error(error)
				setAlertInfo({ open: true, severity: 'error', message: t('auth:error.saveProfile') })
				setBusy(false)
			}
		},
		[profileData?.data?.userId, t],
	)

	const formik = useFormik<UMFormValues>({
		enableReinitialize: true,
		initialValues: defaultFormValues,
		validationSchema: validationSchema,
		onSubmit,
	})

	const ChangePwValidationSchema = yup.object({
		currentPw: yup.string(),
		newPw: yup
			.string()
			.required(t('auth:warning.inputNewPassword'))
			.min(8, t('auth:warning.minPasswordCharacters'))
			.matches(/^(?=.*[A-Z])/, t('auth:warning.minPasswordUppercaseLetter'))
			.matches(/^(?=.*[a-z])/, t('auth:warning.minPasswordLowercaseLetter'))
			.matches(/^(?=.*\d)/, t('auth:warning.minPasswordNumber'))
			.matches(/^(?=.*[!@#$%^&*()_+\-=[\]{};:\\|,.<>~/?])/, t('auth:warning.minPasswordSymbol')),
		confirmPw: yup.string(),
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

	type ChangePasswordFormType = yup.InferType<typeof ChangePwValidationSchema>

	const { isPending, mutateAsync: mutateChangePassword } = useMutation<
		ResponseDto<ChangePasswordProfileDtoOut>,
		AxiosError,
		ChangePasswordProfileDtoIn,
		unknown
	>({
		mutationFn: service.profile.changePasswordProfile,
	})

	const onSubmitChangePw = useCallback(
		async (values: ChangePasswordFormType) => {
			try {
				setBusy(true)
				if (values.newPw !== values.confirmPw) {
					setAlertInfo({
						open: true,
						severity: 'error',
						message: t('auth:error.invalidPasswordMatch'),
					})
					setBusy(false)
					return
				}
				const response = await mutateChangePassword({
					oldPassword: values.currentPw ?? '',
					newPassword: values.newPw,
				})
				if (response?.data?.success) {
					setAlertInfo({
						open: true,
						severity: 'success',
						message: t('auth:success.resetPassword'),
					})
				} else {
					setAlertInfo({
						open: true,
						severity: 'error',
						message: t('auth:error.resetPassword'),
					})
				}
				setBusy(false)
			} catch (error) {
				console.error('Reset password failed', error)
				setAlertInfo({ open: true, severity: 'error', message: t('auth:error.resetPassword') })
				setBusy(false)
			}
		},
		[mutateChangePassword, t],
	)

	const changePwFormik = useFormik<ChangePasswordFormType>({
		enableReinitialize: true,
		initialValues: {
			currentPw: '',
			newPw: '',
			confirmPw: '',
		},
		validationSchema: ChangePwValidationSchema,
		validateOnChange: true,
		onSubmit: onSubmitChangePw,
	})

	const handleClickShowCurrentPassword = useCallback(() => setShowCurrentPassword((show) => !show), [])

	const handleClickShowNewPassword = useCallback(() => setShowNewPassword((show) => !show), [])

	const handleClickShowConfirmNewPassword = useCallback(() => setShowConfirmNewPassword((show) => !show), [])

	const handleMouseDownPassword = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
	}, [])

	const lineNotiButtonElement = (
		<Button
			className='text-nowrap rounded-[5px] !bg-[#FBBF07] !px-[12px] !py-[5px] text-sm !font-normal !shadow-none'
			variant='contained'
		>
			{t('um:lineNoti')}
		</Button>
	)

	const changePasswordButtonElement = (
		<Button
			className='text-nowrap rounded-[5px] !border-[#D8D8D8] !px-[31px] !py-[8px] text-sm !shadow-none'
			variant='outlined'
			onClick={() => {
				setOpenChangePw(true)
			}}
		>
			{t('um:changePassword')}
		</Button>
	)

	return (
		<Box className='relative flex h-full flex-col items-center'>
			<div className='h-[80px] min-h-[80px] w-full bg-primary'></div>
			<div className='lg:w-[850px]'>
				<ProfileForm
					title='ข้อมูลผู้ใช้งาน'
					formik={formik}
					loading={isPending || busy || isProfileDataLoading}
					lineNotiButtonElement={lineNotiButtonElement}
					changePasswordButtonElement={changePasswordButtonElement}
					className='relative top-[-60px] h-max'
				/>
				<div className='mt-[-36px] flex flex-col justify-between pb-[20px] max-lg:w-full max-lg:gap-[16px] max-lg:px-[16px] lg:flex-row'>
					<div className='flex flex-col gap-[16px] lg:flex-row'>
						<Button
							className='text-nowrap rounded-[5px] !border-none !bg-[#E6E6E6] !px-[30px] !py-[10px] text-sm !text-black !shadow-none'
							variant='outlined'
							onClick={() => {
								router.back()
							}}
						>
							{t('back')}
						</Button>
						<Button
							className='text-nowrap rounded-[5px] !border-none !bg-white !px-[30px] !py-[10px] text-sm !text-black !shadow-none'
							variant='outlined'
							onClick={() => {
								formik.resetForm()
								formik.setFieldValue('regions', [])
							}}
						>
							{t('clear')}
						</Button>
					</div>
					<Button
						className='text-nowrap rounded-[5px] !border-none !px-[30px] !py-[10px] text-sm !text-white !shadow-none'
						variant='contained'
						color='secondary'
						onClick={() => {
							formik.submitForm()
						}}
					>
						{t('save')}
					</Button>
				</div>
			</div>

			<Dialog
				open={openChangePw}
				onClose={(_event, reason) => {
					if (reason !== 'backdropClick') {
						setOpenChangePw(false)
					}
				}}
				PaperProps={{
					className:
						'!rounded-[15px] !bg-primary [&_.MuiDialogTitle-root]:!p-[25px] [&_.MuiDialogContent-root]:!p-[25px] [&_.MuiDialogContent-root]:!px-[50px] [&_.MuiDialogContent-root]:lg:!px-[107px] [&_.MuiDialogContent-root]:!pt-[0px]',
				}}
			>
				<DialogTitle className='flex items-center justify-end !py-6'>
					<IconButton
						aria-label='close'
						onClick={() => {
							setOpenChangePw(false)
						}}
					>
						<CloseIcon fontSize='small' className='!text-white' />
					</IconButton>
				</DialogTitle>
				<DialogContent className='flex h-full w-auto flex-col items-center gap-[12px] rounded-[15px] text-white'>
					<Box className='flex w-full flex-col items-center gap-3'>
						<FormControl
							fullWidth={true}
							className={classNames(
								'[&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white',
								className,
							)}
						>
							<OutlinedInput
								id='currentPassword-input'
								className='[&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
								endAdornment={
									<InputAdornment position='end'>
										<IconButton
											aria-label='toggle password visibility'
											onClick={handleClickShowCurrentPassword}
											onMouseDown={handleMouseDownPassword}
											edge='end'
										>
											{showCurrentPassword ? (
												<Icon path={mdiEyeOffOutline} size={1} />
											) : (
												<Icon path={mdiEyeOutline} size={1} />
											)}
										</IconButton>
									</InputAdornment>
								}
								type={showCurrentPassword ? 'text' : 'password'}
								name='currentPw'
								size='small'
								value={changePwFormik?.values['currentPw'] || ''}
								onChange={changePwFormik?.handleChange}
								error={
									changePwFormik?.touched['currentPw'] && Boolean(changePwFormik?.errors['currentPw'])
								}
								disabled={isPending || busy || isProfileDataLoading}
								placeholder={t('auth:specifyCurrentPassword')}
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
								name='newPw'
								size='small'
								value={changePwFormik?.values['newPw'] || ''}
								onChange={changePwFormik?.handleChange}
								error={changePwFormik?.touched['newPw'] && Boolean(changePwFormik?.errors['newPw'])}
								disabled={isPending || busy || isProfileDataLoading}
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
								name='confirmPw'
								size='small'
								value={changePwFormik?.values['confirmPw'] ?? ''}
								onChange={changePwFormik?.handleChange}
								error={
									changePwFormik?.touched['confirmPw'] && Boolean(changePwFormik?.errors['confirmPw'])
								}
								disabled={isPending || busy || isProfileDataLoading}
								placeholder={t('auth:specifyConfirmPassword')}
							/>
						</FormControl>
					</Box>
					<Box className='flex w-full flex-col gap-1'>
						{passwordValidationRules.map((rule) => {
							const isValid = rule.test(changePwFormik.values.newPw)
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
					<Button
						className='!mt-[12px] text-nowrap rounded-[5px] !border-none !px-[30px] !py-[10px] text-sm !text-white !shadow-none'
						variant='contained'
						color='secondary'
						onClick={() => {
							changePwFormik.submitForm()
						}}
					>
						{t('um:changePassword')}
					</Button>
				</DialogContent>
			</Dialog>

			<AlertSnackbar alertInfo={alertInfo} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
		</Box>
	)
}
