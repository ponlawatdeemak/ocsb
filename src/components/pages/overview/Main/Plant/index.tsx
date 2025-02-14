import { GetPlantOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import LinearProgressBar from '../../Chart/LinearProgressBar'
import InfoTooltip from '../../Tooltip/InfoTooltip'
import classNames from 'classnames'

const OverviewPlantMain = ({
	plantData,
	className,
}: {
	plantData: GetPlantOverviewDtoOut | undefined
	className?: string
}) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 shadow max-lg:w-full lg:flex-[1]',
				className,
			)}
		>
			<div className='flex w-full items-center justify-between'>
				<Typography>{t('SugarCaneArea')}</Typography>
				<InfoTooltip title={t('SugarCaneArea')} placement='bottom' />
			</div>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test1</Typography>
						<Typography className='!text-sm'>120</Typography>
					</div>
					<LinearProgressBar value={20} color='#40C4FF' />
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test2</Typography>
						<Typography className='!text-sm'>80</Typography>
					</div>
					<LinearProgressBar value={20} color='#40C4FF' />
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test3</Typography>
						<Typography className='!text-sm'>10</Typography>
					</div>
					<LinearProgressBar value={20} color='#40C4FF' />
				</div>
				<div className='flex flex-col'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test4</Typography>
						<Typography className='!text-sm'>5</Typography>
					</div>
					<LinearProgressBar value={20} color='#40C4FF' />
				</div>
			</div>
		</div>
	)
}

export default OverviewPlantMain
