import FilterSelect from '@/components/common/select/FilterSelect'
import { Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useState } from 'react'
import InfoTooltip from '../Tooltip/InfoTooltip'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import OverviewSummaryMain from './Summary'
import OverviewHotSpotMain from './Hotspot'
import OverviewBurntScarMain from './BurntScar'
import OverviewPlantMain from './Plant'
import OverviewProductMain from './Product'
import OverviewProductPredictMain from './ProductPredict'
import OverviewReplantMain from './Replant'

interface OverviewMainProps {
	className?: string
}

export const OverviewMain: React.FC<OverviewMainProps> = ({ className = '' }) => {
	const { t } = useTranslation(['overview', 'common'])
	const [year, setYear] = useState('')

	const { data: yearProductionLookupData, isLoading: isYearProductionDataLoading } = useQuery({
		queryKey: ['yearProductionLookupData'],
		queryFn: async () => {
			const response = await service.lookup.get({ name: 'year_production', sort: 'id', order: 'ASC' })
			setYear(response[response.length - 1].id)
			return response
		},
	})

	return (
		<div className={classNames('relative flex h-auto w-full flex-1 flex-col p-6 lg:px-6 lg:py-3', className)}>
			<div className='absolute left-0 top-0 z-0 h-[750px] w-full bg-primary lg:h-[300px]'></div>
			<div className='z-10 flex h-full w-full flex-1 flex-col gap-6 text-white lg:gap-4'>
				<div className='flex w-full flex-col justify-between gap-6 lg:flex-row lg:items-center'>
					<div className='flex items-center gap-[6px]'>
						<Typography className='!text-md'>{t('productOverview')}</Typography>
						<InfoTooltip title={t('productOverview')} />
					</div>
					<div className='flex flex-col gap-[6px] lg:flex-row lg:items-center lg:gap-[16px]'>
						<Typography className='text-nowrap !text-xs'>{t('productYear')}</Typography>
						<FilterSelect
							className='lg:[&>.MuiInputBase-root]:min-w-[206px]'
							id='year'
							value={year}
							data={yearProductionLookupData ?? []}
							disabled={isYearProductionDataLoading}
							onChange={(event) => {
								setYear(event.target.value)
							}}
						/>
					</div>
				</div>

				<OverviewSummaryMain summaryData={undefined} />

				<div className='flex w-full flex-col items-center gap-6 lg:max-h-[245px] lg:flex-row lg:gap-4'>
					<OverviewHotSpotMain heatPointsData={undefined} heatPointSugarcaneData={undefined} />
					<OverviewBurntScarMain burntData={undefined} />
				</div>

				<div className='flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4'>
					<OverviewPlantMain plantData={undefined} />
					<OverviewProductMain productData={undefined} />
					<OverviewProductPredictMain productPredictData={undefined} />
					<OverviewReplantMain replantData={undefined} />
				</div>
			</div>
		</div>
	)
}
