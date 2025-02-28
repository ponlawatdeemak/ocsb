import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import PlantingMapMain from './PlantMap'
import { yieldMapTypeCode } from '@interface/config/app.config'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import useMapStore from '@/components/common/map/store/map'
import SwipeableEdgeDrawer from './Drawer'
import PlantingSearchFormMain, { OptionType } from './SearchForm'
import PlantingDashboardMain from './Dashboard'
import { GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]

interface PlantingAreaMainProps {
	className?: string
}

export const PlantingAreaMain: React.FC<PlantingAreaMainProps> = ({ className = '' }) => {
	const { mapLibre } = useMapStore()
	const [searchSelectedAdmOption, setSearchSelectedAdmOption] = useState<OptionType | null>(null)
	const [selectedArea, setSelectedArea] = useState<{ id: string; admOption: OptionType | null }[]>([])
	const [selectedCard, setSelectedCard] = useState<string>()
	const [mapTypeArray, setMapTypeArray] = useState<yieldMapTypeCode[]>([])
	const [openDrawer, setOpenDrawer] = useState(false)
	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)
	const [selectedRepeatArea, setSelectedRepeatArea] = useState<GetRepeatAreaLookupDtoOut>()

	const [mapExtent, setMapExtent] = useState<number[][] | null>(null)

	// const { data: hotspotBurntAreaData, isLoading: isHotspotBurntAreaDataLoading } = useQuery({
	// 	queryKey: ['getHotspotBurntArea', selectedHotspots, selectedDateRange, searchSelectedAdmOption, mapExtent],
	// 	queryFn: ({ signal }) =>
	// 		service.mapAnalyze.getHotspotBurntArea(
	// 			{
	// 				inSugarcan: selectedHotspots,
	// 				startDate: selectedDateRange[0].toISOString().split('T')[0],
	// 				endDate: selectedDateRange[1].toISOString().split('T')[0],
	// 				admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
	// 				polygon: JSON.stringify(mapExtent ?? ''),
	// 			},
	// 			{ signal },
	// 		),
	// 	enabled: !!selectedHotspots?.length && (!!searchSelectedAdmOption?.id || !!mapExtent),
	// })

	// const mapDataHotSpot = useMemo(() => {
	// 	if (selectedHotspots?.length) {
	// 		return hotspotBurntAreaData?.data || []
	// 	} else {
	// 		return []
	// 	}
	// }, [selectedHotspots, hotspotBurntAreaData])

	const toggleDrawer = useCallback((newOpen: boolean) => {
		setOpenDrawer(newOpen)
	}, [])

	const handleClickAdd = useCallback(() => {
		const updateArea = [...selectedArea]
		updateArea.push({ id: crypto.randomUUID(), admOption: searchSelectedAdmOption })
		setSelectedArea(updateArea)
	}, [searchSelectedAdmOption, selectedArea])

	const handleClickDelete = useCallback(
		(item: any) => {
			const updateArea = [...selectedArea]
			const index = updateArea.findIndex((area) => area.id === item.id)
			updateArea.splice(index, 1)
			setSelectedArea(updateArea)
		},
		[selectedArea],
	)

	const handleSelectCard = useCallback(
		(item: any) => {
			setSelectedCard((selected) => (selected === item.id ? undefined : item.id))
			if (mapLibre && selectedCard !== item.id && item?.admOption?.geometry) {
				mapLibre.fitBounds(item.admOption.geometry, { padding: 100 })
				setSearchSelectedAdmOption(item.admOption)
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

	const handleChange = useCallback(
		(event: any) => {
			event.preventDefault()
			event.stopPropagation()
			const updateMapTypeArray = [...mapTypeArray]

			if (event.target.value) {
				const { value } = event.target

				// setSelectedHotspots(value)
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
			<PlantingSearchFormMain
				className='relative z-10 w-full'
				selectedDateRange={selectedDateRange}
				onSelectedDateRange={(selectedDateRange: Date[]) => setSelectedDateRange(selectedDateRange)}
				handleChange={handleChange}
				mapTypeArray={mapTypeArray}
				searchSelectedAdmOption={searchSelectedAdmOption}
				handleSelectedAdmOption={handleSelectedAdmOption}
				selectedRepeatArea={selectedRepeatArea}
				handleSelectedRepeatArea={handleSelectedRepeatArea}
			/>
			<Box className='absolute flex h-full w-full overflow-y-auto max-md:h-[calc(100%-80px)] md:relative'>
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
					className='max-w-[calc(80vw)] max-md:hidden'
				/>
				<PlantingMapMain
					className='w-full flex-1 md:h-full max-md:[&_.maplibregl-ctrl-bottom-right]:bottom-[40px]'
					mapTypeArray={mapTypeArray}
					currentAdmOption={searchSelectedAdmOption}
					selectedRepeatArea={selectedRepeatArea}
					// hotspotBurntAreaData={mapDataHotSpot}
					// burntBurntAreaData={mapDataBurnt}
					// plantBurntAreaData={mapDataPlant}
					// isHotspotBurntAreaDataLoading={isHotspotBurntAreaDataLoading}
					// isBurntBurntAreaDataLoading={isBurntBurntAreaDataLoading}
					// isPlantBurntAreaDataLoading={isPlantBurntAreaDataLoading}
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
