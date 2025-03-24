import { GetPlantOverviewDtoOut, GetPlantOverviewRegionArea } from '@interface/dto/overview/overview.dto-out'
import { Divider, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import LinearProgressBar from '../../Chart/LinearProgressBar'
import InfoTooltip from '../../Tooltip/InfoTooltip'
import classNames from 'classnames'
import { Languages } from '@/enum'
import * as _ from 'lodash'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import useResponsive from '@/hook/responsive'

const OverviewPlantMain = ({
	plantData,
	className,
}: {
	plantData: GetPlantOverviewDtoOut | undefined
	className?: string
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { areaUnit } = useAreaUnit()
	const { isDesktopXl } = useResponsive()

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 shadow max-xl:w-full xl:flex-[1]',
				className,
			)}
		>
			<div className='flex w-full items-center justify-between'>
				<Typography>{`${t('sugarCaneArea')} (${t('common:' + areaUnit)})`}</Typography>
				<InfoTooltip
					title={
						<div className='flex w-full flex-col items-center gap-[6px]'>
							{`(${t('regionSugarCane')}*100)`}
							<Divider orientation='horizontal' className='w-full' /> {`${t('allRegionSugarCane')}`}
						</div>
					}
					placement='bottom'
				/>
			</div>
			<div className='flex flex-col gap-3'>
				{plantData ? (
					plantData.regionArea.map((item) => {
						return (
							<div key={item.regionId} className='flex flex-col'>
								<div className='flex items-center justify-between'>
									<Typography className='!text-xs'>
										{
											item[
												_.camelCase(
													`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`,
												) as keyof GetPlantOverviewRegionArea
											] as string
										}
									</Typography>
									<Typography className='!text-sm'>
										{defaultNumber(item.area[areaUnit], 0)}
									</Typography>
								</div>
								<LinearProgressBar
									value={Math.max(item.percent[areaUnit], isDesktopXl ? 11 : 6)}
									color='#40C4FF'
									fontColor='black'
									contentInner={`${item.percent[areaUnit]}%`}
									contentOuter={''}
								/>
							</div>
						)
					})
				) : (
					<div className='flex h-[170px] w-full items-center justify-center'>
						<NoDataDisplay />
					</div>
				)}
			</div>
		</div>
	)
}

export default OverviewPlantMain
