import FilterSelect from '@/components/common/select/FilterSelect'
import { ArrowBackIcon, ArrowForwardIcon, InfoIcon } from '@/components/svg/MenuIcon'
import { Divider, IconButton, Tooltip, TooltipProps, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React from 'react'
import DonutChart from '../Chart/DonutChart'
import InfoTooltip from '../Tooltip/InfoTooltip'
import LinearProgressBar from '../Chart/LinearProgressBar'
import SplineChart from '../Chart/SplineChart'
import StackedAreaChart from '../Chart/StackedAreaChart'
import { area } from 'billboard.js'
import BarChart from '../Chart/BarChart'
import { regionColor } from '@interface/config/app.config'

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

				<div className='flex w-full flex-col items-center gap-6 lg:max-h-[245px] lg:flex-row lg:gap-4'>
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
								width={170}
								height={170}
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
					<div className='flex h-full w-full flex-col items-start gap-6 rounded-[10px] bg-white p-4 shadow'>
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
				</div>

				<div className='flex w-full flex-col items-center gap-6 lg:flex-row lg:gap-4'>
					<div className='flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 shadow max-lg:w-full lg:flex-[1]'>
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
					<div className='flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 text-white shadow max-lg:w-full lg:flex-[1]'>
						<Typography>{t('sugarCaneYield')}</Typography>
						<div className='flex flex-col gap-4'>
							<div className='flex flex-col gap-2'>
								<div className='flex items-center justify-between'>
									<Typography className='!text-xs'>test1</Typography>
									<Typography className='!text-sm'>120</Typography>
								</div>
								<Divider className='!border-white !border-opacity-25' />
							</div>
							<div className='flex flex-col gap-2'>
								<div className='flex items-center justify-between'>
									<Typography className='!text-xs'>test2</Typography>
									<Typography className='!text-sm'>80</Typography>
								</div>
								<Divider className='!border-white !border-opacity-25' />
							</div>
							<div className='flex flex-col gap-2'>
								<div className='flex items-center justify-between'>
									<Typography className='!text-xs'>test3</Typography>
									<Typography className='!text-sm'>10</Typography>
								</div>
								<Divider className='!border-white !border-opacity-25' />
							</div>
							<div className='flex flex-col gap-2'>
								<div className='flex items-center justify-between'>
									<Typography className='!text-xs'>test4</Typography>
									<Typography className='!text-sm'>5</Typography>
								</div>
								<Divider className='!border-white !border-opacity-25' />
							</div>
						</div>
					</div>
					<div className='flex h-full flex-col justify-start gap-6 rounded-[10px] bg-white p-4 shadow max-lg:w-full lg:flex-[2]'>
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
					<div className='flex h-full flex-col justify-start gap-6 rounded-[10px] bg-white p-4 shadow max-lg:w-full lg:flex-[2]'>
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
				</div>
			</div>
		</div>
	)
}
