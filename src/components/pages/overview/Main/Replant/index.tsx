import { ArrowBackIcon, ArrowForwardIcon } from '@/components/svg/MenuIcon'
import { GetReplantOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography, IconButton } from '@mui/material'
import { useTranslation } from 'next-i18next'
import BarChart from '../../Chart/BarChart'
import classNames from 'classnames'

const OverviewReplantMain = ({
	replantData,
	className,
}: {
	replantData: GetReplantOverviewDtoOut | undefined
	className?: string
}) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-6 rounded-[10px] bg-white p-4 shadow max-lg:w-full lg:flex-[2]',
				className,
			)}
		>
			<div className='flex w-full items-center justify-between'>
				<Typography className='text-primary'>{t('threeYearPlant')}</Typography>
				<div className='flex items-center gap-4'>
					<IconButton className='!p-0'>
						<ArrowBackIcon />
					</IconButton>
					<IconButton className='!p-0'>
						<ArrowForwardIcon fill='#000000' />
					</IconButton>
				</div>
			</div>
			<BarChart
				legendId='BarOverview'
				columns={[
					['x', 'test1', 'test2', 'test3', 'test4'],
					['data1', 30, 35, 30, null],
					['data2', 13, 10, 14, 20],
					['data3', 30, 10, 14, 20],
				]}
				colors={{ data1: '#C5E71E', data2: '#34A9A0', data3: '#2F5F98' }}
			/>
		</div>
	)
}

export default OverviewReplantMain
