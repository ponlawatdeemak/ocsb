import React, { ReactNode, useCallback, useMemo } from 'react'
import AutocompleteInput from '@/components/common/input/AutocompleteInput'
import FormInput from '@/components/common/input/FormInput'
import UploadImage from '@/components/shared/ProfileForm/UploadImage'
import { Box, Button, Checkbox, Divider, FormControlLabel, FormHelperText, Typography } from '@mui/material'
import { FormikProps } from 'formik'
import { useTranslation } from 'next-i18next'
import classNames from 'classnames'
import useResponsive from '@/hook/responsive'
import IOSSwitch from '@/components/common/switch/IOSSwitch'
import { BackIcon } from '@/components/svg/AppIcon'
import { useRouter } from 'next/navigation'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { Languages } from '@/enum'

import _ from 'lodash'
import { RegionsEntity } from '@interface/entities'
import { enSuffix } from '@/config/app.config'
import { useSession } from 'next-auth/react'
import { UserRole } from '@interface/config/um.config'

export interface UMFormValues {
	image: File | string
	firstName: string | undefined
	lastName: string | undefined
	position: number | null | undefined
	region: number | null | undefined
	province: number | null | undefined
	phone: string | undefined
	email: string | undefined
	role: number | null | undefined
	regions: number[] | undefined
	isActive?: boolean
}

export interface ProfileFormProps {
	title: string
	formik: FormikProps<UMFormValues>
	lineNotiButtonElement?: ReactNode
	changePasswordButtonElement?: ReactNode
	isShowActiveButton?: boolean
	loading?: boolean
	className?: string
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	title,
	formik,
	lineNotiButtonElement,
	changePasswordButtonElement,
	isShowActiveButton = false,
	loading = false,
	className,
}) => {
	const router = useRouter()
	const { t, i18n } = useTranslation(['um', 'common'])
	const { isDesktop } = useResponsive()
	const checkBoxerrorMessage = formik?.touched.regions && formik?.errors.regions
	const { data: session } = useSession()

	const isEditRole = useMemo(() => {
		if (session?.user) {
			return session.user.role.roleId === UserRole.SuperAdmin || session.user.role.roleId === UserRole.Admin
		}
	}, [session?.user])

	const { data: regionsLookupData, isLoading: isRegionsDataLoading } = useQuery({
		queryKey: ['getRegions'],
		queryFn: () =>
			service.lookup.get({ name: 'regions' }).then((res) => {
				return res.filter((item: RegionsEntity) => item.regionName !== 'ส่วนกลาง')
			}),
	})

	const { data: provinceLookupData, isPending: isProvinceDataLoading } = useQuery({
		queryKey: ['getProvince', formik.values.region],
		queryFn: () => service.lookup.get({ name: 'provinces', where: `region_id=${formik.values.region}` }),
		enabled: !!formik.values.region,
	})

	const { data: positionLookupData, isLoading: isPositionDataLoading } = useQuery({
		queryKey: ['getPosition'],
		queryFn: () => service.lookup.get({ name: 'position' }),
	})

	const { data: rolesLookupData, isLoading: isRolesDataLoading } = useQuery({
		queryKey: ['getRoles'],
		queryFn: () => service.lookup.get({ name: 'roles' }),
	})

	const onRegionCheck = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (formik.values.regions?.includes(Number(event.target.value))) {
				const toDelIndex = formik.values.regions.findIndex((item) => item === Number(event.target.value))
				const newValue = [...formik.values.regions]
				newValue.splice(toDelIndex, 1)
				formik.setFieldValue('regions', newValue)
			} else {
				if (formik.values.regions) {
					const newValue = [...formik.values.regions]
					newValue.push(Number(event.target.value))
					formik.setFieldValue('regions', newValue)
				}
			}
		},
		[formik],
	)

	return (
		<div className={classNames('flex h-full w-full flex-col', className)}>
			<div className='flex h-[60px] min-h-[60px] w-full justify-between gap-[16px] rounded-[15px_15px_0px_0px] bg-primary-light py-4 pl-[31px] pr-[40px]'>
				<div className='flex items-center'>
					<Button onClick={() => router.back()} className='!ml-[-19px] !p-0'>
						<BackIcon />
					</Button>
					<Typography className='!text-[18px] font-normal text-white'>{title}</Typography>
				</div>

				{isShowActiveButton && (
					<FormControlLabel
						labelPlacement='start'
						className='pointer-events-none !font-normal text-white [&_span]:text-sm'
						control={
							<div className='pointer-events-auto'>
								<IOSSwitch
									className='m-0 ml-2 [&_.Mui-checked+.MuiSwitch-track]:!bg-white [&_.MuiSwitch-thumb]:bg-primary-light [&_.MuiSwitch-track]:!bg-gray-400'
									checked={formik.values.isActive || false}
									onChange={(event) => {
										formik.setFieldValue('isActive', event.target.checked)
									}}
								/>
							</div>
						}
						label={`${t('การเปิดใช้งาน')}:`}
					/>
				)}
			</div>
			<div className={'flex w-full flex-col rounded-[0px_0px_15px_15px] bg-white py-6 lg:flex-row'}>
				<div className='flex flex-col gap-[16px] px-10 lg:w-[25%]'>
					<UploadImage
						name='image'
						formik={formik}
						className='flex flex-col items-center [&_.MuiAvatar-root]:h-[153px] [&_.MuiAvatar-root]:w-[153px]'
						disabled={loading}
					/>
					<Box className='flex h-full flex-col items-center justify-between max-lg:gap-[16px]'>
						<Box className='flex w-full flex-col items-center gap-[16px]'>
							<Typography className='w-full !overflow-hidden !text-ellipsis !whitespace-nowrap text-center !text-sm'>
								{formik.values.firstName || formik.values.lastName
									? `${formik.values.firstName} ${formik.values.lastName}`
									: `${t('um:profile.firstName')} - ${t('um:profile.lastName')}`}
								<br />
								{formik.values.position
									? `${(positionLookupData as any[])?.find((item) => item.positionId === formik.values.position)?.[`${_.camelCase(`positionName-${i18n.language ? '' : i18n.language}`)}`]}` ||
										''
									: t('um:profile.position')}
							</Typography>

							{lineNotiButtonElement}
						</Box>
						{changePasswordButtonElement}
					</Box>
				</div>
				{isDesktop && <Divider orientation='vertical' flexItem />}
				{!isDesktop && <Divider className='w-full pt-[22px]' />}
				<div className='flex flex-col lg:w-[75%] lg:grow lg:gap-[8px] lg:px-5'>
					<Box className='grid grid-cols-[1fr] text-nowrap px-[16px] py-[24px] lg:grid-cols-[100px_1fr] lg:gap-x-[20px] lg:gap-y-[22px] lg:p-[22px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[8px]'>
							{t('um:profile.firstName')}
						</Typography>
						<FormInput
							className='w-full'
							name='firstName'
							formik={formik}
							required
							disabled={loading}
							placeholder={`${t('common:placeholder.input')}${t('um:profile.firstName')}`}
							inputProps={{ maxLength: 100 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{t('um:profile.lastName')}
						</Typography>
						<FormInput
							className='w-full'
							name='lastName'
							formik={formik}
							required
							disabled={loading}
							placeholder={`${t('common:placeholder.input')}${t('um:profile.lastName')}`}
							inputProps={{ maxLength: 100 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{t('um:profile.position')}
						</Typography>
						<AutocompleteInput
							className='w-full bg-white [&_::placeholder]:text-sm [&_input]:!text-sm'
							getOptionLabel={(option) => {
								return option.name
							}}
							options={
								positionLookupData?.map((item: any) => ({
									value: item.positionId,
									name: String(item[`positionName${Languages.TH === i18n.language ? '' : enSuffix}`]),
								})) || []
							}
							name='position'
							formik={formik}
							disabled={isPositionDataLoading || loading}
							required={true}
							placeholder={`${t('common:placeholder.autocomplete')}${t('um:profile.position')}`}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:hidden'>
							{t('um:profile.regionProvince')}
						</Typography>

						<div className='flex flex-col lg:flex-row lg:gap-4'>
							<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px] lg:hidden'>
								{t('um:profile.region')}
							</Typography>
							<AutocompleteInput
								className='w-full bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
								getOptionLabel={(option) => {
									return option.name
								}}
								options={
									regionsLookupData?.map((item: any) => ({
										value: item.regionId,
										name: String(
											item[`regionName${Languages.TH === i18n.language ? '' : enSuffix}`],
										),
									})) || []
								}
								name='region'
								formik={formik}
								disabled={isRegionsDataLoading || loading}
								required={true}
								placeholder={`${t('common:placeholder.autocomplete')}${t('um:profile.region')}`}
							/>
							<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px] lg:hidden'>
								{t('um:profile.province')}
							</Typography>
							<AutocompleteInput
								className='w-full bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
								getOptionLabel={(option) => {
									return option.name
								}}
								options={
									provinceLookupData?.map((item: any) => ({
										value: item[`adm1Code`],
										name: String(
											item[`provinceName${Languages.TH === i18n.language ? '' : enSuffix}`],
										),
									})) || []
								}
								name='province'
								formik={formik}
								disabled={
									isProvinceDataLoading || isRegionsDataLoading || !formik.values.region || loading
								}
								required={true}
								placeholder={`${t('common:placeholder.autocomplete')}${t('um:profile.province')}`}
							/>
						</div>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{t('um:profile.phone')}
						</Typography>
						<FormInput
							className='w-full'
							name='phone'
							formik={formik}
							required
							disabled={loading}
							placeholder={`${t('common:placeholder.input')}${t('um:profile.phone')}`}
							inputProps={{ maxLength: 10 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{t('um:profile.email')}
						</Typography>
						<FormInput
							className='w-full'
							name='email'
							formik={formik}
							required
							disabled={loading}
							placeholder={`${t('common:placeholder.input')}${t('um:profile.email')}`}
							inputProps={{ maxLength: 255 }}
						/>
					</Box>
					<Box className='grid grid-cols-[1fr] gap-x-[20px] text-nowrap bg-background max-lg:px-[16px] max-lg:py-[22px] lg:grid-cols-[100px_1fr] lg:gap-y-[22px] lg:rounded-[15px] lg:p-[22px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px]'>
							{t('um:profile.role')}
						</Typography>
						<AutocompleteInput
							className='w-full bg-background [&_.MuiAutocomplete-root]:bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
							getOptionLabel={(option) => {
								return option.name
							}}
							options={
								rolesLookupData?.map((item: any) => ({
									value: item.roleId,
									name: item.roleName,
								})) || []
							}
							name='role'
							formik={formik}
							disabled={isRolesDataLoading || loading || !isEditRole}
							required={true}
							placeholder={`${t('common:placeholder.autocomplete')}${t('um:profile.role')}`}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pt-[24px]'>
							{t('um:profile.regions')}
						</Typography>
						<div className='flex flex-col max-lg:pl-[24px] max-lg:pt-[10px]'>
							<div className='flex flex-col lg:flex-row lg:items-center lg:gap-6'>
								{regionsLookupData?.map((item: RegionsEntity) => (
									<FormControlLabel
										key={item.regionId}
										control={
											<Checkbox
												value={Number(item.regionId)}
												onChange={onRegionCheck}
												size='small'
												checked={formik.values.regions?.includes(item.regionId!) ? true : false}
												disabled={loading || !isEditRole}
											/>
										}
										label={String(
											item[`regionName${Languages.TH === i18n.language ? '' : enSuffix}`],
										)}
										className='!mr-0 [&_.MuiFormControlLabel-label]:text-sm'
									/>
								))}
							</div>
							{typeof checkBoxerrorMessage === 'string' && (
								<FormHelperText error className='max-lg:!ml-[-10px] lg:!mx-[14px] lg:!mt-[0px]'>
									{checkBoxerrorMessage}
								</FormHelperText>
							)}
						</div>
					</Box>
				</div>
			</div>
		</div>
	)
}

export default ProfileForm
