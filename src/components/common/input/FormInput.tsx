import { FormControl, FormHelperText, FormLabel, OutlinedInput, OutlinedInputProps } from '@mui/material'
import classNames from 'classnames'
import { FormikProps } from 'formik'
import React from 'react'

export interface FormInputProps extends OutlinedInputProps {
	name: string
	formik?: FormikProps<any>
}

const FormInput: React.FC<FormInputProps> = ({ formik, name, label, className, fullWidth = true, value, ...props }) => {
	const errorMessage = formik?.touched[name] && formik?.errors[name]
	return (
		<FormControl
			fullWidth={fullWidth}
			className={classNames('[&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white', className)}
		>
			{label && (
				<FormLabel id={`${name}-label`} className='mb-2 [&_.MuiFormLabel-asterisk]:text-error'>
					{label}
				</FormLabel>
			)}
			<OutlinedInput
				{...props}
				id={`${name}-input`}
				className='[&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
				name={name}
				size='small'
				value={formik?.values[name] || value}
				onChange={formik?.handleChange}
				error={formik?.touched[name] && Boolean(formik?.errors[name])}
			/>
			{typeof errorMessage === 'string' && <FormHelperText error>{errorMessage}</FormHelperText>}
		</FormControl>
	)
}

export default FormInput
