import { Box, Button, Dialog, DialogContent, DialogTitle, IconButton, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { AreaUnit, Languages } from '@/enum'
import useAreaUnit from '@/store/area-unit'
import SettingsIcon from '@mui/icons-material/Settings'
import CloseIcon from '@mui/icons-material/Close'

interface SettingDialogProps {
	open: boolean
	onClose: () => void
}

const SettingDialog: React.FC<SettingDialogProps> = ({ ...props }) => {
	const { open, onClose } = props
	const router = useRouter()
	const { t, i18n } = useTranslation('common')
	const { areaUnit, setAreaUnit } = useAreaUnit()

	const handleUnitChange = (unit: AreaUnit) => {
		if (unit !== null) setAreaUnit(unit)
	}

	const handleLangChange = (locale: Languages) => {
		if (locale) {
			i18n.changeLanguage(locale)
			router.push(
				{
					pathname: router.pathname,
					query: router.query,
				},
				router.asPath,
				{ locale },
			)
		}
	}

	return (
		<Dialog
			open={open}
			onClose={(event, reason) => {
				if (reason !== 'backdropClick') {
					onClose()
				}
			}}
		>
			<DialogTitle className='flex items-center'>
				<SettingsIcon color='primary' />
				<Typography className='!ml-1 flex-1 !text-lg !font-semibold' color='primary'>
					{t('menuSetting')}
				</Typography>
				<IconButton aria-label='close' onClick={onClose}>
					<CloseIcon />
				</IconButton>
			</DialogTitle>
			<DialogContent>
				<Typography className='!mb-2 !font-semibold'>{t('unitArea')}</Typography>
				<Box>
					<Button
						onClick={() => handleUnitChange(AreaUnit.Rai)}
						variant={areaUnit === AreaUnit.Rai ? 'contained' : 'outlined'}
						size='small'
					>
						{t('unitRai')}
					</Button>
					<Button
						className='!ml-2'
						onClick={() => handleUnitChange(AreaUnit.Sqkm)}
						variant={areaUnit === AreaUnit.Sqkm ? 'contained' : 'outlined'}
						size='small'
					>
						{t('unitSqkm')}
					</Button>
					<Button
						className='!ml-2'
						onClick={() => handleUnitChange(AreaUnit.Hectare)}
						variant={areaUnit === AreaUnit.Hectare ? 'contained' : 'outlined'}
						size='small'
					>
						{t('unitHectare')}
					</Button>
				</Box>
				<Typography className='!mb-2 !mt-4 !font-semibold'>{t('languages')}</Typography>
				<Box>
					<Button
						onClick={() => handleLangChange(Languages.TH)}
						variant={i18n.language === Languages.TH ? 'contained' : 'outlined'}
						size='small'
					>
						{t('languagesTh')}
					</Button>
					<Button
						className='!ml-2'
						onClick={() => handleLangChange(Languages.EN)}
						variant={i18n.language === Languages.EN ? 'contained' : 'outlined'}
						size='small'
					>
						{t('languagesEn')}
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	)
}

export default SettingDialog
