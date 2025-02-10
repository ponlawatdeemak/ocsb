import {
	Alert,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Snackbar,
	FormControlLabel,
	CircularProgress,
} from '@mui/material'
import React, { FormEvent, useState, useCallback, useEffect, useMemo } from 'react'
import ProfileForm from '@/components/shared/ProfileForm'
// import { AlertInfoType, FormValues } from '@/components/shared/ProfileForm/interface'
import { useFormik } from 'formik'
import service from '@/api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as yup from 'yup'
import { useTranslation } from 'next-i18next'
// import { useSwitchLanguage } from '@/i18n/client'
// import { Language } from '@/enum'
import { useSession } from 'next-auth/react'
import AlertDialog from '@/components/common/dialog/AlertDialog'
import {
	DeleteProfileDtoIn,
	PostProfileUMDtoIn,
	PostUploadFilesDtoIn,
	PutProfileDtoIn,
	PutProfileUMDtoIn,
} from '@/api/um/dto-in.dto'
import um from '@/api/um'
import Icon from '@mdi/react'
import { mdiTrashCanOutline, mdiArrowLeft } from '@mdi/js'
import useResponsive from '@/hook/responsive'
import classNames from 'classnames'
import { UserDialogMode } from '@/enum'
// import LoadingButton from '@mui/lab/LoadingButton'
import clsx from 'clsx'
import ResetPasswordForm from '@/components/shared/ResetPasswordForm'
// import { ChangePasswordDtoIn } from '@/api/auth/dto-in.dto'
import { GetProfileDtoOut } from '@/api/um/dto-out.dto'
// import PasswordResetContent from './PasswordResetContent'
import { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import { ChangePasswordDtoIn } from '@/api/login/dto-in.dto'
import IOSSwitch from '@/components/common/switch/IOSSwitch'

export interface UserManagementProps {
	open: boolean
	onClose: () => void
	userId: string
	isEdit: boolean
	setOpen: React.Dispatch<React.SetStateAction<boolean>>
	setIsSearch: React.Dispatch<React.SetStateAction<boolean>>
	userDialogMode: UserDialogMode
}

interface UMFormValues {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: File | string
	orgCode: string
	role: string
	responsibleProvinceCode: string
	responsibleDistrictCode: string
	flagStatus?: string
}

const defaultFormValues: UMFormValues = {
	id: '',
	username: '',
	firstName: '',
	lastName: '',
	email: '',
	image: '',
	orgCode: '',
	role: '',
	responsibleProvinceCode: '',
	responsibleDistrictCode: '',
	flagStatus: 'A',
}

interface PasswordFormValues {
	currentPassword: string
	password: string
	confirmPassword: string
}

const defaultPasswordValues: PasswordFormValues = {
	currentPassword: '',
	password: '',
	confirmPassword: '',
}

export const FormMain: React.FC<UserManagementProps> = ({ ...props }) => {
	const { t } = useTranslation(['common', 'um'])
	const { open, onClose, userId, isEdit, setOpen, setIsSearch, userDialogMode } = props
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Language, 'appbar')
	const [isConfirmAddOpen, setIsConfirmAddOpen] = useState<boolean>(false)
	const [isConfirmEditOpen, setIsConfirmEditOpen] = useState<boolean>(false)
	const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false)
	const [isResetPasswordOpen, setIsResetPasswordOpen] = useState<boolean>(false)
	const [resetPasswordStatus, setResetPasswordStatus] = useState<boolean | null>(null)
	const [isConfirmResetPasswordOpen, setIsConfirmResetPasswordOpen] = useState<boolean>(false)
	const [alertInfo, setAlertInfo] = React.useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})
	const [isBusy, setIsBusy] = useState<boolean>(false)
	const { data: session, update } = useSession()
	const { isDesktop } = useResponsive()
	const queryClient = useQueryClient()

	const handleSubmitUser = async (event: FormEvent) => {
		event.preventDefault()

		formik.validateForm().then((errors) => {
			if (Object.keys(errors).length === 0) {
				isEdit ? setIsConfirmEditOpen(true) : setIsConfirmAddOpen(true)
			} else {
				formik.handleSubmit()
			}
		})
		// isEdit ? setIsConfirmEditOpen(true) : setIsConfirmAddOpen(true)
	}

	const validationSchema = yup.object({
		username: yup.string().required(t('warning.inputUserName')),
		firstName: yup.string().required(t('warning.inputFirstName')),
		lastName: yup.string().required(t('warning.inputLastName')),
		email: yup.string().email(t('warning.invalidEmailFormat')).required(t('warning.inputEmail')),
		responsibleProvinceCode: yup.string().required(t('warning.inputProvince')),
		orgCode: yup.string().required(t('warning.inputOrgCode')),
		role: yup.string().required(t('warning.inputRole')),
	})

	const passwordValidationSchema = yup.object({
		currentPassword: yup.string().required(t('warning.inputPassword')),
		password: yup
			.string()
			.required(t('warning.inputNewPassword'))
			.min(8, t('warning.minPasswordCharacters'))
			.matches(/^(?=.*\d)/, t('warning.minPasswordNumber'))
			.matches(/^(?=.*[a-z])/, t('warning.minPasswordLowercaseLetter'))
			.matches(/^(?=.*[A-Z])/, t('warning.minPasswordUppercaseLetter'))
			.matches(/^(?=.*[!@#$%^&*()_+\-=[\]{};:\\|,.<>~/?])/, t('warning.minPasswordSymbol')),
		confirmPassword: yup
			.string()
			.required(t('warning.inputConfirmPassword'))
			.oneOf([yup.ref('password')], t('warning.invalidPasswordMatch')),
	})

	const {
		data: userData,
		isLoading: isUserDataLoading,
		error: _getUMError,
	} = useQuery({
		queryKey: ['getUM', userId],
		queryFn: async () => {
			if (userDialogMode === UserDialogMode.UserEdit) {
				const res = await service.um.getUM({
					userId: props.userId,
				})
				return res
			}
		},
		enabled: !!userId,
	})

	const { data: userProfileData, isLoading: isUserProfileLoading } = useQuery({
		queryKey: ['getProfile'],
		queryFn: async () => {
			if (userDialogMode === UserDialogMode.UserProfile) {
				const res = await service.um.getProfile()
				return res
			}
		},
	})

	const {
		data: _putProfileUMData,
		error: _putProfileUMError,
		mutateAsync: mutatePutProfileUM,
		isPending: isPutProfileUMPending,
	} = useMutation({
		mutationFn: async (payload: PutProfileUMDtoIn) => {
			const res = await um.putProfileUM(payload)
			queryClient.invalidateQueries({ queryKey: ['getUM', userId] })
			return res
		},
	})

	const {
		data: _postProfileUMData,
		error: _postProfileUMError,
		mutateAsync: mutatePostProfileUM,
		isPending: isPostProfileUMPending,
	} = useMutation({
		mutationFn: async (payload: PostProfileUMDtoIn) => {
			return await um.postProfileUM(payload)
		},
	})

	const {
		data: _updateProfileData,
		error: _updateProfileError,
		mutateAsync: mutateUpdateProfile,
		isPending: isPutProfilePending,
	} = useMutation({
		mutationFn: async (payload: PutProfileDtoIn) => {
			await service.um.putProfile(payload)
			queryClient.invalidateQueries({ queryKey: ['getProfile'] })
		},
	})

	const onDelete = useCallback(
		async (userId: string) => {
			try {
				// filter out current session userid
				if (userId === session?.user.id) {
					return
				}
				const payload: DeleteProfileDtoIn = { id: userId }
				await um.deleteProfile(payload)
				setIsSearch(true)
				setAlertInfo({ open: true, severity: 'success', message: t('profileDeleteSuccess', { ns: 'um' }) })
				setOpen(false)
			} catch (error: any) {
				setAlertInfo({
					open: true,
					severity: 'error',
					message: error?.title ? error.title : t('profileDeleteFail', { ns: 'um' }),
				})
			}
		},
		[session?.user.id, t, setIsSearch, setOpen],
	)

	const onSubmit = useCallback(
		async (values: UMFormValues) => {
			let errorMessage = t('error.somethingWrong')
			try {
				// images is newly added
				if (values.image instanceof File) {
					// New image uploaded
					const imagePayload: PostUploadFilesDtoIn = {
						file: values.image,
					}
					const res = await um.postUploadFiles(imagePayload)
					values.image = res.data?.download_file_url ?? ''
					// response does not have image signature
				}
				if (userDialogMode === UserDialogMode.UserEdit) {
					// put method edit existing user
					errorMessage = t('profileUpdateFail', { ns: 'um' })
					const payload: PutProfileUMDtoIn = {
						id: values.id,
						username: values.username,
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						image: values.image,
						orgCode: values.orgCode,
						role: values.role,
						responsibleProvinceCode: values.responsibleProvinceCode,
						responsibleDistrictCode: values.responsibleDistrictCode,
						flagStatus: values.flagStatus,
					}
					await mutatePutProfileUM(payload)

					// update session on userId
					if (session?.user.id === values.id) {
						let userImage
						userImage = (await service.um.getProfile()).data?.image

						// ใช้ update ค่า data จาก useSession
						await update({
							firstName: payload.firstName,
							lastName: payload.lastName,
							email: payload.email,
							image: userImage,
							responsibleProvinceCode: payload.responsibleProvinceCode,
							responsibleDistrictCode: payload.responsibleDistrictCode,
						})
					}
					setAlertInfo({
						open: true,
						severity: 'success',
						message: t('profileUpdateSuccess', { ns: 'um' }),
					})
					setIsSearch(true)
					setOpen(false)
					formik.resetForm()
				} else if (userDialogMode === UserDialogMode.UserAdd) {
					// post method add new user
					errorMessage = t('profileAddFail', { ns: 'um' })
					const payload: PostProfileUMDtoIn = {
						username: values.username,
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						image: values.image,
						orgCode: values.orgCode,
						role: values.role,
						responsibleProvinceCode: values.responsibleProvinceCode,
						responsibleDistrictCode: values.responsibleDistrictCode,
						flagStatus: values.flagStatus,
					}
					await mutatePostProfileUM(payload)
					setAlertInfo({
						open: true,
						severity: 'success',
						message: t('profileAddSuccess', { ns: 'um' }),
					})
					setIsSearch(true)
					setOpen(false)
					formik.resetForm()
				} else if (userDialogMode === UserDialogMode.UserProfile) {
					// user Profile
					const profileData: PutProfileDtoIn = {
						username: values.username,
						id: values.id,
						firstName: values.firstName,
						lastName: values.lastName,
						email: values.email,
						image: values.image,
						responsibleProvinceCode: values.responsibleProvinceCode,
						responsibleDistrictCode: values.responsibleDistrictCode,
					}
					try {
						await mutateUpdateProfile(profileData)
						setAlertInfo({
							open: true,
							severity: 'success',
							message: t('profileUpdateSuccess', { ns: 'um' }),
						})
					} catch (error) {
						setAlertInfo({
							open: true,
							severity: 'error',
							message: t('profileUpdateFail', { ns: 'um' }),
						})
						throw new Error('Profile update failed')
					}

					let userImage
					userImage = (await service.um.getProfile()).data?.image

					// ใช้ update ค่า data จาก useSession
					await update({
						firstName: profileData.firstName,
						lastName: profileData.lastName,
						email: profileData.email,
						image: userImage,
						responsibleProvinceCode: profileData.responsibleProvinceCode,
						responsibleDistrictCode: profileData.responsibleDistrictCode,
					})
				} else {
					console.error('Unknown component mode :: ', userDialogMode)
				}
			} catch (error: any) {
				console.error(error)
				setAlertInfo({
					open: true,
					severity: 'error',
					message: error?.title || errorMessage,
				})
			}
		},
		[mutatePostProfileUM, mutatePutProfileUM, t, isEdit, session?.user.id, setIsSearch, setOpen, update],
	)

	const handleOnClose = useCallback(
		(event: any, reason: string) => {
			if (reason === 'backdropClick' || isBusy) {
				return
			}
			setOpen(false)
			// setTimeout(() => {
			passwordFormik.resetForm()
			setIsResetPasswordOpen(false)
			setResetPasswordStatus(null)
			// formik.resetForm()
			// }, 200)
		},
		[onClose],
	)

	useEffect(() => {
		if (open) {
			// queryClient.invalidateQueries({ queryKey: ['getUM', userId] })
			formik.resetForm()
		}
	}, [open])

	const handleValidatePassword = useCallback(() => {
		passwordFormik.validateForm().then(async (errors) => {
			if (Object.keys(errors).length === 0) {
				setIsConfirmResetPasswordOpen(true)
			} else {
				passwordFormik.handleSubmit()
			}
		})
	}, [])

	const handleResetPassword = useCallback(
		async (passwordFormValues: PasswordFormValues, userProfileData: GetProfileDtoOut | undefined) => {
			// try resetting password
			const payload = {
				userId: userProfileData?.id ?? '',
				password: passwordFormValues.currentPassword,
				newPassword: passwordFormValues.confirmPassword,
			}
			try {
				// await mutateChangePassword(payload)

				setResetPasswordStatus(true)
				// on success
			} catch (error) {
				// on error
				console.error('error :: ', error)
				setResetPasswordStatus(false)
			} finally {
				setIsConfirmResetPasswordOpen(false)
			}
		},
		[],
	)

	// const {
	// 	isPending: isChangePasswordPending,
	// 	error: _passwordError,
	// 	mutateAsync: mutateChangePassword,
	// } = useMutation({
	// 	mutationFn: async (payload: ChangePasswordDtoIn) => {
	// 		await service.auth.changePassword(payload)
	// 	},
	// })

	const formik = useFormik<UMFormValues>({
		enableReinitialize: true,
		initialValues:
			userDialogMode === UserDialogMode.UserAdd
				? defaultFormValues
				: (userData?.data as UMFormValues) || (userProfileData?.data as UMFormValues) || defaultFormValues,
		validationSchema: validationSchema,
		onSubmit,
	})
	useEffect(() => {
		if (
			!formik.values.responsibleProvinceCode ||
			formik.values.responsibleProvinceCode.toString() !==
				formik.values.responsibleDistrictCode?.toString().substring(0, 2)
		) {
			formik.setFieldValue('responsibleDistrictCode', null)
		}
	}, [formik.values.responsibleProvinceCode, formik.values.responsibleDistrictCode])

	const passwordFormik = useFormik<PasswordFormValues>({
		enableReinitialize: true,
		initialValues: defaultPasswordValues,
		validationSchema: passwordValidationSchema,
		onSubmit: () => {},
	})

	const handleBackResetPassword = () => {
		passwordFormik.resetForm()
		setIsResetPasswordOpen((prev) => !prev)
	}

	const handleClickReturnProfile = () => {
		setIsResetPasswordOpen(false)
		setResetPasswordStatus(null)
		setIsConfirmResetPasswordOpen(false)
		passwordFormik.resetForm()
	}

	useEffect(() => {
		if (
			isUserDataLoading ||
			isUserProfileLoading ||
			isPutProfileUMPending ||
			isPostProfileUMPending ||
			isPutProfilePending
			// ||isChangePasswordPending
		) {
			setIsBusy(true)
		} else {
			setIsBusy(false)
		}
	}, [
		isUserDataLoading,
		isUserProfileLoading,
		isPutProfileUMPending,
		isPostProfileUMPending,
		isPutProfilePending,
		// isChangePasswordPending,
	])

	const displayDialogTitle = useMemo(() => {
		if (userDialogMode === UserDialogMode.UserProfile) return t('profileManagement', { ns: 'um' })
		if (userDialogMode === UserDialogMode.UserEdit) return t('editUserAccount', { ns: 'um' })
		return t('addUser', { ns: 'um' })
	}, [userDialogMode, t])

	return (
		<div className='flex flex-col'>
			<Dialog
				open={open}
				onClose={handleOnClose}
				component='form'
				// onSubmit={handleSubmitUser}
				fullWidth
				scroll='paper'
				className={classNames(
					'flex flex-col pt-[80px] [&_.MuiBackdrop-root]:!opacity-0 [&_.MuiDialog-container]:bg-background [&_.MuiDialog-container]:p-[80px]',
					{
						'': !isDesktop,
					},
				)}
				fullScreen={true}
				// transitionDuration={0}
			>
				<DialogTitle
					className={clsx('', {
						'!pl-[32px]': isDesktop,
					})}
				>
					{displayDialogTitle}
				</DialogTitle>
				<DialogContent
					dividers={true}
					className={clsx('flex flex-col justify-between p-[24px] !pt-[24px] max-lg:gap-3', {
						'!pl-[32px]': isDesktop,
					})}
				>
					{/* {isResetPasswordOpen &&
						(resetPasswordStatus === null ? (
							<div className='flex h-full flex-col gap-[16px] lg:gap-[18px] lg:px-[16px] lg:py-[10px]'>
								<div>
									<Button
										className='flex !w-[106px] gap-[4px] !rounded-xl !border-gray bg-white py-[4px] pl-[6px] pr-[8px] text-sm !font-medium !text-black [&_.MuiButton-startIcon]:m-0'
										onClick={handleBackResetPassword}
										variant='outlined'
										disabled={isBusy}
										startIcon={<Icon path={mdiArrowLeft} size={'18px'} className='text-black' />}
									>
										{t('back')}
									</Button>
								</div>
								<form
									onSubmit={formik.handleSubmit}
									noValidate
									className='flex h-full flex-col gap-[28px] max-lg:justify-between lg:w-[306px]'
								>
									<ResetPasswordForm
										className='flex flex-col gap-[16px] lg:gap-[18px]'
										formik={passwordFormik}
										changePassword={true}
										loading={isBusy}
									/>
									<div className='flex max-lg:justify-center'>
										<Button
											className='h-[40px] !w-[106px] px-[16px] py-[8px] text-base font-semibold'
											variant='contained'
											onClick={() => {
												handleValidatePassword()
											}}
											color='primary'
											disabled={isBusy}
											startIcon={
												isBusy ? (
													<CircularProgress
														className='[&_.MuiCircularProgress-circle]:text-[#00000042]'
														size={16}
													/>
												) : null
											}
										>
											{t('confirm')}
										</Button>
									</div>
								</form>
							</div>
						) : (
							<PasswordResetContent
								isSuccess={resetPasswordStatus}
								handleClickReturnProfile={handleClickReturnProfile}
							/>
						))} */}

					{!isResetPasswordOpen && (
						<>
							<div className='flex grow !flex-row-reverse items-center justify-between max-lg:block lg:flex-row lg:gap-[32px] xl:gap-[48px] 2xl:gap-[64px]'>
								<ProfileForm
									formik={formik}
									loading={
										isUserDataLoading ||
										isUserProfileLoading ||
										isPutProfileUMPending ||
										isPostProfileUMPending ||
										isPutProfilePending
									}
									isFormUM={true}
									isDisabledProfile={userId === session?.user.id}
									userDialogmode={userDialogMode}
									userData={
										userDialogMode === UserDialogMode.UserProfile
											? userProfileData?.data
											: userData?.data
									}
									isResetPasswordOpen={isResetPasswordOpen}
									setIsResetPasswordOpen={setIsResetPasswordOpen}
								/>
							</div>
							{session?.user.id !== userId && userDialogMode !== UserDialogMode.UserProfile && (
								<FormControlLabel
									sx={{
										pointerEvents: 'none',
										margin: 0,
									}}
									className='max-lg:pt-1'
									control={
										<div className='pointer-events-auto'>
											<IOSSwitch
												className='m-0 mr-2 [&_.Mui-checked+.MuiSwitch-track]:!bg-green-light'
												checked={formik.values.flagStatus === 'A' || false}
												onChange={(event) => {
													formik.setFieldValue('flagStatus', event.target.checked ? 'A' : 'C')
												}}
											/>
										</div>
									}
									label={t('enableUser', { ns: 'um' })}
								/>
							)}
						</>
					)}
				</DialogContent>
				{!isResetPasswordOpen && (
					<DialogActions
						className={classNames('flex justify-between !p-4', {
							'': isEdit || session?.user.id === userId,
						})}
					>
						{session?.user.id !== userId && isEdit && userDialogMode !== UserDialogMode.UserProfile && (
							<Button
								className='h-[40px] w-[150px] !border-gray bg-white text-sm !text-error'
								variant='outlined'
								onClick={() => {
									setIsConfirmDeleteOpen(true)
								}}
								startIcon={<Icon path={mdiTrashCanOutline} size={1} color={'var(--error-color-1)'} />}
								disabled={isPostProfileUMPending || isPutProfileUMPending || isUserDataLoading}
							>
								{t('deleteUser', { ns: 'um' })}
							</Button>
						)}
						<div className='flex-1' />
						<div
							className={classNames('flex justify-end space-x-2', {
								'': isEdit || session?.user.id === userId,
							})}
						>
							<Button
								className={clsx('h-[40px] !w-[71px] !border-gray !bg-white text-sm !text-black', {
									'!text-gray':
										isPostProfileUMPending ||
										isPutProfileUMPending ||
										isUserDataLoading ||
										isPutProfilePending,
								})}
								variant='outlined'
								onClick={(e) => {
									handleOnClose(e, '')
								}}
								disabled={
									isPostProfileUMPending ||
									isPutProfileUMPending ||
									isUserDataLoading ||
									isPutProfilePending
								}
							>
								{t('cancel')}
							</Button>
							<Button
								className='h-[40px] !w-[71px] px-[16px] py-[8px] text-base text-sm font-semibold'
								variant='contained'
								onClick={handleSubmitUser}
								color='primary'
								disabled={
									isPostProfileUMPending ||
									isPutProfileUMPending ||
									isUserDataLoading ||
									isPutProfilePending
								}
								startIcon={
									isPostProfileUMPending ||
									isPutProfileUMPending ||
									isUserDataLoading ||
									isPutProfilePending ? (
										<CircularProgress
											className='[&_.MuiCircularProgress-circle]:text-[#00000042]'
											size={16}
										/>
									) : null
								}
							>
								{t('save', { ns: 'um' })}
							</Button>
						</div>
					</DialogActions>
				)}
			</Dialog>
			{/* Alert Confirm Add New */}
			<AlertDialog
				open={isConfirmAddOpen}
				title={t('addUser', { ns: 'um' })}
				content={t('alert.confirmAddUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmAddOpen(false)
				}}
				onConfirm={() => {
					formik.handleSubmit()
					// onSubmit(formik.values)
					setIsConfirmAddOpen(false)
				}}
			/>
			{/* Alert Confirm Edit Existing */}
			<AlertDialog
				open={isConfirmEditOpen}
				title={t('editUserAccount', { ns: 'um' })}
				content={t('alert.confirmEditUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmEditOpen(false)
				}}
				onConfirm={() => {
					formik.handleSubmit()
					// onSubmit(formik.values)
					setIsConfirmEditOpen(false)
				}}
			/>
			{/* Alert Confirm DeleteOne */}
			<AlertDialog
				open={isConfirmDeleteOpen}
				title={t('deleteUser', { ns: 'um' })}
				content={t('alert.confirmDeleteUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmDeleteOpen(false)
				}}
				onConfirm={() => {
					onDelete(userId)
					setIsConfirmDeleteOpen(false)
				}}
			/>
			{/* Alert Confirm Change Password */}
			<AlertDialog
				open={isConfirmResetPasswordOpen}
				title={t('alert.confirmEditPassword')}
				content={t('alert.confirmChangePassword')}
				onClose={() => setIsConfirmResetPasswordOpen(false)}
				onConfirm={() => {
					handleResetPassword(passwordFormik.values, userProfileData?.data)
				}}
			/>

			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				open={alertInfo.open}
				autoHideDuration={6000}
				onClose={() => setAlertInfo({ ...alertInfo, open: false })}
				className='w-[300px]'
			>
				<Alert
					onClose={() => setAlertInfo({ ...alertInfo, open: false })}
					severity={alertInfo.severity}
					className='w-full'
				>
					{alertInfo.message}
				</Alert>
			</Snackbar>
		</div>
	)
}
