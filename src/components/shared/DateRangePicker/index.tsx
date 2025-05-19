import { CalendarIcon } from '@/components/svg/AppIcon'
import useResponsive from '@/hook/responsive'
import { formatDate } from '@/utils/date'
import { ResponseLanguage } from '@interface/config/app.config'
import { Box, IconButton, InputBase, Paper, Popover, Typography } from '@mui/material'
import classNames from 'classnames'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useTranslation } from 'next-i18next'
import React, { useCallback, useMemo, useState } from 'react'
import { DateObject } from 'react-multi-date-picker'
import CalendarDesktopPopverMain from './CalendarDesktopPopover'
import CalendarMobilePopoverMain from './CalendarMobilePopover'
import { EastRounded } from '@mui/icons-material'

export enum CalendarType {
	Date = 'date',
	Month = 'month',
	LastSevenDays = 'lastSevenDays',
	LastThirtyDays = 'lastThirtyDays',
	LastThreeMonths = 'lastThreeMonths',
}

export interface CalendarTapType {
	key: CalendarType
	type: CalendarType
	title: string
}

export const defaultCurrentDateRange: DateObject[] = [new DateObject(), new DateObject()]

export const DATE_RANGE_LENGTH = 2

interface DateRangePickerMainProps {
	className?: string
	responsiveType: 'desktop' | 'mobile'
	selectedDateRange: Date[]
	onSelectedDateRange: (selectedDateRange: Date[]) => void
	burnAreaCalendarData?: string[]
	isBurnAreaCalendarDataLoading?: boolean
}

const DateRangePickerMain: React.FC<DateRangePickerMainProps> = ({
	className = '',
	responsiveType,
	selectedDateRange,
	onSelectedDateRange,
	burnAreaCalendarData,
	isBurnAreaCalendarDataLoading,
}) => {
	const { isDesktopMD } = useResponsive()
	const { t, i18n } = useTranslation(['common', 'map-analyze'])
	const language = i18n.language as keyof ResponseLanguage

	const [calendarType, setCalendarType] = useState<CalendarType | false>(CalendarType.Date)
	const [currentDateRange, setCurrentDateRange] = useState<DateObject[]>(defaultCurrentDateRange)

	const [calendarDesktopPopoverAnchorEl, setCalendarDesktopPopoverAnchorEl] = useState<HTMLButtonElement | null>(null)
	const [calendarMobilePopoverAnchorEl, setCalendarMobilePopoverAnchorEl] = useState<HTMLButtonElement | null>(null)

	const calendarTap: CalendarTapType[] = useMemo(() => {
		return [
			{ key: CalendarType.Date, type: CalendarType.Date, title: t('calendar.dateBtn') },
			{ key: CalendarType.Month, type: CalendarType.Month, title: t('calendar.monthBtn') },
			{ key: CalendarType.LastSevenDays, type: CalendarType.LastSevenDays, title: t('calendar.lastSevenDayBtn') },
			{
				key: CalendarType.LastThirtyDays,
				type: CalendarType.LastThirtyDays,
				title: t('calendar.lastThirtyDayBtn'),
			},
			{
				key: CalendarType.LastThreeMonths,
				type: CalendarType.LastThreeMonths,
				title: t('calendar.lastThreeMonthBtn'),
			},
		]
	}, [t])

	const handleCalendarPopoverClick = useCallback(() => {
		const burntAreaSearchFormElement = document.getElementById('search-form') as HTMLElement
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
			const type = isExpanded ? panel : ''
			if (type) {
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
			} else {
				setCalendarType(false)
			}
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
			const startDate = new Date(currentDateRange[0]?.format('YYYY-MM-DD'))
			const endDate = new Date(currentDateRange[1]?.format('YYYY-MM-DD'))
			onSelectedDateRange([startDate, endDate])
			setCalendarDesktopPopoverAnchorEl(null)
			setCalendarMobilePopoverAnchorEl(null)
			setCalendarType(CalendarType.Date)
		}
	}, [currentDateRange, onSelectedDateRange])

	const handleCurrentMonthRangeSubmit = useCallback(() => {
		if (currentDateRange.length === DATE_RANGE_LENGTH) {
			const startDate = startOfMonth(new Date(currentDateRange[0]?.format('YYYY-MM-DD')))
			startDate.setHours(startDate.getHours() + 7)
			const endDate = endOfMonth(new Date(currentDateRange[1]?.format('YYYY-MM-DD')))
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

	const displayCurretnDateRange = useMemo(() => {
		const displayFormat = calendarType === CalendarType.Month ? 'MMMM yyyy' : 'dd MMMM yyyy'

		if ((currentDateRange[0]?.format() ?? '') === (currentDateRange[1]?.format() ?? '')) {
			return (
				<Box className='flex items-center gap-2'>
					<Typography className='!text-xs text-primary'>
						{currentDateRange[0]
							? formatDate(new Date(currentDateRange[0]?.format('YYYY-MM-DD')), displayFormat, language)
							: ''}
					</Typography>
				</Box>
			)
		} else {
			return (
				<Box className='flex items-center gap-2'>
					<Typography className='!text-xs text-primary'>
						{currentDateRange[0]
							? formatDate(new Date(currentDateRange[0]?.format('YYYY-MM-DD')), displayFormat, language)
							: ''}
					</Typography>
					<EastRounded className='!h-3 !w-3 text-black' />
					<Typography className='!text-xs text-primary'>
						{currentDateRange[1]
							? formatDate(new Date(currentDateRange[1]?.format('YYYY-MM-DD')), displayFormat, language)
							: ''}
					</Typography>
				</Box>
			)
		}
	}, [calendarType, currentDateRange, language])

	return (
		<>
			{responsiveType === 'desktop' ? (
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
						placeholder={t('map-analyze:requiredDate')}
						readOnly
					/>
					<IconButton
						id='desktop-calendar-btn'
						className={classNames('!rounded-[5px] !p-2.5 [&_svg>path]:stroke-[#003491]', {
							'[&_svg>path]:stroke-white': Boolean(calendarDesktopPopoverAnchorEl),
						})}
						onClick={handleCalendarPopoverClick}
						disabled={isBurnAreaCalendarDataLoading ?? false}
					>
						<CalendarIcon />
					</IconButton>
				</Paper>
			) : (
				<Paper
					component='form'
					className={classNames(
						'flex h-[38px] items-center !rounded-[5px] p-0 !shadow-none md:hidden [&_button]:bg-[#EBF5FF] hover:[&_button]:bg-[#EBF5FF]',
						{
							'[&_button]:bg-primary hover:[&_button]:bg-primary': Boolean(calendarMobilePopoverAnchorEl),
						},
						className,
					)}
				>
					<IconButton
						id='mobile-calendar-btn'
						className={classNames('!rounded-[5px] !p-2.5 [&_svg>path]:stroke-[#003491]', {
							'[&_svg>path]:stroke-white': Boolean(calendarMobilePopoverAnchorEl),
						})}
						onClick={handleCalendarPopoverClick}
						disabled={isBurnAreaCalendarDataLoading ?? false}
					>
						<CalendarIcon />
					</IconButton>
				</Paper>
			)}

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
					calendarTap={calendarTap}
					currentDateRange={currentDateRange}
					burnAreaCalendarData={burnAreaCalendarData}
					displayCurretnDateRange={displayCurretnDateRange}
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
						className:
							'!left-0 mt-4 flex !max-h-[calc(100%-158px)] w-full !max-w-full overflow-hidden !rounded-[5px] px-0 pb-6 pt-4 !shadow-none',
					},
				}}
			>
				<CalendarMobilePopoverMain
					calendarType={calendarType}
					calendarTap={calendarTap}
					currentDateRange={currentDateRange}
					burnAreaCalendarData={burnAreaCalendarData}
					displayCurretnDateRange={displayCurretnDateRange}
					handleCalendarTypeExpanded={handleCalendarTypeExpanded}
					onCurrentDateRangeChange={handleCurrentDateRangeChange}
					onCurrentDateRangeReset={handleCurrentDateRangeReset}
					onCurrentDateRangeSubmit={handleCurrentDateRangeSubmit}
					onCurrentMonthRangeSubmit={handleCurrentMonthRangeSubmit}
				/>
			</Popover>
		</>
	)
}

export default DateRangePickerMain
