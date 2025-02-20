import { Box, Button } from '@mui/material'
import classNames from 'classnames'
import React, { useMemo } from 'react'
import DashboardCardMain from './Card'

interface BurntDashboardMainProps {
	selectedArea: any[]
	handleClickAdd: () => void
	handleClickDelete: (item: any) => void
	selectedCard: number | undefined
	handleSelectCard: (item: any) => void
	className?: string
}

const BurntDashboardMain: React.FC<BurntDashboardMainProps> = ({
	selectedArea,
	handleClickAdd,
	handleClickDelete,
	selectedCard,
	handleSelectCard,
	className = '',
}) => {
	if (selectedArea.length === 0) {
		return (
			<Button
				className='!absolute left-0 top-0 z-[9999] !rounded-none !text-white max-md:!hidden'
				variant='contained'
				onClick={handleClickAdd}
			>
				Add
			</Button>
		)
	} else {
		return (
			<div className={classNames('relative flex h-full gap-[1px] max-lg:hidden', className)}>
				{selectedArea.map((item, index) => (
					<DashboardCardMain
						key={index}
						handleClickDelete={() => handleClickDelete(item)}
						isSelectedCard={selectedCard === item}
						handleSelectCard={() => handleSelectCard(item)}
					/>
				))}
				{selectedArea.length < 4 && (
					<Button
						className='!absolute right-[-40px] top-0 z-[9999] !max-h-10 !min-h-10 !min-w-10 !max-w-10 !bg-[#EBF5FF] !text-primary !shadow-none hover:!shadow'
						variant='contained'
						onClick={handleClickAdd}
					>
						+
					</Button>
				)}
			</div>
		)
	}
}

export default BurntDashboardMain
