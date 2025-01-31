'use client'
import { useCallback, useState } from 'react'
import { GetSearchUMDtoIn } from '@/api/um/dto-in.dto'
import { SortType } from '@/enum'
import useResponsive from '@/hook/responsive'
import { useTranslation } from 'next-i18next'
import { useFormik } from 'formik'
import * as yup from 'yup'
import ProfileForm from '@/components/shared/ProfileForm'

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

export const UserManagementMain = () => {
	const { t, i18n } = useTranslation(['common', 'um'])
	const [searchParams, setSearchParams] = useState<GetSearchUMDtoIn>({
		keyword: '',
		firstName: '',
		sortField: 'firstName',
		sortOrder: SortType.ASC,
		limit: 10,
		offset: 0,
		respLang: i18n.language,
	})
	const [isSearch, setIsSearch] = useState<boolean>(false)
	const [page, setPage] = useState<number>(1)
	const { isDesktop } = useResponsive()

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
		<div className='flex h-[600px] w-full p-4'>
			<ProfileForm title='หัวข้อ' formik={formik} loading={false} />
		</div>
	)
}
