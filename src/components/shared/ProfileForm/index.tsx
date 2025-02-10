import React, { ReactNode } from 'react'
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

import * as _ from 'lodash'

interface ResponseLanguage {
	en: string
	th: string
}
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
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Languages, 'appbar')
	const { isDesktop } = useResponsive()

	const checkBoxerrorMessage = formik?.touched.regions && formik?.errors.regions

	const { data: regionsLookupData, isLoading: isRegionsDataLoading } = useQuery({
		queryKey: ['getRegions'],
		queryFn: () => service.lookup.get({ name: 'regions' }),
	})

	const { data: provinceLookupData, isLoading: isProvinceDataLoading } = useQuery({
		queryKey: ['getProvince'],
		queryFn: () => service.lookup.get({ name: 'provinces' }),
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
									: 'ชื่อ - นามสกุล'}
								<br />
								{formik.values.position
									? `${(positionLookupData as any[])?.find((item) => item.positionId === formik.values.position)?.[`${_.camelCase(`positionName-${i18n.language ? '' : i18n.language}`)}`]}` ||
										''
									: 'ตำแหน่ง'}
							</Typography>

							{lineNotiButtonElement}
						</Box>
						{changePasswordButtonElement}
					</Box>
				</div>
				{isDesktop && <Divider orientation='vertical' flexItem />}
				{!isDesktop && <Divider className='w-full pt-[22px]' />}
				<div className='flex flex-col lg:grow lg:gap-[8px] lg:px-5'>
					<Box className='grid grid-cols-[1fr] text-nowrap px-[16px] py-[24px] lg:grid-cols-[100px_1fr] lg:gap-x-[20px] lg:gap-y-[22px] lg:p-[22px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[8px]'>
							{'ชื่อ'}
						</Typography>
						<FormInput
							className='w-full'
							name='firstName'
							formik={formik}
							required
							disabled={loading}
							placeholder={t('ระบุชื่อ - นามสกุล')}
							inputProps={{ maxLength: 100 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{'นามสกุล'}
						</Typography>
						<FormInput
							className='w-full'
							name='lastName'
							formik={formik}
							required
							disabled={loading}
							placeholder={t('ระบุชื่อ - นามสกุล')}
							inputProps={{ maxLength: 100 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{t('um:position')}
						</Typography>
						<AutocompleteInput
							className='w-full bg-white [&_::placeholder]:text-sm [&_input]:!text-sm'
							getOptionLabel={(option) => {
								return option.name
							}}
							options={
								positionLookupData?.map((item: any) => ({
									value: item.positionId,
									name: String(
										item[`${_.camelCase(`positionName-${i18n.language ? '' : i18n.language}`)}`],
									),
								})) || []
							}
							name='position'
							formik={formik}
							disabled={isPositionDataLoading || loading}
							required={true}
							placeholder={t('um:selectPosition')}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:hidden'>
							{'ภาค / จังหวัด'}
						</Typography>

						<div className='flex flex-col lg:flex-row lg:gap-4'>
							<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px] lg:hidden'>
								{'ภาค'}
							</Typography>
							<AutocompleteInput
								className='w-full bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
								getOptionLabel={(option) => {
									return option.name
								}}
								options={
									regionsLookupData?.map((item: any) => ({
										value: item.regionId,
										name: String(item[`regionName${Languages.TH === i18n.language ? '' : 'En'}`]),
									})) || []
								}
								name='region'
								formik={formik}
								disabled={isRegionsDataLoading || loading}
								required={true}
								placeholder={t('เลือกภาค')}
							/>
							<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px] lg:hidden'>
								{'จังหวัด'}
							</Typography>
							<AutocompleteInput
								className='w-full bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
								getOptionLabel={(option) => {
									return option.name
								}}
								options={
									provinceLookupData?.map((item: any) => ({
										value: item[`adm1Code`],
										name: String(item[`provinceName${Languages.TH === i18n.language ? '' : 'En'}`]),
									})) || []
								}
								name='province'
								formik={formik}
								disabled={
									isProvinceDataLoading || isRegionsDataLoading || !formik.values.region || loading
								}
								required={true}
								placeholder={t('เลือกจังหวัด')}
							/>
						</div>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{'เบอร์โทรศัพท์'}
						</Typography>
						<FormInput
							className='w-full'
							name='phone'
							formik={formik}
							required
							disabled={loading}
							placeholder={t('ระบุเบอร์โทรศัพท์')}
							inputProps={{ maxLength: 10 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{'อีเมล'}
						</Typography>
						<FormInput
							className='w-full'
							name='email'
							formik={formik}
							required
							disabled={loading}
							placeholder={t('ระบุอีเมล')}
							inputProps={{ maxLength: 255 }}
						/>
					</Box>
					<Box className='grid grid-cols-[1fr] gap-x-[20px] text-nowrap bg-background max-lg:px-[16px] max-lg:py-[22px] lg:grid-cols-[100px_1fr] lg:gap-y-[22px] lg:rounded-[15px] lg:p-[22px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px]'>
							{'สิทธิ์การเข้าถึง'}
						</Typography>
						<AutocompleteInput
							className='w-full bg-background [&_.MuiAutocomplete-root]:bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
							getOptionLabel={(option) => {
								return option.name
							}}
							options={
								rolesLookupData?.map((item: any) => ({
									value: item.roleId,
									name: String(item[`roleName`]),
								})) || []
							}
							name='role'
							formik={formik}
							disabled={isRolesDataLoading || loading}
							required={true}
							placeholder={t('เลือกสิทธิ์การเข้าถึง')}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pt-[24px]'>
							{'ภูมิภาคที่ดูแล'}
						</Typography>
						<div className='flex flex-col max-lg:pl-[24px] max-lg:pt-[10px]'>
							<div className='flex flex-col lg:flex-row lg:items-center lg:gap-12'>
								{regionsLookupData &&
									regionsLookupData.map((item: any) => {
										if (item.regionName !== 'ส่วนกลาง')
											return (
												<FormControlLabel
													key={item.regionId}
													control={
														<Checkbox
															value={Number(item.regionId)}
															onChange={(event) => {
																if (
																	formik.values.regions.includes(
																		Number(event.target.value),
																	)
																) {
																	const toDelIndex = formik.values.regions.findIndex(
																		(item) => item === Number(event.target.value),
																	)
																	const newValue = [...formik.values.regions]
																	newValue.splice(toDelIndex, 1)
																	formik.setFieldValue('regions', newValue)
																} else {
																	const newValue = [...formik.values.regions]
																	newValue.push(Number(event.target.value))
																	formik.setFieldValue('regions', newValue)
																}
															}}
															size='small'
															checked={
																formik.values.regions.includes(item.regionId)
																	? true
																	: false
															}
															disabled={loading}
														/>
													}
													label={String(
														item[`regionName${Languages.TH === i18n.language ? '' : 'En'}`],
													)}
													className='!mr-0 [&_.MuiFormControlLabel-label]:text-sm'
												/>
											)
									})}
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
