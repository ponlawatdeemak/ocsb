import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material'
import React from 'react'
import { useTranslation } from 'next-i18next'
import classNames from 'classnames'
import ActionButton from '../button/ActionButton'
import { Close } from '@mui/icons-material'

export enum DialogMode {
	Confirm = 'DialogConfirm',
	Alert = 'DialogAlert',
}

export interface AlertDialogProps {
	open: boolean
	title: string
	content: string
	subContent?: string
	hideClose?: boolean
	className?: string
	mode?: DialogMode
	confirmTitle?: string
	cancelTitle?: string
	loading?: boolean
	isDisableBackdropClick?: boolean
	onClose: () => void
	onConfirm: () => void
}

const AlertDialog: React.FC<AlertDialogProps> = ({
	open = false,
	title,
	content,
	subContent,
	hideClose = false,
	className,
	mode = DialogMode.Confirm,
	confirmTitle,
	cancelTitle,
	loading = false,
	isDisableBackdropClick = false,
	onClose,
	onConfirm,
}) => {
	const { t } = useTranslation(['common'])

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (!isDisableBackdropClick) return onClose()

				if (reason !== 'backdropClick') {
					return onClose()
				}
			}}
			PaperProps={{
				className: 'w-[438px] rounded-lg [&_.MuiDialogContent-root]:p-4',
			}}
			className={classNames('', className)}
		>
			<DialogTitle className='flex items-center justify-between border-0'>
				<Typography className='text-base font-semibold leading-5 text-black'>{title}</Typography>
				{!hideClose && (
					<IconButton className='p-0' onClick={onClose}>
						<Close />
					</IconButton>
				)}
			</DialogTitle>
			<DialogContent className='flex flex-col gap-6 border-b-[0.5px] border-solid border-gray !px-[24px]'>
				<DialogContentText className='text-base text-black'>{content}</DialogContentText>
				{subContent && <DialogContentText className='text-sm text-black'>{subContent}</DialogContentText>}
			</DialogContent>
			{mode === DialogMode.Confirm ? (
				<DialogActions className='flex items-center gap-3 p-4 [&_.MuiButtonBase-root]:m-0'>
					<ActionButton
						title={cancelTitle ?? t('common:cancel')}
						onClick={onClose}
						loading={loading}
						isOutlinedButton
					/>
					<ActionButton title={confirmTitle ?? t('common:confirm')} onClick={onConfirm} loading={loading} />
				</DialogActions>
			) : (
				<DialogActions className='p-4'>
					<ActionButton title={confirmTitle ?? t('common:close')} onClick={onConfirm} loading={loading} />
				</DialogActions>
			)}
		</Dialog>
	)
}

export default AlertDialog
