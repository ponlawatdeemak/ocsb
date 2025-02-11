import ProfileForm from '@/components/shared/ProfileForm'
import service from '@/api'
import { Box, Button } from '@mui/material'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useCallback, useMemo } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import { PostUMDtoIn, PutUMDtoIn } from '@interface/dto/um/um.dto.in'
import { PositionEntity, ProvincesEntity, RegionsEntity, RolesEntity } from '@interface/entities'
import { AppPath } from '@/config/app.config'

interface UMFormValues {
	image: File | string
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

interface UserManagementFormMainProps {
	className?: string
}

export const UserManagementFormMain: React.FC<UserManagementFormMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const searchParams = useSearchParams()
	const { t } = useTranslation('common')

	const userId = useMemo(() => searchParams.get('userId') ?? '', [searchParams])
	const isEditForm = useMemo(() => !!userId || false, [userId])

	// const { data: imageData, isPending: isImageDataPending } = useQuery({
	// 	queryKey: ['getImageUM'],
	// 	queryFn: async () => await service.um.getImage({ userId }),
	// 	enabled: !!userId,
	// })

	const { data: userManagementData, isPending: isUserManagementDataPending } = useQuery({
		queryKey: ['getUM'],
		queryFn: async () => await service.um.getUM({ userId }),
		enabled: !!userId,
	})

	const {
		data: _putProfileUMData,
		error: _putProfileUMError,
		mutateAsync: mutatePutUM,
		isPending: isPutUMPending,
	} = useMutation({
		mutationFn: async (payload: { userId: string; payload: PutUMDtoIn }) => {
			return await service.um.putUM(payload.userId, payload.payload)
		},
	})

	const {
		data: _postProfileUMData,
		error: _postProfileUMError,
		mutateAsync: mutatePostUM,
		isPending: isPostUMPending,
	} = useMutation({
		mutationFn: async (payload: PostUMDtoIn) => {
			return await service.um.postUM(payload)
		},
	})

	const defaultFormValues: UMFormValues = useMemo(
		() => ({
			image: '',
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
		[userManagementData],
	)

	const validationSchema = yup.object({
		firstName: yup.string().required(t('warning.inputFirstName')).max(100, t('warning.maxinputFirstName')),
		lastName: yup.string().required(t('warning.inputLastName')).max(100, t('warning.maxinputLastName')),
		phone: yup.number().typeError(' warning.invalidPhoneFormat').required(t('warning.inputPhone')),
		email: yup
			.string()
			.email(t('warning.invalidEmailFormat'))
			.required(t('warning.inputEmail'))
			.max(255, t('auth:warning.maxInputEmail')),
		role: yup.string().required(t('warning.inputRole')),
		regions: yup.array().min(1, t('warning.inputRegions')),
	})

	const onSubmit = useCallback(
		async (values: UMFormValues) => {
			try {
				// // images is newly added
				// if (values.image instanceof File) {
				// 	// New image uploaded
				// 	const imagePayload: PostUploadFilesDtoIn = {
				// 		file: values.image,
				// 	}
				// 	const res = await um.postUploadFiles(imagePayload)
				// 	values.image = res.data?.download_file_url ?? ''
				// 	// response does not have image signature
				// }
				if (isEditForm) {
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
					await mutatePutUM({ userId, payload })
					router.push(AppPath.UserManagement)
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
					await mutatePostUM(payload)
					router.push(AppPath.UserManagement)
				}
			} catch (error: any) {
				console.error(error)
			}
		},
		[isEditForm, mutatePostUM, mutatePutUM, router, userId],
	)

	const formik = useFormik<UMFormValues>({
		enableReinitialize: true,
		initialValues: defaultFormValues,
		validationSchema: validationSchema,
		onSubmit,
	})

	return (
		<Box className='relative flex h-full flex-col items-center'>
			<div className='h-[80px] min-h-[80px] w-full bg-primary'></div>
			<div className='lg:max-w-[850px]'>
				<ProfileForm
					title='เพิ่มผู้ใช้งาน'
					formik={formik}
					className='relative top-[-60px] h-max'
					isShowActiveButton
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
							ย้อนกลับ
						</Button>
						<Button
							className='text-nowrap rounded-[5px] !border-none !bg-white !px-[30px] !py-[10px] text-sm !text-black !shadow-none'
							variant='outlined'
							onClick={() => {
								formik.resetForm()
								formik.setFieldValue('regions', [])
							}}
						>
							ล้างข้อมูล
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
						บันทึก
					</Button>
				</div>
			</div>
		</Box>
	)
}
