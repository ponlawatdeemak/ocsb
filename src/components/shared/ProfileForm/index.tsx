import React from 'react'
import AutocompleteInput from '@/components/common/input/AutocompleteInput'
import FormInput from '@/components/common/input/FormInput'
import UploadImage from '@/components/common/upload/UploadImage'
import { Box, Button, Divider, Typography } from '@mui/material'
import { FormikProps } from 'formik'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
// import { useSwitchLanguage } from '@/i18n/client'

import classNames from 'classnames'
import { UserDialogMode } from '@/enum'
import useResponsive from '@/hook/responsive'
// import { ContactIcon, EmailIcon, LockIcon } from '@/components/svg/MenuIcon'
import { GetProfileDtoOut, GetUmDtoOut } from '@/api/um/dto-out.dto'
import { ResponseLanguage } from '@/api/interface'
// import { Languages } from '@/config/app.config'
import clsx from 'clsx'

export interface ProfileFormProps {
	formik: FormikProps<any>
	loading?: boolean
	isDisabledProfile?: boolean
	isHiddenProfile?: boolean
	isFormUM?: boolean
	isEditFormUM?: boolean
	userDialogmode?: UserDialogMode
	userData?: GetProfileDtoOut | GetUmDtoOut
	isResetPasswordOpen?: boolean
	setIsResetPasswordOpen?: React.Dispatch<React.SetStateAction<boolean>>
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	formik,
	loading = false,
	isDisabledProfile = false,
	isHiddenProfile = false,
	isFormUM = false,
	isEditFormUM = false,
	userDialogmode,
	userData,
	isResetPasswordOpen,
	setIsResetPasswordOpen = () => {},
}) => {
	const { t, i18n } = useTranslation(['common', 'um'])
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Languages, 'appbar')
	const isDesktop = useResponsive()

	// const { data: provinceLookupData, isLoading: isProvinceDataLoading } = useQuery({
	// 	queryKey: ['getProvince'],
	// 	queryFn: () => service.lookup.get('provinces'),
	// })

	// const { data: districtLookupData, isLoading: isDistricDataLoading } = useQuery({
	// 	queryKey: ['getDistrict', formik?.values.responsibleProvinceCode],
	// 	queryFn: () => service.lookup.get(`districts/${formik.values.responsibleProvinceCode}`),
	// 	enabled: !!formik.values.responsibleProvinceCode,
	// })

	// const { data: organizationLookupData, isLoading: _isOrganizationDataLoading } = useQuery({
	// 	queryKey: ['getOrganization'],
	// 	queryFn: () => service.lookup.get('organizations'),
	// })

	// const { data: roleLookupData, isLoading: _isRoleDataLoading } = useQuery({
	// 	queryKey: ['getRole'],
	// 	queryFn: () => service.lookup.get('roles'),
	// })

	const handleClickResetPassword = () => {
		setIsResetPasswordOpen((prev) => !prev)
	}

	return (
		<>
			<div className='w-full self-start'>
				<UploadImage
					name='image'
					formik={formik}
					className='flex flex-col items-center gap-[12px] py-[16px] [&_.MuiAvatar-root]:h-[168px] [&_.MuiAvatar-root]:w-[168px]'
					disabled={loading}
				/>
				{(userDialogmode === UserDialogMode.UserProfile || userDialogmode === UserDialogMode.UserEdit) && (
					<Box className='mb-[16px] flex flex-col items-center gap-[16px]'>
						<Typography className='max-w-[230px] !overflow-hidden !text-ellipsis !whitespace-nowrap !text-lg !font-medium'>
							{formik?.values.firstName}
							&nbsp;
							{formik?.values.lastName}
						</Typography>
						<Box className='max-w-full'>
							<Typography className='max-w-full !overflow-hidden !text-ellipsis !whitespace-nowrap'>
								<span className='inline-flex items-center'>
									<div className='[&>svg]:fill-dark1'>
										{/* <EmailIcon width={26} height={24} /> */}
									</div>
								</span>
								&nbsp;&nbsp;&nbsp;
								<span>{formik?.values.email}</span>
							</Typography>
							<Typography className='max-w-full !overflow-hidden !text-ellipsis !whitespace-nowrap'>
								<Box className='inline-flex items-center'>
									<div className='[&>svg]:fill-dark1'>
										{/* <ContactIcon width={26} height={24} /> */}
									</div>
									&nbsp;&nbsp;&nbsp;
									<span className='inline-flex'>
										{/* {userData?.orgCode.toLocaleUpperCase()}
										{!!formik?.values.responsibleProvinceCode && ', '}
										{
											provinceLookupData?.data?.find(
												(item) =>
													item.code === parseInt(formik?.values.responsibleProvinceCode),
											)?.name[i18n.language as keyof ResponseLanguage]
										}
										{!!formik?.values.responsibleDistrictCode && ', '}
										{
											districtLookupData?.data?.find(
												(item) =>
													item.code === parseInt(formik?.values.responsibleDistrictCode),
											)?.name[i18n.language as keyof ResponseLanguage]
										} */}
									</span>
								</Box>
							</Typography>
						</Box>
					</Box>
				)}
			</div>
			{isDesktop && <Divider orientation='vertical' flexItem />}
			<div className='flex flex-col gap-[16px] self-start'>
				<Box className='flex flex-col gap-[12px]'>
					<div className='flex gap-[12px] max-lg:flex-col'>
						<FormInput
							className='!lg:w-[50%] w-full text-sm font-medium'
							name='username'
							label={t('username')}
							formik={formik}
							required
							disabled={
								loading ||
								isEditFormUM ||
								userDialogmode === UserDialogMode.UserEdit ||
								userDialogmode === UserDialogMode.UserProfile
							}
							placeholder={t('pleaseEnter')}
							inputProps={{ maxLength: 100 }}
							title=''
						/>
						<FormInput
							className='w-full text-sm font-medium lg:w-[240px]'
							name='email'
							label={t('email')}
							formik={formik}
							required
							disabled={
								isDisabledProfile ||
								loading ||
								isEditFormUM ||
								userDialogmode === UserDialogMode.UserEdit ||
								userDialogmode === UserDialogMode.UserProfile
							}
							placeholder={t('pleaseEnter')}
							inputProps={{ maxLength: 100 }}
							title=''
						/>
					</div>
					<div className='flex gap-[12px] max-lg:flex-col'>
						<FormInput
							className='w-full text-sm font-medium lg:w-[240px]'
							name='firstName'
							label={t('firstName')}
							formik={formik}
							required
							disabled={loading}
							placeholder={t('pleaseEnter')}
							inputProps={{ maxLength: 100 }}
							title=''
						/>
						<FormInput
							className='w-full text-sm font-medium lg:w-[240px]'
							name='lastName'
							label={t('lastName')}
							formik={formik}
							required
							disabled={loading}
							placeholder={t('pleaseEnter')}
							inputProps={{ maxLength: 100 }}
							title=''
						/>
					</div>
				</Box>
				<Box className='flex flex-col gap-[16px] lg:gap-[12px]'>
					<div className='flex gap-[16px] max-lg:flex-col lg:gap-[12px]'>
						<AutocompleteInput
							className='w-full text-sm font-medium lg:w-[240px]'
							options={
								// provinceLookupData?.data?.map((item) => ({
								// 	...item,
								// 	value: String(item.code),
								// })) ||
								[]
							}
							getOptionLabel={(option) => option.name[i18n.language]}
							name='responsibleProvinceCode'
							label={t('belongProvince', { ns: 'um' })}
							formik={formik}
							disabled={
								// isProvinceDataLoading ||
								loading
							}
							required
							placeholder={t('pleaseEnter')}
							title=''
						/>
						<AutocompleteInput
							className='w-full text-sm font-medium lg:w-[240px]'
							options={
								// districtLookupData?.data?.map((item) => ({
								// 	...item,
								// 	value: String(item.code),
								// })) ||
								[]
							}
							getOptionLabel={(option) => option.name?.[i18n.language]}
							name='responsibleDistrictCode'
							label={t('belongDistrict', { ns: 'um' })}
							formik={formik}
							disabled={
								// isDistricDataLoading ||
								loading || !formik.values.responsibleProvinceCode
							}
							required={false}
							placeholder={t('notEnter')}
						/>
					</div>
					<div
						className={classNames('flex gap-[16px] max-lg:flex-col lg:gap-[12px]', {
							'max-lg:hidden': isHiddenProfile,
						})}
					>
						<AutocompleteInput
							className='w-full text-sm font-medium lg:w-[240px]'
							options={
								// organizationLookupData?.data?.map((item) => ({
								// 	...item,
								// 	value: item.code,
								// })) ||
								[]
							}
							getOptionLabel={(option) => option.name[i18n.language]}
							name='orgCode'
							label={t('org')}
							formik={formik}
							disabled={isDisabledProfile || loading || userDialogmode === UserDialogMode.UserProfile}
							required={
								userDialogmode === UserDialogMode.UserAdd ||
								userDialogmode === UserDialogMode.UserEdit ||
								userDialogmode === UserDialogMode.UserProfile
							}
							placeholder={userDialogmode === UserDialogMode.UserAdd ? t('pleaseEnter') : t('notEnter')}
							title=''
						/>
						<AutocompleteInput
							className='w-full text-sm font-medium lg:w-[240px]'
							options={
								// roleLookupData?.data?.map((item) => ({
								// 	...item,
								// 	value: item.code,
								// })) ||
								[]
							}
							getOptionLabel={(option) => option.name[i18n.language]}
							name='role'
							label={t('role')}
							formik={formik}
							disabled={isDisabledProfile || loading || userDialogmode === UserDialogMode.UserProfile}
							required={
								userDialogmode === UserDialogMode.UserAdd ||
								userDialogmode === UserDialogMode.UserEdit ||
								userDialogmode === UserDialogMode.UserProfile
							}
							placeholder={userDialogmode === UserDialogMode.UserAdd ? t('pleaseEnter') : t('notEnter')}
							title=''
						/>
					</div>
					{userDialogmode === UserDialogMode.UserProfile && (
						<div
							className={classNames('flex gap-[16px] max-lg:flex-col lg:mt-[24px] lg:gap-[12px]', {
								'max-lg:hidden': isHiddenProfile,
							})}
						>
							<Button
								className={clsx(
									'h-[40px] w-[150px] border-green-light bg-white text-sm text-green-light',
									{
										'w-[178px]': isDesktop,
									},
								)}
								variant='outlined'
								onClick={handleClickResetPassword}
								startIcon={
									<div
										className={clsx('[&>svg]:fill-green-dark1', {
											'[&>svg]:fill-gray': loading,
										})}
									>
										{/* <LockIcon width={24} height={24} /> */}
									</div>
								}
								disabled={loading}
							>
								{t('resetPassword')}
							</Button>
						</div>
					)}
				</Box>
			</div>
		</>
	)

	// return <></>
}

export default ProfileForm
