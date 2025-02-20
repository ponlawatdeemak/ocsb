import { ArrowBackIcon, ArrowForwardIcon } from '@/components/svg/MenuIcon'
import {
	_RegionGetProductPredictOverviewDtoOut,
	GetProductPredictOverviewDtoOut,
} from '@interface/dto/overview/overview.dto-out'
import { Typography, IconButton, CircularProgress } from '@mui/material'
import { useTranslation } from 'next-i18next'
import StackedAreaChart from '../../Chart/StackedAreaChart'
import classNames from 'classnames'
import { Languages } from '@/enum'
import { useCallback, useMemo } from 'react'
import useQuantityUnit from '@/store/quantity-unit'
import * as _ from 'lodash'
import { stackedAreaColor } from '@interface/config/app.config'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import useResponsive from '@/hook/responsive'

const OverviewProductPredictMain = ({
	productPredictData,
	isProductPredictDataLoading,
	handleSetProductPredictYear,
	isDisabledBack,
	isDisabledForward,
	className,
}: {
	productPredictData: GetProductPredictOverviewDtoOut[] | undefined
	isProductPredictDataLoading: boolean
	handleSetProductPredictYear: (action: 'back' | 'forward') => void
	isDisabledBack: boolean
	isDisabledForward: boolean
	className?: string
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { quantityUnit } = useQuantityUnit()
	const { isDesktopXl } = useResponsive()

	const checkYearIndex = useCallback(
		(result: [string, number][], yearData: _RegionGetProductPredictOverviewDtoOut) => {
			return result.findIndex(
				(entry) =>
					entry[0] ===
					yearData[
						_.camelCase(
							`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`,
						) as keyof _RegionGetProductPredictOverviewDtoOut
					],
			)
		},
		[i18n.language],
	)

	const columns = useMemo(() => {
		const label = ['x']
		productPredictData?.forEach((item) => {
			label.push(i18n.language === Languages.TH ? item.regionName : item.regionNameEn)
		})

		const result: [string, number][] = []

		productPredictData?.forEach((region) => {
			region.years.forEach((yearData) => {
				const existingYearIndex = checkYearIndex(result, yearData)

				if (existingYearIndex === -1) {
					result.push([
						yearData[
							_.camelCase(
								`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`,
							) as keyof _RegionGetProductPredictOverviewDtoOut
						] as string,
						yearData.weight[quantityUnit],
					])
				} else {
					result[existingYearIndex].push(yearData.weight[quantityUnit])
				}
			})
		})

		return [label, ...result]
	}, [i18n.language, productPredictData, quantityUnit, checkYearIndex])

	const colors = useMemo(() => {
		return productPredictData?.[0].years.reduce(
			(acc, item, index) => {
				acc[
					item[
						_.camelCase(
							`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`,
						) as keyof _RegionGetProductPredictOverviewDtoOut
					] as string
				] = stackedAreaColor[index as keyof typeof stackedAreaColor].color
				return acc
			},
			{} as {
				[key: string]: any
			},
		)
	}, [i18n.language, productPredictData])

	const group = useMemo(() => {
		return (
			productPredictData?.[0].years.map((item) => {
				return item[
					_.camelCase(
						`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`,
					) as keyof _RegionGetProductPredictOverviewDtoOut
				]
			}) ?? []
		)
	}, [i18n.language, productPredictData])

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-6 rounded-[10px] bg-white p-4 shadow max-xl:min-h-[400px] max-xl:w-full xl:flex-[2]',
				{ '!gap-12': !isDesktopXl },
				className,
			)}
		>
			<div className='flex w-full items-center justify-between'>
				<Typography className='text-primary'>{t('sugarCanePredict')}</Typography>
				<div className='flex items-center gap-4'>
					<IconButton
						className='!p-0'
						onClick={() => {
							handleSetProductPredictYear('back')
						}}
						disabled={isDisabledBack || isProductPredictDataLoading}
					>
						<ArrowBackIcon fill={isDisabledBack || isProductPredictDataLoading ? '#A7AFB9' : '#000000'} />
					</IconButton>
					<IconButton
						className='!p-0'
						onClick={() => {
							handleSetProductPredictYear('forward')
						}}
						disabled={isDisabledForward || isProductPredictDataLoading}
					>
						<ArrowForwardIcon
							fill={isDisabledForward || isProductPredictDataLoading ? '#A7AFB9' : '#000000'}
						/>
					</IconButton>
				</div>
			</div>
			{isProductPredictDataLoading ? (
				<div className='flex h-full w-full items-center justify-center'>
					<CircularProgress />
				</div>
			) : (
				<>
					{productPredictData?.length && columns && colors && group ? (
						<StackedAreaChart
							legendId='StackedAreaOverview'
							columns={columns}
							groups={[group]}
							colors={colors}
						/>
					) : (
						<div className='flex h-full w-full items-center justify-center xl:h-[170px] xl:flex-1'>
							<NoDataDisplay />
						</div>
					)}
				</>
			)}
		</div>
	)
}

export default OverviewProductPredictMain
