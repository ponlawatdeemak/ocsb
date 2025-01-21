import React, { useCallback } from 'react'
import FormInput, { FormInputProps } from './FormInput'
import { IconButton, InputAdornment } from '@mui/material'
import Icon from '@mdi/react'
import { mdiEyeOffOutline, mdiEyeOutline } from '@mdi/js'

interface PasswordInputProps extends FormInputProps {}

const PasswordInput: React.FC<PasswordInputProps> = ({
	formik,
	label,
	name,
	disabled,
	className,
	value,
	placeholder,
}) => {
	const [showPassword, setShowPassword] = React.useState(false)

	const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), [])

	const handleMouseDownPassword = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
		event.preventDefault()
	}, [])

	return (
		<FormInput
			name={name}
			label={label}
			formik={formik}
			className={className}
			type={showPassword ? 'text' : 'password'}
			disabled={disabled}
			endAdornment={
				<InputAdornment position='end'>
					<IconButton
						aria-label='toggle password visibility'
						onClick={handleClickShowPassword}
						onMouseDown={handleMouseDownPassword}
						edge='end'
					>
						{showPassword ? (
							<Icon path={mdiEyeOffOutline} size={1} />
						) : (
							<Icon path={mdiEyeOutline} size={1} />
						)}
					</IconButton>
				</InputAdornment>
			}
			inputProps={{ maxLength: 100 }}
			value={value}
			placeholder={placeholder}
		/>
	)
}

export default PasswordInput
