import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { defaultNumber } from '@/utils/text'
import { GetSummaryOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'

const OverviewSummaryMain = ({
	summaryData,
	className,
}: {
	summaryData: GetSummaryOverviewDtoOut | undefined
	className?: string
}) => {
	const { t } = useTranslation(['overview', 'common'])
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()

	return (
		<div
			className={classNames(
				'flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4 [&>div>p]:!text-md [&>div]:flex [&>div]:h-full [&>div]:w-full [&>div]:items-center [&>div]:justify-between [&>div]:gap-4 [&>div]:rounded-[10px] [&>div]:p-6 [&>div]:text-center',
				className,
			)}
		>
			<div className='bg-gradient-to-r from-[#F94187_0%] to-[#BB53A6_100%]'>
				<Typography>{t('totalHotspot')}</Typography>
				<Typography>{`${defaultNumber(summaryData?.hotspot ?? '-', 0)} ${t('common:point')}`}</Typography>
			</div>
			<div className='bg-gradient-to-r from-[#875FBA_0%] to-[#5C4ABD_100%]'>
				<Typography>{t('burntScarArea')}</Typography>
				<Typography>{`${defaultNumber(summaryData?.burnArea[areaUnit] ?? '-', 0)} ${t(`common:${areaUnit}`)}`}</Typography>
			</div>
			<div className='bg-gradient-to-r from-[#FAB725_0%] to-[#F67F54_100%]'>
				<Typography>{t('SugarCaneArea')}</Typography>
				<Typography>{`${defaultNumber(summaryData?.yieldPred[areaUnit] ?? '-', 0)} ${t(`common:${areaUnit}`)}`}</Typography>
			</div>
			<div className='bg-gradient-to-r from-[#89E2E6_0%] to-[#488AB6_100%]'>
				<Typography>{t('SugarCaneQuantity')}</Typography>
				<Typography>{`${defaultNumber(summaryData?.sugarcaneVolume[quantityUnit] ?? '-', 0)} ${t(`common:${quantityUnit}`)}`}</Typography>
			</div>
		</div>
	)
}

export default OverviewSummaryMain
