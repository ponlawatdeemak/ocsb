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

import UsageCount from '../UsageCount'

const PRODUCT_PREDICT_LEGEND_LENGTH = 4
const REPLANT_LEGEND_LENGTH = 3

interface OverviewMainProps {
	className?: string
}

export const OverviewMain: React.FC<OverviewMainProps> = ({ className = '' }) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const [year, setYear] = useState('')
	const [productPredictYear, setProductPredictYear] = useState('')
	const [replantYear, setReplantYear] = useState('')

	const { data: yearProductionLookupData, isLoading: isYearProductionDataLoading } = useQuery({
		queryKey: ['yearProductionLookupData'],
		queryFn: async () => {
			const response = await service.lookup.get({ name: 'year_production', sort: 'id', order: 'ASC' })
			setYear(String(response[response.length - 1].id))
			setProductPredictYear(String(response[response.length - 1].id))
			setReplantYear(String(response[response.length - 1].id))
			return response
		},
	})

	const { data: summaryData, isPending: isSummaryDataLoading } = useQuery({
		queryKey: ['summaryData', year],
		queryFn: () => service.overview.getSummaryOverview({ id: year }),
		enabled: !!year,
	})

	const { data: heatPointsData, isPending: isHeatPointsDataLoading } = useQuery({
		queryKey: ['heatPointsData', year],
		queryFn: () => service.overview.getHeatPointsOverview({ id: year }),
		enabled: !!year,
	})

	const { data: heatPointsSugarcaneData, isPending: isHeatPointsSugarcaneDataLoading } = useQuery({
		queryKey: ['heatPointsSugarcaneData', year],
		queryFn: () => service.overview.getHeatPointsSugarcaneOverview({ id: year }),
		enabled: !!year,
	})

	const { data: BurntData, isPending: isBurntDataLoading } = useQuery({
		queryKey: ['BurntData', year],
		queryFn: () => service.overview.getBurntOverview({ id: year }),
		enabled: !!year,
	})

	const { data: plantData, isPending: isPlantDataLoading } = useQuery({
		queryKey: ['plantData', year],
		queryFn: () => service.overview.getPlantOverview({ id: year }),
		enabled: !!year,
	})

	const { data: productData, isPending: isProductDataLoading } = useQuery({
		queryKey: ['productData', year],
		queryFn: () => service.overview.getProductOverview({ id: year }),
		enabled: !!year,
	})

	const { data: productPredictData, isPending: isProductPredictDataLoading } = useQuery({
		queryKey: ['productPredictData', productPredictYear],
		queryFn: () => service.overview.getProductPredictOverview({ id: productPredictYear }),
		enabled: !!productPredictYear,
	})

	const { data: replantData, isPending: isReplantDataLoading } = useQuery({
		queryKey: ['replantData', replantYear],
		queryFn: () => service.overview.getReplantOverview({ id: replantYear }),
		enabled: !!replantYear,
	})

	const yearLookupData = useMemo(() => {
		return (
			yearProductionLookupData?.map((item: any) => ({
				id: item.id,
				name: item[_.camelCase(`name-${i18n.language === Languages.TH ? '' : i18n.language}`)],
			})) ?? []
		)
	}, [i18n.language, yearProductionLookupData])

	const handleSetProductPredictYear = (action: 'back' | 'forward') => {
		if (action === 'back') {
			setProductPredictYear((productPredictYear) => String(Number(productPredictYear) - 1))
		} else if (action === 'forward') {
			setProductPredictYear((productPredictYear) => String(Number(productPredictYear) + 1))
		}
	}

	const isDisabledBackProductPredict = useMemo(() => {
		if (productPredictYear && productPredictData) {
			return Number(productPredictYear) <= PRODUCT_PREDICT_LEGEND_LENGTH
		} else {
			return true
		}
	}, [productPredictData, productPredictYear])

	const isDisabledForwardProductPredict = useMemo(() => {
		if (productPredictYear && productPredictData) {
			return Number(productPredictYear) === yearProductionLookupData[yearProductionLookupData.length - 1].id
		} else {
			return true
		}
	}, [productPredictData, productPredictYear, yearProductionLookupData])

	const handleSetReplantYear = (action: 'back' | 'forward') => {
		if (action === 'back') {
			setReplantYear((replantYear) => String(Number(replantYear) - 1))
		} else if (action === 'forward') {
			setReplantYear((replantYear) => String(Number(replantYear) + 1))
		}
	}

	const isDisabledBackReplant = useMemo(() => {
		if (replantYear && replantData) {
			return Number(replantYear) <= REPLANT_LEGEND_LENGTH
		} else {
			return false
		}
	}, [replantData, replantYear])

	const isDisabledForwardReplant = useMemo(() => {
		if (replantYear && replantData) {
			return Number(replantYear) === yearProductionLookupData[yearProductionLookupData.length - 1].id
		} else {
			return false
		}
	}, [replantData, replantYear, yearProductionLookupData])

	return (
		<div className={classNames('relative flex h-auto w-full flex-1 flex-col p-6 xl:px-6 xl:py-3', className)}>
			<div className='absolute left-0 top-0 z-0 h-[750px] w-full bg-primary xl:h-[300px]'></div>
			<div className='z-10 flex h-full w-full flex-1 flex-col gap-6 text-white xl:gap-4'>
				<div className='flex w-full flex-col justify-between gap-6 xl:flex-row xl:items-center'>
					<div className='flex items-center gap-[6px]'>
						<Typography className='!text-md'>{t('productOverview')}</Typography>
						<InfoTooltip title={t('titleInfo')} />
					</div>
					<div className='flex flex-col gap-[6px] xl:flex-row xl:items-center xl:gap-[16px]'>
						<Typography className='text-nowrap !text-xs'>{t('productYear')}</Typography>
						<FilterSelect
							className='xl:[&>.MuiInputBase-root]:min-w-[206px]'
							id='year'
							value={year}
							data={yearLookupData}
							disabled={isYearProductionDataLoading}
							onChange={(event) => {
								setProductPredictYear(event.target.value)
								setReplantYear(event.target.value)
								setYear(event.target.value)
							}}
						/>
					</div>
				</div>
				{isYearProductionDataLoading ||
				isSummaryDataLoading ||
				isHeatPointsDataLoading ||
				isHeatPointsSugarcaneDataLoading ||
				isBurntDataLoading ||
				isPlantDataLoading ||
				isProductDataLoading ? (
					<div className='flex h-full w-full items-center justify-center'>
						<CircularProgress size={80} />
					</div>
				) : (
					<>
						<OverviewSummaryMain summaryData={summaryData?.data} />

						<div className='flex w-full flex-col items-center gap-6 xl:max-h-[245px] xl:flex-row xl:gap-4'>
							<OverviewHotSpotMain
								heatPointsData={heatPointsData?.data}
								heatPointSugarcaneData={heatPointsSugarcaneData?.data}
							/>
							<OverviewBurntScarMain burntData={BurntData?.data} />
						</div>

						<div className='flex w-full flex-col items-center gap-6 xl:flex-row xl:gap-4'>
							<div className='flex w-full flex-col items-center gap-6 lg:flex-row xl:h-full xl:flex-[1] xl:gap-4'>
								<OverviewPlantMain plantData={plantData?.data} />
								<OverviewProductMain productData={productData?.data} />
							</div>
							<div className='flex w-full flex-col items-center gap-6 xl:h-full xl:flex-[2] xl:flex-row xl:gap-4'>
								<OverviewProductPredictMain
									productPredictData={productPredictData?.data}
									isProductPredictDataLoading={isProductPredictDataLoading}
									handleSetProductPredictYear={handleSetProductPredictYear}
									isDisabledBack={isDisabledBackProductPredict}
									isDisabledForward={isDisabledForwardProductPredict}
								/>
								<OverviewReplantMain
									replantData={replantData?.data}
									isReplantDataLoading={isReplantDataLoading}
									handleSetReplantYear={handleSetReplantYear}
									isDisabledBack={isDisabledBackReplant}
									isDisabledForward={isDisabledForwardReplant}
								/>
							</div>
						</div>
					</>
				)}
				<UsageCount />
			</div>
		</div>
	)
}
