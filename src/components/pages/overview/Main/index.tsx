import FilterSelect from '@/components/common/select/FilterSelect'
import { CircularProgress, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useMemo, useState } from 'react'
import InfoTooltip from '../Tooltip/InfoTooltip'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import * as _ from 'lodash'
import OverviewSummaryMain from './Summary'
import OverviewHotSpotMain from './Hotspot'
import OverviewBurntScarMain from './BurntScar'
import OverviewPlantMain from './Plant'
import OverviewProductMain from './Product'
import OverviewProductPredictMain from './ProductPredict'
import OverviewReplantMain from './Replant'
import { Languages } from '@/enum'

interface OverviewMainProps {
	className?: string
}

export const OverviewMain: React.FC<OverviewMainProps> = ({ className = '' }) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const [year, setYear] = useState('')
	const [productPredictYear, setProductPredictYear] = useState('')

	const { data: yearProductionLookupData, isLoading: isYearProductionDataLoading } = useQuery({
		queryKey: ['yearProductionLookupData'],
		queryFn: async () => {
			const response = await service.lookup.get({ name: 'year_production', sort: 'id', order: 'ASC' })
			setYear(String(response[response.length - 1].id))
			return response
		},
	})

	const { data: summaryData, isLoading: isSummaryDataLoading } = useQuery({
		queryKey: ['summaryData', year],
		queryFn: () => service.overview.getSummaryOverview({ id: year }),
		enabled: !!year,
	})

	const { data: heatPointsData, isLoading: isHeatPointsDataLoading } = useQuery({
		queryKey: ['heatPointsData', year],
		queryFn: () => service.overview.getHeatPointsOverview({ id: year }),
		enabled: !!year,
	})

	const { data: heatPointsSugarcaneData, isLoading: isHeatPointsSugarcaneDataLoading } = useQuery({
		queryKey: ['heatPointsSugarcaneData', year],
		queryFn: () => service.overview.getHeatPointsSugarcaneOverview({ id: year }),
		enabled: !!year,
	})

	const { data: BurntData, isLoading: isBurntDataLoading } = useQuery({
		queryKey: ['BurntData', year],
		queryFn: () => service.overview.getBurntOverview({ id: year }),
		enabled: !!year,
	})

	const { data: plantData, isLoading: isPlantDataLoading } = useQuery({
		queryKey: ['plantData', year],
		queryFn: () => service.overview.getPlantOverview({ id: year }),
		enabled: !!year,
	})

	const { data: productData, isLoading: isProductDataLoading } = useQuery({
		queryKey: ['productData', year],
		queryFn: () => service.overview.getProductOverview({ id: year }),
		enabled: !!year,
	})

	const { data: productPredictData, isLoading: isProductPredictDataLoading } = useQuery({
		queryKey: ['productPredictData', year, productPredictYear],
		queryFn: () =>
			service.overview.getProductPredictOverview({ id: productPredictYear ? productPredictYear : year }),
		enabled: !!year,
	})

	const handleSetProductPredictYear = (action: 'back' | 'forward') => {
		if (action === 'back') {
			setProductPredictYear((productPredictYear) =>
				productPredictYear ? String(Number(productPredictYear) - 1) : String(Number(year) - 1),
			)
		} else if (action === 'forward') {
			setProductPredictYear((productPredictYear) =>
				productPredictYear ? String(Number(productPredictYear) + 1) : String(Number(year) + 1),
			)
		}
	}

	const yearLookupData = useMemo(() => {
		return (
			yearProductionLookupData?.map((item: any) => ({
				id: item.id,
				name: item[`${_.camelCase(`name-${i18n.language === Languages.TH ? '' : i18n.language}`)}`],
			})) ?? []
		)
	}, [i18n.language, yearProductionLookupData])

	const isDisabledBackproductPredict = useMemo(() => {
		if ((productPredictYear ? productPredictYear : year) && productPredictData) {
			return Number(productPredictYear ? productPredictYear : year) === yearProductionLookupData[0].id
		} else {
			return false
		}
	}, [productPredictData, productPredictYear, year, yearProductionLookupData])

	const isDisabledForwardproductPredict = useMemo(() => {
		if ((productPredictYear ? productPredictYear : year) && productPredictData) {
			return (
				Number(productPredictYear ? productPredictYear : year) ===
				yearProductionLookupData[yearProductionLookupData.length - 1].id
			)
		} else {
			return false
		}
	}, [productPredictData, productPredictYear, year, yearProductionLookupData])

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
							data={yearLookupData}
							disabled={isYearProductionDataLoading}
							onChange={(event) => {
								setProductPredictYear('')
								setYear(event.target.value)
							}}
						/>
					</div>
				</div>
				{(isYearProductionDataLoading ||
					isSummaryDataLoading ||
					isHeatPointsDataLoading ||
					isHeatPointsSugarcaneDataLoading ||
					isBurntDataLoading ||
					isPlantDataLoading ||
					isProductDataLoading ||
					isProductPredictDataLoading) &&
				!productPredictYear ? (
					<div className='flex h-full w-full items-center justify-center'>
						<CircularProgress size={80} />
					</div>
				) : (
					<>
						<OverviewSummaryMain summaryData={summaryData?.data} />

						<div className='flex w-full flex-col items-center gap-6 lg:max-h-[245px] lg:flex-row lg:gap-4'>
							<OverviewHotSpotMain
								heatPointsData={heatPointsData?.data}
								heatPointSugarcaneData={heatPointsSugarcaneData?.data}
							/>
							<OverviewBurntScarMain burntData={BurntData?.data} />
						</div>

						<div className='flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4'>
							<OverviewPlantMain plantData={plantData?.data} />
							<OverviewProductMain productData={productData?.data} />
							<OverviewProductPredictMain
								productPredictData={productPredictData?.data}
								isProductPredictDataLoading={isProductPredictDataLoading}
								handleSetProductPredictYear={handleSetProductPredictYear}
								isDisabledBack={isDisabledBackproductPredict}
								isDisabledForward={isDisabledForwardproductPredict}
							/>
							<OverviewReplantMain replantData={undefined} />
						</div>
					</>
				)}
			</div>
		</div>
	)
}
