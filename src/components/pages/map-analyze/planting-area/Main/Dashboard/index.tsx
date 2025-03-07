import { Button, Tooltip } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import DashboardCardMain from './Card'
import { AddDashboardIcon, DashboardIcon } from '@/components/svg/MenuIcon'
import { useTranslation } from 'next-i18next'
import { yieldMapTypeCode } from '@interface/config/app.config'
import { SelectedArea } from '..'
// import CloseIcon from '@mui/icons-material/Close'

interface PlantingDashboardMainProps {
	selectedArea: SelectedArea[]
	handleClickAdd: () => void
	handleClickDelete: (item: SelectedArea) => void
	selectedCard: string | undefined
	handleSelectCard: (item: SelectedArea) => void
	mapTypeArray: yieldMapTypeCode[]
	selectedDateRange: Date[]
	openDrawer: boolean
	toggleDrawer: (newOpen: boolean) => void
	className?: string
}

const PlantingDashboardMain: React.FC<PlantingDashboardMainProps> = ({
	selectedArea,
	handleClickAdd,
	handleClickDelete,
	selectedCard,
	handleSelectCard,
	mapTypeArray,
	selectedDateRange,
	openDrawer,
	toggleDrawer,
	className = '',
}) => {
	const { t } = useTranslation(['map-analyze', 'common', 'overview'])

	const cards = useMemo(() => {
		return selectedArea.map((item) => (
			<DashboardCardMain
				key={item.id}
				handleClickDelete={() => {
					if (selectedArea.length === 1) {
						toggleDrawer(false)
					}
					handleClickDelete(item)
				}}
				isSelectedCard={(selectedCard ?? '') === item.id}
				handleSelectCard={() => handleSelectCard(item)}
				area={item}
				mapTypeArray={mapTypeArray}
				selectedDateRange={selectedDateRange}
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
		<>
			<Button
				className={classNames(
					'!absolute left-0 top-0 z-[2] gap-[6px] !rounded-none !px-6 !py-3 !text-sm !font-normal !text-white max-md:!hidden',
					{ '!hidden': openDrawer },
				)}
				variant='contained'
				onClick={() => {
					if (selectedArea.length === 0) {
						handleClickAdd()
						toggleDrawer(true)
					} else {
						toggleDrawer(true)
					}
				}}
			>
				<DashboardIcon /> {t('compare')}
			</Button>

			<div className={classNames('relative flex h-full gap-[1px]', { '!hidden': !openDrawer }, className)}>
				{cards}

				{/* <Tooltip
					title={t('hideCompare')}
					placement='right'
					componentsProps={{
						tooltip: {
							sx: {
								bgcolor: 'white',
								color: 'black',
								fontSize: '12px',
								padding: '8px',
								boxShadow: '0px 2px 10px -2px rgb(0 0 0 / 0.3)',
							},
						},
						arrow: {
							sx: {
								color: 'white',
							},
						},
					}}
					arrow
					hidden={!openDrawer}
				>
					<Button
						className={classNames(
							'!absolute right-[-40px] top-0 z-[1] !max-h-10 !min-h-10 !min-w-10 !max-w-10 !rounded-[0px_5px_5px_0px] !bg-[#EBF5FF] !p-2 !text-primary !shadow-none hover:z-[9999] hover:!shadow',
						)}
						variant='contained'
						onClick={() => {
							toggleDrawer(false)
						}}
					>
						<CloseIcon className='!h-4 !w-4 pt-[2px] text-primary' />
					</Button>
				</Tooltip> */}

				{selectedArea.length < 4 && (
					<Tooltip
						title={t('addCompare')}
						placement='right'
						componentsProps={{
							tooltip: {
								sx: {
									bgcolor: 'white',
									color: 'black',
									fontSize: '12px',
									padding: '8px',
									boxShadow: '0px 2px 10px -2px rgb(0 0 0 / 0.3)',
								},
							},
							arrow: {
								sx: {
									color: 'white',
								},
							},
						}}
						arrow
						hidden={!openDrawer}
					>
						<Button
							className={classNames(
								'!absolute right-[-40px] top-0 z-[1] !max-h-10 !min-h-10 !min-w-10 !max-w-10 !rounded-[0px_5px_5px_0px] !bg-[#EBF5FF] !p-2 !text-primary !shadow-none hover:z-[9999] hover:!shadow',
							)}
							variant='contained'
							onClick={handleClickAdd}
						>
							<AddDashboardIcon />
						</Button>
					</Tooltip>
				)}
			</div>
		</>
	)
}

export default PlantingDashboardMain
