import { BasemapType } from '@/components/common/map/interface/map'
import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { CsvIcon, MiniMapCompassIcon, PdfIcon } from '@/components/svg/MenuIcon'
import { Languages } from '@/enum'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { mapTypeCode, ResponseLanguage, yieldMapTypeCode } from '@interface/config/app.config'
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
import React, { useCallback, useMemo } from 'react'
import { BurntMapDetailType, GridType, MAP_EXPORT, MapLegendType, MINI_MAP_EXPORT, PlantMapDetailType } from '.'
import { BurntMapExportParamType } from '@/components/pages/map-analyze/burnt-area/Main/BurntMap'
import { PlantMapExportParamType } from '@/components/pages/map-analyze/planting-area/Main/PlantMap'
import { defaultNumber } from '@/utils/text'
import { formatDate } from '@/utils/date'
import { GetPrintInfoBurntDtoOut } from '@interface/dto/burnt-area/burnt-area.dto.out'
import Image from 'next/image'

interface PrintMapDialogProps {
	className?: string
	id: 'burnt' | 'plant'
	open: boolean
	mapDetail: BurntMapDetailType | PlantMapDetailType | null
	mapLegendArray: MapLegendType[]
	mapExportParam: BurntMapExportParamType | PlantMapExportParamType
	gridColsArray: GridType[]
	gridRowsArray: GridType[]
	displayDialogTitle: string
	displaySelectedDateRange: string
	loading?: boolean
	disabled?: boolean
	handleMapPdfExport: () => Promise<void>
	handleMapCsvExport: () => Promise<void>
	onClose: () => void
	mapData: GetPrintInfoBurntDtoOut
}

const PrintMapDialog: React.FC<PrintMapDialogProps> = ({
	className = '',
	id,
	open,
	mapDetail,
	mapLegendArray,
	mapExportParam,
	gridColsArray,
	gridRowsArray,
	displayDialogTitle,
	displaySelectedDateRange,
	loading,
	disabled,
	handleMapPdfExport,
	handleMapCsvExport,
	onClose,
	mapData,
}) => {
	const { basemap } = useMapStore()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const { t, i18n } = useTranslation(['map-analyze', 'common'])
	const language = i18n.language as keyof ResponseLanguage

	const quantityLang = useMemo(() => 'common:' + quantityUnit, [quantityUnit])
	const areaLang = useMemo(() => 'common:' + areaUnit, [areaUnit])

	const mapLegendElement = useCallback(
		(isFixedLegend: boolean = false) => {
			if (id === 'burnt') {
				return (
					<Box
						className={classNames(
							'z-1 absolute bottom-8 left-8 flex items-center gap-2 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3',
							{
								'!hidden': mapLegendArray.length === 0,
								'max-lg:bottom-[22px] max-lg:left-[22px] max-sm:pl-[5px] max-sm:pr-[7px]':
									!isFixedLegend,
							},
						)}
					>
						{mapLegendArray.map((mapLegend) => {
							return (
								<Box key={mapLegend.key} className='flex shrink-0 items-center gap-1.5'>
									{mapLegend.type === mapTypeCode.burnArea ? (
										<Box
											className={classNames('h-2 w-3 bg-[#F9B936]', {
												'max-sm:h-1 max-sm:w-2': !isFixedLegend,
											})}
										></Box>
									) : (
										<Box
											className={classNames('h-3 w-3 rounded-full', {
												'max-sm:h-2 max-sm:w-2': !isFixedLegend,
												'bg-[#FF0000]': mapLegend.type === mapTypeCode.hotspots,
												'bg-[#8AB62D]': mapLegend.type === mapTypeCode.plant,
											})}
										></Box>
									)}
									<Typography
										className={classNames('!text-2xs text-black', {
											'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
										})}
									>
										{mapLegend.title}
									</Typography>
								</Box>
							)
						})}
					</Box>
				)
			} else if (id === 'plant' && mapExportParam.type === 'plant') {
				return (
					<Box
						className={classNames(
							'z-1 absolute bottom-8 left-8 flex max-w-[calc(100%-68px)] items-center gap-3 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3',
							{
								'!hidden':
									mapExportParam.mapTypeArray.length === 0 &&
									mapExportParam.selectedRepeatArea === undefined,
								'max-lg:bottom-[22px] max-lg:left-[22px] max-lg:max-w-[calc(100%-48px)] max-sm:pl-[5px] max-sm:pr-[7px]':
									!isFixedLegend,
							},
						)}
					>
						<Box
							className={classNames('hidden shrink-0 items-center gap-1.5', {
								'!flex': mapExportParam.mapTypeArray.includes(yieldMapTypeCode.plant),
							})}
						>
							<Box
								className={classNames('h-3 w-3 rounded-full bg-[#8AB62D]', {
									'max-sm:h-2 max-sm:w-2': !isFixedLegend,
								})}
							></Box>
							<Typography
								className={classNames('!text-2xs text-black', {
									'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
								})}
							>
								{t('plantingArea')}
							</Typography>
						</Box>
						<Box
							className={classNames('hidden shrink-0 items-center gap-3', {
								'!flex': mapExportParam.mapTypeArray.includes(yieldMapTypeCode.product),
							})}
						>
							<Box className={'flex items-center gap-1.5'}>
								<Box
									className={classNames('h-3 w-3 rounded-full bg-[#003491]', {
										'max-sm:h-2 max-sm:w-2': !isFixedLegend,
									})}
								></Box>
								<Typography
									className={classNames('!text-2xs text-black', {
										'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
									})}
								>{`${t('moreThan')} ${defaultNumber(mapExportParam.yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
							</Box>
							<Box className={'flex items-center gap-1.5'}>
								<Box
									className={classNames('h-3 w-3 rounded-full bg-[#1DB240]', {
										'max-sm:h-2 max-sm:w-2': !isFixedLegend,
									})}
								></Box>
								<Typography
									className={classNames('!text-2xs text-black', {
										'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
									})}
								>{`${defaultNumber(mapExportParam.yieldLegendNumber.ten, 6)}-${defaultNumber(mapExportParam.yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
							</Box>
							<Box className={'flex items-center gap-1.5'}>
								<Box
									className={classNames('h-3 w-3 rounded-full bg-[#F0E927]', {
										'max-sm:h-2 max-sm:w-2': !isFixedLegend,
									})}
								></Box>
								<Typography
									className={classNames('!text-2xs text-black', {
										'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
									})}
								>{`${defaultNumber(mapExportParam.yieldLegendNumber.five, 6)}-${defaultNumber(mapExportParam.yieldLegendNumber.nine, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
							</Box>
							<Box className={'flex items-center gap-1.5'}>
								<Box
									className={classNames('h-3 w-3 rounded-full bg-[#FF9500]', {
										'max-sm:h-2 max-sm:w-2': !isFixedLegend,
									})}
								></Box>
								<Typography
									className={classNames('!text-2xs text-black', {
										'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
									})}
								>{`${t('lessThan')} ${defaultNumber(mapExportParam.yieldLegendNumber.five, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
							</Box>
						</Box>
						<Box
							className={classNames('hidden shrink-0 items-center gap-1.5', {
								'!flex': mapExportParam.selectedRepeatArea,
							})}
						>
							<Box
								className={classNames(
									'h-3 w-3 rotate-[45deg] rounded-full bg-[repeating-linear-gradient(to_right,#8AB62D_0px,#8AB62D_1px,#ffffff_1px,#ffffff_2px)]',
									{ 'max-sm:h-2 max-sm:w-2': !isFixedLegend },
								)}
							></Box>
							<Typography
								className={classNames('!text-2xs text-black', {
									'max-sm:!text-[8px] max-sm:!leading-none': !isFixedLegend,
								})}
							>{`${t('replantingArea')} ${mapExportParam.selectedRepeatArea?.name ?? '-'} ${t('common:year')}`}</Typography>
						</Box>
					</Box>
				)
			}

			return <></>
		},
		[id, mapLegendArray, mapExportParam, quantityLang, areaLang, t],
	)

	const gridElement = useMemo(() => {
		return (
			<>
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
			</>
		)
	}, [gridColsArray, gridRowsArray])

	const mapDetailElement = useCallback(
		(isFixedLegend: boolean = false) => {
			if (mapDetail && mapData) {
				if (id === 'burnt' && mapDetail.type === 'burnt') {
					return (
						<>
							{Object.keys(mapDetail).map((item) => {
								return (
									mapLegendArray.map((item) => item.type).includes(item as mapTypeCode) && (
										<Box key={item} className='flex w-full'>
											<Typography
												className={classNames('w-[50%] !text-2xs text-black', {
													'max-lg:!text-sm': !isFixedLegend,
												})}
											>
												{item === mapTypeCode.hotspots && t('hotspot')}
												{item === mapTypeCode.burnArea && t('burntScar')}
												{item === mapTypeCode.plant && t('plantingArea')}
											</Typography>
											<Typography
												className={classNames('flex-1 !text-2xs !font-bold text-black', {
													'max-lg:!text-sm': !isFixedLegend,
												})}
											>
												{item === mapTypeCode.hotspots &&
													`${defaultNumber(mapData?.hotspot || 0)} ${t('common:point')}`}
												{item === mapTypeCode.burnArea &&
													`${defaultNumber(mapData?.burnArea[areaUnit] || 0)} ${t('common:' + areaUnit)}`}
												{item === mapTypeCode.plant &&
													`${defaultNumber(mapData?.plant[areaUnit] || 0)} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)
								)
							})}
						</>
					)
				} else if (id === 'plant' && mapDetail.type === 'plant') {
					return (
						<>
							{Object.keys(mapDetail).map((item) => {
								return (
									mapLegendArray.map((item) => item.type).includes(item as yieldMapTypeCode) && (
										<Box key={item} className='flex w-full'>
											<Typography
												className={classNames('w-[50%] !text-2xs text-black', {
													'max-lg:!text-sm': !isFixedLegend,
												})}
											>
												{item === yieldMapTypeCode.plant && t('plantingArea')}
												{item === yieldMapTypeCode.product && t('sugarCaneYield')}
												{item === yieldMapTypeCode.repeat && t('replantingArea')}
											</Typography>
											<Typography
												className={classNames('flex-1 !text-2xs !font-bold text-black', {
													'max-lg:!text-sm': !isFixedLegend,
												})}
											>
												{item === yieldMapTypeCode.plant &&
													`${defaultNumber(mapData?.plant[areaUnit] || 0)} ${t('common:' + areaUnit)}`}
												{item === yieldMapTypeCode.product &&
													`${defaultNumber(mapData?.product[quantityUnit] || 0)} ${t('common:' + quantityUnit)}`}
												{item === yieldMapTypeCode.repeat &&
													`${defaultNumber(mapData?.repeat[areaUnit] || 0)} ${t('common:' + areaUnit)}`}
											</Typography>
										</Box>
									)
								)
							})}
						</>
					)
				}
			}

			return <></>
		},
		[mapDetail, id, mapLegendArray, quantityUnit, areaUnit, t, mapData],
	)

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
					{loading ? (
						<div className='flex h-full w-full items-center justify-center'>
							<CircularProgress />
						</div>
					) : (
						<Box className='flex h-full w-full items-center gap-5 max-lg:flex-col lg:gap-6'>
							<Box className='flex h-full flex-1 flex-col gap-4 max-lg:w-full'>
								<Box className='relative aspect-[738/473] w-full border border-solid border-black p-4 lg:max-h-[473px] lg:p-6'>
									<Box
										id={`${id}-map-export-container`}
										className={classNames(
											'flex h-full w-full [&_.map-tools]:hidden [&_.maplibregl-compact]:!box-border [&_.maplibregl-compact]:flex [&_.maplibregl-compact]:!h-4 [&_.maplibregl-compact]:!min-h-0 [&_.maplibregl-compact]:items-center [&_.maplibregl-compact]:!pr-4 [&_.maplibregl-ctrl-attrib-button]:!h-4 [&_.maplibregl-ctrl-attrib-button]:!w-4 [&_.maplibregl-ctrl-attrib-button]:!bg-contain [&_.maplibregl-ctrl-attrib-inner]:mr-1 [&_.maplibregl-ctrl-attrib-inner]:text-[8px] [&_.maplibregl-ctrl-attrib-inner]:leading-3 [&_.maplibregl-ctrl-bottom-right]:!z-[0] [&_.maplibregl-ctrl-scale]:!mb-0',
											{
												'[&_.maplibregl-ctrl-bottom-right]:max-sm:!mb-[22px]': id === 'burnt',
												'[&_.maplibregl-compact]:!mb-[42px] [&_.maplibregl-ctrl-bottom-right]:max-sm:!bottom-[-10px]':
													id === 'plant',
											},
										)}
									>
										<MapView mapId={`${id}-${MAP_EXPORT}`} />
									</Box>

									{/* Map's legend */}
									{mapLegendElement()}

									{gridElement}
								</Box>
								<Typography className='w-full flex-1 !text-2xs !leading-5 text-[#707070] max-lg:hidden'>
									{(language === Languages.TH
										? 'จุดความร้อนจากดาวเทียม  VIIRS, MODIS / ร่องรอยเผาไหม้จากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-2 / พื้นที่ปลูกอ้อยจากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-1, Sentinel-2'
										: 'Hotspots from VIIRS, MODIS satellites / Burn scars analyzed from Sentinel-2 satellite data / Sugarcane plantation areas analyzed from Sentinel-1, Sentinel-2 satellite data') +
										` (${displaySelectedDateRange})`}
								</Typography>
							</Box>
							<Box className='flex h-full w-full flex-col items-center lg:w-[22%]'>
								<Box className='relative aspect-[215/287] w-full'>
									<Box
										id={`${id}-mini-map-export-container`}
										className='flex h-full w-full [&_.map-tools]:hidden [&_.maplibregl-compact]:!mr-[5px] [&_.maplibregl-compact]:!box-border [&_.maplibregl-compact]:flex [&_.maplibregl-compact]:!h-4 [&_.maplibregl-compact]:!min-h-0 [&_.maplibregl-compact]:items-center [&_.maplibregl-compact]:!pr-4 [&_.maplibregl-ctrl-attrib-button]:!h-4 [&_.maplibregl-ctrl-attrib-button]:!w-4 [&_.maplibregl-ctrl-attrib-button]:!bg-contain [&_.maplibregl-ctrl-attrib-inner]:mr-1 [&_.maplibregl-ctrl-attrib-inner]:text-[6px] [&_.maplibregl-ctrl-scale]:hidden'
									>
										<MapView mapId={`${id}-${MINI_MAP_EXPORT}`} isInteractive={false} />
									</Box>

									<Box className='absolute right-[5px] top-[5px]'>
										<MiniMapCompassIcon
											fill={basemap === BasemapType.CartoLight ? 'black' : 'white'}
										/>
									</Box>
								</Box>
								<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
									<Box className='flex w-full flex-1 flex-col gap-2 lg:gap-1.5'>
										<Box className='flex w-full'>
											<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
												{t('common:date')}
											</Typography>
											<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
												{formatDate(Date.now(), 'dd MMMM yyyy', language)}
											</Typography>
										</Box>
										{mapDetailElement()}
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
												onClick={handleMapPdfExport}
												disabled={disabled}
											>
												<Box className='!text-xs text-primary'>{'PDF'}</Box>
											</Button>
											<Button
												className={classNames(
													'flex h-[38px] w-[84px] items-center gap-1.5 !rounded-[5px] !px-5 !py-2.5 !shadow-none hover:!shadow-none [&_.MuiButton-icon]:m-0',
													{
														'!bg-white': mapLegendArray.length > 0,
														'!bg-background': mapLegendArray.length === 0,
													},
												)}
												variant='contained'
												startIcon={
													<CsvIcon fill={mapLegendArray.length === 0 ? '#d6d6d6' : ''} />
												}
												onClick={handleMapCsvExport}
												disabled={mapLegendArray.length === 0 || disabled}
											>
												<Box
													className={classNames('!text-xs text-primary', {
														'!text-gray': mapLegendArray.length === 0,
													})}
												>
													{'CSV'}
												</Box>
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
					<Box className='flex h-full w-full items-center gap-6'>
						<Box className='flex h-full flex-1 flex-col gap-4'>
							<Box className='relative aspect-[738/473] max-h-[473px] w-full border border-solid border-black p-6'>
								<Box
									className='captured-map-image aspect-[688/423] w-full bg-contain'
									component='img'
									alt='Map Image'
								/>

								{/* Map's legend */}
								{mapLegendElement(true)}

								{basemap === BasemapType.Google && (
									<Image
										src={'/images/map/google_on_non_white_hdpi.png'}
										width={59}
										height={18}
										className={classNames(
											'absolute bottom-[52px] left-[calc(50%-29.5px)] z-20 md:bottom-8',
										)}
										alt={`Google Logo`}
									/>
								)}
								{gridElement}
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
									className='captured-mini-map-image h-full w-full bg-contain'
									component='img'
									alt='Mini Map Image'
								/>

								<Box className='absolute right-[5px] top-[5px]'>
									<MiniMapCompassIcon fill={basemap === BasemapType.CartoLight ? 'black' : 'white'} />
								</Box>

								{basemap === BasemapType.Google && (
									<Image
										src={'/images/map/google_on_non_white_hdpi.png'}
										width={59}
										height={18}
										className={classNames(
											'absolute bottom-[52px] left-[calc(50%-29.5px)] z-20 md:bottom-2',
										)}
										alt={`Google Logo`}
									/>
								)}
							</Box>
							<Box className='flex w-full flex-1 flex-col items-center justify-between gap-5 bg-[#E6E6E6] p-4'>
								<Box className='flex w-full flex-1 flex-col gap-1.5'>
									<Box className='flex w-full'>
										<Typography className='w-[50%] !text-2xs text-black'>
											{t('common:date')}
										</Typography>
										<Typography className='flex-1 !text-2xs !font-bold text-black'>
											{formatDate(Date.now(), 'dd MMMM yyyy', language)}
										</Typography>
									</Box>

									{mapDetailElement(true)}
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
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default PrintMapDialog
