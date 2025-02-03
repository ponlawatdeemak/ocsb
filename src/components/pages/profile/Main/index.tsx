import ProfileForm from '@/components/shared/ProfileForm'
import { AppPath } from '@/config/app.config'
import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import { signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import React, { useCallback, useState } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'
import CloseIcon from '@mui/icons-material/Close'
import FormInput from '@/components/common/input/FormInput'
import { MapLayerIcon } from '@/components/svg/MenuIcon'

interface ProfileMainProps {
	className?: string
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

interface ResetPwFormValues {
	currentPw: string
	newPw: string
	confirmPw: string
}

export const ProfileMain: React.FC<ProfileMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { t } = useTranslation('common')

	const logout = useCallback(() => signOut({ callbackUrl: AppPath.Overview }), [])

	const [openResetPw, setOpenResetPw] = useState(false)

	const defaultFormValues: UMFormValues = {
		image: '',
		firstName: '',
		lastName: '',
		position: '',
		region: '',
		province: '',
		phone: '',
		email: '',
		role: '',
		regions: [],
		isActive: true,
	}

	const validationSchema = yup.object({
		firstName: yup.string().required(t('warning.inputFirstName')),
		lastName: yup.string().required(t('warning.inputLastName')),
		position: yup.string().required(t('warning.inputPosition')),
		region: yup.string().required(t('warning.inputRegion')),
		province: yup.string().required(t('warning.inputProvince')),
		phone: yup.number().typeError(' warning.invalidPhoneFormat').required(t('warning.inputPhone')),
		email: yup.string().email(t('warning.invalidEmailFormat')).required(t('warning.inputEmail')),
		role: yup.string().required(t('warning.inputRole')),
		regions: yup.array().min(1, t('warning.inputRegions')),
	})

	const onSubmit = useCallback(async (values: UMFormValues) => {
		try {
			console.log(values)
		} catch (error: any) {
			console.error(error)
		}
	}, [])

	const formik = useFormik<UMFormValues>({
		enableReinitialize: true,
		initialValues: defaultFormValues,
		validationSchema: validationSchema,
		onSubmit,
	})

	const resetPwFormik = useFormik<ResetPwFormValues>({
		enableReinitialize: true,
		initialValues: {
			currentPw: '',
			newPw: '',
			confirmPw: '',
		},
		validationSchema: yup.object({
			currentPw: yup.string().required(t('warning.inputCurrentPwFirstName')),
			newPw: yup.string().min(8, t('warning.minNewPw')).required(t('warning.inputNewPw')), // validate new password
			confirmPw: yup.string().required(t('warning.inputConfirmPw')),
		}),
		// validateOnChange:true,
		onSubmit: (values: ResetPwFormValues) => {
			console.log(values)
		},
	})

	const lineNotiButtonElement = (
		<Button
			className='text-nowrap rounded-[5px] !bg-[#FBBF07] !px-[12px] !py-[5px] text-sm !font-normal !shadow-none'
			variant='contained'
		>
			การแจ้งเตือนผ่านไลน์
		</Button>
	)

	const changePasswordButtonElement = (
		<Button
			className='text-nowrap rounded-[5px] !border-[#D8D8D8] !px-[31px] !py-[8px] text-sm !shadow-none'
			variant='outlined'
			onClick={() => {
				setOpenResetPw(true)
			}}
		>
			เปลี่ยนรหัสผ่าน
		</Button>
	)

	return (
		<Box className='relative flex h-full flex-col items-center'>
			<div className='h-[80px] min-h-[80px] w-full bg-primary'></div>
			<ProfileForm
				title='ข้อมูลผู้ใช้งาน'
				formik={formik}
				// loading={false}
				lineNotiButtonElement={lineNotiButtonElement}
				changePasswordButtonElement={changePasswordButtonElement}
				className='relative top-[-60px] h-max lg:max-w-[80%]'
			/>
			<div className='mt-[-36px] flex flex-col justify-between pb-[20px] max-lg:w-full max-lg:gap-[16px] max-lg:px-[16px] lg:w-[80%] lg:flex-row'>
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

			<Dialog
				open={openResetPw}
				onClose={(_event, reason) => {
					if (reason !== 'backdropClick') {
						setOpenResetPw(false)
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
							setOpenResetPw(false)
						}}
					>
						<CloseIcon fontSize='small' className='!text-white' />
					</IconButton>
				</DialogTitle>
				<DialogContent className='flex h-full w-auto flex-col items-center gap-[12px] rounded-[15px] text-white'>
					<FormInput
						className='lg:!min-w-[250px] lg:!max-w-[250px]'
						name='currentPw'
						formik={resetPwFormik}
						required
						// disabled={false}
						placeholder={t('ระบุรหัสผ่านปัจจุบัน')}
						inputProps={{ maxLength: 100 }}
						type='password'
					/>
					<FormInput
						className='lg:!min-w-[250px] lg:!max-w-[250px]'
						name='newPw'
						formik={resetPwFormik}
						required
						// disabled={false}
						placeholder={t('ระบุรหัสผ่านใหม่')}
						inputProps={{ maxLength: 100 }}
						type='password'
					/>
					<FormInput
						className='lg:!min-w-[250px] lg:!max-w-[250px]'
						name='confirmPw'
						formik={resetPwFormik}
						required
						// disabled={false}
						placeholder={t('ระบุรหัสผ่านใหม่อีกครั้ง')}
						inputProps={{ maxLength: 100 }}
						type='password'
					/>
					<div className='grid grid-cols-[12px_1fr] gap-x-[9px] gap-y-[4px] pt-[6px] lg:!min-w-[250px] lg:!max-w-[250px] [&_.MuiTypography-root]:!text-xs'>
						<div className='content-center'>
							<MapLayerIcon fill='white' />
						</div>
						<Typography className='content-center'>ควรมีความยาวอย่างน้อย 8 ตัวอักษรขึ้นไป</Typography>
						<div className='content-center'>
							<MapLayerIcon fill='white' />
						</div>
						<Typography className='content-center'>มีตัวอักษรพิมพ์ใหญ่ (A-Z) อย่างน้อย 1 ตัว</Typography>
						<div className='content-center'>
							<MapLayerIcon fill='white' />
						</div>
						<Typography className='content-center'>มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว</Typography>
						<div className='content-center'>
							<MapLayerIcon fill='white' />
						</div>
						<Typography className='content-center'>มีตัวเลข (0-9) อย่างน้อย 1 ตัว</Typography>
						<div className='content-center'>
							<MapLayerIcon fill='white' />
						</div>
						<Typography className='content-center'>
							มีเครื่องหมายหรืออักขระพิเศษ (!@#$%^&*/) อย่างน้อย 1 ตัว
						</Typography>
					</div>
					<Button
						className='!mt-[12px] text-nowrap rounded-[5px] !border-none !px-[30px] !py-[10px] text-sm !text-white !shadow-none'
						variant='contained'
						color='secondary'
						onClick={() => {
							resetPwFormik.submitForm()
						}}
					>
						ตั้งรหัสผ่านใหม่
					</Button>
				</DialogContent>
			</Dialog>
		</Box>
	)
}
