import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useState } from 'react'
import BurntSearchFormMain from './SearchForm'
import BurntMapMain from './BurntMap'
import BurntDashboardMain from './Dashboard'

interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	const [selectedArea, setSelectedArea] = useState<number[]>([])
	const [selectedCard, setSelectedCard] = useState<number>()

	const handleClickAdd = () => {
		const updateArea = [...selectedArea]
		updateArea.push(Math.random())
		setSelectedArea(updateArea)
	}

	const handleClickDelete = (item: any) => {
		const updateArea = [...selectedArea]
		const index = updateArea.findIndex((area) => area === item)
		updateArea.splice(index, 1)
		setSelectedArea(updateArea)
	}

	const handleSelectCard = (item: any) => {
		setSelectedCard(item)
	}

	return (
		<Box className={classNames('flex h-full w-full flex-col', className)}>
			<BurntSearchFormMain className='z-10 w-full' />
			<Box className='relative flex h-full w-full'>
				<BurntDashboardMain
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					className='max-w-[calc(80vw)]'
				/>
				<BurntMapMain className='h-full w-full flex-1 bg-green-200' />
			</Box>
		</Box>
	)
}
