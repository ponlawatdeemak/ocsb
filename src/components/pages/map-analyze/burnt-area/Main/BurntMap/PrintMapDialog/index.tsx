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
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import html2canvas from 'html2canvas'
pdfMake.vfs = pdfFonts.vfs

const GRID_COLS = 4
const GRID_ROWS = 3

interface NavigatorWithSaveBlob extends Navigator {
	msSaveOrOpenBlob?: (blob: Blob, defaultName?: string) => boolean
}

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

	const exportPdf = async () => {
		try {
			const style = document.createElement('style')
			document.head.appendChild(style)
			style.sheet?.insertRule('body > div:last-child img { display: inline-block; }')

			const dialogDiv = document.querySelector('.hidden-dialog .MuiDialog-paper') as HTMLDivElement
			if (dialogDiv) {
				const canvas = await html2canvas(dialogDiv, {
					useCORS: true,
					allowTaint: true,
					scale: 2,
				})
				const dataURL = canvas.toDataURL('image/png')

				const a4Width = 841
				const dialogRatio = dialogDiv.clientWidth / dialogDiv.clientHeight
				const pdfPageMargin = 40
				const dialogImageWidth = a4Width - pdfPageMargin * 2

				const docDefinition: any = {
					pageSize: 'A4',
					pageOrientation: 'landscape',
					content: [
						{
							image: dataURL,
							width: dialogImageWidth,
							height: dialogImageWidth / dialogRatio,
							alignment: 'center',
							margin: [0, pdfPageMargin / dialogRatio, 0, 0],
						},
					],
				}

				pdfMake.createPdf(docDefinition).getBlob((blob: Blob) => {
					const url = URL.createObjectURL(blob)
					const a = document.createElement('a')
					a.href = url
					a.download = 'burnt_map.pdf'
					document.body.appendChild(a)
					a.click()
					document.body.removeChild(a)
					URL.revokeObjectURL(url)
				})
			} else {
				throw new Error()
			}
		} catch (error) {
			console.error(error)
		}
	}

	return (
		<div className='relative'>
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

									{/* Map's legend */}
									<Box
										className={classNames(
											'z-1 absolute bottom-8 left-8 flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3 max-lg:py-[3px] max-lg:pl-[5px] max-lg:pr-[7px]',
											{ '!hidden': mapLegendArray.length === 0 },
										)}
									>
										{mapLegendArray.map((mapLegend) => {
											return (
												<Box key={mapLegend.key} className='flex shrink-0 items-center gap-1.5'>
													{mapLegend.type === mapTypeCode.burnArea ? (
														<Box className='h-2 w-3 bg-[#F9B936] max-lg:h-[4px] max-lg:w-[5px]'></Box>
													) : (
														<Box
															className={classNames(
																'h-3 w-3 rounded-full max-lg:h-[5px] max-lg:w-[5px]',
																{
																	'bg-[#FF0000]':
																		mapLegend.type === mapTypeCode.hotspots,
																	'bg-[#8AB62D]':
																		mapLegend.type === mapTypeCode.plant,
																},
															)}
														></Box>
													)}
													<Typography className='!text-2xs text-black max-lg:!text-[4px] max-lg:!leading-none'>
														{mapLegend.title}
													</Typography>
												</Box>
											)
										})}
									</Box>

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
										<MiniMapCompassIcon
											fill={basemap === BasemapType.CartoLight ? 'black' : 'white'}
										/>
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
												onClick={exportPdf}
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

			{/* hidden Dialog for PDF image */}
			<Dialog
				className={classNames(
					'hidden-dialog !z-[-9999] [&_.MuiBackdrop-root]:!opacity-0 [&_.MuiDialog-container]:!absolute [&_.MuiDialog-container]:!left-[-9999px] [&_.MuiDialog-container]:!top-[-9999px]',
					className,
				)}
				open={open}
				onClose={(_event, reason) => {
					if (reason !== 'backdropClick') {
						onClose()
					}
				}}
				PaperProps={{
					className:
						'!max-w-[1025px] !min-w-[1025px] !w-[1025px] !min-h-[627px] !max-h-[627px] !h-[627px] !m-6 !rounded-[15px] !bg-primary',
				}}
			>
				<DialogTitle className='flex items-center gap-2 !py-3'>
					<Typography className='flex-1 !text-md !leading-5 text-white'>{displayDialogTitle}</Typography>
					<IconButton className='!p-1.5' aria-label='close' onClick={onClose}>
						<Close className='!invisible text-white' />
					</IconButton>
				</DialogTitle>
				<DialogContent className='flex h-full w-full flex-col justify-between rounded-[15px] bg-white !py-4'>
					{loading || isMapTypeDataLoading ? (
						<div className='flex h-full w-full items-center justify-center'>
							<CircularProgress />
						</div>
					) : (
						<Box className='flex h-full w-full items-center gap-6'>
							<Box className='flex h-full flex-1 flex-col gap-4'>
								<Box className='relative aspect-[738/473] w-full border border-solid border-black p-6'>
									<Box
										className='aspect-[688/423] w-full'
										component='img'
										src={''}
										alt='Burnt Map Image'
									/>

									{/* Map's legend */}
									<Box
										className={classNames(
											'z-1 absolute bottom-8 left-8 flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3',
											{ '!hidden': mapLegendArray.length === 0 },
										)}
									>
										{mapLegendArray.map((mapLegend) => {
											return (
												<Box key={mapLegend.key} className='flex shrink-0 items-center gap-1.5'>
													{mapLegend.type === mapTypeCode.burnArea ? (
														<Box className='h-2 w-3 bg-[#F9B936]'></Box>
													) : (
														<Box
															className={classNames('h-3 w-3 rounded-full', {
																'bg-[#FF0000]': mapLegend.type === mapTypeCode.hotspots,
																'bg-[#8AB62D]': mapLegend.type === mapTypeCode.plant,
															})}
														></Box>
													)}
													<Typography className='!text-2xs text-black'>
														{mapLegend.title}
													</Typography>
												</Box>
											)
										})}
									</Box>

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
								<Typography className='w-full flex-1 !text-2xs !leading-5 text-[#707070]'>
									{(language === Languages.TH
										? 'จุดความร้อนจากดาวเทียม  VIIRS, MODIS / ร่องรอยเผาไหม้จากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-2 / พื้นที่ปลูกอ้อยจากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-1, Sentinel-2'
										: 'Hotspots from VIIRS, MODIS satellites / Burn scars analyzed from Sentinel-2 satellite data / Sugarcane plantation areas analyzed from Sentinel-1, Sentinel-2 satellite data') +
										` (${displaySelectedDateRange})`}
								</Typography>
							</Box>
							<Box className='flex h-full w-[22%] flex-col items-center'>
								<Box className='relative aspect-[215/287]'>
									<Box
										className='h-full w-full'
										component='img'
										src={''}
										alt='Burnt Mini Map Image'
									/>

									<Box className='absolute right-[5px] top-[5px]'>
										<MiniMapCompassIcon
											fill={basemap === BasemapType.CartoLight ? 'black' : 'white'}
										/>
									</Box>
								</Box>
								<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
									<Box className='flex w-full flex-col gap-1.5'>
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-2xs text-black'>
												{t('date')}
											</Typography>
											<Typography className='flex-1 !text-2xs !font-bold text-black'>
												{formatDate(Date.now(), 'dd MMMM yyyy', language)}
											</Typography>
										</Box>
										{mapTypeData?.hotspot && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-2xs text-black'>
													{t('map-analyze:hotspot')}
												</Typography>
												<Typography className='flex-1 !text-2xs !font-bold text-black'>
													{`${defaultNumber(mapTypeData.hotspot.total)} ${t('point')}`}
												</Typography>
											</Box>
										)}
										{mapTypeData?.burnArea && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-2xs text-black'>
													{t('map-analyze:burntScar')}
												</Typography>
												<Typography className='flex-1 !text-2xs !font-bold text-black'>
													{`${defaultNumber(mapTypeData.burnArea?.list?.reduce((total, item) => total + (item.area?.[areaUnit] ?? 0), 0) ?? 0)} ${t('common:' + areaUnit)}`}
												</Typography>
											</Box>
										)}
										{mapTypeData?.plant && (
											<Box className='flex w-full'>
												<Typography className='w-[50%] !text-2xs text-black'>
													{t('map-analyze:plantingArea')}
												</Typography>
												<Typography className='flex-1 !text-2xs !font-bold text-black'>
													{`${defaultNumber(mapTypeData.plant?.area?.[areaUnit] ?? 0)} ${t('common:' + areaUnit)}`}
												</Typography>
											</Box>
										)}
									</Box>
									<Box className='flex w-full'>
										<Typography className='!text-2xs text-[#707070]'>
											{language === Languages.TH
												? 'กลุ่มเทคโนโลยีสารสนเทศและการสื่อสาร  0-2430-6813 ต่อ 3825'
												: 'Information and Communication Technology Group, Office of the Cane and Sugar Board, 0-2430-6813 extension 3825'}
										</Typography>
									</Box>
								</Box>
							</Box>
						</Box>
					)}
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default PrintMapDialog
