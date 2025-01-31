import React from 'react'
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
	loading?: boolean
}

const ProfileForm: React.FC<ProfileFormProps> = ({ title, formik, loading = false }) => {
	const router = useRouter()
	const { t, i18n } = useTranslation(['um', 'common'])
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Languages, 'appbar')
	const isDesktop = useResponsive()

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
								className='m-0 ml-2 [&_.Mui-checked+.MuiSwitch-track]:!bg-white [&_.MuiSwitch-thumb]:bg-primary'
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
			<div className='flex w-full flex-row rounded-[0px_0px_15px_15px] bg-white py-6'>
				<div className='flex w-[25%] flex-col gap-[16px] px-10'>
					<UploadImage
						name='image'
						formik={formik}
						className='flex flex-col items-center [&_.MuiAvatar-root]:h-[153px] [&_.MuiAvatar-root]:w-[153px]'
						disabled={loading}
					/>
					<Box className='flex flex-col items-start items-center gap-[16px]'>
						<Typography className='w-full !overflow-hidden !text-ellipsis !whitespace-nowrap text-center text-sm'>
							{formik.values.firstName || formik.values.lastName
								? `${formik.values.firstName} ${formik.values.lastName}`
								: 'ชื่อ - นามสกุล'}
							<br />
							{formik.values.position
								? `${positionOptions.find((item) => item.value === formik.values.position)?.name[i18n.language as keyof ResponseLanguage]}`
								: 'ตำแหน่ง'}
						</Typography>
					</Box>
				</div>
				{isDesktop && <Divider orientation='vertical' flexItem />}
				<div className='flex grow flex-col gap-10 px-5'>
					<Box className='grid grid-cols-[100px_1fr] gap-x-[20px] gap-y-[22px] text-nowrap p-[22px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light'>{'ชื่อ'}</Typography>
						<FormInput
							className='w-full'
							name='firstName'
							formik={formik}
							required
							disabled={loading}
							placeholder={t('ระบุชื่อ - นามสกุล')}
							inputProps={{ maxLength: 100 }}
						/>
						<Typography className='content-center justify-center !text-sm !font-light'>
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
						<Typography className='content-center justify-center !text-sm !font-light'>
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
						<Typography className='content-center justify-center !text-sm !font-light'>
							{'ภาค / จังหวัด'}
						</Typography>
						<div className='flex gap-4'>
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
						<Typography className='content-center justify-center !text-sm !font-light'>
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
					<Box className='grid grid-cols-[100px_1fr] gap-x-[20px] gap-y-[22px] text-nowrap rounded-[15px] bg-background p-[22px] [&_.MuiInputBase-input]:!h-[35px] [&_.MuiInputBase-root]:h-[35px]'>
						<Typography className='content-center justify-center !text-sm !font-light'>
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
						<Typography className='content-center justify-center !text-sm !font-light'>
							{'ภูมิภาคที่ดูแล'}
						</Typography>
						<div className='flex items-center justify-between'>
							<Checkbox
								value='one'
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
							/>
							<Checkbox
								value='two'
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
