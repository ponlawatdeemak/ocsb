import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	IconButton,
	Typography,
} from '@mui/material'
import React, { memo } from 'react'
import { useTranslation } from 'next-i18next'

import CloseIcon from '@mui/icons-material/Close'
import { DeleteIcon } from '@/components/svg/AppIcon'

export interface FormImportProps {
	open: boolean
	onCancel?: () => void
	onSubmit?: () => void
	loading?: boolean
	disabled?: boolean
	name?: string
}

const DialogDelete: React.FC<FormImportProps> = ({ ...props }) => {
	const { t } = useTranslation(['common', 'um'])

	const { loading, open, onCancel, onSubmit, disabled, name } = props

	return (
		<div className='flex flex-col'>
			<Dialog
				open={open}
				fullWidth
				keepMounted={false}
				scroll='paper'
				className='[&_.MuiPaper-root]:h-[300px] [&_.MuiPaper-root]:max-w-[430px] [&_.MuiPaper-root]:rounded-2xl'
			>
				<DialogContent
					dividers={true}
					className='-mb-3 -mt-3 flex h-full flex-col items-center justify-between overflow-x-hidden bg-white max-lg:gap-3'
					sx={{
						boxShadow: '0px 3px 6px 0px #00000040',
						borderRadius: '15px',
						position: 'relative',
						zIndex: 10,
					}}
				>
					<Box className='flex h-full w-full flex-col'>
						<Box className='flex justify-end'>
							<IconButton onClick={onCancel} className='mr-2 p-2' disabled={disabled || loading}>
								<CloseIcon />
							</IconButton>
						</Box>
						<Box className='flex flex-1 flex-col items-center justify-center gap-6'>
							<Box>
								<DeleteIcon />
							</Box>
							<Box>
								<Box>{t('common:deleteMsg')}</Box>
								<Box className='text-center'>
									{name && <Typography fontWeight='bold'>{name}</Typography>}{' '}
								</Box>
							</Box>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions className={'flex justify-end bg-[#E6E6E6]'}>
					<div className={'flex h-[60px] w-full justify-between space-x-2 pt-3'}>
						<Button
							variant='text'
							sx={{ width: '50%', '&:hover': { bgcolor: 'initial' }, color: 'black' }}
							onClick={onCancel}
							disabled={disabled || loading}
						>
							{t('back')}
						</Button>
						<Divider orientation='vertical' className='h-full' />
						<Button
							variant='text'
							sx={{ width: '50%', '&:hover': { bgcolor: 'initial' }, color: '#FF0000' }}
							onClick={onSubmit}
							disabled={disabled || loading}
							startIcon={
								loading && (
									<CircularProgress
										className='[&_.MuiCircularProgress-circle]:text-white'
										size={16}
									/>
								)
							}
						>
							{t('common:delete')}
						</Button>
					</div>
				</DialogActions>
			</Dialog>
		</div>
	)
}

export default memo(DialogDelete)
