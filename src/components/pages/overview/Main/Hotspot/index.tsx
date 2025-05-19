import { Divider } from '@mui/material'
import classNames from 'classnames'
import {
	GetHeatPointsOverviewDtoOut,
	GetHeatPointsSugarcaneOverviewDtoOut,
} from '@interface/dto/overview/overview.dto-out'
import HotSpotHeatSugarcaneMain from './HeatSugarcane'
import HotSpotHeatMain from './Heat'

const OverviewHotSpotMain = ({
	heatPointsData,
	heatPointSugarcaneData,
	className,
}: {
	heatPointsData: GetHeatPointsOverviewDtoOut[] | undefined
	heatPointSugarcaneData: GetHeatPointsSugarcaneOverviewDtoOut[] | undefined
	className?: string
}) => {
	return (
		<div
			className={classNames(
				'flex h-full w-full flex-col items-start rounded-[10px] bg-white p-4 shadow max-xl:gap-6 xl:flex-row',
				className,
			)}
		>
			<HotSpotHeatMain heatPointsData={heatPointsData} />
			<Divider orientation='vertical' className='max-xl:hidden' />
			<HotSpotHeatSugarcaneMain heatPointSugarcaneData={heatPointSugarcaneData} />
		</div>
	)
}

export default OverviewHotSpotMain
