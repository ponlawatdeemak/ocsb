import { mdiAccountOutline, mdiDeleteOutline } from '@mdi/js'
import Icon from '@mdi/react'
import { Avatar } from '@mui/material'
import { FormikProps } from 'formik'
import React, { ChangeEvent, useEffect, useState } from 'react'
// import { PictureIcon } from '@/components/svg/MenuIcon'

export interface UploadImageProps {
	name: string
	formik: FormikProps<any>
	className?: string
	defaultImage?: string
	disabled?: boolean
	[key: string]: unknown
}

const UploadImage: React.FC<UploadImageProps> = ({
	formik,
	name,
	className,
	defaultImage = mdiAccountOutline,
	disabled = false,
	...props
}) => {
	const maxImageSize = 3 * 1024 * 1024
	const [image, setImage] = useState<string | null>(null)
	const { i18n, tReady, ...uploadProps } = props
	// const [showInvalidFile, setShowInvalidFile] = useState(false)

	useEffect(() => {
		const formikValue = formik.values[name]
		if (formikValue instanceof File) {
			setImage(URL.createObjectURL(formikValue))
		} else if (typeof formikValue === 'string') {
			setImage(formikValue)
		} else {
			setImage(null)
		}
	}, [formik.values, name])

	const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
		const selectedImage = event.target.files?.[0]
		if (selectedImage) {
			const imageType = selectedImage.type
			const imageSize = selectedImage.size
			const validImageTypes = ['image/png', 'image/jpeg']

			if (validImageTypes.includes(imageType) && imageSize <= maxImageSize) {
				formik.setFieldValue(name, selectedImage)
				setImage(URL.createObjectURL(selectedImage))
				// setShowInvalidFile(false)
			} else {
				formik.setFieldValue(name, null)
				setImage(null)
				// setShowInvalidFile(true)
			}
		} else {
			formik.setFieldValue(name, null)
			setImage(null)
		}
	}

	const handleImageError = () => {
		setImage(null)
	}

	const handleDeleteClick = () => {
		formik.setFieldValue(name, '')
		setImage(null)
	}

	return (
		<div className={className}>
			{image ? (
				<Avatar
					src={image}
					alt='Profile Image'
					className='bg-success-light h-[120px] w-[120px]'
					onError={handleImageError}
				/>
			) : (
				<Avatar className='relative h-[120px] w-[120px] !bg-[#CCCCCC]'>
					<Icon path={defaultImage} size={'100px'} className='text-white' />
					<input
						type='file'
						accept='image/png, image/jpeg'
						className='absolute h-full w-full cursor-pointer rounded-full bg-black text-black opacity-0 hover:opacity-70 [&::file-selector-button]:hidden'
						onChange={handleImageChange}
						{...uploadProps}
					/>
				</Avatar>
			)}

			{image && (
				<div className='absolute box-border flex h-[153px] w-[153px] items-center justify-center rounded-full bg-black opacity-0 transition hover:opacity-70'>
					<button onClick={handleDeleteClick}>
						<Icon path={mdiDeleteOutline} size={1} className='!color-[#2F7A59] cursor-pointer text-white' />
					</button>
				</div>
			)}
		</div>
	)
}

export default UploadImage
