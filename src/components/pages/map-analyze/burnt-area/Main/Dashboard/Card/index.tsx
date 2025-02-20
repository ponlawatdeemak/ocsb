import { Box, Divider, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import DonutChart from '../Chart/DonutChart'
import StackedBarChart from '../Chart/StackedBarChart'
import { formatDate } from '@/utils/date'
import { useTranslation } from 'next-i18next'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'
import { hotspotType, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'

interface DashboardCardMainProps {
	handleClickDelete: () => void
	isSelectedCard: boolean
	handleSelectCard: () => void
	payloadData: any
	mapTypeArray: string[]
	selectedHotspots: string[]
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
	mapTypeArray,
	selectedHotspots,
	className = '',
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage
	const { areaUnit } = useAreaUnit()
	const areaUnitTranslate = `common:${areaUnit}`

	//region Hotspot
	const inSugarCaneArea = useMemo(() => {
		return hotspotType[0]
	}, [])

	const notInSugarCaneArea = useMemo(() => {
		return hotspotType[1]
	}, [])

	const defaultColorHotspot = useMemo(() => {
		return {
			[`${hotspotType[0].label.en}`]: '#FF0000',
			[`${hotspotType[0].label.th}`]: '#FF0000',
			[`${hotspotType[1].label.en}`]: '#FFC7C7',
			[`${hotspotType[1].label.th}`]: '#FFC7C7',
		}
	}, [])

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

		const result: any[][] = [[inSugarCaneArea.label[language]], [notInSugarCaneArea.label[language]]]

		data.hotspot.list?.forEach((item) => {
			result[0].push(item.inSugarcane)
			result[1].push(item.notInSugarcane)
		})

		return [label, ...result]
	}, [i18n.language, inSugarCaneArea.label, language, notInSugarCaneArea.label])

	const [donutColorHotspot, setDonutColorHotspot] = useState(defaultColorHotspot)
	const [percent, setPercent] = useState((data.hotspot.inSugarcane * 100) / data.hotspot.total)
	const [hideData, setHideData] = useState<string[]>()

	const handleClickOnChart = (name: string) => {
		if (selectedHotspots.length === hotspotType.length) {
			if (name === inSugarCaneArea.label.en || name === inSugarCaneArea.label.th) {
				if (
					donutColorHotspot[notInSugarCaneArea.label.en] === '#f5f5f6' ||
					donutColorHotspot[notInSugarCaneArea.label.th] === '#f5f5f6'
				) {
					setDonutColorHotspot(defaultColorHotspot)
					setHideData([])
				} else {
					setDonutColorHotspot({
						[inSugarCaneArea.label.en]: '#FF0000',
						[inSugarCaneArea.label.th]: '#FF0000',
						[notInSugarCaneArea.label.en]: '#f5f5f6',
						[notInSugarCaneArea.label.th]: '#f5f5f6',
					})
					setHideData([notInSugarCaneArea.label[language]])
				}
				setPercent(percentInArea)
			} else if (name === notInSugarCaneArea.label.en || name === notInSugarCaneArea.label.th) {
				if (
					donutColorHotspot[inSugarCaneArea.label.en] === '#f5f5f6' ||
					donutColorHotspot[inSugarCaneArea.label.th] === '#f5f5f6'
				) {
					setDonutColorHotspot(defaultColorHotspot)
					setPercent(percentInArea)
					setHideData([])
				} else {
					setDonutColorHotspot({
						[inSugarCaneArea.label.en]: '#f5f5f6',
						[inSugarCaneArea.label.th]: '#f5f5f6',
						[notInSugarCaneArea.label.en]: '#FFC7C7',
						[notInSugarCaneArea.label.th]: '#FFC7C7',
					})
					setPercent(percentNotInArea)
					setHideData([inSugarCaneArea.label[language]])
				}
			}
		}
	}
	//end region Hotspot

	//region burnArea
	const defaultColorBurnArea = { [t('overview:burntScar')]: '#F9B936' }
	const columnsBurnArea = useMemo(() => {
		const label = ['x']
		data.burnArea.list?.forEach((item) => {
			label.push(formatDate(new Date(item.date), 'MMM yy', i18n.language))
		})

		const result: any[][] = [[t('overview:burntScar')]]

		data.burnArea.list?.forEach((item) => {
			result[0].push(item.area[areaUnit])
		})

		return [label, ...result]
	}, [areaUnit, i18n.language, t])
	//end region burnArea

	//region plant
	const defaultColorPlant = { [t('common:menu.plantingArea')]: '#8AB62D', [t('common:noData')]: '#f5f5f6' }
	//end region plant

	useEffect(() => {
		if (!selectedHotspots.includes(inSugarCaneArea.code)) {
			setHideData([inSugarCaneArea.label[language]])
			setDonutColorHotspot({
				[inSugarCaneArea.label.en]: '#f5f5f6',
				[inSugarCaneArea.label.th]: '#f5f5f6',
				[notInSugarCaneArea.label.en]: '#FFC7C7',
				[notInSugarCaneArea.label.th]: '#FFC7C7',
			})
		} else if (!selectedHotspots.includes(notInSugarCaneArea.code)) {
			setHideData([notInSugarCaneArea.label[language]])
			setDonutColorHotspot({
				[inSugarCaneArea.label.en]: '#FF0000',
				[inSugarCaneArea.label.th]: '#FF0000',
				[notInSugarCaneArea.label.en]: '#f5f5f6',
				[notInSugarCaneArea.label.th]: '#f5f5f6',
			})
		} else if (selectedHotspots.length === hotspotType.length) {
			setHideData([])
			setDonutColorHotspot(defaultColorHotspot)
		}
	}, [
		defaultColorHotspot,
		inSugarCaneArea.code,
		inSugarCaneArea.label,
		language,
		notInSugarCaneArea.code,
		notInSugarCaneArea.label,
		selectedHotspots,
	])

	return (
		<Box className={classNames('flex h-full w-[300px] min-w-0 flex-col bg-white', className)}>
			<button
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
			</button>
			<div className='flex w-full flex-col items-center justify-center py-4'>
				{mapTypeArray.includes(mapTypeCode.hotspots) && (
					<>
						<Typography className='pb-3 !text-sm'>{t('overview:totalHotspot')}</Typography>
						<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
							<DonutChart
								columns={[
									[inSugarCaneArea.label[language], data.hotspot.inSugarcane],
									[notInSugarCaneArea.label[language], data.hotspot.notInSugarcane],
								]}
								colors={donutColorHotspot}
								percent={percent}
								chartId={payloadData.id}
								height={111}
								width={111}
								handleClickOnChart={handleClickOnChart}
							/>
						</div>
						<Typography className='pt-3 !text-lg'>
							{defaultNumber(data.hotspot.inSugarcane)} {t('common:point')}
						</Typography>
						<Typography className='pb-4 !text-xs text-[#707070]'>
							{t('totalHotspots')} {defaultNumber(data.hotspot.total)} {t('common:point')}
						</Typography>

						<Divider flexItem />

						<Typography className='pt-3 !text-sm'>
							{hideData?.[0] === inSugarCaneArea.label[language]
								? t('hotspotOutArea')
								: t('hotspotInArea')}
						</Typography>
						<div className='h-[262px] !max-h-[262px] !min-h-[262px] w-full'>
							<StackedBarChart
								chartId={payloadData.id}
								columns={columnsHotspot}
								colors={defaultColorHotspot}
								groups={[[inSugarCaneArea.label[language], notInSugarCaneArea.label[language]]]}
								hideData={hideData}
								handleClickOnChart={handleClickOnChart}
							/>
						</div>
					</>
				)}

				{mapTypeArray.includes(mapTypeCode.burnArea) && (
					<>
						{mapTypeArray.includes(mapTypeCode.hotspots) && <Divider flexItem className='!mb-3 !mt-4' />}

						<Typography className='!text-sm'>
							{t('overview:burntScar')} ({t(`common:${areaUnit}`)})
						</Typography>
						<div className='h-[262px] !max-h-[262px] !min-h-[262px] w-full'>
							<StackedBarChart
								chartId={'second-bar' + payloadData.id}
								columns={columnsBurnArea}
								colors={defaultColorBurnArea}
								handleClickOnChart={handleClickOnChart}
							/>
						</div>
					</>
				)}

				{mapTypeArray.includes(mapTypeCode.plant) && (
					<>
						{(mapTypeArray.includes(mapTypeCode.hotspots) ||
							mapTypeArray.includes(mapTypeCode.burnArea)) && (
							<Divider flexItem className='!mb-3 !mt-4' />
						)}

						<Typography className='pb-3 !text-sm'>{t('common:menu.plantingArea')}</Typography>
						<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
							<DonutChart
								columns={[
									[t('common:menu.plantingArea'), data.plant.area[areaUnit]],
									[t('common:noData'), data.plant.total[areaUnit] - data.plant.area[areaUnit]],
								]}
								colors={defaultColorPlant}
								percent={(data.plant.area[areaUnit] * 100) / data.plant.total[areaUnit]}
								chartId={'second-donut' + payloadData.id}
								height={111}
								width={111}
								handleClickOnChart={handleClickOnChart}
							/>
						</div>
						<Typography className='pt-3 !text-lg'>{`${defaultNumber(data.plant.area[areaUnit])} ${t(areaUnitTranslate)}`}</Typography>
						<Typography className='!text-xs text-[#707070]'>
							{`${t('common:total')} ${defaultNumber(data.plant.total[areaUnit])} ${t(areaUnitTranslate)}`}
						</Typography>
					</>
				)}
			</div>
		</Box>
	)
}

export default DashboardCardMain
