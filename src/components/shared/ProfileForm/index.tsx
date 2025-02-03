import React, { ReactNode } from 'react'
import AutocompleteInput from '@/components/common/input/AutocompleteInput'
import FormInput from '@/components/common/input/FormInput'
import UploadImage from '@/components/shared/ProfileForm/UploadImage'
import { Box, Button, Checkbox, Divider, FormControlLabel, Typography } from '@mui/material'
import { FormikProps } from 'formik'
import { useTranslation } from 'next-i18next'
import classNames from 'classnames'
import useResponsive from '@/hook/responsive'
import clsx from 'clsx'
import IOSSwitch from '@/components/common/switch/IOSSwitch'
import { BackIcon } from '@/components/svg/AppIcon'
import { useRouter } from 'next/navigation'

interface ResponseLanguage {
	en: string
	th: string
}
interface UMFormValues {
	image: string
	firstName: string
	lastName: string
	position: string
	region: string
	province: string
	phone: string
	email: string
	role: string
	regions: string[]
	isActive: boolean
}

export interface ProfileFormProps {
	title: string
	formik: FormikProps<UMFormValues>
	lineNotiButtonElement?: ReactNode
	changePasswordButtonElement?: ReactNode
	loading?: boolean
}

const ProfileForm: React.FC<ProfileFormProps> = ({
	title,
	formik,
	lineNotiButtonElement,
	changePasswordButtonElement,
	loading = false,
}) => {
	const router = useRouter()
	const { t, i18n } = useTranslation(['um', 'common'])
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Languages, 'appbar')
	const { isDesktop } = useResponsive()

	const positionOptions = [{ value: '1', name: { th: 'เมฆ', en: 'make' } }]
	const regionOptions = [{ value: '1', name: { th: 'กลาง', en: 'middle' } }]
	const provinceOptions = [{ value: '1', name: { th: 'กทม', en: 'bangkok' } }]
	const roleOptions = [{ value: '1', name: { th: 'แอดมิน', en: 'admin' } }]

	return (
		<div className='flex h-full w-full flex-col'>
			<div className='flex w-full justify-between gap-[16px] rounded-[15px_15px_0px_0px] bg-primary py-4 pl-[31px] pr-[40px]'>
				<div className='flex items-center gap-3'>
					<button onClick={() => router.back()}>
						<BackIcon />
					</button>
					<Typography className='!text-[18px] font-normal text-white'>{title}</Typography>
				</div>

				<FormControlLabel
					labelPlacement='start'
					className='pointer-events-none !font-normal text-white [&_span]:text-sm'
					control={
						<div className='pointer-events-auto'>
							<IOSSwitch
								className='m-0 ml-2 [&_.Mui-checked+.MuiSwitch-track]:!bg-white [&_.MuiSwitch-thumb]:bg-primary [&_.MuiSwitch-track]:!bg-gray-400'
								checked={formik.values.isActive || false}
								onChange={(event) => {
									formik.setFieldValue('isActive', event.target.checked)
								}}
							/>
						</div>
					}
					label={`${t('การเปิดใช้งาน')}:`}
				/>
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
						<Box className='flex flex-col items-center gap-[16px]'>
							<Typography className='w-full !overflow-hidden !text-ellipsis !whitespace-nowrap text-center text-sm'>
								{formik.values.firstName || formik.values.lastName
									? `${formik.values.firstName} ${formik.values.lastName}`
									: 'ชื่อ - นามสกุล'}
								<br />
								{formik.values.position
									? `${positionOptions.find((item) => item.value === formik.values.position)?.name[i18n.language as keyof ResponseLanguage]}`
									: 'ตำแหน่ง'}
							</Typography>
							{lineNotiButtonElement}
						</Box>
						{changePasswordButtonElement}
					</Box>
				</div>
				{isDesktop && <Divider orientation='vertical' />}
				{!isDesktop && <Divider className='w-full pt-[22px]' />}
				<div className='flex flex-col lg:grow lg:gap-10 lg:px-5'>
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
							{'ตำแหน่ง'}
						</Typography>
						<AutocompleteInput
							className='w-full bg-white [&_::placeholder]:text-sm [&_input]:!text-sm'
							options={positionOptions}
							getOptionLabel={(option) => option.name[i18n.language]}
							name='position'
							formik={formik}
							disabled={false}
							required={true}
							placeholder={t('เลือกตำแหน่ง')}
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
								options={regionOptions}
								getOptionLabel={(option) => option.name[i18n.language]}
								name='region'
								formik={formik}
								disabled={false}
								required={true}
								placeholder={t('เลือกภาค')}
							/>
							<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px] lg:hidden'>
								{'จังหวัด'}
							</Typography>
							<AutocompleteInput
								className='w-full bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
								options={provinceOptions}
								getOptionLabel={(option) => option.name[i18n.language]}
								name='province'
								formik={formik}
								disabled={false}
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
							disabled={false}
							placeholder={t('ระบุเบอร์โทรศัพท์')}
							inputProps={{ maxLength: 100 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px] max-lg:pt-[24px]'>
							{'อีเมล'}
						</Typography>
						<FormInput
							className='w-full'
							name='email'
							formik={formik}
							required
							disabled={false}
							placeholder={t('ระบุอีเมล')}
							inputProps={{ maxLength: 100 }}
						/>
					</Box>
					<Box className='grid grid-cols-[1fr] gap-x-[20px] text-nowrap bg-background p-[22px] lg:grid-cols-[100px_1fr] lg:gap-y-[22px] lg:rounded-[15px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pb-[6px]'>
							{'สิทธิ์การเข้าถึง'}
						</Typography>
						<AutocompleteInput
							className='w-full bg-white [&_::placeholder]:text-sm [&_input]:text-sm'
							options={roleOptions}
							getOptionLabel={(option) => option.name[i18n.language]}
							name='role'
							formik={formik}
							disabled={false}
							required={true}
							placeholder={t('เลือกสิทธิ์การเข้าถึง')}
						/>
						<Typography className='content-center justify-center !text-sm !font-light max-lg:pt-[24px]'>
							{'ภูมิภาคที่ดูแล'}
						</Typography>
						<div className='flex flex-col max-lg:pl-[24px] max-lg:pt-[10px] lg:flex-row lg:items-center lg:gap-12'>
							<FormControlLabel
								control={
									<Checkbox
										value='ภาค1'
										onChange={(event) => {
											if (formik.values.regions.includes(event.target.value)) {
												const toDelIndex = formik.values.regions.findIndex(
													(item) => item === event.target.value,
												)
												const newValue = [...formik.values.regions]
												newValue.splice(toDelIndex, 1)
												formik.setFieldValue('regions', newValue)
											} else {
												const newValue = [...formik.values.regions]
												newValue.push(event.target.value)
												formik.setFieldValue('regions', newValue)
											}
										}}
										size='small'
									/>
								}
								label='ภาค 1'
								className='[&_.MuiFormControlLabel-label]:text-sm'
							/>
							<FormControlLabel
								control={
									<Checkbox
										value='ภาค2'
										onChange={(event) => {
											if (formik.values.regions.includes(event.target.value)) {
												const toDelIndex = formik.values.regions.findIndex(
													(item) => item === event.target.value,
												)
												const newValue = [...formik.values.regions]
												newValue.splice(toDelIndex, 1)
												formik.setFieldValue('regions', newValue)
											} else {
												const newValue = [...formik.values.regions]
												newValue.push(event.target.value)
												formik.setFieldValue('regions', newValue)
											}
										}}
										size='small'
									/>
								}
								label='ภาค 2'
								className='[&_.MuiFormControlLabel-label]:text-sm'
							/>
							<FormControlLabel
								control={
									<Checkbox
										value='ภาค3'
										onChange={(event) => {
											if (formik.values.regions.includes(event.target.value)) {
												const toDelIndex = formik.values.regions.findIndex(
													(item) => item === event.target.value,
												)
												const newValue = [...formik.values.regions]
												newValue.splice(toDelIndex, 1)
												formik.setFieldValue('regions', newValue)
											} else {
												const newValue = [...formik.values.regions]
												newValue.push(event.target.value)
												formik.setFieldValue('regions', newValue)
											}
										}}
										size='small'
									/>
								}
								label='ภาค 3'
								className='[&_.MuiFormControlLabel-label]:text-sm'
							/>
							<FormControlLabel
								control={
									<Checkbox
										value='ภาค4'
										onChange={(event) => {
											if (formik.values.regions.includes(event.target.value)) {
												const toDelIndex = formik.values.regions.findIndex(
													(item) => item === event.target.value,
												)
												const newValue = [...formik.values.regions]
												newValue.splice(toDelIndex, 1)
												formik.setFieldValue('regions', newValue)
											} else {
												const newValue = [...formik.values.regions]
												newValue.push(event.target.value)
												formik.setFieldValue('regions', newValue)
											}
										}}
										size='small'
									/>
								}
								label='ภาค 4'
								className='[&_.MuiFormControlLabel-label]:text-sm'
							/>
						</div>
					</Box>

					{/* <div
						className={classNames('flex gap-[16px] max-lg:flex-col lg:mt-[24px] lg:gap-[12px]', {
							'max-lg:hidden': true,
						})}
					>
						<Button
							className={clsx('h-[40px] w-[150px] border-green-light bg-white text-sm text-green-light', {
								'w-[178px]': isDesktop,
							})}
							variant='outlined'
							onClick={() => {}}
							startIcon={
								<div
									className={clsx('[&>svg]:fill-green-dark1', {
										'[&>svg]:fill-gray': loading,
									})}
								>
									{
										// LockIcon width={24} height={24}
									}
								</div>
							}
							disabled={loading}
						>
							{t('resetPassword')}
						</Button>
					</div> */}
				</div>
			</div>
		</div>
	)
}

export default ProfileForm
