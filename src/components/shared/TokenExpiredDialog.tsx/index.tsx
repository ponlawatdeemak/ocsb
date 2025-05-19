import {
	Box,
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Typography,
} from '@mui/material'
import { signOut } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import React, { useCallback } from 'react'

interface TokenExpiredDialogProps {}

const TokenExpiredDialog: React.FC<TokenExpiredDialogProps> = () => {
	const onClose = useCallback(() => signOut(), [])
	const { t } = useTranslation(['auth', 'common'])

	return (
		<Dialog
			open={true}
			PaperProps={{
				className: 'w-[400px] !rounded-[15px] !bg-primary',
			}}
		>
			<DialogTitle className='flex h-[60px] items-center !py-5'>
				<Typography className='flex-1 !text-md !leading-5 text-white'>{t('tokenExpire')}</Typography>
			</DialogTitle>
			<Box className='rounded-[15px] bg-white'>
				<DialogContent className='flex h-full w-full rounded-[15px]'>
					<DialogContentText className='!text-black'>{t('loginAgain')}</DialogContentText>
				</DialogContent>
				<DialogActions className='!px-6 !py-5'>
					<Button className='!rounded-[5px] !normal-case !text-white' variant='contained' onClick={onClose}>
						{t('common:submit')}
					</Button>
				</DialogActions>
			</Box>
		</Dialog>
	)
}

export default TokenExpiredDialog
