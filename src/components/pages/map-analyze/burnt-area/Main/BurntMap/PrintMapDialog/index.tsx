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
import { EndBoundsType } from '..'
import useMapStore from '@/components/common/map/store/map'
import { BasemapType } from '@/components/common/map/interface/map'

const GRID_COLS = 4
const GRID_ROWS = 3

interface PrintMapDialogProps {
	className?: string
	open: boolean
	burntMapImage: string
	burntMiniMapImage: string
	endBounds: EndBoundsType
	loading: boolean
	onClose: () => void
}

const PrintMapDialog: React.FC<PrintMapDialogProps> = ({
	className = '',
	open,
	burntMapImage,
	burntMiniMapImage,
	endBounds,
	loading = false,
	onClose,
}) => {
	const { basemap } = useMapStore()
	const { t } = useTranslation(['map-analyze', 'common'])

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
				<Typography className='flex-1 !text-md !leading-5 text-white'>
					{'แผนที่แสดงข้อมูลจุดความร้อน ร่องรอยเผาไหม้ และพื้นที่ปลูกอ้อย'}
				</Typography>
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
								{
									'จุดความร้อนจากดาวเทียม  VIIRS, MODIS / ร่องรอยเผาไหม้จากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-2 / พื้นที่ปลูกอ้อยจากการวิเคราะห์ข้อมูลดาวเทียม Sentinel-1, Sentinel-2 (วันที่ 19 ธันวาคม 2567 - 5 มกราคม 2568)'
								}
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
									<Box className='flex w-full items-center'>
										<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
											{'วันที่'}
										</Typography>
										<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
											{'24 ตุลาคม 2567'}
										</Typography>
									</Box>
									<Box className='flex w-full items-center'>
										<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
											{'จุดความร้อน'}
										</Typography>
										<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
											{'8 จุด'}
										</Typography>
									</Box>
									<Box className='flex w-full items-center'>
										<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
											{'ร่องรอยเผาไหม้'}
										</Typography>
										<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
											{'50 ไร่'}
										</Typography>
									</Box>
									<Box className='flex w-full items-center'>
										<Typography className='w-[50%] !text-sm text-black lg:!text-2xs'>
											{'พื้นที่ปลูกอ้อย'}
										</Typography>
										<Typography className='flex-1 !text-sm !font-bold text-black lg:!text-2xs'>
											{'1,250 ไร่'}
										</Typography>
									</Box>
								</Box>
								<Box className='flex w-full flex-col gap-6 lg:gap-3'>
									<Typography className='!text-sm text-[#707070] lg:!text-2xs'>
										{
											'กลุ่มเทคโนโลยีสารสนเทศและการสื่อสาร สำนักงานคณะกรรมการอ้อยและน้ำตาลทราย 0-2430-6813 ต่อ 3825'
										}
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
