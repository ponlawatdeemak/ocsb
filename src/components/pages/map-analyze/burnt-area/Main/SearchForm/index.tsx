import MultipleSelectCheckmarks, { MultipleSelectedType } from '@/components/common/select/MultipleSelectCheckmarks'
import { hotspotType, hotspotTypeCode, mapType, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { Box, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import DateRangePickerMain from '@/components/shared/DateRangePicker'
import SearchAdminPoly from '@/components/shared/SearchAdminPoly'

export interface OptionType {
	id: string
	name: ResponseLanguage
	geometry: any
}

interface BurntSearchFormMainProps {
	className?: string
	selectedHotspots: hotspotTypeCode[]
	handleChangeMapTypeArray: (event: any) => void
	mapTypeArray: mapTypeCode[]
	selectedDateRange: Date[]
	onSelectedDateRange: (selectedDateRange: Date[]) => void
	searchSelectedAdmOption: OptionType | null
	handleSelectedAdmOption: (value: OptionType | null) => void
}

const BurntSearchFormMain: React.FC<BurntSearchFormMainProps> = ({
	className = '',
	selectedHotspots,
	handleChangeMapTypeArray,
	mapTypeArray,
	selectedDateRange,
	onSelectedDateRange,
	searchSelectedAdmOption,
	handleSelectedAdmOption,
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage

	const { data: burnAreaCalendarData, isLoading: isBurnAreaCalendarDataLoading } = useQuery({
		queryKey: ['getBurnAreaCalendar'],
		queryFn: () => service.mapAnalyze.getBurnAreaCalendar(),
	})

	const hotspotOptions: MultipleSelectedType[] = useMemo(
		() => hotspotType.map((type) => ({ id: type.code, name: type.label[language] })),
		[language],
	)

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
			<Box id='search-form' className='flex items-center gap-4 max-md:flex-col'>
				<Box className='flex w-full items-center gap-4 md:w-[26%]'>
					<SearchAdminPoly
						searchSelectedAdmOption={searchSelectedAdmOption}
						handleSelectedAdmOption={handleSelectedAdmOption}
					/>

					<DateRangePickerMain
						responsiveType='mobile'
						selectedDateRange={selectedDateRange}
						onSelectedDateRange={onSelectedDateRange}
						burnAreaCalendarData={burnAreaCalendarData?.data || []}
						isBurnAreaCalendarDataLoading={isBurnAreaCalendarDataLoading}
					/>
				</Box>

				<Box className='flex w-full items-center gap-4 md:w-[74%]'>
					{mapType.map((item) => {
						if (item.code === mapTypeCode.hotspots) {
							return (
								<MultipleSelectCheckmarks
									key={item.code}
									name={item.code}
									className={classNames(
										'text-center !text-xs max-md:w-full [&_.MuiInputBase-root]:!border-none [&_.MuiSelect-select>div]:!text-xs',
										{
											'[&_.MuiInputBase-root]:!bg-[#EBF5FF] [&_.MuiSelect-select>div]:!text-primary [&_.MuiSvgIcon-root]:!text-primary':
												mapTypeArray.includes(mapTypeCode.hotspots),
											'[&_.MuiInputBase-root]:!bg-white [&_.MuiSelect-select>div]:!text-black [&_.MuiSvgIcon-root]:!text-black':
												!mapTypeArray.includes(mapTypeCode.hotspots),
										},
									)}
									options={hotspotOptions}
									multipleSelected={selectedHotspots}
									onChange={handleChangeMapTypeArray}
									fixedRenderValue={item.label[language]}
									optionsClassName='[&_p]:!text-xs [&_.MuiSvgIcon-root]:w-4 [&_.MuiSvgIcon-root]:h-4 [&_.MuiList-root]:!p-0'
								/>
							)
						} else {
							return (
								<button
									key={item.code}
									className={classNames(
										'h-[38px] !truncate !rounded-[5px] !px-4 !py-2.5 !text-xs !font-normal !shadow-none max-md:w-full',
										{ '!bg-[#EBF5FF] !text-primary': mapTypeArray.includes(item.code) },
										{ '!bg-white !text-black': !mapTypeArray.includes(item.code) },
									)}
									name={item.code}
									onClick={handleChangeMapTypeArray}
								>
									{item.label[language]}
								</button>
							)
						}
					})}

					<DateRangePickerMain
						responsiveType='desktop'
						selectedDateRange={selectedDateRange}
						onSelectedDateRange={onSelectedDateRange}
						burnAreaCalendarData={burnAreaCalendarData?.data || []}
						isBurnAreaCalendarDataLoading={isBurnAreaCalendarDataLoading}
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default BurntSearchFormMain
