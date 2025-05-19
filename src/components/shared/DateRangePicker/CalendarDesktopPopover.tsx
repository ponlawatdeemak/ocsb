import { Box, Button, IconButton, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight } from '@mui/icons-material'
import { Calendar, DateObject } from 'react-multi-date-picker'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@interface/config/app.config'
import { Languages } from '@/enum'
import thai_th from '@/utils/thai_th'
import english_en from '@/utils/english_en'
import { differenceInMonths } from 'date-fns'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import { CalendarTapType, CalendarType, DATE_RANGE_LENGTH } from '@/components/shared/DateRangePicker'
// import { addMonths, subMonths } from 'date-fns'

interface CalendarDesktopPopverMainProps {
	className?: string
	calendarType: CalendarType | false
	calendarTap: CalendarTapType[]
	currentDateRange: DateObject[]
	burnAreaCalendarData?: string[]
	displayCurretnDateRange: React.JSX.Element
	onCalendarTypeChange: (_event: React.MouseEvent<HTMLElement>, type: CalendarType) => void
	onCurrentDateRangeChange: (values: DateObject[]) => void
	onCurrentDateRangeReset: () => void
	onCurrentDateRangeSubmit: () => void
	onCurrentMonthRangeSubmit: () => void
}

const CalendarDesktopPopverMain: React.FC<CalendarDesktopPopverMainProps> = ({
	className = '',
	calendarType,
	calendarTap,
	currentDateRange,
	burnAreaCalendarData,
	displayCurretnDateRange,
	onCalendarTypeChange,
	onCurrentDateRangeChange,
	onCurrentDateRangeReset,
	onCurrentDateRangeSubmit,
	onCurrentMonthRangeSubmit,
}) => {
	const { t, i18n } = useTranslation('common')
	const language = i18n.language as keyof ResponseLanguage

	const [alertInfo, setAlertInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'error',
		message: '',
	})

	const onChange = (values: DateObject[]) => {
		if (values.length === 2) {
			const dateStart = values[0]
			const dateEnd = values[1]
			const monthDiff = differenceInMonths(dateStart.toDate(), dateEnd.toDate())
			if (Math.abs(monthDiff) > 11) {
				setAlertInfo({ open: true, severity: 'error', message: t('calendar.errorMaxMonth') })
			} else {
				onCurrentDateRangeChange(values)
			}
		}
	}

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
					{calendarTap.map((item) => {
						return (
							<ToggleButton
								key={item.key}
								className='!items-center !justify-between !px-2 !normal-case hover:!bg-transparent [&_svg>path]:fill-black [&_svg]:h-3 [&_svg]:w-3'
								value={item.type}
								aria-label={item.type}
							>
								<Box className='!text-xs font-light text-black'>{item.title}</Box>
								{calendarType === item.type && <ChevronRight />}
							</ToggleButton>
						)
					})}
				</ToggleButtonGroup>

				<Box className='flex h-full w-[477px] flex-col'>
					<Box className='flex w-full items-center gap-3 bg-[#F8F8FA] px-6 py-4'>
						<Typography className='!text-xs text-black'>{t('calendar.selectedDate')}</Typography>
						{displayCurretnDateRange}
					</Box>

					<Box className='flex h-full w-full flex-col items-center justify-between gap-6 p-6'>
						{calendarType === CalendarType.Month ? (
							<Calendar
								className='desktop-calendar-month'
								locale={language === Languages.EN ? english_en : thai_th}
								value={currentDateRange}
								onChange={onChange}
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
						) : (
							<Calendar
								className='desktop-calendar-date'
								locale={language === Languages.EN ? english_en : thai_th}
								value={currentDateRange}
								onChange={onChange}
								mapDays={({ date }) => {
									const isBurntDate = burnAreaCalendarData
										?.map((burntDate) => burntDate.toString())
										.includes(date?.format('YYYY-MM-DD').toString())

									return {
										children: (
											<Box className='flex h-full flex-col items-center justify-center'>
												<Box>{date.format('D')}</Box>
												{isBurntDate && (
													<Box className='h-[5px] w-[5px] rounded-full bg-[#FF0000]'></Box>
												)}
											</Box>
										),
									}
								}}
								range
								numberOfMonths={2}
								// minDate={subMonths(new Date(currentDateRange[0].format()), 12)}
								// maxDate={addMonths(new Date(currentDateRange[0].format()), 12)}
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
						)}

						<Box
							className={classNames('flex h-[30px] w-full items-center justify-between', {
								'!justify-end': calendarType === CalendarType.Month,
							})}
						>
							{calendarType !== CalendarType.Month && (
								<Box className='flex items-center gap-3'>
									<Box className='flex items-center gap-1'>
										<Box className='h-[7px] w-[7px] rounded-full bg-[#FBBF07]'></Box>
										<Typography className='!text-2xs text-black'>
											{t('calendar.currentDate')}
										</Typography>
									</Box>
									{burnAreaCalendarData && (
										<Box className='flex items-center gap-1'>
											<Box className='h-[7px] w-[7px] rounded-full bg-[#FF0000]'></Box>
											<Typography className='!text-2xs text-black'>
												{t('calendar.burntDate')}
											</Typography>
										</Box>
									)}
								</Box>
							)}

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
									<Typography className='!text-xs text-black'>{t('calendar.resetBtn')}</Typography>
								</Button>
								<Button
									variant='contained'
									className='h-full w-[74px] !rounded-[5px] !normal-case'
									onClick={
										calendarType === CalendarType.Month
											? onCurrentMonthRangeSubmit
											: onCurrentDateRangeSubmit
									}
									disabled={currentDateRange.length !== DATE_RANGE_LENGTH}
								>
									<Typography className='!text-xs text-white'>{t('calendar.confirmBtn')}</Typography>
								</Button>
							</Box>
						</Box>
					</Box>
				</Box>
			</Box>

			<AlertSnackbar alertInfo={alertInfo} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
		</Box>
	)
}

export default CalendarDesktopPopverMain
