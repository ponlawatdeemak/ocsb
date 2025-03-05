import { Close } from '@mui/icons-material'
import { Box, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'

interface PrintMapDialogProps {
	className?: string
	open: boolean
	burntMapImage: string
	burntMiniMapImage: string
	loading: boolean
	onClose: () => void
}

const PrintMapDialog: React.FC<PrintMapDialogProps> = ({
	className = '',
	open,
	burntMapImage,
	burntMiniMapImage,
	loading = false,
	onClose,
}) => {
	const { t } = useTranslation(['map-analyze', 'common'])

	return (
		<Dialog
			className={classNames('', className)}
			open={open}
			onClose={(_event, reason) => {
				if (reason !== 'backdropClick') {
					onClose()
				}
			}}
			PaperProps={{
				className: 'w-[1025px] !max-w-none h-[627px] !rounded-[15px] !bg-primary',
			}}
		>
			<DialogTitle className='flex h-[60px] items-center !py-5'>
				<Typography className='flex-1 !text-md !leading-5 text-white'>
					{'แผนที่แสดงข้อมูลจุดความร้อน'}
				</Typography>
				<IconButton aria-label='close' onClick={onClose}>
					<Close className='text-white' />
				</IconButton>
			</DialogTitle>
			<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !py-4'>
				{loading ? (
					<div className='flex h-full w-full items-center justify-center'>
						<CircularProgress />
					</div>
				) : (
					<Box className='flex h-full w-full items-center gap-6'>
						<Box className='h-full flex-1'>
							<Box className='aspect-[738/473]'>
								<Box
									className='h-full w-full'
									component='img'
									src={burntMapImage}
									alt='Burnt Map Image'
								/>
							</Box>
						</Box>
						<Box className='flex h-full w-[22%] flex-col items-center'>
							<Box className='aspect-[215/287]'>
								<Box
									className='h-full w-full'
									component='img'
									src={burntMiniMapImage}
									alt='Burnt Mini Map Image'
								/>
							</Box>
							<Box className='w-full flex-1 bg-[#E6E6E6]'></Box>
						</Box>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default PrintMapDialog
