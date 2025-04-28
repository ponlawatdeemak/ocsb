import { plantingMapType, ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { Box, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import DateRangePickerMain from '@/components/shared/DateRangePicker'
import SearchAdminPoly from '@/components/shared/SearchAdminPoly'
import FilterSelect from '@/components/common/select/FilterSelect'
import { GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'

export interface OptionType {
	id: string
	name: ResponseLanguage
	geometry: any
}

interface PlantingSearchFormMainProps {
	className?: string
	handleChangeMapTypeArray: (event: React.MouseEvent<HTMLButtonElement>) => void
	mapTypeArray: yieldMapTypeCode[]
	selectedDateRange: Date[]
	onSelectedDateRange: (selectedDateRange: Date[]) => void
	searchSelectedAdmOption: OptionType | null
	handleSelectedAdmOption: (value: OptionType | null) => void
	selectedRepeatArea: GetRepeatAreaLookupDtoOut | undefined
	handleSelectedRepeatArea: (value: GetRepeatAreaLookupDtoOut | undefined) => void
}

const PlantingSearchFormMain: React.FC<PlantingSearchFormMainProps> = ({
	className = '',
	handleChangeMapTypeArray,
	mapTypeArray,
	selectedDateRange,
	onSelectedDateRange,
	searchSelectedAdmOption,
	handleSelectedAdmOption,
	selectedRepeatArea,
	handleSelectedRepeatArea,
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage

	const { data: repeatAreaData, isLoading: isRepeatAreaDataLoading } = useQuery({
		queryKey: ['getLookupRepeatArea'],
		queryFn: () => service.lookup.getRepeatArea(),
	})

	const repeatAreaOptions: any[] = useMemo(
		() => repeatAreaData?.map((item) => ({ id: item.id, name: item.name })) ?? [],
		[repeatAreaData],
	)

	return (
		<Box
			className={classNames(
				'flex flex-col gap-2 px-4 py-6 md:px-6 md:py-4 xl:flex-row xl:items-center xl:justify-between xl:gap-12',
				className,
			)}
		>
			<Typography className='whitespace-nowrap !text-md text-primary max-md:hidden'>
				{t('plantAreaAnalysis')}
			</Typography>
			<Box id='search-form' className='flex grow items-center gap-4 max-md:flex-col xl:justify-end'>
				<Box className='flex w-full items-center gap-4 md:w-[26%] md:min-w-[26%]'>
					<SearchAdminPoly
						searchSelectedAdmOption={searchSelectedAdmOption}
						handleSelectedAdmOption={handleSelectedAdmOption}
					/>

					<DateRangePickerMain
						responsiveType='mobile'
						selectedDateRange={selectedDateRange}
						onSelectedDateRange={onSelectedDateRange}
					/>
				</Box>

				<Box className='flex w-full items-center gap-4 md:w-fit md:min-w-0'>
					{plantingMapType.map((item) => {
						if (item.code === yieldMapTypeCode.repeat) {
							return (
								<FilterSelect
									id='sugarCaneYield'
									key={item.code}
									value={selectedRepeatArea?.id ?? ''}
									data={repeatAreaOptions}
									renderValue={() => (
										<Box className='flex-1 truncate !text-sm text-[#8E8E8E]'>
											{t('replantingArea')}
										</Box>
									)}
									onChange={(e) => {
										handleSelectedRepeatArea(
											repeatAreaOptions.find((item) => item.id === Number(e.target.value)) ??
												undefined,
										)
									}}
									onClick={(clickEvent) => {
										if ((clickEvent.target as HTMLOptionElement).selected === true) {
											handleSelectedRepeatArea(undefined)
										}
									}}
									className={classNames(
										'flex text-center max-md:!w-[115%] md:!w-[155%] md:!max-w-fit [&_.MuiInputBase-input>div]:!self-center [&_.MuiInputBase-input>div]:!text-xs [&_.MuiInputBase-input]:!flex [&_.MuiInputBase-input]:!pr-9 [&_fieldset]:!border-none',
										{
											'[&_.MuiInputBase-input>div]:!text-primary [&_.MuiInputBase-root]:!bg-[#EBF5FF]':
												selectedRepeatArea,
										},
										{
											'[&_.MuiInputBase-input>div]:!text-black': !selectedRepeatArea,
										},
									)}
									optionsClassName='[&_li]:!text-xs [&_.MuiList-root]:!p-0'
									optionUnit={t('common:year')}
									disabled={isRepeatAreaDataLoading}
								/>
							)
						} else {
							return (
								<button
									key={item.code}
									className={classNames(
										'h-[38px] !w-full !truncate !rounded-[5px] !px-4 !py-2.5 !text-xs !font-normal !shadow-none md:!max-w-fit',
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
					/>
				</Box>
			</Box>
		</Box>
	)
}

export default PlantingSearchFormMain
