import service from '@/api'
import { SearchInputIcon } from '@/components/svg/AppIcon'
import { ResponseLanguage } from '@interface/config/app.config'
import { Clear } from '@mui/icons-material'
import { Autocomplete, FormControl, IconButton, Input, InputAdornment } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
import React, { ChangeEvent, useCallback, useMemo, useState } from 'react'
import { debounce } from 'lodash'
import classNames from 'classnames'
import { OptionType } from '@/components/pages/map-analyze/burnt-area/Main/SearchForm'

interface SearchAdminPolyProps {
	className?: string
	searchSelectedAdmOption: OptionType | null
	handleSelectedAdmOption: (value: OptionType | null) => void
}

const SearchAdminPoly: React.FC<SearchAdminPolyProps> = ({
	className = '',
	searchSelectedAdmOption,
	handleSelectedAdmOption,
}) => {
	const { t, i18n } = useTranslation(['common', 'map-analyze'])
	const language = i18n.language as keyof ResponseLanguage

	const [searchAdmInputValue, setSearchAdmInputValue] = useState<string>('')

	const { data: searchAdmData, isPending: isSearchAdmDataLoading } = useQuery({
		queryKey: ['getSearchAdminPoly', searchAdmInputValue],
		queryFn: () => service.lookup.getSearchAdm({ keyword: searchAdmInputValue }),
		enabled: !!searchAdmInputValue,
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

	return (
		<FormControl
			className={classNames(
				'md-[255px] w-full overflow-hidden !rounded-[5px] bg-white [&_::placeholder]:text-xs [&_input]:!text-xs [&_input]:!normal-case [&_input]:text-black',
				className,
			)}
		>
			<Autocomplete
				blurOnSelect
				options={optionAdmList}
				getOptionLabel={(option) => option.name[language]}
				isOptionEqualToValue={(option, value) => option.id === value.id}
				value={searchSelectedAdmOption}
				onInputChange={debounce(handleChangeAdmInput, 500)}
				onChange={handleSelectAdmOption}
				slotProps={{
					popper: { sx: { zIndex: 10000 } },
					paper: {
						className:
							'border mt-1 !shadow-none border-solid border-gray !rounded-[5px] [&_.MuiAutocomplete-noOptions]:!text-xs [&_.MuiAutocomplete-noOptions]:!p-4',
					},
				}}
				ListboxProps={{ className: '[&_>li]:!py-2 [&_>li]:!text-xs' }}
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
				noOptionsText={isSearchAdmDataLoading ? t('typing') : t('noData')}
			/>
		</FormControl>
	)
}

export default SearchAdminPoly
