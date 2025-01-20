import { Box, Button, ButtonProps, CircularProgress } from '@mui/material'
import classNames from 'classnames'
import React from 'react'

interface ActionButtonProps extends Omit<ButtonProps, 'color' | 'startIcon' | 'disabled'> {
	className?: string
	fullWidth?: boolean
	title: string
	disabled?: boolean
	loading?: boolean
	isOutlinedButton?: boolean
}

const ActionButton: React.FC<ActionButtonProps> = ({
	className = '',
	fullWidth = false,
	title,
	disabled = false,
	loading = false,
	isOutlinedButton = false,
	...props
}) => {
	return (
		<Button
			className={classNames(
				'h-10 rounded-full border border-solid px-5 py-2 shadow-none hover:shadow-none',
				{
					'w-full': fullWidth,
					'border-white hover:border-white': !isOutlinedButton,
					'border-gray bg-white hover:border-gray hover:bg-white [&_.MuiBox-root]:text-black [&_.MuiButton-startIcon_.MuiCircularProgress-circle]:text-black':
						isOutlinedButton,
					'opacity-30': disabled || loading,
					'!border-black': isOutlinedButton && (disabled || loading),
				},
				className,
			)}
			variant={isOutlinedButton ? 'outlined' : 'contained'}
			startIcon={loading && <CircularProgress className='[&_.MuiCircularProgress-circle]:text-white' size={16} />}
			disabled={disabled || loading}
			{...props}
		>
			<Box className='whitespace-nowrap text-sm font-semibold normal-case text-white sm:text-base'>{title}</Box>
		</Button>
	)
}

export default ActionButton
