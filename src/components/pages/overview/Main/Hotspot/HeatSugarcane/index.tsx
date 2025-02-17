import { Typography } from '@mui/material'
import { GetHeatPointsSugarcaneOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { useTranslation } from 'next-i18next'
import LinearProgressBar from '../../../Chart/LinearProgressBar'
import { Languages } from '@/enum'
import * as _ from 'lodash'
import { defaultNumber } from '@/utils/text'
import classNames from 'classnames'
import { regionColor } from '@interface/config/app.config'

const HotSpotHeatSugarcaneMain = ({
	heatPointSugarcaneData,
}: {
	heatPointSugarcaneData: GetHeatPointsSugarcaneOverviewDtoOut[] | undefined
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])

	return (
		<div className='flex w-full flex-col gap-4 xl:ml-4'>
			<Typography className='text-primary'>{t('hotspotInArea')}</Typography>
			<div className='flex flex-col gap-3'>
				{heatPointSugarcaneData &&
					heatPointSugarcaneData.map((item, index) => (
						<div key={item.regionId} className='flex flex-col'>
							<div className='flex items-center justify-between text-black'>
								<Typography className='!text-xs'>
									{`${
										item[
											`${_.camelCase(`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetHeatPointsSugarcaneOverviewDtoOut
										]
									} (${(
										item[
											`${_.camelCase(`provinces-${i18n.language === Languages.TH ? '' : i18n.language}`)}` as keyof GetHeatPointsSugarcaneOverviewDtoOut
										] as string[]
									).join(',')})`}
								</Typography>
								<Typography className='!text-sm'>{`${t('common:total')} ${defaultNumber(item.regionCount)} ${t('common:point')}`}</Typography>
							</div>
							<LinearProgressBar
								value={Math.max((item.inSugarcane * 100) / item.regionCount, 7)}
								color={regionColor[item.regionId as keyof typeof regionColor].color}
								fontColor={index > 1 ? 'white' : 'black'}
								contentInner={item.inSugarcane}
								contentOuter={item.inSugarcane === item.regionCount ? '' : item.notInSugarcane}
							/>
						</div>
					))}
			</div>
		</div>
	)
}

export default HotSpotHeatSugarcaneMain
