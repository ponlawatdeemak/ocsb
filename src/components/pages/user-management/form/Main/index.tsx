import ProfileForm, { UMFormValues } from '@/components/shared/ProfileForm'
import service from '@/api'
import { Box, Button, CircularProgress } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo, useState } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { DeleteImageUserDtoIn, PostImageUserDtoIn, PostUMDtoIn, PutUMDtoIn } from '@interface/dto/um/um.dto.in'
import { PositionEntity, ProvincesEntity, RegionsEntity, RolesEntity } from '@interface/entities'
import { AppPath } from '@/config/app.config'
import { getUserImage } from '@/utils/image'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import { useSession } from 'next-auth/react'
import { errorResponse } from '@interface/config/error.config'

interface UserManagementFormMainProps {
	className?: string
}

export const UserManagementFormMain: React.FC<UserManagementFormMainProps> = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const searchParams = useSearchParams()
	const { t } = useTranslation(['common', 'um'])
	const [alertUMFormInfo, setAlertUMFormInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const userId = useMemo(() => searchParams.get('userId') ?? '', [searchParams])
	const isEdit = useMemo(() => !!userId || false, [userId])
	const [busy, setBusy] = useState<boolean>(false)

	const { data: userManagementData, isPending: isUserManagementDataPending } = useQuery({
		queryKey: ['getUM'],
		queryFn: async () => await service.um.getUM({ userId }),
		enabled: !!userId,
	})

	const {
		data: _putUMData,
		error: _putUMError,
		mutateAsync: mutatePutUM,
		isPending: isPutUMPending,
	} = useMutation({
		mutationFn: async (payload: { userId: string; payload: PutUMDtoIn }) => {
			return await service.um.putUM(payload.userId, payload.payload)
		},
	})

	const {
		data: _postUMData,
		error: _postUMError,
		mutateAsync: mutatePostUM,
		isPending: isPostUMPending,
	} = useMutation({
		mutationFn: (payload: PostUMDtoIn) => {
			return service.um.postUM(payload)
		},
	})

	const defaultFormValues: UMFormValues = useMemo(
		() => ({
			image: userId ? getUserImage(userId) : '',
			firstName: userManagementData?.data?.firstName ?? '',
			lastName: userManagementData?.data?.lastName ?? '',
			position: userManagementData?.data?.position?.positionId ?? null,
			region: userManagementData?.data?.region?.regionId ?? null,
			province: userManagementData?.data?.province?.adm1Code ?? null,
			phone: userManagementData?.data?.phone ?? '',
			email: userManagementData?.data?.email ?? '',
			role: userManagementData?.data?.role?.roleId ?? null,
			regions: userManagementData?.data?.regions?.map((region) => region.regionId ?? 0) ?? [],
			isActive: userManagementData?.data?.isActive ?? true,
		}),
		[userId, userManagementData],
	)

	const validationSchema = yup.object({
		firstName: yup.string().required(`${t('required')}${t('um:profile.firstName')}`),
		lastName: yup.string().required(`${t('required')}${t('um:profile.lastName')}`),
		position: yup.number().required(`${t('required')}${t('um:profile.position')}`),
		region: yup.number().required(`${t('required')}${t('um:profile.region')}`),
		province: yup.number().required(`${t('required')}${t('um:profile.province')}`),
		phone: yup
			.number()
			.typeError('warning.invalidPhoneFormat')
			.required(`${t('required')}${t('um:profile.phone')}`),
		email: yup
			.string()
			.email(t('warning.invalidEmailFormat'))
			.required(`${t('required')}${t('um:profile.email')}`),
		role: yup.number().required(`${t('required')}${t('um:profile.role')}`),
		regions: yup.array().min(1, `${t('required')}${t('um:profile.regions')}`),
	})

	const onSubmit = useCallback(
		async (values: UMFormValues) => {
			try {
				// images is added
				setBusy(true)
				let userIdParam = userId

				if (isEdit) {
					// put method edit existing user
					const payload: PutUMDtoIn = {
						firstName: values.firstName,
						lastName: values.lastName,
						position: values.position as PositionEntity,
						region: values.region as RegionsEntity,
						province: values.province as ProvincesEntity,
						phone: values.phone,
						email: values.email,
						role: values.role as RolesEntity,
						regions: values.regions as RegionsEntity[],
						isActive: values.isActive,
					}
					const response = await mutatePutUM({ userId: userIdParam, payload })

					if (response?.data) {
						userIdParam = response.data?.id
					}
				} else {
					// post method add new user
					const payload: PostUMDtoIn = {
						firstName: values.firstName,
						lastName: values.lastName,
						position: values.position as PositionEntity,
						region: values.region as RegionsEntity,
						province: values.province as ProvincesEntity,
						phone: values.phone,
						email: values.email,
						role: values.role as RolesEntity,
						regions: values.regions as RegionsEntity[],
						isActive: values.isActive,
					}
					const response = await mutatePostUM(payload)

					if (response?.data) {
						userIdParam = response.data?.id
					}
				}

				if (values.image instanceof File) {
					const imagePayload: { file: File; payload: PostImageUserDtoIn } = {
						file: values.image,
						payload: { userId: userIdParam },
					}
					await service.um.postImage(imagePayload.file, imagePayload.payload)
				} else if (userId && !values.image) {
					const imagePayload: DeleteImageUserDtoIn = { userId: userIdParam }
					await service.um.deleteImage(imagePayload)
				}

				setAlertUMFormInfo({
					open: true,
					severity: 'success',
					message: t('um:alert.saveComplete'),
				})

				router.push(AppPath.UserManagement)
			} catch (error: any) {
				let message = ''
				if (error?.message === errorResponse.USER_EMAIL_DUPLICATED) {
					message = t('um:alert.duplicateEmail')
				} else if (error?.message === errorResponse.USER_PHONE_DUPLICATED) {
					message = t('um:alert.duplicatePhone')
				} else {
					message = t('common:error.somethingWrong')
				}
				setAlertUMFormInfo({ open: true, severity: 'error', message })
			} finally {
				setBusy(false)
			}
		},
		[isEdit, mutatePostUM, mutatePutUM, router, userId, t],
	)

	const formik = useFormik<UMFormValues>({
		enableReinitialize: true,
		initialValues: defaultFormValues,
		validationSchema: validationSchema,
		onSubmit,
	})

	const isShowActiveButton = useMemo(() => {
		return session?.user?.id !== userId
	}, [session?.user, userId])

	return (
		<Box className='relative flex h-full flex-col items-center'>
			<div className='h-[110px] min-h-[110px] w-full bg-primary'></div>
			<div className='w-full lg:w-[850px]'>
				<ProfileForm
					title={isEdit ? t('um:titleEdit') : t('um:titleCreate')}
					formik={formik}
					className='relative top-[-60px] h-max'
					isShowActiveButton={isShowActiveButton}
					loading={busy || (userId && isUserManagementDataPending) || isPostUMPending || isPutUMPending}
				/>
				<div className='mt-[-36px] flex flex-col justify-between pb-[20px] max-lg:w-full max-lg:gap-[16px] max-lg:px-[16px] lg:flex-row'>
					<div className='flex flex-col gap-[16px] lg:flex-row'>
						<Button
							className='text-nowrap rounded-[5px] !border-none !bg-[#E6E6E6] !px-[30px] !py-[10px] text-sm !text-black !shadow-none'
							variant='outlined'
							onClick={() => {
								router.back()
							}}
							startIcon={
								(busy ||
									(userId && isUserManagementDataPending) ||
									isPostUMPending ||
									isPutUMPending) && (
									<CircularProgress
										className='[&_.MuiCircularProgress-circle]:text-white'
										size={16}
									/>
								)
							}
							disabled={
								busy || (userId && isUserManagementDataPending) || isPostUMPending || isPutUMPending
							}
						>
							{t('common:back')}
						</Button>
						<Button
							className='text-nowrap rounded-[5px] !border-none !bg-white !px-[30px] !py-[10px] text-sm !text-black !shadow-none'
							variant='outlined'
							onClick={() => {
								formik.resetForm()
							}}
							startIcon={
								(busy ||
									(userId && isUserManagementDataPending) ||
									isPostUMPending ||
									isPutUMPending) && (
									<CircularProgress
										className='[&_.MuiCircularProgress-circle]:text-white'
										size={16}
									/>
								)
							}
							disabled={
								busy || (userId && isUserManagementDataPending) || isPostUMPending || isPutUMPending
							}
						>
							{t('common:clear')}
						</Button>
					</div>
					<Button
						className='text-nowrap rounded-[5px] !border-none !px-[30px] !py-[10px] text-sm !text-white !shadow-none'
						variant='contained'
						color='secondary'
						onClick={() => {
							formik.submitForm()
						}}
						startIcon={
							(busy || (userId && isUserManagementDataPending) || isPostUMPending || isPutUMPending) && (
								<CircularProgress className='[&_.MuiCircularProgress-circle]:text-white' size={16} />
							)
						}
						disabled={busy || (userId && isUserManagementDataPending) || isPostUMPending || isPutUMPending}
					>
						{t('common:save')}
					</Button>
				</div>
			</div>

			<AlertSnackbar
				alertInfo={alertUMFormInfo}
				onClose={() => setAlertUMFormInfo({ ...alertUMFormInfo, open: false })}
			/>
		</Box>
	)
}
