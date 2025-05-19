import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import BurntSearchFormMain, { OptionType } from './SearchForm'
import BurntMapMain, { BURNT_MAP_ID } from './BurntMap'
import BurntDashboardMain from './Dashboard'
import { hotspotType, hotspotTypeCode, mapTypeCode } from '@interface/config/app.config'
import useMapStore from '@/components/common/map/store/map'
import SwipeableEdgeDrawer from './Drawer'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]
export interface SelectedArea {
	id: string
	admOption: OptionType | null
}
interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	const { mapLibre } = useMapStore()
	const [searchSelectedAdmOption, setSearchSelectedAdmOption] = useState<OptionType | null>(null)
	const [selectedArea, setSelectedArea] = useState<SelectedArea[]>([])
	const [selectedCard, setSelectedCard] = useState<string>()
	const [mapTypeArray, setMapTypeArray] = useState<mapTypeCode[]>([mapTypeCode.hotspots])
	const [openDrawer, setOpenDrawer] = useState(false)
	const [selectedHotspots, setSelectedHotspots] = useState<hotspotTypeCode[]>(hotspotType.map((type) => type.code))
	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)

	const [maxHotspotValues, setMaxHotspotValues] = useState<Record<string, number>>({})
	const [maxBurntValues, setMaxBurntValues] = useState<Record<string, number>>({})

	const toggleDrawer = useCallback((newOpen: boolean) => {
		setOpenDrawer(newOpen)
	}, [])

	const handleClickAdd = useCallback(() => {
		const updateArea = [...selectedArea]
		updateArea.push({ id: crypto.randomUUID(), admOption: searchSelectedAdmOption })
		setSelectedArea(updateArea)
	}, [searchSelectedAdmOption, selectedArea])

	const handleClickDelete = useCallback(
		(item: SelectedArea) => {
			const updateArea = [...selectedArea]
			const index = updateArea.findIndex((area) => area.id === item.id)
			updateArea.splice(index, 1)
			setSelectedArea(updateArea)

			setMaxHotspotValues((prevMaxValue) => {
				const { [item.id]: _, ...newData } = prevMaxValue
				return newData
			})
			setMaxBurntValues((prevMaxValue) => {
				const { [item.id]: _, ...newData } = prevMaxValue
				return newData
			})
		},
		[selectedArea],
	)

	const handleSelectCard = useCallback(
		(item: SelectedArea) => {
			const burntMap = mapLibre[BURNT_MAP_ID]
			setSelectedCard((selected) => (selected === item.id ? undefined : item.id))
			if (burntMap && selectedCard !== item.id && item?.admOption?.geometry) {
				burntMap.fitBounds(item.admOption.geometry, { padding: 100 })
				setSearchSelectedAdmOption(item.admOption)
			} else if (!item?.admOption?.geometry) {
				setSearchSelectedAdmOption(null)
			}
		},
		[mapLibre, selectedCard],
	)

	const handleSelectedAdmOption = useCallback(
		(value: OptionType | null) => {
			setSearchSelectedAdmOption(value)
			if (selectedArea.find((area) => area.id === selectedCard)) {
				const updateArea = [...selectedArea]
				const index = selectedArea.findIndex((area) => area.id === selectedCard)
				updateArea[index].admOption = value
				setSelectedArea(updateArea)
			} else {
				setSelectedCard(undefined)
			}
		},
		[selectedArea, selectedCard],
	)

	const handleChangeMapTypeArray = useCallback(
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
		<Box className={classNames('flex w-full grow flex-col overflow-y-hidden', className)}>
			<BurntSearchFormMain
				className='relative z-10 w-full'
				selectedDateRange={selectedDateRange}
				onSelectedDateRange={(selectedDateRange: Date[]) => setSelectedDateRange(selectedDateRange)}
				selectedHotspots={selectedHotspots}
				handleChangeMapTypeArray={handleChangeMapTypeArray}
				mapTypeArray={mapTypeArray}
				searchSelectedAdmOption={searchSelectedAdmOption}
				handleSelectedAdmOption={handleSelectedAdmOption}
			/>
			<Box className='absolute flex h-full w-full overflow-y-auto overflow-x-hidden max-md:h-[calc(100%-80px)] md:relative'>
				<BurntDashboardMain
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					mapTypeArray={mapTypeArray}
					selectedHotspots={selectedHotspots}
					selectedDateRange={selectedDateRange}
					openDrawer={openDrawer}
					toggleDrawer={toggleDrawer}
					maxHotspotValues={maxHotspotValues}
					setMaxHotspotValues={setMaxHotspotValues}
					maxBurntValues={maxBurntValues}
					setMaxBurntValues={setMaxBurntValues}
					className='z-[99] max-md:hidden'
				/>
				<BurntMapMain
					className='flex w-full flex-1 md:h-full max-md:[&_.maplibregl-ctrl-bottom-right]:bottom-[40px]'
					mapTypeArray={mapTypeArray}
					currentAdmOption={searchSelectedAdmOption}
					selectedHotspots={selectedHotspots}
					selectedDateRange={selectedDateRange}
				/>
				<SwipeableEdgeDrawer
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					mapTypeArray={mapTypeArray}
					selectedHotspots={selectedHotspots}
					selectedDateRange={selectedDateRange}
					openDrawer={openDrawer}
					toggleDrawer={toggleDrawer}
					maxHotspotValues={maxHotspotValues}
					setMaxHotspotValues={setMaxHotspotValues}
					maxBurntValues={maxBurntValues}
					setMaxBurntValues={setMaxBurntValues}
				/>
			</Box>
		</Box>
	)
}
