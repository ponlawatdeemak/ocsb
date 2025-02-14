import {
	GetPlantOverviewAreaPercent,
	GetPlantOverviewDtoOut,
	GetPlantOverviewRegionArea,
} from '@interface/dto/overview/overview.dto-out'
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import LinearProgressBar from '../../Chart/LinearProgressBar'
import InfoTooltip from '../../Tooltip/InfoTooltip'
import classNames from 'classnames'
import { Languages } from '@/enum'
import * as _ from 'lodash'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'

const OverviewPlantMain = ({
	plantData,
	className,
}: {
	plantData: GetPlantOverviewDtoOut | undefined
	className?: string
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { areaUnit } = useAreaUnit()

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 shadow max-lg:w-full lg:flex-[1]',
				className,
			)}
		>
			<div className='flex w-full items-center justify-between'>
				<Typography>{`${t('SugarCaneArea')} (${t(`common:${areaUnit}`)})`}</Typography>
				<InfoTooltip title={t('SugarCaneArea')} placement='bottom' />
			</div>
			<div className='flex flex-col gap-3'>
				{plantData &&
					plantData.regionArea.map((item) => {
						return (
							<div key={item.regionId} className='flex flex-col'>
								<div className='flex items-center justify-between'>
									<Typography className='!text-xs'>
										{
											item[
												`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetPlantOverviewRegionArea
											] as string
										}
									</Typography>
									<Typography className='!text-sm'>{defaultNumber(item.area[areaUnit])}</Typography>
								</div>
								<LinearProgressBar
									value={
										item.areaPercent[
											`${_.camelCase(`${areaUnit}-percent`)}` as keyof GetPlantOverviewAreaPercent
										]
									}
									color='#40C4FF'
								/>
							</div>
						)
					})}
			</div>
		</div>
	)
}

export default OverviewPlantMain
