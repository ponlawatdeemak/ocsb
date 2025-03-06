import { CsvIcon, MiniMapCompassIcon, PdfIcon } from '@/components/svg/MenuIcon'
import { Close } from '@mui/icons-material'
import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogContent,
	DialogTitle,
	IconButton,
	Typography,
} from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'
import { EndBoundsType, MapLegendType } from '..'
import useMapStore from '@/components/common/map/store/map'
import { BasemapType } from '@/components/common/map/interface/map'
import { hotspotTypeCode, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import { Languages } from '@/enum'
import { OptionType } from '../../SearchForm'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { defaultNumber } from '@/utils/text'
import useAreaUnit from '@/store/area-unit'
import { formatDate } from '@/utils/date'

const GRID_COLS = 4
const GRID_ROWS = 3

interface PrintMapDialogProps {
	className?: string
	open: boolean
	burntMapImage: string
	burntMiniMapImage: string
	endBounds: EndBoundsType
	mapTypeArray: mapTypeCode[]
	mapLegendArray: MapLegendType[]
	currentAdmOption: OptionType | null
	selectedDateRange: Date[]
	selectedHotspots: hotspotTypeCode[]
	loading: boolean
	onClose: () => void
}

const PrintMapDialog: React.FC<PrintMapDialogProps> = ({
	className = '',
	open,
	burntMapImage,
	burntMiniMapImage,
	endBounds,
	mapTypeArray,
	mapLegendArray,
	currentAdmOption,
	selectedDateRange,
	selectedHotspots,
	loading = false,
	onClose,
}) => {
	const { basemap } = useMapStore()
	const { areaUnit } = useAreaUnit()
	const { t, i18n } = useTranslation(['common', 'map-anlyze'])
	const language = i18n.language as keyof ResponseLanguage

	const { data: mapTypeData, isFetching: isMapTypeDataLoading } = useQuery({
		queryKey: [
			'getDashBoardBurntAreaPrintMap',
			selectedDateRange,
			currentAdmOption,
			mapTypeArray,
			selectedHotspots,
		],
		queryFn: async () => {
			const response = await service.mapAnalyze.getDashBoardBurntArea({
				startDate: selectedDateRange[0]?.toISOString().split('T')[0],
				endDate: selectedDateRange[1]?.toISOString().split('T')[0],
				admC: currentAdmOption?.id ? Number(currentAdmOption.id) : undefined,
				mapType: mapTypeArray,
				inSugarcan: selectedHotspots,
			})
			return response.data
		},
		enabled: !!open,
	})

	const gridColsArray = useMemo(
		() =>
			Array.from({ length: GRID_COLS - 1 }).map((_, index) => {
				const gap = endBounds.xmax - endBounds.xmin
				return {
					key: 'col' + index,
					percent: ((index + 1) / GRID_COLS) * 100,
					value: (endBounds.xmin + ((index + 1) / GRID_COLS) * gap).toFixed(5),
				}
			}),
		[endBounds.xmax, endBounds.xmin],
	)

	const gridRowsArray = useMemo(
		() =>
			Array.from({ length: GRID_ROWS - 1 }).map((_, index) => {
				const gap = endBounds.ymax - endBounds.ymin
				return {
					key: 'row' + index,
					percent: ((index + 1) / GRID_ROWS) * 100,
					value: (endBounds.ymin + ((index + 1) / GRID_ROWS) * gap).toFixed(5),
				}
			}),
		[endBounds.ymax, endBounds.ymin],
	)

	const displayDialogTitle = useMemo(() => {
		const mapType = mapLegendArray.map((item, index) => {
			if (mapLegendArray.length > 1 && index === mapLegendArray.length - 1) {
				return t('and') + (language === Languages.EN ? ' ' : '') + item.title
			}

			return item.title
		})

		return t('mapDisplayData') + (language === Languages.EN ? ' ' : '') + mapType.join(' ')
	}, [mapLegendArray, t])

	const displaySelectedDateRange = useMemo(() => {
		if (selectedDateRange[0].toString() === selectedDateRange[1].toString()) {
			return selectedDateRange[0] ? formatDate(selectedDateRange[0], 'dd MMMM yyyy', language) : ''
		} else {
			const startDate = selectedDateRange[0] ? formatDate(selectedDateRange[0], 'dd MMMM yyyy', language) : ''
			const endDate = selectedDateRange[1] ? formatDate(selectedDateRange[1], 'dd MMMM yyyy', language) : ''
			return `${startDate} - ${endDate}`
		}
	}, [selectedDateRange, language])

	return (
		<Dialog
			className={classNames('', className)}
			open={open}
			onClose={(_event, reason) => {
				if (reason !== 'backdropClick') {
					onClose()
				}
			}}
			PaperProps={{
				className: 'w-[1025px] !max-w-none lg:h-[627px] !m-6 !rounded-[15px] !bg-primary',
			}}
		>
			<DialogTitle className='flex items-center gap-2 !py-3 max-lg:!px-5'>
				<Typography className='flex-1 !text-md !leading-5 text-white'>{displayDialogTitle}</Typography>
				<IconButton className='!p-1.5' aria-label='close' onClick={onClose}>
					<Close className='text-white' />
				</IconButton>
			</DialogTitle>
			<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !py-4 max-lg:!px-4'>
				{loading || isMapTypeDataLoading ? (
					<div className='flex h-full w-full items-center justify-center'>
						<CircularProgress />
					</div>
				) : (
					<Box className='flex h-full w-full items-center gap-5 max-lg:flex-col lg:gap-6'>
						<Box className='flex h-full flex-1 flex-col gap-4'>
							<Box className='relative aspect-[738/473] w-full border border-solid border-black p-6'>
								<Box
									className='aspect-[688/423] w-full'
									component='img'
									src={burntMapImage}
									alt='Burnt Map Image'
								/>

								{/* Vertical Lines */}
								{gridColsArray.map((gridCol) => {
									return (
										<React.Fragment key={gridCol.key}>
											<div
												className='absolute top-0 h-full w-[1px] bg-black'
												style={{ left: gridCol.percent + '%' }}
											/>

											{/* Top Label */}
											<span
												className='absolute -top-4 -translate-x-1/2 text-2xs text-black'
												style={{ left: gridCol.percent + '%' }}
											>
												{gridCol.value}
											</span>

											{/* Bottom Label */}
											<span
												className='absolute -bottom-4 -translate-x-1/2 text-2xs text-black'
												style={{ left: gridCol.percent + '%' }}
											>
												{gridCol.value}
											</span>
										</React.Fragment>
									)
								})}

								{/* Horizontal Lines */}
								{gridRowsArray.map((gridRow) => {
									return (
										<React.Fragment key={gridRow.key}>
											<div
												className='absolute left-0 h-[1px] w-full bg-black'
												style={{ bottom: gridRow.percent + '%' }}
											/>

											{/* Left Label */}
											<span
												className='absolute -left-2 -translate-x-1/2 translate-y-1/2 -rotate-90 transform text-2xs text-black'
												style={{ bottom: gridRow.percent + '%' }}
											>
												{gridRow.value}
											</span>

											{/* Right Label */}
											<span
												className='absolute -right-2 translate-x-1/2 translate-y-1/2 rotate-90 transform text-2xs text-black'
												style={{ bottom: gridRow.percent + '%' }}
											>
												{gridRow.value}
											</span>
										</React.Fragment>
									)
								})}
							</Box>
							<Typography className='w-full flex-1 !text-2xs !leading-5 text-[#707070] max-lg:hidden'>
								{(language === Languages.TH
									? 'จุดความร้อนจากดาวเทียม  VIIRS, MODIS / ร่องรอยเผาไหม้จากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-2 / พื้นที่ปลูกอ้อยจากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-1, Sentinel-2'
									: 'Hotspots from VIIRS, MODIS satellites / Burn scars analyzed from Sentinel-2 satellite data / Sugarcane plantation areas analyzed from Sentinel-1, Sentinel-2 satellite data') +
									` (${displaySelectedDateRange})`}
							</Typography>
						</Box>
						<Box className='flex h-full w-full flex-col items-center lg:w-[22%]'>
							<Box className='relative aspect-[215/287]'>
								<Box
									className='h-full w-full'
									component='img'
									src={burntMiniMapImage}
									alt='Burnt Mini Map Image'
								/>

								<Box className='absolute right-[5px] top-[5px]'>
									<MiniMapCompassIcon fill={basemap === BasemapType.CartoLight ? 'black' : 'white'} />
								</Box>
							</Box>
							<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
								<Box className='flex w-full flex-col gap-2 lg:gap-1.5'>
									<Box className='flex w-full'>
										<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
											{t('date')}
										</Typography>
										<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
											{formatDate(Date.now(), 'dd MMMM yyyy', language)}
										</Typography>
									</Box>
									{mapTypeData?.hotspot && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
												{t('map-analyze:hotspot')}
											</Typography>
											<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
												{`${defaultNumber(mapTypeData.hotspot.total)} ${t('point')}`}
											</Typography>
										</Box>
									)}
									{mapTypeData?.burnArea && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
												{t('map-analyze:burntScar')}
											</Typography>
											<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
												{`${defaultNumber(mapTypeData.burnArea?.list?.reduce((total, item) => total + (item.area?.[areaUnit] ?? 0), 0) ?? 0)} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)}
									{mapTypeData?.plant && (
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
												{t('map-analyze:plantingArea')}
											</Typography>
											<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
												{`${defaultNumber(mapTypeData.plant?.area?.[areaUnit] ?? 0)} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)}
								</Box>
								<Box className='flex w-full flex-col gap-6 lg:gap-3'>
									<Typography className='!text-sm text-[#707070] lg:!text-2xs'>
										{language === Languages.TH
											? 'กลุ่มเทคโนโลยีสารสนเทศและการสื่อสาร  0-2430-6813 ต่อ 3825'
											: 'Information and Communication Technology Group, Office of the Cane and Sugar Board, 0-2430-6813 extension 3825'}
									</Typography>
									<Box className='flex w-full items-center justify-between'>
										<Button
											className='flex h-[38px] w-[84px] items-center gap-1.5 !rounded-[5px] !bg-white !px-5 !py-2.5 !shadow-none hover:!shadow-none [&_.MuiButton-icon]:m-0'
											variant='contained'
											startIcon={<PdfIcon />}
										>
											<Box className='!text-xs text-primary'>{'PDF'}</Box>
										</Button>
										<Button
											className='flex h-[38px] w-[84px] items-center gap-1.5 !rounded-[5px] !bg-white !px-5 !py-2.5 !shadow-none hover:!shadow-none [&_.MuiButton-icon]:m-0'
											variant='contained'
											startIcon={<CsvIcon />}
										>
											<Box className='!text-xs text-primary'>{'CSV'}</Box>
										</Button>
									</Box>
								</Box>
							</Box>
						</Box>
					</Box>
				)}
			</DialogContent>
		</Dialog>
	)
}

export default PrintMapDialog
