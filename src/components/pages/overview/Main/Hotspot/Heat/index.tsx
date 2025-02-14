import { Typography } from '@mui/material'
import DonutChart from '../../../Chart/DonutChart'
import InfoTooltip from '../../../Tooltip/InfoTooltip'
import { GetHeatPointsOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { useTranslation } from 'next-i18next'
import { useMemo } from 'react'
import * as _ from 'lodash'
import { Languages } from '@/enum'
import { regionColor } from '@interface/config/app.config'

const HotSpotHeatMain = ({ heatPointsData }: { heatPointsData: GetHeatPointsOverviewDtoOut[] | undefined }) => {
	const { t, i18n } = useTranslation(['overview', 'common'])

	const columns = useMemo(() => {
		return heatPointsData?.map((item) => [
			item[
				`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetHeatPointsOverviewDtoOut
			],
			item.regionCount,
		])
	}, [heatPointsData, i18n.language])

	const colors = useMemo(() => {
		return heatPointsData?.reduce(
			(acc, item) => {
				acc[
					item[
						`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetHeatPointsOverviewDtoOut
					] as string
				] = regionColor[item.regionId as keyof typeof regionColor].color
				return acc
			},
			{} as {
				[key: string]: any
			},
		)
	}, [heatPointsData, i18n.language])

	return (
		heatPointsData &&
		columns &&
		colors && (
			<div className='flex w-full flex-col gap-4 lg:mr-4'>
				<div className='flex w-full items-center justify-between'>
					<Typography className='text-primary'>{t('totalHotspot')}</Typography>
					<InfoTooltip title={t('totalHotspot')} color='#a7a7a7' placement='bottom' />
				</div>
				<DonutChart columns={columns} colors={colors} width={170} height={170} />
			</div>
		)
	)
}

export default HotSpotHeatMain
