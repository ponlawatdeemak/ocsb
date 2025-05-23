import { Box, CircularProgress, Divider, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import DonutChart from '../Chart/DonutChart'
import StackedBarChart from '../Chart/StackedBarChart'
import { formatDate } from '@/utils/date'
import { useTranslation } from 'next-i18next'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'
import { hotspotType, hotspotTypeCode, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { SelectedArea } from '../..'
import useResponsive from '@/hook/responsive'
import HotspotLineChart from '../Chart/HotspotLineChart'
import { format } from 'date-fns'

interface DashboardCardMainProps {
	handleClickDelete: () => void
	isSelectedCard: boolean
	handleSelectCard: () => void
	area: SelectedArea
	mapTypeArray: mapTypeCode[]
	selectedHotspots: hotspotTypeCode[]
	selectedDateRange: Date[]
	openDrawer: boolean
	maxHotspotValues: Record<string, number>
	setMaxHotspotValues: React.Dispatch<React.SetStateAction<Record<string, number>>>
	maxBurntValues: Record<string, number>
	setMaxBurntValues: React.Dispatch<React.SetStateAction<Record<string, number>>>
	className?: string
}

const DashboardCardMain: React.FC<DashboardCardMainProps> = ({
	handleClickDelete,
	isSelectedCard,
	handleSelectCard,
	area,
	mapTypeArray,
	selectedHotspots,
	selectedDateRange,
	openDrawer,
	maxHotspotValues,
	setMaxHotspotValues,
	maxBurntValues,
	setMaxBurntValues,
	className = '',
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage
	const { areaUnit } = useAreaUnit()
	const areaUnitTranslate = `common:${areaUnit}`
	const defaultColorHotspot = useMemo(() => {
		return {
			[`${hotspotType[0].label.en}`]: '#FF0000',
			[`${hotspotType[0].label.th}`]: '#FF0000',
			[`${hotspotType[1].label.en}`]: '#FFC7C7',
			[`${hotspotType[1].label.th}`]: '#FFC7C7',
		}
	}, [])
	const { isDesktopMD } = useResponsive()

	const [donutColorHotspot, setDonutColorHotspot] = useState(defaultColorHotspot)
	const [percent, setPercent] = useState<number>(0)
	const [hideData, setHideData] = useState<string[]>()
	const [hotspotChartMode, setHotspotChartMode] = useState<'daily' | 'month'>('month')
	const [dailyInfo, setDailyInfo] = useState()

	const { data: dashBoardData, isFetching: isDashBoardDataLoading } = useQuery({
		queryKey: ['getDashBoardBurntArea', area.admOption, mapTypeArray, selectedHotspots, selectedDateRange, area.id],
		queryFn: async () => {
			const response = await service.mapAnalyze.getDashBoardBurntArea({
				startDate: format(selectedDateRange[0], 'yyyy-MM-dd'),
				endDate: format(selectedDateRange[1], 'yyyy-MM-dd'),
				admC: area.admOption?.id ? Number(area.admOption?.id) : undefined,
				mapType: mapTypeArray,
				inSugarcan: selectedHotspots,
			})
			if (response.data.hotspot && selectedHotspots.length === hotspotType.length) {
				setPercent(
					(((response.data.hotspot.notInSugarcane ?? 0) + (response.data.hotspot.inSugarcane ?? 0)) * 100) /
						response.data.hotspot.total,
				)
			} else if (response.data.hotspot && selectedHotspots[0] === inSugarCaneArea.code) {
				setPercent(((response.data.hotspot.inSugarcane ?? 0) * 100) / response.data.hotspot.total)
			} else if (response.data.hotspot && selectedHotspots[0] === notInSugarCaneArea.code) {
				setPercent(((response.data.hotspot.notInSugarcane ?? 0) * 100) / response.data.hotspot.total)
			}

			setMaxHotspotValues((prevMaxValue) => {
				const key = area.id.split('mobile-').join('')
				const total = response.data.hotspot?.total ?? 0
				return {
					...prevMaxValue,
					[key]: total,
				}
			})
			setMaxBurntValues((prevMaxValue) => {
				const key = area.id.split('mobile-').join('')
				const total =
					response.data.burnArea?.list.reduce((total, item) => total + (item.area?.rai ?? 0), 0) ?? 0
				return {
					...prevMaxValue,
					[key]: total,
				}
			})
			setHotspotChartMode('month')

			return response.data
		},
		enabled:
			openDrawer === true &&
			mapTypeArray.length !== 0 &&
			((!isDesktopMD && !!area.id.includes('mobile')) || (isDesktopMD && !area.id.includes('mobile'))),
	})

	//#region Hotspot
	const inSugarCaneArea = useMemo(() => {
		return hotspotType[0]
	}, [])

	const notInSugarCaneArea = useMemo(() => {
		return hotspotType[1]
	}, [])

	const percentInArea = useMemo(() => {
		return ((dashBoardData?.hotspot?.inSugarcane ?? 0) * 100) / (dashBoardData?.hotspot?.total ?? 0)
	}, [dashBoardData?.hotspot?.inSugarcane, dashBoardData?.hotspot?.total])

	const percentNotInArea = useMemo(() => {
		return ((dashBoardData?.hotspot?.notInSugarcane ?? 0) * 100) / (dashBoardData?.hotspot?.total ?? 0)
	}, [dashBoardData?.hotspot?.notInSugarcane, dashBoardData?.hotspot?.total])

	const columnsHotspot = useMemo(() => {
		const label = ['x']
		dashBoardData?.hotspot?.list?.forEach((item) => {
			label.push(formatDate(new Date(item.date), 'MMM yy', i18n.language))
		})

		const result: any[][] = [[inSugarCaneArea.label[language]], [notInSugarCaneArea.label[language]]]

		dashBoardData?.hotspot?.list?.forEach((item) => {
			result[0].push(item.inSugarcane)
			result[1].push(item.notInSugarcane)
		})

		return [label, ...result]
	}, [i18n.language, inSugarCaneArea.label, language, notInSugarCaneArea.label, dashBoardData?.hotspot?.list])

	const handleClickOnChart = (name: string) => {
		if (selectedHotspots.length === hotspotType.length) {
			if (name === inSugarCaneArea.label.en || name === inSugarCaneArea.label.th) {
				if (
					donutColorHotspot[notInSugarCaneArea.label.en] === '#f5f5f6' ||
					donutColorHotspot[notInSugarCaneArea.label.th] === '#f5f5f6'
				) {
					setDonutColorHotspot(defaultColorHotspot)
					setPercent(
						(((dashBoardData?.hotspot?.notInSugarcane ?? 0) + (dashBoardData?.hotspot?.inSugarcane ?? 0)) *
							100) /
							(dashBoardData?.hotspot?.total ?? 0),
					)
					setHideData([])
				} else {
					setDonutColorHotspot({
						[inSugarCaneArea.label.en]: '#FF0000',
						[inSugarCaneArea.label.th]: '#FF0000',
						[notInSugarCaneArea.label.en]: '#f5f5f6',
						[notInSugarCaneArea.label.th]: '#f5f5f6',
					})
					setPercent(percentInArea)
					setHideData([notInSugarCaneArea.label[language]])
				}

				// setPercent(percentInArea)
			} else if (name === notInSugarCaneArea.label.en || name === notInSugarCaneArea.label.th) {
				if (
					donutColorHotspot[inSugarCaneArea.label.en] === '#f5f5f6' ||
					donutColorHotspot[inSugarCaneArea.label.th] === '#f5f5f6'
				) {
					setDonutColorHotspot(defaultColorHotspot)
					setPercent(
						(((dashBoardData?.hotspot?.notInSugarcane ?? 0) + (dashBoardData?.hotspot?.inSugarcane ?? 0)) *
							100) /
							(dashBoardData?.hotspot?.total ?? 0),
					)
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
	//#endregion Hotspot

	//#region burnArea
	const defaultColorBurnArea = { [t('overview:burntScar')]: '#F9B936' }
	const columnsBurnArea = useMemo(() => {
		const label = ['x']
		dashBoardData?.burnArea?.list?.forEach((item) => {
			label.push(formatDate(new Date(item.date), 'MMM yy', i18n.language))
		})

		const result: any[][] = [[t('overview:burntScar')]]

		dashBoardData?.burnArea?.list?.forEach((item) => {
			result[0].push(item?.area?.[areaUnit])
		})

		return [label, ...result]
	}, [areaUnit, i18n.language, dashBoardData?.burnArea?.list, t])
	//#endregion burnArea

	//#region plant
	const defaultColorPlant = { [t('common:menu.plantingArea')]: '#8AB62D', [t('common:noData')]: '#f5f5f6' }
	//#endregion plant

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

	const hotspotPoint = useMemo(() => {
		if (hideData?.length === 0) {
			return defaultNumber(dashBoardData?.hotspot?.total ?? '-')
		} else if (hideData?.[0] === inSugarCaneArea.label[language]) {
			return defaultNumber(dashBoardData?.hotspot?.notInSugarcane ?? '-')
		} else if (hideData?.[0] === notInSugarCaneArea.label[language]) {
			return defaultNumber(dashBoardData?.hotspot?.inSugarcane ?? '-')
		}
	}, [
		dashBoardData?.hotspot?.inSugarcane,
		dashBoardData?.hotspot?.notInSugarcane,
		dashBoardData?.hotspot?.total,
		hideData,
		inSugarCaneArea.label,
		language,
		notInSugarCaneArea.label,
	])

	const hotspotBarChartTitle = useMemo(() => {
		if (hideData?.length === 0) {
			return t('hotspotTotalArea')
		} else if (hideData?.[0] === inSugarCaneArea.label[language]) {
			return t('hotspotOutArea')
		} else {
			return t('hotspotInArea')
		}
	}, [hideData, inSugarCaneArea, language, t])

	useEffect(() => {
		setHideData([])
		setDonutColorHotspot(defaultColorHotspot)
	}, [defaultColorHotspot, isDesktopMD])

	const onHotSpotStackChartClick = (name: string, info: any) => {
		setHotspotChartMode('daily')
		const temp = dashBoardData?.hotspot?.list?.[info.index as number]
		setDailyInfo(temp as any)
	}

	return (
		<Box
			className={classNames(
				'relative flex h-full w-[375px] min-w-[375px] flex-col bg-white md:w-[25vw] md:min-w-[25vw]',
				className,
			)}
		>
			<button
				className={classNames('flex h-fit w-full items-center bg-[#EBF5FF] px-5 py-4 hover:cursor-pointer')}
				style={{
					outlineStyle: isSelectedCard ? 'solid' : 'none',
					outlineOffset: '-3px',
					outlineColor: '#003491',
				}}
				onClick={handleSelectCard}
			>
				<Typography className='break-all text-start text-primary max-md:!text-md'>
					{area.admOption?.name[language] ?? t('allRegions')}
				</Typography>
			</button>
			<IconButton
				className='!absolute right-5 top-4'
				onClick={(e) => {
					e.preventDefault()
					e.stopPropagation()
					handleClickDelete()
				}}
			>
				<CloseIcon className='!h-3 !w-3' />
			</IconButton>
			<Box className={classNames('overflow-y-auto', { 'flex grow': isDashBoardDataLoading })}>
				<div className='flex w-full grow flex-col items-center justify-start py-4'>
					{isDashBoardDataLoading ? (
						<div className='flex h-full w-full items-center justify-center'>
							<CircularProgress />
						</div>
					) : (
						<>
							{mapTypeArray.includes(mapTypeCode.hotspots) && (
								<>
									<Typography className='pb-3 text-center !text-sm'>
										{t('overview:totalHotspot')}
									</Typography>
									{dashBoardData?.hotspot ? (
										<>
											<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
												<DonutChart
													columns={[
														[
															inSugarCaneArea.label[language],
															dashBoardData?.hotspot?.inSugarcane,
														],
														[
															notInSugarCaneArea.label[language],
															dashBoardData?.hotspot?.notInSugarcane,
														],
													]}
													colors={donutColorHotspot}
													percent={percent || 0}
													chartId={area.id}
													height={111}
													width={111}
													handleClickOnChart={handleClickOnChart}
												/>
											</div>
											<Typography className='pt-3 !text-lg'>
												{`${hotspotPoint} ${t('common:point')}`}
											</Typography>
											<Typography className='pb-4 !text-xs text-[#707070]'>
												{`${t('totalHotspots')} ${defaultNumber(dashBoardData?.hotspot?.total ?? '-')} ${t('common:point')}`}
											</Typography>

											<Divider flexItem />
											{hotspotChartMode === 'daily' ? (
												<HotspotLineChart
													data={dailyInfo}
													onBack={() => setHotspotChartMode('month')}
													colors={defaultColorHotspot}
												/>
											) : (
												<>
													<Typography className='pt-3 text-center !text-sm'>
														{hotspotBarChartTitle}
													</Typography>
													<div className='!min-h-[262px] w-full'>
														<StackedBarChart
															chartId={area.id}
															columns={columnsHotspot}
															colors={defaultColorHotspot}
															groups={[
																[
																	inSugarCaneArea.label[language],
																	notInSugarCaneArea.label[language],
																],
															]}
															hideData={hideData}
															handleClickOnChart={onHotSpotStackChartClick}
															maxValues={maxHotspotValues}
														/>
													</div>
												</>
											)}
										</>
									) : (
										<NoDataDisplay />
									)}
								</>
							)}

							{mapTypeArray.includes(mapTypeCode.burnArea) && (
								<>
									{mapTypeArray.includes(mapTypeCode.hotspots) && (
										<Divider flexItem className='!mb-3 !mt-4' />
									)}
									<Typography className='pb-3 text-center !text-sm'>
										{t('overview:burntScar')} ({t(`common:${areaUnit}`)})
									</Typography>
									{dashBoardData?.burnArea ? (
										<div className='!min-h-[262px] w-full'>
											<StackedBarChart
												chartId={'second-bar' + area.id}
												columns={columnsBurnArea}
												colors={defaultColorBurnArea}
												handleClickOnChart={handleClickOnChart}
												maxValues={maxBurntValues}
											/>
										</div>
									) : (
										<NoDataDisplay />
									)}
								</>
							)}

							{mapTypeArray.includes(mapTypeCode.plant) && (
								<>
									{(mapTypeArray.includes(mapTypeCode.hotspots) ||
										mapTypeArray.includes(mapTypeCode.burnArea)) && (
										<Divider flexItem className='!mb-3 !mt-4' />
									)}
									<Typography className='pb-3 text-center !text-sm'>
										{t('common:menu.plantingArea')}
									</Typography>
									{dashBoardData?.plant ? (
										<>
											<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
												<DonutChart
													columns={[
														[
															t('common:menu.plantingArea'),
															dashBoardData?.plant?.area[areaUnit],
														],
														[
															t('common:noData'),
															dashBoardData?.plant?.total[areaUnit] -
																dashBoardData?.plant?.area[areaUnit],
														],
													]}
													colors={defaultColorPlant}
													percent={
														((dashBoardData?.plant?.area[areaUnit] ?? 0) * 100) /
															(dashBoardData?.plant?.total[areaUnit] ?? 0) || 0
													}
													chartId={'second-donut' + area.id}
													height={111}
													width={111}
													handleClickOnChart={handleClickOnChart}
													unit={t(areaUnitTranslate)}
												/>
											</div>
											<Typography className='pt-3 !text-lg'>{`${defaultNumber(dashBoardData?.plant?.area[areaUnit] ?? '-')} ${t(areaUnitTranslate)}`}</Typography>
											<Typography className='!text-xs text-[#707070]'>
												{`${t('common:total')} ${defaultNumber(dashBoardData?.plant?.total[areaUnit] ?? '-')} ${t(areaUnitTranslate)}`}
											</Typography>
										</>
									) : (
										<NoDataDisplay />
									)}
								</>
							)}
						</>
					)}
				</div>
			</Box>
		</Box>
	)
}

export default DashboardCardMain
