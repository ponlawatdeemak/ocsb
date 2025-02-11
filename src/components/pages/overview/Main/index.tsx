import FilterSelect from '@/components/common/select/FilterSelect'
import { InfoIcon } from '@/components/svg/MenuIcon'
import { Divider, IconButton, Tooltip, TooltipProps, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import DonutChart from '../DonutChart'
import InfoTooltip from '../InfoTooltip'
import LinearProgressBar from '../LinearProgressBar'
import SplineChart from '../SplineChart'

interface OverviewMainProps {
	className?: string
}

export const OverviewMain: React.FC<OverviewMainProps> = ({ className = '' }) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div className={classNames('relative flex h-auto w-full flex-1 flex-col p-6 lg:px-6 lg:py-3', className)}>
			<div className='absolute left-0 top-0 z-0 h-[750px] w-full bg-primary lg:h-[300px]'></div>
			<div className='z-10 flex h-full w-full flex-1 flex-col gap-6 text-white lg:gap-4'>
				<div className='flex w-full flex-col justify-between gap-6 lg:flex-row lg:items-center'>
					<div className='flex items-center gap-[6px]'>
						<Typography className='!text-md'>{t('productOverview')}</Typography>
						<InfoTooltip title={t('productOverview')} />
					</div>
					<div className='flex flex-col gap-[6px] lg:flex-row lg:items-center lg:gap-[16px]'>
						<Typography className='text-nowrap !text-xs'>{t('productYear')}</Typography>
						<FilterSelect
							className='lg:[&>.MuiInputBase-root]:min-w-[206px]'
							id='year'
							value={[]}
							data={[]}
							onChange={() => {}}
						/>
					</div>
				</div>

				<div className='flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4 [&>div>p]:!text-md [&>div]:flex [&>div]:h-full [&>div]:w-full [&>div]:items-center [&>div]:justify-between [&>div]:gap-4 [&>div]:rounded-[10px] [&>div]:p-6 [&>div]:text-center'>
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

				<div className='flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4'>
					<div className='flex h-full w-full flex-col items-start rounded-[10px] bg-white p-4 shadow max-lg:gap-6 lg:flex-row'>
						<div className='flex w-full flex-col gap-4 lg:mr-4'>
							<div className='flex w-full items-center justify-between'>
								<Typography className='text-primary'>{t('totalHotspot')}</Typography>
								<InfoTooltip title={t('totalHotspot')} color='#a7a7a7' placement='bottom' />
							</div>
							<DonutChart
								columns={[
									['test1', 20],
									['test2', 40],
									['test3', 10],
									['test4', 30],
								]}
								colors={{
									['test1']: '#F9B936',
									['test2']: '#D3655A',
									['test3']: '#AC3C5E',
									['test4']: '#440C53',
								}}
								width={194}
								height={194}
							/>
						</div>
						<Divider orientation='vertical' className='max-lg:hidden' />
						<div className='flex w-full flex-col gap-4 lg:ml-4'>
							<Typography className='text-primary'>{t('hotspotInArea')}</Typography>
							<div className='flex flex-col gap-3'>
								<div className='flex flex-col'>
									<div className='flex items-center justify-between text-black'>
										<Typography className='!text-xs'>test1</Typography>
										<Typography className='!text-sm'>120</Typography>
									</div>
									<LinearProgressBar value={20} color='#FBBF07' />
								</div>
								<div className='flex flex-col'>
									<div className='flex items-center justify-between text-black'>
										<Typography className='!text-xs'>test2</Typography>
										<Typography className='!text-sm'>80</Typography>
									</div>
									<LinearProgressBar value={20} color='#D3655A' />
								</div>
								<div className='flex flex-col'>
									<div className='flex items-center justify-between text-black'>
										<Typography className='!text-xs'>test3</Typography>
										<Typography className='!text-sm'>10</Typography>
									</div>
									<LinearProgressBar value={20} color='#AC3C5E' />
								</div>
								<div className='flex flex-col'>
									<div className='flex items-center justify-between text-black'>
										<Typography className='!text-xs'>test4</Typography>
										<Typography className='!text-sm'>5</Typography>
									</div>
									<LinearProgressBar value={20} color='#440C53' />
								</div>
							</div>
						</div>
					</div>
					<div className='flex h-full w-full items-start gap-4 rounded-[10px] bg-white p-4 shadow'>
						<div className='flex h-full w-full flex-col'>
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
									['test1']: '#F9B936',
									['test2']: '#D3655A',
									['test3']: '#AC3C5E',
									['test4']: '#440C53',
								}}
							/>
						</div>
					</div>
				</div>

				<div className='flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4'>
					<div className='flex h-full justify-start rounded-[10px] bg-primary p-4 text-white shadow max-lg:w-full lg:flex-[1]'></div>
					<div className='flex h-full justify-start rounded-[10px] bg-primary p-4 text-white shadow max-lg:w-full lg:flex-[1]'></div>
					<div className='flex h-full justify-start rounded-[10px] bg-white p-4 shadow max-lg:w-full lg:flex-[2]'></div>
					<div className='flex h-full justify-start rounded-[10px] bg-white p-4 shadow max-lg:w-full lg:flex-[2]'></div>
				</div>
			</div>
		</div>
	)
}
