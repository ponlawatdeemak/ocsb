import { ArrowBackIcon, ArrowForwardIcon } from '@/components/svg/MenuIcon'
import { _yearGetReplantOverviewDtoOut, GetReplantOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography, IconButton, CircularProgress } from '@mui/material'
import { useTranslation } from 'next-i18next'
import BarChart from '../../Chart/BarChart'
import classNames from 'classnames'
import { useMemo } from 'react'
import { Languages } from '@/enum'
import * as _ from 'lodash'
import useAreaUnit from '@/store/area-unit'
import { barColor } from '@interface/config/app.config'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import useResponsive from '@/hook/responsive'

const OverviewReplantMain = ({
	replantData,
	isReplantDataLoading,
	handleSetReplantYear,
	isDisabledBack = true,
	isDisabledForward = true,
	className,
}: {
	replantData: GetReplantOverviewDtoOut[] | undefined
	isReplantDataLoading: boolean
	handleSetReplantYear: (action: 'back' | 'forward') => void
	isDisabledBack: boolean
	isDisabledForward: boolean
	className?: string
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { areaUnit } = useAreaUnit()
	const { isDesktopXl } = useResponsive()

	const columns = useMemo(() => {
		const label = ['x']
		replantData?.forEach((item) => {
			label.push(i18n.language === Languages.TH ? item.regionName : item.regionNameEn)
		})

		const result: [string, number][] = []

		replantData?.forEach((region) => {
			region.years.forEach((yearData) => {
				const existingYearIndex = result.findIndex(
					(entry) =>
						entry[0] ===
						yearData[
							`${_.camelCase(`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof _yearGetReplantOverviewDtoOut
						],
				)

				if (existingYearIndex === -1) {
					result.push([
						yearData[
							`${_.camelCase(`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof _yearGetReplantOverviewDtoOut
						] as string,
						yearData.area[areaUnit],
					])
				} else {
					result[existingYearIndex].push(yearData.area[areaUnit])
				}
			})
		})

		return [label, ...result]
	}, [areaUnit, i18n.language, replantData])

	const colors = useMemo(() => {
		return replantData?.[0].years.reduce(
			(acc, item, index) => {
				acc[
					item[
						`${_.camelCase(`yearName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof _yearGetReplantOverviewDtoOut
					] as string
				] = barColor[index as keyof typeof barColor].color
				return acc
			},
			{} as {
				[key: string]: any
			},
		)
	}, [i18n.language, replantData])

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-6 rounded-[10px] bg-white p-4 shadow max-xl:min-h-[400px] max-xl:w-full xl:flex-[2]',
				{ '!gap-12': !isDesktopXl },
				className,
			)}
		>
			<div className='flex w-full items-center justify-between'>
				<Typography className='text-primary'>{t('threeYearPlant')}</Typography>
				<div className='flex items-center gap-4'>
					<IconButton
						className='!p-0'
						onClick={() => {
							handleSetReplantYear('back')
						}}
						disabled={isDisabledBack || isReplantDataLoading}
					>
						<ArrowBackIcon fill={isDisabledBack || isReplantDataLoading ? '#A7AFB9' : '#000000'} />
					</IconButton>
					<IconButton
						className='!p-0'
						onClick={() => {
							handleSetReplantYear('forward')
						}}
						disabled={isDisabledForward || isReplantDataLoading}
					>
						<ArrowForwardIcon fill={isDisabledForward || isReplantDataLoading ? '#A7AFB9' : '#000000'} />
					</IconButton>
				</div>
			</div>
			{isReplantDataLoading ? (
				<div className='flex h-full w-full items-center justify-center'>
					<CircularProgress />
				</div>
			) : replantData?.length && columns && colors ? (
				<BarChart legendId='BarOverview' columns={columns} colors={colors} />
			) : (
				<div className='flex h-full w-full items-center justify-center xl:h-[170px] xl:flex-1'>
					<NoDataDisplay />
				</div>
			)}
		</div>
	)
}

export default OverviewReplantMain
