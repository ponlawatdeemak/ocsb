import { Global } from '@emotion/react'
import { styled } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import SwipeableDrawer from '@mui/material/SwipeableDrawer'
import { Divider, Typography } from '@mui/material'
import { AddDashboardIcon } from '@/components/svg/MenuIcon'
import CloseIcon from '@mui/icons-material/Close'
import { useTranslation } from 'next-i18next'
import { OptionType } from '../SearchForm'
import { hotspotTypeCode, mapTypeCode, yieldMapTypeCode } from '@interface/config/app.config'
import DashboardCardMain from '../Dashboard/Card'
import classNames from 'classnames'
import { useMemo } from 'react'

const drawerBleeding = 40

const Puller = styled('div')(({ theme }) => ({
	width: 105,
	height: 6,
	backgroundColor: '#A7A7A7',
	borderRadius: 3,
	position: 'absolute',
	top: 17,
	left: 'calc(50% - 52.5px)',
}))

const SwipeableEdgeDrawer = ({
	selectedArea,
	handleClickAdd,
	handleClickDelete,
	selectedCard,
	handleSelectCard,
	mapTypeArray,
	// selectedHotspots,
	selectedDateRange,
	openDrawer,
	toggleDrawer,
}: {
	selectedArea: { id: string; admOption: OptionType | null }[]
	handleClickAdd: () => void
	handleClickDelete: (item: any) => void
	selectedCard: string | undefined
	handleSelectCard: (item: any) => void
	mapTypeArray: yieldMapTypeCode[]
	// selectedHotspots: hotspotTypeCode[]
	selectedDateRange: Date[]
	openDrawer: boolean
	toggleDrawer: (newOpen: boolean) => void
}) => {
	const { t } = useTranslation(['map-analyze', 'common'])

	const cards = useMemo(() => {
		return selectedArea.map((item) => (
			<DashboardCardMain
				key={'mobile-' + item.id}
				handleClickDelete={() => {
					if (selectedArea.length === 1) {
						toggleDrawer(false)
					}
					handleClickDelete(item)
				}}
				isSelectedCard={(selectedCard ?? '') === item.id}
				handleSelectCard={() => handleSelectCard(item)}
				area={{ id: 'mobile-' + item.id, admOption: item.admOption }}
				mapTypeArray={mapTypeArray}
				// selectedHotspots={selectedHotspots}
				selectedDateRange={selectedDateRange}
				className={classNames({ '!w-[100%]': selectedArea.length === 1 })}
				openDrawer={openDrawer}
			/>
		))
	}, [
		handleClickDelete,
		handleSelectCard,
		mapTypeArray,
		openDrawer,
		selectedArea,
		selectedCard,
		selectedDateRange,
		toggleDrawer,
	])

	return (
		<div className='bg-white md:hidden'>
			<CssBaseline />
			<Global
				styles={{
					'.MuiDrawer-root > .MuiPaper-root': {
						height: `calc(90% - ${drawerBleeding}px)`,
						overflow: 'visible',
					},
				}}
			/>
			<SwipeableDrawer
				anchor='bottom'
				open={openDrawer}
				onClose={() => toggleDrawer(false)}
				onOpen={() => {
					if (selectedArea.length === 0) {
						handleClickAdd()
					}
					toggleDrawer(true)
				}}
				swipeAreaWidth={drawerBleeding}
				disableSwipeToOpen={false}
				ModalProps={{
					keepMounted: true,
				}}
				className='md:hidden'
			>
				<div
					style={{
						position: 'relative',
						top: -drawerBleeding,
						borderTopLeftRadius: 15,
						borderTopRightRadius: 15,
						visibility: 'visible',
						right: 0,
						left: 0,
						height: '100%',
						backgroundColor: 'white',
					}}
				>
					<Puller />
				</div>
				<div className='absolute z-[999] flex h-full w-full flex-col'>
					<div className='flex grow overflow-auto'>{cards}</div>
					<div className='flex w-full'>
						<button
							className='flex w-1/2 items-center justify-center gap-[6px] bg-[#EBF5FF] p-4'
							onClick={() => toggleDrawer(false)}
						>
							<CloseIcon className='!h-4 !w-4 pt-[2px] text-primary' />
							<Typography className='!truncate !text-sm text-primary'>{t('hideCompare')}</Typography>
						</button>
						<Divider orientation='vertical' className='h-full' />
						<button
							className={classNames('flex w-1/2 items-center justify-center gap-2 bg-[#EBF5FF] p-4', {
								'bg-background': selectedArea.length === 4,
							})}
							onClick={handleClickAdd}
							disabled={selectedArea.length === 4}
						>
							<AddDashboardIcon />
							<Typography className='!truncate !text-sm text-primary'>{t('addCompare')}</Typography>
						</button>
					</div>
				</div>
			</SwipeableDrawer>
		</div>
	)
}

export default SwipeableEdgeDrawer
