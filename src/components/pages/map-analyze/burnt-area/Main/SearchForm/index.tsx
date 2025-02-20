import MultipleSelectCheckmarks, { MultipleSelectedType } from '@/components/common/select/MultipleSelectCheckmarks'
import { CalendarIcon } from '@/components/svg/AppIcon'
import useResponsive from '@/hook/responsive'
import {
	Box,
	Button,
	FormControl,
	IconButton,
	InputBase,
	OutlinedInput,
	Paper,
	Popover,
	SelectChangeEvent,
	Typography,
} from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import CalendarDesktopPopverMain from './CalendarDesktopPopover'
import CalendarMobilePopoverMain from './CalendarMobilePopover'
import { DateObject } from 'react-multi-date-picker'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@interface/config/app.config'
import { formatDate } from '@/utils/date'
import { endOfMonth, startOfMonth } from 'date-fns'

export enum CalendarType {
	Date = 'date',
	Month = 'month',
	LastSevenDays = 'lastSevenDays',
	LastThirtyDays = 'lastThirtyDays',
	LastThreeMonths = 'lastThreeMonths',
}

const defaultCurrentDateRange: DateObject[] = [new DateObject(), new DateObject()]

export const DATE_RANGE_LENGTH = 2

interface BurntSearchFormMainProps {
	className?: string
	selectedDateRange: Date[]
	onSelectedDateRange: (selectedDateRange: Date[]) => void
}

const BurntSearchFormMain: React.FC<BurntSearchFormMainProps> = ({
	className = '',
	selectedDateRange,
	onSelectedDateRange,
}) => {
	const { isDesktopMD } = useResponsive()
	const [selectedHotspots, setSelectedHotspots] = useState<string[]>(['1', '2'])
	const { t, i18n } = useTranslation(['common', 'map-analyze'])
	const language = i18n.language as keyof ResponseLanguage

	const [calendarDesktopPopoverAnchorEl, setCalendarDesktopPopoverAnchorEl] = useState<HTMLButtonElement | null>(null)
	const [calendarMobilePopoverAnchorEl, setCalendarMobilePopoverAnchorEl] = useState<HTMLButtonElement | null>(null)

	const [calendarType, setCalendarType] = useState<CalendarType | false>(CalendarType.Date)
	const [currentDateRange, setCurrentDateRange] = useState<DateObject[]>(defaultCurrentDateRange)

	const hotspotOptions: MultipleSelectedType[] = useMemo(
		() => [
			{ id: '1', name: t('map-analyze:hotspotInsideAreas') },
			{ id: '2', name: t('map-analyze:hotspotOutsideAreas') },
		],
		[t],
	)

	const handleHotspotChange = useCallback((event: SelectChangeEvent<typeof selectedHotspots>) => {
		const { value } = event.target
		setSelectedHotspots(typeof value === 'string' ? value.split(',') : value)
	}, [])

	const handleCalendarPopoverClick = useCallback(() => {
		const burntAreaSearchFormElement = document.getElementById('burnt-area-search-form') as HTMLElement
		const mobileCalendarBtnElement = burntAreaSearchFormElement.querySelector(
			'#mobile-calendar-btn',
		) as HTMLButtonElement
		const desktopCalendarBtnElement = burntAreaSearchFormElement.querySelector(
			'#desktop-calendar-btn',
		) as HTMLButtonElement
		if (mobileCalendarBtnElement && desktopCalendarBtnElement) {
			setCalendarDesktopPopoverAnchorEl(desktopCalendarBtnElement)
			setCalendarMobilePopoverAnchorEl(mobileCalendarBtnElement)
		}
	}, [])

	const handleCalendarPopoverClose = useCallback(() => {
		setCalendarDesktopPopoverAnchorEl(null)
		setCalendarMobilePopoverAnchorEl(null)
		setCalendarType(CalendarType.Date)
		setCurrentDateRange([new DateObject(selectedDateRange[0]), new DateObject(selectedDateRange[1])])
	}, [selectedDateRange])

	const handleCalendarTypeChange = useCallback((_event: React.MouseEvent<HTMLElement>, type: CalendarType) => {
		if (type !== null) {
			switch (type) {
				case CalendarType.LastSevenDays:
					setCurrentDateRange([new DateObject().subtract(7, 'day'), new DateObject()])
					break
				case CalendarType.LastThirtyDays:
					setCurrentDateRange([new DateObject().subtract(30, 'day'), new DateObject()])
					break
				case CalendarType.LastThreeMonths:
					setCurrentDateRange([new DateObject().subtract(3, 'month'), new DateObject()])
					break
			}
			setCalendarType(type)
		}
	}, [])

	const handleCalendarTypeExpanded = useCallback(
		(panel: CalendarType) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
			setCalendarType(isExpanded ? panel : false)
		},
		[],
	)

	const handleCurrentDateRangeChange = useCallback((values: DateObject[]) => {
		setCurrentDateRange(values)
	}, [])

	const handleCurrentDateRangeReset = useCallback(() => {
		setCurrentDateRange(defaultCurrentDateRange)
	}, [])

	const handleCurrentDateRangeSubmit = useCallback(() => {
		if (currentDateRange.length === DATE_RANGE_LENGTH) {
			const startDate = new Date(currentDateRange[0]?.format('Date: YYYY-MM-DD', ['Date']))
			const endDate = new Date(currentDateRange[1]?.format('Date: YYYY-MM-DD', ['Date']))
			onSelectedDateRange([startDate, endDate])
			setCalendarDesktopPopoverAnchorEl(null)
			setCalendarMobilePopoverAnchorEl(null)
			setCalendarType(CalendarType.Date)
		}
	}, [currentDateRange, onSelectedDateRange])

	const handleCurrentMonthRangeSubmit = useCallback(() => {
		if (currentDateRange.length === DATE_RANGE_LENGTH) {
			const startDate = startOfMonth(new Date(currentDateRange[0]?.format('Date: YYYY-MM-DD', ['Date'])))
			const endDate = endOfMonth(new Date(currentDateRange[1]?.format('Date: YYYY-MM-DD', ['Date'])))
			setCurrentDateRange([new DateObject(startDate), new DateObject(endDate)])
			onSelectedDateRange([startDate, endDate])
			setCalendarDesktopPopoverAnchorEl(null)
			setCalendarMobilePopoverAnchorEl(null)
			setCalendarType(CalendarType.Date)
		}
	}, [currentDateRange, onSelectedDateRange])

	const displaySelectedDateRange = useMemo(() => {
		if (selectedDateRange[0].toString() === selectedDateRange[1].toString()) {
			return selectedDateRange[0] ? formatDate(selectedDateRange[0], 'dd MMMM yyyy', language) : ''
		} else {
			const startDate = selectedDateRange[0] ? formatDate(selectedDateRange[0], 'dd MMMM yyyy', language) : ''
			const endDate = selectedDateRange[1] ? formatDate(selectedDateRange[1], 'dd MMMM yyyy', language) : ''
			return `${startDate} - ${endDate}`
		}
	}, [selectedDateRange, language])

	return (
		<Box
			className={classNames(
				'flex flex-col gap-2 px-4 py-6 md:px-6 md:py-4 xl:flex-row xl:items-center xl:justify-between xl:gap-12',
				className,
			)}
		>
			<Typography className='whitespace-nowrap !text-md text-primary max-md:hidden'>
				{t('map-analyze:hotspotAndBurntAreaAnalysis')}
			</Typography>
			<Box id='burnt-area-search-form' className='flex items-center gap-4 max-md:flex-col'>
				<Box className='flex w-full items-center gap-4 md:w-[26%]'>
					<FormControl className='w-full [&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white'>
						<OutlinedInput
							id='burnt-area-search'
							className='[&_fieldset]:border-none [&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
							placeholder={t('map-analyze:searchArea')}
						/>
					</FormControl>
					<Paper
						component='form'
						className={classNames(
							'flex h-[38px] items-center !rounded-[5px] p-0 !shadow-none md:hidden [&_button]:bg-[#EBF5FF] hover:[&_button]:bg-[#EBF5FF]',
							{
								'[&_button]:bg-primary hover:[&_button]:bg-primary':
									Boolean(calendarMobilePopoverAnchorEl),
							},
						)}
					>
						<IconButton
							id='mobile-calendar-btn'
							className={classNames('!rounded-[5px] !p-2.5 [&_svg>path]:stroke-[#003491]', {
								'[&_svg>path]:stroke-white': Boolean(calendarMobilePopoverAnchorEl),
							})}
							onClick={handleCalendarPopoverClick}
						>
							<CalendarIcon />
						</IconButton>
					</Paper>
				</Box>

				<Box className='flex w-full items-center gap-4 md:w-[74%]'>
					<MultipleSelectCheckmarks
						className='max-md:w-full [&_.MuiInputBase-root]:!border-none [&_.MuiSelect-select>div]:!text-black'
						options={hotspotOptions}
						multipleSelected={selectedHotspots}
						onChange={handleHotspotChange}
						fixedRenderValue={t('map-analyze:hotspot')}
					/>

					<Button
						className='h-[38px] !rounded-[5px] !bg-white !px-4 !py-2.5 !normal-case !shadow-none max-md:w-full'
						variant='contained'
					>
						<Typography className='flex-1 truncate !text-sm text-black'>
							{t('map-analyze:burntScar')}
						</Typography>
					</Button>

					<Button
						className='h-[38px] !rounded-[5px] !bg-white !px-4 !py-2.5 !normal-case !shadow-none max-md:w-full'
						variant='contained'
					>
						<Typography className='flex-1 truncate !text-sm text-black'>
							{t('map-analyze:plantingArea')}
						</Typography>
					</Button>

					<Paper
						component='form'
						className={classNames(
							'flex h-[38px] items-center !rounded-[5px] p-0 !shadow-none max-md:hidden [&_button]:bg-[#EBF5FF] hover:[&_button]:bg-[#EBF5FF]',
							{
								'[&_button]:bg-primary hover:[&_button]:bg-primary':
									Boolean(calendarDesktopPopoverAnchorEl),
							},
						)}
					>
						<InputBase
							className='m-0 flex h-[38px] w-[200px] px-3 py-2.5 [&_>input]:text-ellipsis [&_>input]:text-xs [&_>input]:text-primary [&_input]:p-0'
							value={displaySelectedDateRange}
							placeholder={t('requiredDate')}
							readOnly
						/>
						<IconButton
							id='desktop-calendar-btn'
							className={classNames('!rounded-[5px] !p-2.5 [&_svg>path]:stroke-[#003491]', {
								'[&_svg>path]:stroke-white': Boolean(calendarDesktopPopoverAnchorEl),
							})}
							onClick={handleCalendarPopoverClick}
						>
							<CalendarIcon />
						</IconButton>
					</Paper>
				</Box>
			</Box>

			{/* desktop calendar popover */}
			<Popover
				id={calendarDesktopPopoverAnchorEl ? 'desktop-calendar-popover' : undefined}
				open={isDesktopMD ? Boolean(calendarDesktopPopoverAnchorEl) : false}
				anchorEl={calendarDesktopPopoverAnchorEl}
				onClose={handleCalendarPopoverClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				slotProps={{
					paper: {
						className: 'w-[614px] !rounded-[5px] mt-4 !min-h-[363px] !shadow-none',
					},
				}}
			>
				<CalendarDesktopPopverMain
					calendarType={calendarType}
					currentDateRange={currentDateRange}
					onCalendarTypeChange={handleCalendarTypeChange}
					onCurrentDateRangeChange={handleCurrentDateRangeChange}
					onCurrentDateRangeReset={handleCurrentDateRangeReset}
					onCurrentDateRangeSubmit={handleCurrentDateRangeSubmit}
					onCurrentMonthRangeSubmit={handleCurrentMonthRangeSubmit}
				/>
			</Popover>

			{/* mobile calendar popover */}
			<Popover
				id={calendarMobilePopoverAnchorEl ? 'mobile-calendar-popover' : undefined}
				open={!isDesktopMD ? Boolean(calendarMobilePopoverAnchorEl) : false}
				anchorEl={calendarMobilePopoverAnchorEl}
				onClose={handleCalendarPopoverClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				slotProps={{
					paper: {
						className: 'w-full px-6 pt-4 pb-6 !left-0 !max-w-full !rounded-[5px] mt-4 !shadow-none',
					},
				}}
			>
				<CalendarMobilePopoverMain
					calendarType={calendarType}
					handleCalendarTypeExpanded={handleCalendarTypeExpanded}
				/>
			</Popover>
		</Box>
	)
}

export default BurntSearchFormMain
