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

interface SettingDialogProps {
	open: boolean
	selectedAreaUnit: AreaUnitKey
	selectedQuantityUnit: QuantityUnitKey
	currentLanguage: 'th' | 'en'
	setSelectedAreaUnit: React.Dispatch<React.SetStateAction<AreaUnitKey>>
	setSelectedQuantityUnit: React.Dispatch<React.SetStateAction<QuantityUnitKey>>
	setCurrentLanguage: React.Dispatch<React.SetStateAction<'th' | 'en'>>
	onClose: () => void
}

const SettingDialog: React.FC<SettingDialogProps> = ({
	open,
	selectedAreaUnit,
	selectedQuantityUnit,
	currentLanguage,
	setSelectedAreaUnit,
	setSelectedQuantityUnit,
	setCurrentLanguage,
	onClose,
}) => {
	const router = useRouter()
	const { setAreaUnit } = useAreaUnit()
	const { setQuantityUnit } = useQuantityUnit()
	const { t, i18n } = useTranslation('common')

	const [busy, setBusy] = useState<boolean>(false)

	const areaUnitOptions: FilterSelectOptionType[] = useMemo(
		() => [
			{ id: AreaUnitKey.Rai, name: t(`${AreaUnitKey.Rai}`) },
			{ id: AreaUnitKey.LandPlot, name: t(`${AreaUnitKey.LandPlot}`) },
		],
		[t],
	)

	const quantityUnitOptions: FilterSelectOptionType[] = useMemo(
		() => [
			{ id: QuantityUnitKey.Ton, name: t(`${QuantityUnitKey.Ton}`) },
			{ id: QuantityUnitKey.Kilogram, name: t(`${QuantityUnitKey.Kilogram}`) },
			{ id: QuantityUnitKey.Gram, name: t(`${QuantityUnitKey.Gram}`) },
		],
		[t],
	)

	const handleAreaUnitChange = useCallback(
		(event: SelectChangeEvent) => {
			setSelectedAreaUnit(event.target.value as AreaUnitKey)
		},
		[setSelectedAreaUnit],
	)

	const handleQuantityUnitChange = useCallback(
		(event: SelectChangeEvent) => {
			setSelectedQuantityUnit(event.target.value as QuantityUnitKey)
		},
		[setSelectedQuantityUnit],
	)

	const handleToggleLanguage = useCallback(
		(_event: React.MouseEvent<HTMLElement>, language: Languages) => {
			if (language) {
				setCurrentLanguage(language)
			}
		},
		[setCurrentLanguage],
	)

	const onSettingsSubmit = useCallback(() => {
		try {
			setBusy(true)
			setAreaUnit(selectedAreaUnit)
			setQuantityUnit(selectedQuantityUnit)
			i18n.changeLanguage(currentLanguage)
			router.push(
				{
					pathname: router.pathname,
					query: router.query,
				},
				router.asPath,
				{ locale: currentLanguage },
			)
		} catch (error) {
			console.error(error)
		} finally {
			setBusy(false)
			onClose()
		}
	}, [setAreaUnit, setQuantityUnit, selectedAreaUnit, selectedQuantityUnit, currentLanguage, i18n, router, onClose])

	return (
		<Dialog
			open={open}
			onClose={(_event, reason) => {
				if (reason !== 'backdropClick') {
					onClose()
				}
			}}
			PaperProps={{
				className: 'w-[500px] h-[500px] !rounded-[15px] !bg-primary',
			}}
		>
			<DialogTitle className='flex items-center !py-6'>
				<Typography className='flex-1 !text-md text-white'>{t('menu.setting')}</Typography>
				<IconButton aria-label='close' onClick={onClose}>
					<CloseIcon className='text-white' />
				</IconButton>
			</DialogTitle>
			<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !p-10'>
				<Box className='flex w-full flex-col gap-6'>
					<Box className='flex items-center justify-between'>
						<Typography className='!text-sm !font-light text-black'>{t('areaUnit')}</Typography>
						<FilterSelect
							className='w-[276px]'
							fullWidth={false}
							id='unitArea'
							value={selectedAreaUnit}
							data={areaUnitOptions}
							onChange={handleAreaUnitChange}
							disabled={busy}
							required
						/>
					</Box>
					<Box className='flex items-center justify-between'>
						<Typography className='!text-sm !font-light text-black'>{t('quantityUnit')}</Typography>
						<FilterSelect
							className='w-[276px]'
							fullWidth={false}
							id='unitQuantity'
							value={selectedQuantityUnit}
							data={quantityUnitOptions}
							onChange={handleQuantityUnitChange}
							disabled={busy}
							required
						/>
					</Box>
					<Box className='flex items-center justify-between'>
						<Typography className='!text-sm !font-light text-black'>{t('languages')}</Typography>
						<Box className='flex w-[276px] items-center'>
							<ToggleButtonGroup
								size='small'
								exclusive
								color='primary'
								className='flex h-[38px] w-[132px] !rounded-[5px] bg-[#E6E6E6] [&_.Mui-selected>div]:text-white [&_.Mui-selected]:!bg-secondary'
								value={currentLanguage}
								onChange={handleToggleLanguage}
								disabled={busy}
							>
								<ToggleButton
									className='!m-0 flex h-full w-[66px] !rounded-[5px] !border-0 !px-0 !py-2'
									value={Languages.TH}
								>
									<Box className='text-sm font-normal normal-case text-black'>{t('languagesTh')}</Box>
								</ToggleButton>
								<ToggleButton
									className='!m-0 flex h-full w-[66px] !rounded-[5px] !border-0 !px-0 !py-2'
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
						className='w-[105px] !rounded-[5px] !bg-[#E6E6E6] !py-2.5 !shadow-none'
						onClick={onClose}
						disabled={busy}
					>
						<Typography className='!text-xs text-black'>{t('back')}</Typography>
					</Button>
					<Button
						variant='contained'
						className='w-[105px] !rounded-[5px] !bg-secondary !py-2.5 !shadow-none'
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
