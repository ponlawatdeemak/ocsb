import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import PlantingMapMain, { PLANTING_MAP_ID } from './PlantMap'
import { yieldMapTypeCode } from '@interface/config/app.config'
import useMapStore from '@/components/common/map/store/map'
import SwipeableEdgeDrawer from './Drawer'
import PlantingSearchFormMain, { OptionType } from './SearchForm'
import PlantingDashboardMain from './Dashboard'
import { GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]
export interface SelectedArea {
	id: string
	admOption: OptionType | null
}
interface PlantingAreaMainProps {
	className?: string
}

export const PlantingAreaMain: React.FC<PlantingAreaMainProps> = ({ className = '' }) => {
	const { mapLibre } = useMapStore()
	const [searchSelectedAdmOption, setSearchSelectedAdmOption] = useState<OptionType | null>(null)
	const [selectedArea, setSelectedArea] = useState<SelectedArea[]>([])
	const [selectedCard, setSelectedCard] = useState<string>()
	const [mapTypeArray, setMapTypeArray] = useState<yieldMapTypeCode[]>([yieldMapTypeCode.plant])
	const [openDrawer, setOpenDrawer] = useState(false)
	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)
	const [selectedRepeatArea, setSelectedRepeatArea] = useState<GetRepeatAreaLookupDtoOut>()

	const [mapExtent, setMapExtent] = useState<number[][] | null>(null)

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
		},
		[selectedArea],
	)

	const handleSelectCard = useCallback(
		(item: SelectedArea) => {
			const plantingMap = mapLibre[PLANTING_MAP_ID]
			setSelectedCard((selected) => (selected === item.id ? undefined : item.id))
			if (plantingMap && selectedCard !== item.id && item?.admOption?.geometry) {
				plantingMap.fitBounds(item.admOption.geometry, { padding: 100 })
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

	const handleSelectedRepeatArea = useCallback((value: GetRepeatAreaLookupDtoOut | undefined) => {
		setSelectedRepeatArea(value)
	}, [])

	const handleChangeMapTypeArray = useCallback(
		(event: React.MouseEvent<HTMLButtonElement>) => {
			event.preventDefault()
			event.stopPropagation()
			const updateMapTypeArray = [...mapTypeArray]

			const findIndex = updateMapTypeArray.findIndex((type) => type === event.currentTarget.name)
			if (findIndex === -1) {
				updateMapTypeArray.push(event.currentTarget.name as yieldMapTypeCode)
				setMapTypeArray(updateMapTypeArray)
			} else {
				updateMapTypeArray.splice(findIndex, 1)
				setMapTypeArray(updateMapTypeArray)
			}
		},
		[mapTypeArray],
	)

	return (
		<Box className={classNames('flex w-full grow flex-col overflow-y-hidden', className)}>
			<PlantingSearchFormMain
				className='relative z-10 w-full'
				selectedDateRange={selectedDateRange}
				onSelectedDateRange={(selectedDateRange: Date[]) => setSelectedDateRange(selectedDateRange)}
				handleChangeMapTypeArray={handleChangeMapTypeArray}
				mapTypeArray={mapTypeArray}
				searchSelectedAdmOption={searchSelectedAdmOption}
				handleSelectedAdmOption={handleSelectedAdmOption}
				selectedRepeatArea={selectedRepeatArea}
				handleSelectedRepeatArea={handleSelectedRepeatArea}
			/>
			<Box className='absolute flex h-full w-full overflow-y-auto overflow-x-hidden max-md:h-[calc(100%-80px)] md:relative'>
				<PlantingDashboardMain
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					mapTypeArray={mapTypeArray}
					selectedDateRange={selectedDateRange}
					openDrawer={openDrawer}
					toggleDrawer={toggleDrawer}
					className='z-[99] max-md:hidden'
				/>
				<PlantingMapMain
					className='w-full flex-1 md:h-full max-md:[&_.maplibregl-ctrl-bottom-right]:bottom-[40px]'
					mapTypeArray={mapTypeArray}
					currentAdmOption={searchSelectedAdmOption}
					selectedRepeatArea={selectedRepeatArea}
					selectedDateRange={selectedDateRange}
					// plantYieldAreaData={mapDataPlant}
					// productYieldAreaData={mapDataProduct}
					// replantYieldAreaData={mapDataReplant}
					// isPlantYieldAreaDataLoading={false}
					// isProductYieldAreaDataLoading={isProductYieldAreaDataLoading}
					// isReplantYieldAreaDataLoading={false}
					onMapExtentChange={setMapExtent}
				/>
				<SwipeableEdgeDrawer
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					mapTypeArray={mapTypeArray}
					selectedDateRange={selectedDateRange}
					openDrawer={openDrawer}
					toggleDrawer={toggleDrawer}
				/>
			</Box>
		</Box>
	)
}
