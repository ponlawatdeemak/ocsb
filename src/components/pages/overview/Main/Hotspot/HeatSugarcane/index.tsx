import { Typography } from '@mui/material'
import { GetHeatPointsSugarcaneOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { useTranslation } from 'next-i18next'
import LinearProgressBar from '../../../Chart/LinearProgressBar'
import { Languages } from '@/enum'
import * as _ from 'lodash'
import { defaultNumber } from '@/utils/text'
import { regionColor } from '@interface/config/app.config'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import useResponsive from '@/hook/responsive'

const HotSpotHeatSugarcaneMain = ({
	heatPointSugarcaneData,
}: {
	heatPointSugarcaneData: GetHeatPointsSugarcaneOverviewDtoOut[] | undefined
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { isDesktopXl } = useResponsive()

	return (
		<div className='flex w-full flex-col gap-4 xl:ml-4'>
			<Typography className='text-primary'>{t('hotspotInArea')}</Typography>
			<div className='flex flex-col gap-3'>
				{heatPointSugarcaneData?.length ? (
					heatPointSugarcaneData.map((item, index) => (
						<div key={item.regionId} className='flex flex-col'>
							<div className='flex items-center justify-between text-black'>
								<Typography className='truncate !text-xs'>
									{`${
										item[
											_.camelCase(
												`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`,
											) as keyof GetHeatPointsSugarcaneOverviewDtoOut
										]
									} (${(
										item[
											_.camelCase(
												`provinces-${i18n.language === Languages.TH ? '' : i18n.language}`,
											) as keyof GetHeatPointsSugarcaneOverviewDtoOut
										] as string[]
									).join(',')})`}
								</Typography>
								<Typography className='shrink-0 !text-sm'>{`${t('common:total')} ${defaultNumber(item.regionCount)} ${t('common:point')}`}</Typography>
							</div>
							<LinearProgressBar
								value={Math.max((item.inSugarcane * 100) / item.regionCount, isDesktopXl ? 7 : 6)}
								color={regionColor[item.regionId as keyof typeof regionColor].color}
								fontColor={index > 1 ? 'white' : 'black'}
								contentInner={item.inSugarcane}
								contentOuter={item.inSugarcane === item.regionCount ? '' : item.notInSugarcane}
								titleInner={t('hotspotInArea')}
								titleOuter={t('hotspotOutArea')}
							/>
						</div>
					))
				) : (
					<div className='flex h-[170px] w-full items-center justify-center'>
						<NoDataDisplay />
					</div>
				)}
			</div>
		</div>
	)
}

export default HotSpotHeatSugarcaneMain
