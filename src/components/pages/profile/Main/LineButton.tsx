import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material'
import { FC, memo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CloseIcon from '@mui/icons-material/Close'

const LineButton: FC = () => {
	const { t } = useTranslation(['common', 'auth', 'um'])
	const [open, setOpen] = useState(false)

	const handleCloseImport = (event: any, reason: string) => {
		if (reason === 'backdropClick') {
			return
		}
		setOpen(false)
	}

	return (
		<>
			<Button
				className='text-nowrap rounded-[5px] !bg-[#FBBF07] !px-[12px] !py-[5px] text-sm !font-normal !shadow-none'
				variant='contained'
				onClick={() => setOpen(true)}
			>
				{t('um:button.lineNoti')}
			</Button>
			<Dialog
				open={open}
				onClose={handleCloseImport}
				fullWidth
				keepMounted={false}
				scroll='paper'
				className='[&_.MuiPaper-root]:h-[460px] [&_.MuiPaper-root]:max-w-[600px] [&_.MuiPaper-root]:rounded-2xl'
			>
				<Box className='flex flex-row items-center justify-between bg-[#003491] pb-3'>
					<DialogTitle className='text-lg text-white'>{t('um:titleLine')}</DialogTitle>
					<IconButton onClick={(event) => handleCloseImport(event, 'cancelClick')} className='mr-2 p-2'>
						<CloseIcon className='text-white' />
					</IconButton>
				</Box>
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
					<Box className='h-full w-full'>
						<Box className='flex h-full w-full items-center justify-center rounded-xl p-8'>
							<Avatar
								src={
									process.env.LINE_QR_URL ||
									'https://qr-official.line.me/gs/M_466tvguq_BW.png?oat_content=qr'
								}
								alt='line_oa qrcode'
								sx={{ width: 300, height: 300 }}
								variant='square'
							/>
						</Box>
					</Box>
				</DialogContent>
				<DialogActions className={'bg-[#E6E6E6]'}>
					<Box className={'flex h-[60px] w-full justify-center space-x-2 pt-3'}>
						<Button
							variant='text'
							sx={{ '&:hover': { bgcolor: 'initial' }, color: 'black' }}
							onClick={(event) => {
								handleCloseImport(event, 'cancelClick')
							}}
						>
							{t('back')}
						</Button>
					</Box>
				</DialogActions>
			</Dialog>
		</>
	)
}

export default memo(LineButton)
