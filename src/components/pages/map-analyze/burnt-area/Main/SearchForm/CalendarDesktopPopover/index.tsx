import { Box, Button, IconButton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { CalendarType, DATE_RANGE_LENGTH } from '..'
import { ChevronLeft, ChevronRight, EastRounded } from '@mui/icons-material'
import { Calendar, DateObject } from 'react-multi-date-picker'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@interface/config/app.config'
import { Languages } from '@/enum'
import thai_th from '@/utils/thai_th'
import english_en from '@/utils/english_en'
import { formatDate } from '@/utils/date'

interface CalendarDesktopPopverMainProps {
	className?: string
	calendarType: CalendarType | false
	currentDateRange: DateObject[]
	onCalendarTypeChange: (_event: React.MouseEvent<HTMLElement>, type: CalendarType) => void
	onCurrentDateRangeChange: (values: DateObject[]) => void
	onCurrentDateRangeReset: () => void
	onCurrentDateRangeSubmit: () => void
	onCurrentMonthRangeSubmit: () => void
}

const CalendarDesktopPopverMain: React.FC<CalendarDesktopPopverMainProps> = ({
	className = '',
	calendarType,
	currentDateRange,
	onCalendarTypeChange,
	onCurrentDateRangeChange,
	onCurrentDateRangeReset,
	onCurrentDateRangeSubmit,
	onCurrentMonthRangeSubmit,
}) => {
	const { t, i18n } = useTranslation('common')
	const language = i18n.language as keyof ResponseLanguage

	const displayCurretnDateRange = useMemo(() => {
		const displayFormat = calendarType === CalendarType.Month ? 'MMMM yyyy' : 'dd MMMM yyyy'

		if ((currentDateRange[0]?.format() ?? '') === (currentDateRange[1]?.format() ?? '')) {
			return (
				<Box className='flex items-center gap-2'>
					<Typography className='!text-xs text-primary'>
						{currentDateRange[0]
							? formatDate(
									new Date(currentDateRange[0]?.format('Date: YYYY-MM-DD', ['Date'])),
									displayFormat,
									language,
								)
							: ''}
					</Typography>
				</Box>
			)
		} else {
			return (
				<Box className='flex items-center gap-2'>
					<Typography className='!text-xs text-primary'>
						{currentDateRange[0]
							? formatDate(
									new Date(currentDateRange[0]?.format('Date: YYYY-MM-DD', ['Date'])),
									displayFormat,
									language,
								)
							: ''}
					</Typography>
					<EastRounded className='!h-3 !w-3 text-black' />
					<Typography className='!text-xs text-primary'>
						{currentDateRange[1]
							? formatDate(
									new Date(currentDateRange[1]?.format('Date: YYYY-MM-DD', ['Date'])),
									displayFormat,
									language,
								)
							: ''}
					</Typography>
				</Box>
			)
		}
	}, [calendarType, currentDateRange, language])

	return (
		<Box className={classNames('h-full w-full', className)}>
			<Box className='flex h-full w-full flex-row'>
				<ToggleButtonGroup
					className='w-[137px] px-3 py-1 [&_.MuiToggleButton-root.Mui-selected>div]:font-normal [&_.MuiToggleButton-root.Mui-selected>div]:text-primary [&_.MuiToggleButton-root.Mui-selected]:bg-transparent [&_.MuiToggleButton-root]:h-[42px] [&_.MuiToggleButton-root]:border-0 [&_.MuiToggleButton-root]:border-b'
					orientation='vertical'
					value={calendarType}
					exclusive
					onChange={onCalendarTypeChange}
				>
					<ToggleButton
						className='!items-center !justify-between !px-2 !normal-case hover:!bg-transparent [&_svg>path]:fill-black [&_svg]:h-3 [&_svg]:w-3'
						value={CalendarType.Date}
						aria-label={CalendarType.Date}
					>
						<Box className='!text-xs font-light text-black'>{t('calendar.dateBtn')}</Box>
						{calendarType === CalendarType.Date && <ChevronRight />}
					</ToggleButton>
					<ToggleButton
						className='!items-center !justify-between !px-2 !normal-case hover:!bg-transparent [&_svg>path]:fill-black [&_svg]:h-3 [&_svg]:w-3'
						value={CalendarType.Month}
						aria-label={CalendarType.Month}
					>
						<Box className='!text-xs font-light text-black'>{t('calendar.monthBtn')}</Box>
						{calendarType === CalendarType.Month && <ChevronRight />}
					</ToggleButton>
					<ToggleButton
						className='!items-center !justify-between !px-2 !normal-case hover:!bg-transparent [&_svg>path]:fill-black [&_svg]:h-3 [&_svg]:w-3'
						value={CalendarType.LastSevenDays}
						aria-label={CalendarType.LastSevenDays}
					>
						<Box className='!text-xs font-light text-black'>{t('calendar.lastSevenDayBtn')}</Box>
						{calendarType === CalendarType.LastSevenDays && <ChevronRight />}
					</ToggleButton>
					<ToggleButton
						className='!items-center !justify-between !px-2 !normal-case hover:!bg-transparent [&_svg>path]:fill-black [&_svg]:h-3 [&_svg]:w-3'
						value={CalendarType.LastThirtyDays}
						aria-label={CalendarType.LastThirtyDays}
					>
						<Box className='!text-xs font-light text-black'>{t('calendar.lastThirtyDayBtn')}</Box>
						{calendarType === CalendarType.LastThirtyDays && <ChevronRight />}
					</ToggleButton>
					<ToggleButton
						className='!items-center !justify-between !px-2 !normal-case hover:!bg-transparent [&_svg>path]:fill-black [&_svg]:h-3 [&_svg]:w-3'
						value={CalendarType.LastThreeMonths}
						aria-label={CalendarType.LastThreeMonths}
					>
						<Box className='!text-xs font-light text-black'>{t('calendar.lastThreeMonthBtn')}</Box>
						{calendarType === CalendarType.LastThreeMonths && <ChevronRight />}
					</ToggleButton>
				</ToggleButtonGroup>
				{calendarType === CalendarType.Month ? (
					<Box className='flex h-full w-[477px] flex-col'>
						<Box className='flex w-full items-center gap-3 bg-[#F8F8FA] px-6 py-4'>
							<Typography className='!text-xs text-black'>{t('calendar.selectedDate')}</Typography>
							{displayCurretnDateRange}
						</Box>
						<Box className='flex h-full w-full flex-col items-center justify-between gap-6 p-6'>
							<Calendar
								className='desktop-calendar-month'
								locale={language === Languages.EN ? english_en : thai_th}
								value={currentDateRange}
								onChange={onCurrentDateRangeChange}
								onlyMonthPicker
								range
								disableYearPicker
								formatMonth={(month, year) => {
									return month
								}}
								formatYear={(year, month) => {
									return language === Languages.EN ? year : `${Number(year) + 543}`
								}}
								monthYearSeparator=' '
								renderButton={(direction: 'right' | 'left', handleClick: any) => (
									<Box className='flex flex-row items-center gap-2'>
										{direction === 'right' ? (
											<>
												<Typography className='!text-2xs text-black'>
													{t('calendar.nextYearBtn')}
												</Typography>
												<IconButton
													className='h-[18px] w-[18px] rounded-full bg-primary !p-0 !text-black hover:!bg-primary hover:!text-white'
													onClick={handleClick}
												>
													<ChevronRight className='!h-[18px] !w-[18px]' />
												</IconButton>
											</>
										) : (
											<>
												<IconButton
													className='h-[18px] w-[18px] rounded-full bg-primary !p-0 !text-black hover:!bg-primary hover:!text-white'
													onClick={handleClick}
												>
													<ChevronLeft className='!h-[18px] !w-[18px]' />
												</IconButton>
												<Typography className='!text-2xs text-black'>
													{t('calendar.prevYearBtn')}
												</Typography>
											</>
										)}
									</Box>
								)}
							/>
							<Box className='flex h-[30px] w-full items-center justify-end'>
								<Box className='flex items-center gap-4'>
									<Button
										variant='outlined'
										className='h-full w-[74px] !rounded-[5px] !border-[#E6E6E6] !normal-case'
										onClick={onCurrentDateRangeReset}
									>
										<Typography className='!text-xs text-black'>
											{t('calendar.resetBtn')}
										</Typography>
									</Button>
									<Button
										variant='contained'
										className='h-full w-[74px] !rounded-[5px] !normal-case'
										onClick={onCurrentMonthRangeSubmit}
										disabled={currentDateRange.length !== DATE_RANGE_LENGTH}
									>
										<Typography className='!text-xs text-white'>
											{t('calendar.confirmBtn')}
										</Typography>
									</Button>
								</Box>
							</Box>
						</Box>
					</Box>
				) : (
					<Box className='flex h-full w-[477px] flex-col'>
						<Box className='flex w-full items-center gap-3 bg-[#F8F8FA] px-6 py-4'>
							<Typography className='!text-xs text-black'>{t('calendar.selectedDate')}</Typography>
							{displayCurretnDateRange}
						</Box>
						<Box className='flex h-full w-full flex-col items-center justify-between gap-6 p-6'>
							<Calendar
								locale={language === Languages.EN ? english_en : thai_th}
								value={currentDateRange}
								onChange={onCurrentDateRangeChange}
								range
								numberOfMonths={2}
								showOtherDays
								disableMonthPicker
								disableYearPicker
								formatMonth={(month, year) => {
									return month
								}}
								formatYear={(year, month) => {
									return language === Languages.EN ? year : `${Number(year) + 543}`
								}}
								monthYearSeparator=' '
								readOnly={
									calendarType === CalendarType.LastSevenDays ||
									calendarType === CalendarType.LastThirtyDays ||
									calendarType === CalendarType.LastThreeMonths
								}
							/>
							<Box className='flex h-[30px] w-full items-center justify-between'>
								<Box className='flex items-center gap-3'>
									<Box className='flex items-center gap-1'>
										<Box className='h-[7px] w-[7px] rounded-full bg-[#FBBF07]'></Box>
										<Typography className='!text-2xs text-black'>
											{t('calendar.currentDate')}
										</Typography>
									</Box>
									<Box className='flex items-center gap-1'>
										<Box className='h-[7px] w-[7px] rounded-full bg-[#FF0000]'></Box>
										<Typography className='!text-2xs text-black'>
											{t('calendar.burntDate')}
										</Typography>
									</Box>
								</Box>
								<Box className='flex items-center gap-4 [&_.Mui-disabled:first-child_.MuiTypography-root]:text-[#E6E6E6]'>
									<Button
										variant='outlined'
										className='h-full w-[74px] !rounded-[5px] !border-[#E6E6E6] !normal-case'
										onClick={onCurrentDateRangeReset}
										disabled={
											calendarType === CalendarType.LastSevenDays ||
											calendarType === CalendarType.LastThirtyDays ||
											calendarType === CalendarType.LastThreeMonths
										}
									>
										<Typography className='!text-xs text-black'>
											{t('calendar.resetBtn')}
										</Typography>
									</Button>
									<Button
										variant='contained'
										className='h-full w-[74px] !rounded-[5px] !normal-case'
										onClick={onCurrentDateRangeSubmit}
										disabled={currentDateRange.length !== DATE_RANGE_LENGTH}
									>
										<Typography className='!text-xs text-white'>
											{t('calendar.confirmBtn')}
										</Typography>
									</Button>
								</Box>
							</Box>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	)
}

export default CalendarDesktopPopverMain
