import ProfileForm from '@/components/shared/ProfileForm'
import { AppPath } from '@/config/app.config'
import { Box, Button, Typography } from '@mui/material'
import { signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import React, { useCallback } from 'react'
import * as yup from 'yup'
import { useFormik } from 'formik'

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

export const ProfileMain: React.FC<ProfileMainProps> = ({ className = '' }) => {
	const router = useRouter()
	const { t } = useTranslation('common')

	const logout = useCallback(() => signOut({ callbackUrl: AppPath.Overview }), [])

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
		username: yup.string().required(t('warning.inputUserName')),
		firstName: yup.string().required(t('warning.inputFirstName')),
		lastName: yup.string().required(t('warning.inputLastName')),
		email: yup.string().email(t('warning.invalidEmailFormat')).required(t('warning.inputEmail')),
		responsibleProvinceCode: yup.string().required(t('warning.inputProvince')),
		orgCode: yup.string().required(t('warning.inputOrgCode')),
		posistion: yup.string().required(t('warning.inputRole')),
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

	return (
		<Box className='flex h-full flex-col justify-between gap-6 p-6'>
			<ProfileForm title='หัวข้อ' formik={formik} loading={false} />
		</Box>
	)
}
