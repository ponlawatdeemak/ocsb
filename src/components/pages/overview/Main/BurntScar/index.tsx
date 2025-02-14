import { regionColor } from '@interface/config/app.config'
import { GetBurntOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import SplineChart from '../../Chart/SplineChart'
import classNames from 'classnames'

const OverviewBurntScarMain = ({
	burntData,
	className,
}: {
	burntData: GetBurntOverviewDtoOut | undefined
	className?: string
}) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div
			className={classNames(
				'flex h-full w-full flex-col items-start gap-6 rounded-[10px] bg-white p-4 shadow',
				className,
			)}
		>
			<Typography className='text-primary'>{t('burntScar')}</Typography>
			<SplineChart
				legendId='splineOverview'
				columns={[
					['x', '1jan', '1feb', '1march', '1april'],
					['test1', 20, 30, 150, 1000],
					['test2', 1, 50, 400, 700],
					['test3', 4, 900, 500, 425],
					['test4', 3, 70, 60, 50],
				]}
				colors={{
					['test1']: regionColor[1].color,
					['test2']: regionColor[2].color,
					['test3']: regionColor[3].color,
					['test4']: regionColor[4].color,
				}}
			/>
		</div>
	)
}

export default OverviewBurntScarMain
