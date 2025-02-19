import { Box, Divider, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import DonutChart from '../Chart/DonutChart'
import StackedBarChart from '../Chart/StackedBarChart'
import { formatDate } from '@/utils/date'
import { useTranslation } from 'next-i18next'
import useAreaUnit from '@/store/area-unit'

interface DashboardCardMainProps {
	handleClickDelete: () => void
	isSelectedCard: boolean
	handleSelectCard: () => void
	payloadData: any
	className?: string
}
const data = {
	hotspot: {
		total: 25,
		inSugarcane: 10,
		notInSugarcane: 15,
		list: [
			{
				date: '2025-02-19',
				inSugarcane: 5,
				notInSugarcane: 10,
			},
			{
				date: '2025-03-20',
				inSugarcane: 3,
				notInSugarcane: 5,
			},
			{
				date: '2025-04-21',
				inSugarcane: 2,
				notInSugarcane: 0,
			},
		],
	},
	burnArea: {
		list: [
			{
				date: '2025-02-19',
				area: {
					m2: 2500,
					km2: 0.0025,
					rai: 1.5,
					hexa: 0.00025,
				},
			},
			{
				date: '2025-03-20',
				area: {
					m2: 3000,
					km2: 0.003,
					rai: 1.8,
					hexa: 0.0003,
				},
			},
			{
				date: '2025-04-21',
				area: {
					m2: 2000,
					km2: 0.002,
					rai: 1.2,
					hexa: 0.0002,
				},
			},
		],
	},
	plant: {
		total: {
			m2: 500000,
			km2: 0.5,
			rai: 300,
			hexa: 0.05,
		},
		area: {
			m2: 250000,
			km2: 0.25,
			rai: 150,
			hexa: 0.025,
		},
	},
}

const DashboardCardMain: React.FC<DashboardCardMainProps> = ({
	handleClickDelete,
	isSelectedCard,
	handleSelectCard,
	payloadData,
	className = '',
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common'])
	const defaultColorHotspot = { data: '#FF0000', noData: '#FFC7C7' }
	const { areaUnit } = useAreaUnit()

	//region Hotspot
	const [donutColorHotspot, setDonutColorHotspot] = useState(defaultColorHotspot)
	const [percent, setPercent] = useState((data.hotspot.inSugarcane * 100) / data.hotspot.total)
	const [hideData, setHideData] = useState<string[]>([])

	const percentInArea = useMemo(() => {
		return (data.hotspot.inSugarcane * 100) / data.hotspot.total
	}, [])

	const percentNotInArea = useMemo(() => {
		return (data.hotspot.notInSugarcane * 100) / data.hotspot.total
	}, [])

	const columnsHotspot = useMemo(() => {
		const label = ['x']
		data.hotspot.list?.forEach((item) => {
			label.push(formatDate(new Date(item.date), 'MMM yy', i18n.language))
		})

		const result: any[][] = [['data'], ['noData']]

		data.hotspot.list?.forEach((item) => {
			result[0].push(item.inSugarcane)
			result[1].push(item.notInSugarcane)
		})

		return [label, ...result]
	}, [i18n.language])

	const handleClickData = () => {
		if (donutColorHotspot.noData === '#f5f5f6') {
			setDonutColorHotspot(defaultColorHotspot)
			setHideData([])
		} else {
			setDonutColorHotspot({ data: '#FF0000', noData: '#f5f5f6' })
			setHideData(['noData'])
		}
		setPercent(percentInArea)
	}

	const handleClickNoData = () => {
		if (donutColorHotspot.data === '#f5f5f6') {
			setDonutColorHotspot(defaultColorHotspot)
			setPercent(percentInArea)
			setHideData([])
		} else {
			setDonutColorHotspot({ data: '#f5f5f6', noData: '#FFC7C7' })
			setPercent(percentNotInArea)
			setHideData(['data'])
		}
	}
	//end region Hotspot

	//region burnArea
	const defaultColorBurnArea = { data: '#F9B936' }
	const columnsBurnArea = useMemo(() => {
		const label = ['x']
		data.burnArea.list?.forEach((item) => {
			label.push(formatDate(new Date(item.date), 'MMM yy', i18n.language))
		})

		const result: any[][] = [['data']]

		data.burnArea.list?.forEach((item) => {
			result[0].push(item.area[areaUnit])
		})

		return [label, ...result]
	}, [areaUnit, i18n.language])
	//end region burnArea

	//region plant
	const defaultColorPlant = { data: '#8AB62D', noData: '#f5f5f6' }
	//end region plant

	return (
		<Box className={classNames('flex h-full w-[300px] min-w-0 flex-col bg-white', className)}>
			<div
				className={classNames(
					'flex h-fit w-full items-start justify-between bg-[#EBF5FF] px-5 py-4 hover:cursor-pointer',
				)}
				style={{
					outlineStyle: isSelectedCard ? 'solid' : 'none',
					outlineOffset: '-3px',
					outlineColor: '#003491',
				}}
				onClick={handleSelectCard}
			>
				<Typography className='break-all'>DashboardCardMain</Typography>
				<IconButton
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						handleClickDelete()
					}}
				>
					<CloseIcon className='!h-3 !w-3' />
				</IconButton>
			</div>
			<div className='flex w-full flex-col items-center justify-center pt-7'>
				<Typography className='pb-3 !text-sm'>จุดความร้อนสะสมทั้งหมด</Typography>
				<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
					<DonutChart
						columns={[
							['data', data.hotspot.inSugarcane],
							['noData', data.hotspot.notInSugarcane],
						]}
						colors={donutColorHotspot}
						percent={percent}
						chartId={payloadData.id}
						height={111}
						width={111}
						handleClickData={handleClickData}
						handleClickNoData={handleClickNoData}
					/>
				</div>
				<Typography className='pt-3 !text-lg'>{data.hotspot.inSugarcane} จุด</Typography>
				<Typography className='pb-4 !text-xs text-[#707070]'>
					จุดความร้อนทั้งหมด {data.hotspot.total} จุด
				</Typography>

				<Divider flexItem />

				<Typography className='pt-3 !text-sm'>
					{hideData?.[0] === 'data' ? 'จุดความร้อนที่ไม่ตกในแปลงอ้อย' : 'จุดความร้อนที่ตกในแปลงอ้อย'}
				</Typography>
				<div className='h-[262px] !max-h-[262px] !min-h-[262px] w-full pb-4'>
					<StackedBarChart
						chartId={payloadData.id}
						columns={columnsHotspot}
						colors={defaultColorHotspot}
						groups={[['data', 'noData']]}
						hideData={hideData}
					/>
				</div>

				<Divider flexItem />

				<Typography className='pt-3 !text-sm'>ร่องรอยการเผาไหม้ ({t(`common:${areaUnit}`)})</Typography>
				<div className='h-[262px] !max-h-[262px] !min-h-[262px] w-full pb-4'>
					<StackedBarChart
						chartId={'noStack' + payloadData.id + 'asdasd'}
						columns={columnsBurnArea}
						colors={defaultColorBurnArea}
					/>
				</div>

				<Divider flexItem />

				<Typography className='pb-3 pt-3 !text-sm'>พื้นที่ปลูกอ้อย</Typography>
				<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
					<DonutChart
						columns={[
							['data', data.plant.area[areaUnit]],
							['noData', data.plant.total[areaUnit] - data.plant.area[areaUnit]],
						]}
						colors={defaultColorPlant}
						percent={(data.plant.area[areaUnit] * 100) / data.plant.total[areaUnit]}
						chartId={'second-' + payloadData.id + 'asdaskp'}
						height={111}
						width={111}
						handleClickData={handleClickData}
						handleClickNoData={handleClickNoData}
					/>
				</div>
				<Typography className='pt-3 !text-lg'>{`${data.plant.area[areaUnit]} ${t(`common:${areaUnit}`)}`}</Typography>
				<Typography className='pb-4 !text-xs text-[#707070]'>
					{`ทั้งหมด ${data.plant.total[areaUnit]} ${t(`common:${areaUnit}`)}`}
				</Typography>
			</div>
		</Box>
	)
}

export default DashboardCardMain
