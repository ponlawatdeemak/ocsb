import { Box, CircularProgress, Divider, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useEffect, useMemo, useState } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import DonutChart from '../Chart/DonutChart'
import { formatDate } from '@/utils/date'
import { useTranslation } from 'next-i18next'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'
import {
	hotspotType,
	hotspotTypeCode,
	mapTypeCode,
	ResponseLanguage,
	yieldMapTypeCode,
} from '@interface/config/app.config'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '../../SearchForm'

interface PlantingCardMainProps {
	handleClickDelete: () => void
	isSelectedCard: boolean
	handleSelectCard: () => void
	area: { id: string; admOption: OptionType | null }
	mapTypeArray: yieldMapTypeCode[]
	// selectedHotspots: hotspotTypeCode[]
	selectedDateRange: Date[]
	openDrawer: boolean
	className?: string
}

const PlantingCardMain: React.FC<PlantingCardMainProps> = ({
	handleClickDelete,
	isSelectedCard,
	handleSelectCard,
	area,
	mapTypeArray,
	// selectedHotspots,
	selectedDateRange,
	openDrawer,
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

	const [donutColorHotspot, setDonutColorHotspot] = useState(defaultColorHotspot)
	const [percent, setPercent] = useState<number>(0)
	const [hideData, setHideData] = useState<string[]>()

	const { data: dashBoardData, isFetching: isDashBoardDataLoading } = useQuery({
		queryKey: ['getDashBoardYieldArea', area.admOption, mapTypeArray, selectedDateRange, area.id],
		queryFn: async () => {
			const response = await service.mapAnalyze.getDashBoardYieldArea({
				startDate: selectedDateRange[0]?.toISOString().split('T')[0],
				endDate: selectedDateRange[1]?.toISOString().split('T')[0],
				admC: area.admOption?.id ? Number(area.admOption.id) : undefined,
				mapType: mapTypeArray,
			})
			return response.data
		},
		enabled: openDrawer === true,
	})

	//#region plant
	const defaultColorPlant = { [t('common:menu.plantingArea')]: '#8AB62D', [t('noPlantingArea')]: '#f5f5f6' }
	//#endregion

	//#region yield
	// const defaultColorBurnArea = { [t('overview:burntScar')]: '#F9B936' }
	// const columnsBurnArea = useMemo(() => {
	// 	const label = ['x']
	// 	dashBoardData?.burnArea?.list?.forEach((item) => {
	// 		label.push(formatDate(new Date(item.date), 'MMM yy', i18n.language))
	// 	})

	// 	const result: any[][] = [[t('overview:burntScar')]]

	// 	dashBoardData?.burnArea?.list?.forEach((item) => {
	// 		result[0].push(item?.area?.[areaUnit])
	// 	})

	// 	return [label, ...result]
	// }, [areaUnit, i18n.language, dashBoardData?.burnArea?.list, t])
	//#endregion

	return (
		<Box
			className={classNames(
				'flex h-full w-[375px] min-w-[375px] flex-col bg-white md:w-[300px] md:min-w-0',
				className,
			)}
		>
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
				<Typography className='break-all text-start text-primary max-md:!text-md'>
					{area.admOption?.name[language] ?? t('allRegions')}
				</Typography>
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
			<Box className={classNames('overflow-y-auto', { 'flex grow': isDashBoardDataLoading })}>
				<div className='flex w-full grow flex-col items-center justify-start py-4'>
					{isDashBoardDataLoading ? (
						<div className='flex h-full w-full items-center justify-center'>
							<CircularProgress />
						</div>
					) : (
						<>
							{mapTypeArray.includes(yieldMapTypeCode.plant) && (
								<>
									{/* {mapTypeArray.includes(yieldMapTypeCode.plant) && (
										<Divider flexItem className='!mb-3 !mt-4' />
									)} */}
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
															dashBoardData?.plant?.area?.[areaUnit] ?? 0,
														],
														[
															t('noPlantingArea'),
															dashBoardData?.plant?.diffArea?.[areaUnit] ?? 0,
														],
													]}
													colors={defaultColorPlant}
													percent={
														((dashBoardData?.plant?.area[areaUnit] ?? 0) * 100) /
															(dashBoardData?.plant?.total[areaUnit] ?? 0) || 0
													}
													chartId={'donut-' + area.id}
													height={111}
													width={111}
													tooltipUnit={t(`common:${areaUnit}`)}
												/>
											</div>
											<Typography className='pt-3 !text-lg'>{`${defaultNumber(dashBoardData?.plant?.area[areaUnit] ?? 0)} ${t(areaUnitTranslate)}`}</Typography>
											<Typography className='!text-xs text-[#707070]'>
												{`${t('common:total')} ${defaultNumber(dashBoardData?.plant?.total[areaUnit] ?? 0)} ${t(areaUnitTranslate)}`}
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

export default PlantingCardMain
