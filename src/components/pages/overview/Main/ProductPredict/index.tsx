import { ArrowBackIcon, ArrowForwardIcon } from '@/components/svg/MenuIcon'
import { GetProductPredictOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography, IconButton } from '@mui/material'
import { useTranslation } from 'next-i18next'
import StackedAreaChart from '../../Chart/StackedAreaChart'
import classNames from 'classnames'

const OverviewProductPredictMain = ({
	productPredictData,
	className,
}: {
	productPredictData: GetProductPredictOverviewDtoOut | undefined
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
				<Typography className='text-primary'>{t('sugarCanePredict')}</Typography>
				<div className='flex items-center gap-4'>
					<IconButton className='!p-0'>
						<ArrowBackIcon />
					</IconButton>
					<IconButton className='!p-0'>
						<ArrowForwardIcon fill='#000000' />
					</IconButton>
				</div>
			</div>
			<StackedAreaChart
				legendId='StackedAreaOverview'
				columns={[
					['x', 'test1', 'test2', 'test3', 'test4'],
					['data1', 30, 35, 30, 0],
					['data2', 13, 10, 14, 20],
					['data3', 30, 10, 14, 20],
					['data4', 10, 10, 10, 20],
				]}
				groups={[['data1', 'data2', 'data3', 'data4']]}
				colors={{ data1: '#6CE5E8', data2: '#41B8D5', data3: '#2D8BBA', data4: '#2F5F98' }}
			/>
		</div>
	)
}

export default OverviewProductPredictMain
