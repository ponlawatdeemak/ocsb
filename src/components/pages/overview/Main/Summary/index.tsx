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

	return (
		<div
			className={classNames(
				'flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4 [&>div>p]:!text-md [&>div]:flex [&>div]:h-full [&>div]:w-full [&>div]:items-center [&>div]:justify-between [&>div]:gap-4 [&>div]:rounded-[10px] [&>div]:p-6 [&>div]:text-center',
				className,
			)}
		>
			<div className='bg-gray-400'>
				<Typography>{t('totalHotspot')}</Typography>
				<Typography>560 จุด</Typography>
			</div>
			<div className='bg-gray-400'>
				<Typography>{t('burntScarArea')}</Typography>
				<Typography>1,300 ไร่</Typography>
			</div>
			<div className='bg-gray-400'>
				<Typography>{t('SugarCaneArea')}</Typography>
				<Typography>13,000,000 ไร่</Typography>
			</div>
			<div className='bg-gray-400'>
				<Typography>{t('SugarCaneQuantity')}</Typography>
				<Typography>7,000,000 ตัน</Typography>
			</div>
		</div>
	)
}

export default OverviewSummaryMain
