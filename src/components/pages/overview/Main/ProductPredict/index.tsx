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
import { useMemo } from 'react'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import * as _ from 'lodash'
import { regionColor, stackedAreaColor } from '@interface/config/app.config'

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

	// const columns = useMemo(() => {
	// 	const xLabel = ['x']
	// 	productPredictData?.forEach((item) => {
	// 		xLabel.push(i18n.language === Languages.TH ? item.regionName : item.regionNameEn)
	// 	})

	// 	const columnsData =
	// 		productPredictData?.map((item) => {
	// 			return [
	// 				item.years[
	// 					`${_.camelCase(`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof _RegionGetProductPredictOverviewDtoOut
	// 				],
	// 				...item.years.map((data) => {
	// 					return data.weight[quantityUnit]
	// 				}),
	// 			]
	// 		}) ??
	//         []

	// 	return [xLabel, ...columnsData]
	// }, [i18n.language, productPredictData, quantityUnit])

	const colors = useMemo(() => {
		return productPredictData?.reduce(
			(acc, item, index) => {
				acc[
					item[
						`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetProductPredictOverviewDtoOut
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
					`${_.camelCase(`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof _RegionGetProductPredictOverviewDtoOut
				]
			}) ?? []
		)
	}, [i18n.language, productPredictData])

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-6 rounded-[10px] bg-white p-4 shadow max-lg:w-full lg:flex-[2]',
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
						disabled={isDisabledBack}
					>
						<ArrowBackIcon fill={isDisabledBack ? '#A7AFB9' : '#000000'} />
					</IconButton>
					<IconButton
						className='!p-0'
						onClick={() => {
							handleSetProductPredictYear('forward')
						}}
						disabled={isDisabledForward}
					>
						<ArrowForwardIcon fill={isDisabledForward ? '#A7AFB9' : '#000000'} />
					</IconButton>
				</div>
			</div>
			{/* {isProductPredictDataLoading ? (
				<div className='flex h-full w-full items-center justify-center'>
					<CircularProgress />
				</div>
			) : (
				productPredictData &&
				// columns &&
				colors &&
				group && (
					<StackedAreaChart
						legendId='StackedAreaOverview'
						columns={
							[]
							// columns
						}
						groups={[group]}
						colors={colors}
					/>
				)
			)} */}
		</div>
	)
}

export default OverviewProductPredictMain
