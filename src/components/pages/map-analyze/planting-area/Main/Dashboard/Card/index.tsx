import { Box, CircularProgress, Divider, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import CloseIcon from '@mui/icons-material/Close'
import DonutChart from '../Chart/DonutChart'
import { useTranslation } from 'next-i18next'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'
import { ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { OptionType } from '../../SearchForm'
import useQuantityUnit from '@/store/quantity-unit'

interface PlantingCardMainProps {
	handleClickDelete: () => void
	isSelectedCard: boolean
	handleSelectCard: () => void
	area: { id: string; admOption: OptionType | null }
	mapTypeArray: yieldMapTypeCode[]
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
	selectedDateRange,
	openDrawer,
	className = '',
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const areaUnitTranslate = `common:${areaUnit}`
	const quantityUnitTranslate = `common:${quantityUnit}`

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
		enabled: openDrawer === true && mapTypeArray.length !== 0,
	})

	//#region plant
	const defaultColorPlant = { [t('plantingArea')]: '#8AB62D', [t('noPlantingArea')]: '#f5f5f6' }
	//#endregion

	//#region product
	const defaultColorProduct = { [t('overview:SugarCaneQuantity')]: '#40C4FF', [t('noSugarCaneQuantity')]: '#f5f5f6' }
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
				<div className='flex w-full grow flex-col items-center justify-start py-5'>
					{isDashBoardDataLoading ? (
						<div className='flex h-full w-full items-center justify-center'>
							<CircularProgress />
						</div>
					) : (
						<>
							{mapTypeArray.includes(yieldMapTypeCode.plant) && (
								<>
									<Typography className='pb-3 text-center !text-sm'>{t('plantingArea')}</Typography>
									{dashBoardData?.plant ? (
										<>
											<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
												<DonutChart
													columns={[
														[
															t('plantingArea'),
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

							{mapTypeArray.includes(yieldMapTypeCode.product) && (
								<>
									{dashBoardData?.product && (
										<>
											{mapTypeArray.includes(yieldMapTypeCode.plant) && (
												<Divider flexItem className='!mb-6 !mt-4' />
											)}

											<Typography
												className={classNames('!text-xs text-[#707070]', {
													'!mt-2': !mapTypeArray.includes(yieldMapTypeCode.plant),
												})}
											>
												{t('avgSugarCaneYield')}
											</Typography>

											<Typography className='!text-lg'>{`${defaultNumber(dashBoardData.product.average[quantityUnit][areaUnit] ?? 0)} ${t(quantityUnitTranslate)}/${t(areaUnitTranslate)}`}</Typography>
										</>
									)}

									{(dashBoardData?.product || mapTypeArray.includes(yieldMapTypeCode.plant)) && (
										<Divider flexItem className='!mb-4 !mt-6' />
									)}

									<Typography className='pb-3 text-center !text-sm'>
										{t('overview:SugarCaneQuantity')}
									</Typography>
									{dashBoardData?.product ? (
										<>
											<div className='h-[111px] !max-h-[111px] w-[111px] !max-w-[111px]'>
												<DonutChart
													columns={[
														[
															t('overview:SugarCaneQuantity'),
															dashBoardData.product.result?.[quantityUnit] ?? 0,
														],
														[
															t('noSugarCaneQuantity'),
															dashBoardData.product.diffResult?.[quantityUnit] ?? 0,
														],
													]}
													colors={defaultColorProduct}
													percent={
														((dashBoardData.product.result[quantityUnit] ?? 0) * 100) /
															(dashBoardData.product.total[quantityUnit] ?? 0) || 0
													}
													chartId={'second-donut-' + area.id}
													height={111}
													width={111}
													tooltipUnit={t(`common:${quantityUnit}`)}
												/>
											</div>
											<Typography className='pt-3 !text-lg'>{`${defaultNumber(dashBoardData.product.result[quantityUnit] ?? 0)} ${t(quantityUnitTranslate)}`}</Typography>
											<Typography className='!text-xs text-[#707070]'>
												{`${t('common:total')} ${defaultNumber(dashBoardData.product.total[quantityUnit] ?? 0)} ${t(quantityUnitTranslate)}`}
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
