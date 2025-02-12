'use client'

import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material'
import React from 'react'
import { mdiClose } from '@mdi/js'
import Icon from '@mdi/react'
import { useTranslation } from 'react-i18next'

export interface AlertConfirmProps {
	open: boolean
	title: string
	content: string
	subContent?: string
	hideClose?: boolean
	className?: string
	mode?: string
	confirmTitle?: string
	cancelTitle?: string
	onClose: () => void
	onConfirm: () => void
}

const AlertConfirm: React.FC<AlertConfirmProps> = ({
	open = false,
	title,
	content,
	subContent,
	hideClose = false,
	className,
	mode = 'DialogConfirm',
	confirmTitle,
	cancelTitle,
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation(['default'])

	return (
		<Dialog
			open={open}
			onClose={(event, reason) => {
				if (reason !== 'backdropClick') {
					onClose()
				}
			}}
			className='[&_.MuiDialog-paper]:m-4 [&_.MuiDialog-paper]:w-[560px]'
		>
			<DialogTitle className='flex items-center justify-between p-[8px] pl-[24px] max-sm:pl-4'>
				<Typography className='text-md font-semibold'>{title}</Typography>
				{!hideClose && (
					<IconButton aria-label='close' onClick={onClose}>
						<Icon path={mdiClose} size={'24px'} />
					</IconButton>
				)}
			</DialogTitle>
			<DialogContent className='flex flex-col gap-[24px] py-[16px] max-sm:px-4'>
				<DialogContentText className='text-base text-black'>{content}</DialogContentText>
				{subContent && <DialogContentText>{subContent}</DialogContentText>}
			</DialogContent>
			{mode === 'DialogConfirm' ? (
				<DialogActions className='border-[0px] border-t-[1px] border-solid border-transparent border-t-gray p-[24px] pt-[15px] max-sm:pb-4'>
					<Button
						onClick={onClose}
						variant='outlined'
						size='large'
						className='h-[40px] border-gray px-[15px] text-base font-semibold text-black'
					>
						{cancelTitle || t('cancel')}
					</Button>
					<Button
						onClick={onConfirm}
						variant='contained'
						size='large'
						className='h-[40px] px-[16px] text-base font-semibold'
					>
						{confirmTitle || t('confirm')}
					</Button>
				</DialogActions>
			) : (
				<DialogActions className='border-[0px] border-t-[1px] border-solid border-transparent border-t-gray p-[24px] pt-[15px] max-sm:pb-4'>
					<Button
						onClick={onConfirm}
						variant='contained'
						size='large'
						className='h-[40px] bg-error px-[16px] text-base font-semibold'
					>
						{confirmTitle || t('close')}
					</Button>
				</DialogActions>
			)}
		</Dialog>
	)
}

export default AlertConfirm
