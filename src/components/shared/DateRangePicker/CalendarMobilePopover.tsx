import { Accordion, AccordionDetails, AccordionSummary, Box, Button, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, ExpandMore } from '@mui/icons-material'
import { Calendar, DateObject } from 'react-multi-date-picker'
import { Languages } from '@/enum'
import thai_th from '@/utils/thai_th'
import english_en from '@/utils/english_en'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@interface/config/app.config'
import { differenceInMonths } from 'date-fns'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import { CalendarTapType, CalendarType, DATE_RANGE_LENGTH } from '@/components/shared/DateRangePicker'

interface CalendarMobilePopoverMainProps {
	className?: string
	calendarType: CalendarType | false
	calendarTap: CalendarTapType[]
	currentDateRange: DateObject[]
	burnAreaCalendarData?: string[]
	displayCurretnDateRange: React.JSX.Element
	handleCalendarTypeExpanded: (panel: CalendarType) => (event: React.SyntheticEvent, isExpanded: boolean) => void
	onCurrentDateRangeChange: (values: DateObject[]) => void
	onCurrentDateRangeReset: () => void
	onCurrentDateRangeSubmit: () => void
	onCurrentMonthRangeSubmit: () => void
}

const CalendarMobilePopoverMain: React.FC<CalendarMobilePopoverMainProps> = ({
	className = '',
	calendarType,
	calendarTap,
	currentDateRange,
	burnAreaCalendarData,
	displayCurretnDateRange,
	handleCalendarTypeExpanded,
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
		<Box className={classNames('w-full overflow-auto px-6', className)}>
			<Box>
				{calendarTap.map((item) => {
					return (
						<Accordion
							key={item.key}
							className={classNames('!m-0 !rounded-none !shadow-none [&::before]:!opacity-0', {
								'border-0 border-t border-solid border-[#E6E6E6]': item.type !== CalendarType.Date,
							})}
							expanded={calendarType === item.type}
							onChange={handleCalendarTypeExpanded(item.type)}
						>
							<AccordionSummary
								className={classNames(
									'!my-1 h-[34px] !min-h-[34px] !rounded-[5px] !px-3 !py-2 [&_>div]:!m-0',
									{
										'!bg-[#EBF5FF]': calendarType === item.type,
									},
								)}
								expandIcon={
									<ExpandMore
										className={classNames('!h-[18px] !w-[18px] text-black', {
											'!text-primary': calendarType === item.type,
										})}
									/>
								}
								aria-controls={`${item.key}-content`}
								id={`${item.key}-header`}
							>
								<Typography
									className={classNames('!text-xs text-black', {
										'!text-primary': calendarType === item.type,
									})}
								>
									{item.title}
								</Typography>
							</AccordionSummary>
							<AccordionDetails className='!mt-1 flex flex-col overflow-hidden rounded-[5px] !px-0 !pb-6 !pt-0'>
								<Box className='mb-3 flex w-full items-center gap-3 bg-[#F8F8FA] p-3'>
									<Typography className='!text-xs text-black'>
										{t('calendar.selectedDate')}
									</Typography>
									{displayCurretnDateRange}
								</Box>

								{item.type === CalendarType.Month ? (
									<Calendar
										className='mobile-calendar-month'
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
										className='mobile-calendar-date'
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
											item.type === CalendarType.LastSevenDays ||
											item.type === CalendarType.LastThirtyDays ||
											item.type === CalendarType.LastThreeMonths
										}
									/>
								)}

								{item.type !== CalendarType.Month && (
									<Box className='mb-4 flex items-center gap-3 px-2'>
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

								<Box className='flex h-[38px] items-center justify-between px-2 [&_.Mui-disabled:first-child_.MuiTypography-root]:text-[#E6E6E6]'>
									<Button
										variant='outlined'
										className='h-full w-[124px] !rounded-[5px] !border-[#E6E6E6] !normal-case'
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
										className='h-full w-[124px] !rounded-[5px] !normal-case'
										onClick={
											calendarType === CalendarType.Month
												? onCurrentMonthRangeSubmit
												: onCurrentDateRangeSubmit
										}
										disabled={currentDateRange.length !== DATE_RANGE_LENGTH}
									>
										<Typography className='!text-xs text-white'>
											{t('calendar.confirmBtn')}
										</Typography>
									</Button>
								</Box>
							</AccordionDetails>
						</Accordion>
					)
				})}
			</Box>

			<AlertSnackbar alertInfo={alertInfo} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
		</Box>
	)
}

export default CalendarMobilePopoverMain
