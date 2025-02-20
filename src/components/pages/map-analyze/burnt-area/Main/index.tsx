import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import BurntSearchFormMain from './SearchForm'
import BurntMapMain from './BurntMap'
import BurntDashboardMain from './Dashboard'
import { hotspotType, mapTypeCode } from '@interface/config/app.config'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]

interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	const [selectedArea, setSelectedArea] = useState<any[]>([])
	const [selectedCard, setSelectedCard] = useState<number>()
	const [mapTypeArray, setMapTypeArray] = useState<string[]>([mapTypeCode.hotspots])
	const [selectedHotspots, setSelectedHotspots] = useState<string[]>(hotspotType.map((type) => type.code))

	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)

	const handleClickAdd = () => {
		const updateArea = [...selectedArea]
		updateArea.push({ id: Math.random().toString().split('.')[1] })
		setSelectedArea(updateArea)
	}

	const handleClickDelete = (item: any) => {
		const updateArea = [...selectedArea]
		const index = updateArea.findIndex((area) => area === item)
		updateArea.splice(index, 1)
		setSelectedArea(updateArea)
	}

	const handleSelectCard = (item: any) => {
		setSelectedCard((selected) => (selected === item ? undefined : item))
	}

	const handleChange = useCallback(
		(event: any) => {
			event.preventDefault()
			event.stopPropagation()
			const updateMapTypeArray = [...mapTypeArray]

			if (event.target.value) {
				const { value } = event.target

				setSelectedHotspots(value)
				if (value && value.length > 0) {
					const findIndex = updateMapTypeArray.findIndex((type) => type === event.target.name)
					if (findIndex === -1) {
						updateMapTypeArray.push(event.target.name)
						setMapTypeArray(updateMapTypeArray)
					}
				} else if (!value || value.length === 0) {
					const findIndex = updateMapTypeArray.findIndex((type) => type === event.target.name)
					if (findIndex !== -1) {
						updateMapTypeArray.splice(findIndex, 1)
						setMapTypeArray(updateMapTypeArray)
					}
				}
			} else {
				const findIndex = updateMapTypeArray.findIndex((type) => type === event.target.name)
				if (findIndex === -1) {
					updateMapTypeArray.push(event.target.name)
					setMapTypeArray(updateMapTypeArray)
				} else {
					updateMapTypeArray.splice(findIndex, 1)
					setMapTypeArray(updateMapTypeArray)
				}
			}
		},
		[mapTypeArray],
	)

	return (
		<Box className={classNames('flex h-full w-full flex-col', className)}>
			<BurntSearchFormMain
				className='z-10 w-full'
				selectedDateRange={selectedDateRange}
				onSelectedDateRange={(selectedDateRange: Date[]) => setSelectedDateRange(selectedDateRange)}
				selectedHotspots={selectedHotspots}
				handleChange={handleChange}
				mapTypeArray={mapTypeArray}
			/>
			<Box className='absolute flex h-full w-full md:relative'>
				<BurntDashboardMain
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					mapTypeArray={mapTypeArray}
					selectedHotspots={selectedHotspots}
					className='max-w-[calc(80vw)] max-lg:hidden'
				/>
				<BurntMapMain className='h-full w-full flex-1' />
			</Box>
		</Box>
	)
}
