import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	SelectChangeEvent,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { AreaUnitKey, Languages, QuantityUnitKey } from '@/enum'
import CloseIcon from '@mui/icons-material/Close'
import { useCallback, useMemo, useState } from 'react'
import FilterSelect, { FilterSelectOptionType } from '../common/select/FilterSelect'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { CurrentSettingType } from './AppBar'

interface SettingDialogProps {
	open: boolean
	currentSetting: CurrentSettingType
	setCurrentSetting: React.Dispatch<React.SetStateAction<CurrentSettingType>>
	onClose: () => void
}

const SettingDialog: React.FC<SettingDialogProps> = ({ open, currentSetting, setCurrentSetting, onClose }) => {
	const router = useRouter()
	const { setAreaUnit } = useAreaUnit()
	const { setQuantityUnit } = useQuantityUnit()
	const { t, i18n } = useTranslation('common')

	const [busy, setBusy] = useState<boolean>(false)

	const areaUnitOptions: FilterSelectOptionType[] = useMemo(
		() => [
			{ id: AreaUnitKey.Sqm, name: t(`${AreaUnitKey.Sqm}`) },
			{ id: AreaUnitKey.Sqkm, name: t(`${AreaUnitKey.Sqkm}`) },
			{ id: AreaUnitKey.Rai, name: t(`${AreaUnitKey.Rai}`) },
			{ id: AreaUnitKey.Hexa, name: t(`${AreaUnitKey.Hexa}`) },
		],
		[t],
	)

	const quantityUnitOptions: FilterSelectOptionType[] = useMemo(
		() => [
			{ id: QuantityUnitKey.Ton, name: t(`${QuantityUnitKey.Ton}`) },
			{ id: QuantityUnitKey.Kilogram, name: t(`${QuantityUnitKey.Kilogram}`) },
		],
		[t],
	)

	const handleAreaUnitChange = useCallback(
		(event: SelectChangeEvent) => {
			setCurrentSetting((prevSetting) => ({
				...prevSetting,
				areaUnit: event.target.value as AreaUnitKey,
			}))
		},
		[setCurrentSetting],
	)

	const handleQuantityUnitChange = useCallback(
		(event: SelectChangeEvent) => {
			setCurrentSetting((prevSetting) => ({
				...prevSetting,
				quantityUnit: event.target.value as QuantityUnitKey,
			}))
		},
		[setCurrentSetting],
	)

	const handleToggleLanguage = useCallback(
		(_event: React.MouseEvent<HTMLElement>, language: Languages) => {
			if (language) {
				setCurrentSetting((prevSetting) => ({
					...prevSetting,
					language: language,
				}))
			}
		},
		[setCurrentSetting],
	)

	const onSettingsSubmit = useCallback(() => {
		try {
			setBusy(true)
			setAreaUnit(currentSetting.areaUnit)
			setQuantityUnit(currentSetting.quantityUnit)
			i18n.changeLanguage(currentSetting.language)
			router.push(
				{
					pathname: router.pathname,
					query: router.query,
				},
				router.asPath,
				{ locale: currentSetting.language },
			)
		} catch (error) {
			console.error(error)
		} finally {
			setBusy(false)
			onClose()
		}
	}, [setAreaUnit, setQuantityUnit, currentSetting, i18n, router, onClose])

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason !== 'backdropClick') {
					onClose()
				}
			}}
			PaperProps={{
				className: '!m-4 w-[500px] h-[500px] !rounded-[15px] !bg-primary',
			}}
		>
			<DialogTitle className='flex items-center !py-6'>
				<Typography className='flex-1 !text-md text-white'>{t('menu.setting')}</Typography>
				<IconButton aria-label='close' onClick={onClose}>
					<CloseIcon className='text-white' />
				</IconButton>
			</DialogTitle>
			<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !p-10'>
				<Box className='flex w-full flex-col gap-4 sm:gap-6'>
					<Box className='flex items-start justify-between max-sm:flex-col max-sm:gap-3 sm:items-center'>
						<Typography className='!text-sm !font-light text-black'>{t('areaUnit')}</Typography>
						<FilterSelect
							className='w-full sm:w-[276px]'
							fullWidth={false}
							id='unitArea'
							value={currentSetting.areaUnit}
							data={areaUnitOptions}
							onChange={handleAreaUnitChange}
							disabled={busy}
							required
						/>
					</Box>
					<Box className='flex items-start justify-between max-sm:flex-col max-sm:gap-3 sm:items-center'>
						<Typography className='!text-sm !font-light text-black'>{t('quantityUnit')}</Typography>
						<FilterSelect
							className='w-full sm:w-[276px]'
							fullWidth={false}
							id='unitQuantity'
							value={currentSetting.quantityUnit}
							data={quantityUnitOptions}
							onChange={handleQuantityUnitChange}
							disabled={busy}
							required
						/>
					</Box>
					<Box className='flex items-start justify-between max-sm:flex-col max-sm:gap-3 sm:items-center'>
						<Typography className='!text-sm !font-light text-black'>{t('languages')}</Typography>
						<Box className='flex w-full items-center sm:w-[276px]'>
							<ToggleButtonGroup
								size='small'
								exclusive
								color='primary'
								className='flex h-[38px] w-[200px] !rounded-[5px] bg-[#E6E6E6] sm:w-[132px] [&_.Mui-selected>div]:text-white [&_.Mui-selected]:!bg-secondary'
								value={currentSetting.language}
								onChange={handleToggleLanguage}
								disabled={busy}
							>
								<ToggleButton
									className='!m-0 flex h-full w-full !rounded-[5px] !border-0 !px-0 !py-2'
									value={Languages.TH}
								>
									<Box className='text-sm font-normal normal-case text-black'>{t('languagesTh')}</Box>
								</ToggleButton>
								<ToggleButton
									className='!m-0 flex h-full w-full !rounded-[5px] !border-0 !px-0 !py-2'
									value={Languages.EN}
								>
									<Box className='text-sm font-normal normal-case text-black'>{t('languagesEn')}</Box>
								</ToggleButton>
							</ToggleButtonGroup>
						</Box>
					</Box>
				</Box>
				<Box className='flex justify-end gap-3'>
					<Button
						variant='contained'
						className='w-full !rounded-[5px] !bg-[#E6E6E6] !py-2.5 !shadow-none sm:w-[105px]'
						onClick={onClose}
						disabled={busy}
					>
						<Typography className='!text-xs text-black'>{t('back')}</Typography>
					</Button>
					<Button
						variant='contained'
						className='w-full !rounded-[5px] !bg-secondary !py-2.5 !shadow-none sm:w-[105px]'
						onClick={onSettingsSubmit}
						disabled={busy}
					>
						<Typography className='!text-xs text-white'>{t('save')}</Typography>
					</Button>
				</Box>
			</DialogContent>
		</Dialog>
	)
}

export default SettingDialog
