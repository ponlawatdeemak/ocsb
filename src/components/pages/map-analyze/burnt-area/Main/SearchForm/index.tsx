import MultipleSelectCheckmarks, { MultipleSelectedType } from '@/components/common/select/MultipleSelectCheckmarks'
import { hotspotType, hotspotTypeCode, mapType, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { CalendarIcon, SearchInputIcon } from '@/components/svg/AppIcon'
import useResponsive from '@/hook/responsive'
import {
	Autocomplete,
	Box,
	FormControl,
	IconButton,
	Input,
	InputAdornment,
	InputBase,
	Paper,
	Popover,
	Typography,
} from '@mui/material'
import classNames from 'classnames'
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'
import CalendarDesktopPopverMain from './CalendarDesktopPopover'
import CalendarMobilePopoverMain from './CalendarMobilePopover'
import { DateObject } from 'react-multi-date-picker'
import { formatDate } from '@/utils/date'
import { endOfMonth, startOfMonth } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import { Clear } from '@mui/icons-material'
import { debounce } from 'lodash'
import { defaultCurrentDateRange } from '..'

export interface OptionType {
	id: string
	name: ResponseLanguage
	geometry: any
}

export enum CalendarType {
	Date = 'date',
	Month = 'month',
	LastSevenDays = 'lastSevenDays',
	LastThirtyDays = 'lastThirtyDays',
	LastThreeMonths = 'lastThreeMonths',
}

export const DATE_RANGE_LENGTH = 2

interface BurntSearchFormMainProps {
	selectedHotspots: hotspotTypeCode[]
	handleChange: (event: any) => void
	mapTypeArray: mapTypeCode[]
	className?: string
	selectedDateRange: Date[]
	onSelectedDateRange: (selectedDateRange: Date[]) => void
	searchSelectedAdmOption: OptionType | null
	handleSelectedAdmOption: (value: OptionType | null) => void
	currentDateRange: DateObject[]
	handleCurrentDateRange: (value: DateObject[]) => void
}

const BurntSearchFormMain: React.FC<BurntSearchFormMainProps> = ({
	selectedHotspots,
	handleChange,
	mapTypeArray,
	selectedDateRange,
	onSelectedDateRange,
	searchSelectedAdmOption,
	handleSelectedAdmOption,
	currentDateRange,
	handleCurrentDateRange,
	className = '',
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage

	const hotspotOptions: MultipleSelectedType[] = useMemo(
		() => hotspotType.map((type) => ({ id: type.code, name: type.label[language] })),
		[language],
	)

	const { isDesktopMD } = useResponsive()
	const [searchAdmInputValue, setSearchAdmInputValue] = useState<string>('')

	const [calendarDesktopPopoverAnchorEl, setCalendarDesktopPopoverAnchorEl] = useState<HTMLButtonElement | null>(null)
	const [calendarMobilePopoverAnchorEl, setCalendarMobilePopoverAnchorEl] = useState<HTMLButtonElement | null>(null)

	const [calendarType, setCalendarType] = useState<CalendarType | false>(CalendarType.Date)

	const { data: searchAdmData, isPending: isSearchAdmDataLoading } = useQuery({
		queryKey: ['getSearchAdminPoly', searchAdmInputValue],
		queryFn: () => service.lookup.getSearchAdm({ keyword: searchAdmInputValue }),
		enabled: !!searchAdmInputValue,
	})

	const { data: burnAreaCalendarData, isLoading: isBurnAreaCalendarDataLoading } = useQuery({
		queryKey: ['getBurnAreaCalendar'],
		queryFn: () => service.mapAnalyze.getBurnAreaCalendar(),
	})

	const optionAdmList: OptionType[] = useMemo(() => {
		return searchAdmData?.map((item: any) => ({ id: item.id, name: item.name, geometry: item.geometry })) ?? []
	}, [searchAdmData])

	const handleChangeAdmInput = useCallback((_event: React.SyntheticEvent<Element, Event>, newInputValue: string) => {
		setSearchAdmInputValue(newInputValue)
	}, [])

	const handleSelectAdmOption = useCallback(
		(_event: ChangeEvent<{}>, newSelectedValue: OptionType | null) => {
			handleSelectedAdmOption(newSelectedValue)
		},
		[handleSelectedAdmOption],
	)

	const handleClear = useCallback(() => {
		setSearchAdmInputValue('')
		handleSelectedAdmOption(null)
	}, [handleSelectedAdmOption])

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
		handleCurrentDateRange([new DateObject(selectedDateRange[0]), new DateObject(selectedDateRange[1])])
	}, [handleCurrentDateRange, selectedDateRange])

	const handleCalendarTypeChange = useCallback(
		(_event: React.MouseEvent<HTMLElement>, type: CalendarType) => {
			if (type !== null) {
				switch (type) {
					case CalendarType.LastSevenDays:
						handleCurrentDateRange([new DateObject().subtract(7, 'day'), new DateObject()])
						break
					case CalendarType.LastThirtyDays:
						handleCurrentDateRange([new DateObject().subtract(30, 'day'), new DateObject()])
						break
					case CalendarType.LastThreeMonths:
						handleCurrentDateRange([new DateObject().subtract(3, 'month'), new DateObject()])
						break
				}
				setCalendarType(type)
			}
		},
		[handleCurrentDateRange],
	)

	const handleCalendarTypeExpanded = useCallback(
		(panel: CalendarType) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
			setCalendarType(isExpanded ? panel : false)
		},
		[],
	)

	const handleCurrentDateRangeChange = useCallback(
		(values: DateObject[]) => {
			handleCurrentDateRange(values)
		},
		[handleCurrentDateRange],
	)

	const handleCurrentDateRangeReset = useCallback(() => {
		handleCurrentDateRange(defaultCurrentDateRange)
	}, [handleCurrentDateRange])

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
			handleCurrentDateRange([new DateObject(startDate), new DateObject(endDate)])
			onSelectedDateRange([startDate, endDate])
			setCalendarDesktopPopoverAnchorEl(null)
			setCalendarMobilePopoverAnchorEl(null)
			setCalendarType(CalendarType.Date)
		}
	}, [currentDateRange, handleCurrentDateRange, onSelectedDateRange])

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
					<FormControl className='md-[255px] w-full overflow-hidden !rounded-[5px] bg-white [&_::placeholder]:text-xs [&_input]:!text-xs [&_input]:!normal-case [&_input]:text-black'>
						<Autocomplete
							blurOnSelect
							options={optionAdmList}
							getOptionLabel={(option) => option.name[language]}
							isOptionEqualToValue={(option, value) => option.id === value.id}
							value={searchSelectedAdmOption}
							onInputChange={debounce(handleChangeAdmInput, 500)}
							onChange={handleSelectAdmOption}
							slotProps={{
								paper: {
									className: 'border mt-1 !shadow-none border-solid border-gray !rounded-[5px]',
								},
								popper: { sx: { zIndex: 10000 } },
							}}
							renderInput={(params) => {
								const { InputLabelProps, InputProps, ...otherParams } = params
								return (
									<Input
										{...otherParams}
										{...params.InputProps}
										className='flex h-[38px] items-center gap-2 rounded-[5px] bg-white px-3 py-0 [&_.MuiInputBase-input]:!p-0'
										startAdornment={
											<InputAdornment className='!m-0 !h-4 !w-4' position='start'>
												<SearchInputIcon />
											</InputAdornment>
										}
										endAdornment={
											<InputAdornment className='!m-0' position='end'>
												{searchAdmInputValue && (
													<IconButton className='!p-0.5' onClick={handleClear}>
														<Clear className='!h-4 !w-4' />
													</IconButton>
												)}
											</InputAdornment>
										}
										disableUnderline={true}
										id='burnt-adm-search'
										placeholder={t('map-analyze:searchArea')}
									/>
								)
							}}
							noOptionsText={isSearchAdmDataLoading ? 'พิมพ์คำค้นหา' : 'ไม่พบข้อมูล'}
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
							disabled={isBurnAreaCalendarDataLoading}
						>
							<CalendarIcon />
						</IconButton>
					</Paper>
				</Box>

				<Box className='flex w-[74%] items-center gap-4'>
					{mapType.map((item) => {
						if (item.code === mapTypeCode.hotspots) {
							return (
								<MultipleSelectCheckmarks
									key={item.code}
									name={item.code}
									className={classNames('[&_.MuiInputBase-root]:!border-none', {
										'[&_.MuiInputBase-root]:!bg-[#EBF5FF] [&_.MuiSelect-select>div]:!text-primary [&_.MuiSvgIcon-root]:!text-primary':
											mapTypeArray.includes(mapTypeCode.hotspots),
										'[&_.MuiInputBase-root]:!bg-white [&_.MuiSelect-select>div]:!text-black [&_.MuiSvgIcon-root]:!text-black':
											!mapTypeArray.includes(mapTypeCode.hotspots),
									})}
									options={hotspotOptions}
									multipleSelected={selectedHotspots}
									onChange={handleChange}
									fixedRenderValue={item.label[language]}
								/>
							)
						} else {
							return (
								<button
									key={item.code}
									className={classNames(
										'h-[38px] !truncate !rounded-[5px] !px-4 !py-2.5 !text-sm !font-normal !shadow-none',
										{ '!bg-[#EBF5FF] !text-primary': mapTypeArray.includes(item.code) },
										{ '!bg-white !text-black': !mapTypeArray.includes(item.code) },
									)}
									name={item.code}
									onClick={handleChange}
								>
									{item.label[language]}
								</button>
							)
						}
					})}

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
							disabled={isBurnAreaCalendarDataLoading}
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
					burnAreaCalendarData={burnAreaCalendarData?.data ?? []}
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
