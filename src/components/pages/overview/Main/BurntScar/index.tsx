import { regionColor } from '@interface/config/app.config'
import { GetBurntOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import SplineChart from '../../Chart/SplineChart'
import classNames from 'classnames'
import { useMemo } from 'react'
import * as _ from 'lodash'
import { Languages } from '@/enum'
import useAreaUnit from '@/store/area-unit'
import { formatDate } from '@/utils/date'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import useResponsive from '@/hook/responsive'

const OverviewBurntScarMain = ({
	burntData,
	className,
}: {
	burntData: GetBurntOverviewDtoOut[] | undefined
	className?: string
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { areaUnit } = useAreaUnit()
	const { isDesktopXl } = useResponsive()

	const columns = useMemo(() => {
		const xLabel = ['x']
		burntData?.[0].monthlyData.forEach((item) => {
			xLabel.push(formatDate(new Date(item.month), 'MMM yy', i18n.language))
		})

		const columnsData =
			burntData?.map((item) => {
				return [
					item[
						`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetBurntOverviewDtoOut
					],
					...item.monthlyData.map((data) => {
						return data.area[areaUnit]
					}),
				]
			}) ?? []

		return [xLabel, ...columnsData]
	}, [areaUnit, burntData, i18n.language])

	const colors = useMemo(() => {
		return burntData?.reduce(
			(acc, item) => {
				acc[
					item[
						`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetBurntOverviewDtoOut
					] as string
				] = regionColor[item.regionId as keyof typeof regionColor].color
				return acc
			},
			{} as {
				[key: string]: any
			},
		)
	}, [burntData, i18n.language])

	return (
		<div
			className={classNames(
				'flex h-full w-full flex-col items-start gap-6 rounded-[10px] bg-white p-4 shadow max-xl:min-h-[400px]',
				{ '!gap-12': !isDesktopXl },
				className,
			)}
		>
			<Typography className='text-primary'>{t('burntScar')}</Typography>
			{burntData?.length && columns && colors ? (
				<SplineChart legendId='splineOverview' columns={columns} colors={colors} />
			) : (
				<div className='flex h-full w-full items-center justify-center xl:h-[170px]'>
					<NoDataDisplay />
				</div>
			)}
		</div>
	)
}

export default OverviewBurntScarMain
