import { Typography } from '@mui/material'
import DonutChart from '../../../Chart/DonutChart'
import InfoTooltip from '../../../Tooltip/InfoTooltip'
import { GetHeatPointsOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { useTranslation } from 'next-i18next'

const HotSpotHeatMain = ({ heatPointsData }: { heatPointsData: GetHeatPointsOverviewDtoOut | undefined }) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div className='flex w-full flex-col gap-4 lg:mr-4'>
			<div className='flex w-full items-center justify-between'>
				<Typography className='text-primary'>{t('totalHotspot')}</Typography>
				<InfoTooltip title={t('totalHotspot')} color='#a7a7a7' placement='bottom' />
			</div>
			<DonutChart
				columns={[
					['test1', 20],
					['test2', 40],
					['test3', 10],
					['test4', 30],
				]}
				colors={{
					['test1']: '#F9B936',
					['test2']: '#D3655A',
					['test3']: '#AC3C5E',
					['test4']: '#440C53',
				}}
				width={170}
				height={170}
			/>
		</div>
	)
}

export default HotSpotHeatMain
