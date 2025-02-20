import { Button, Tooltip } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import DashboardCardMain from './Card'
import { AddDashboardIcon, DashboardIcon } from '@/components/svg/MenuIcon'
import { useTranslation } from 'next-i18next'

interface BurntDashboardMainProps {
	selectedArea: any[]
	handleClickAdd: () => void
	handleClickDelete: (item: any) => void
	selectedCard: number | undefined
	handleSelectCard: (item: any) => void
	mapTypeArray: string[]
	selectedHotspots: string[]
	className?: string
}

const BurntDashboardMain: React.FC<BurntDashboardMainProps> = ({
	selectedArea,
	handleClickAdd,
	handleClickDelete,
	selectedCard,
	handleSelectCard,
	mapTypeArray,
	selectedHotspots,
	className = '',
}) => {
	const { t } = useTranslation(['map-analyze', 'common', 'overview'])

	if (selectedArea.length === 0) {
		return (
			<Button
				className='!absolute left-0 top-0 z-[9999] gap-[6px] !rounded-none !px-6 !py-3 !text-sm !font-normal !text-white max-md:!hidden'
				variant='contained'
				onClick={handleClickAdd}
			>
				<DashboardIcon /> {t('compare')}
			</Button>
		)
	} else {
		return (
			<div className={classNames('relative flex h-full gap-[1px]', className)}>
				{selectedArea.map((item) => (
					<DashboardCardMain
						key={item.id}
						handleClickDelete={() => handleClickDelete(item)}
						isSelectedCard={selectedCard === item}
						handleSelectCard={() => handleSelectCard(item)}
						payloadData={item}
						mapTypeArray={mapTypeArray}
						selectedHotspots={selectedHotspots}
					/>
				))}
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
					>
						<Button
							className='!absolute right-[-40px] top-0 z-[1] !max-h-10 !min-h-10 !min-w-10 !max-w-10 !rounded-[0px_5px_5px_0px] !bg-[#EBF5FF] !p-2 !text-primary !shadow-none hover:!shadow'
							variant='contained'
							onClick={handleClickAdd}
						>
							<AddDashboardIcon />
						</Button>
					</Tooltip>
				)}
			</div>
		)
	}
}

export default BurntDashboardMain
