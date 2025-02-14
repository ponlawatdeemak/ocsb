import { Typography } from '@mui/material'
import DonutChart from '../../../Chart/DonutChart'
import InfoTooltip from '../../../Tooltip/InfoTooltip'
import { GetHeatPointsSugarcaneOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { useTranslation } from 'next-i18next'
import LinearProgressBar from '../../../Chart/LinearProgressBar'

const HotSpotHeatSugarcaneMain = ({
	heatPointSugarcaneData,
}: {
	heatPointSugarcaneData: GetHeatPointsSugarcaneOverviewDtoOut | undefined
}) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div className='flex w-full flex-col gap-4 lg:ml-4'>
			<Typography className='text-primary'>{t('hotspotInArea')}</Typography>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between text-black'>
						<Typography className='!text-xs'>test1</Typography>
						<Typography className='!text-sm'>120</Typography>
					</div>
					<LinearProgressBar value={20} color='#FBBF07' />
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between text-black'>
						<Typography className='!text-xs'>test2</Typography>
						<Typography className='!text-sm'>80</Typography>
					</div>
					<LinearProgressBar value={20} color='#D3655A' />
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between text-black'>
						<Typography className='!text-xs'>test3</Typography>
						<Typography className='!text-sm'>10</Typography>
					</div>
					<LinearProgressBar value={20} color='#AC3C5E' />
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between text-black'>
						<Typography className='!text-xs'>test4</Typography>
						<Typography className='!text-sm'>5</Typography>
					</div>
					<LinearProgressBar value={20} color='#440C53' />
				</div>
			</div>
		</div>
	)
}

export default HotSpotHeatSugarcaneMain
