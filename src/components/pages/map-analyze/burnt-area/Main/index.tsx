import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'
import BurntSearchFormMain, { OptionType } from './SearchForm'
import BurntMapMain, { BURNT_MAP_ID } from './BurntMap'
import BurntDashboardMain from './Dashboard'
import { hotspotType, hotspotTypeCode, mapTypeCode } from '@interface/config/app.config'
import service from '@/api'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import useMapStore from '@/components/common/map/store/map'
import SwipeableEdgeDrawer from './Drawer'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]

interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	const { mapLibre } = useMapStore()
	const [searchSelectedAdmOption, setSearchSelectedAdmOption] = useState<OptionType | null>(null)
	const [selectedArea, setSelectedArea] = useState<{ id: string; admOption: OptionType | null }[]>([])
	const [selectedCard, setSelectedCard] = useState<string>()
	const [mapTypeArray, setMapTypeArray] = useState<mapTypeCode[]>([mapTypeCode.hotspots])
	const [openDrawer, setOpenDrawer] = useState(false)
	const [selectedHotspots, setSelectedHotspots] = useState<hotspotTypeCode[]>(hotspotType.map((type) => type.code))
	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)

	const [mapExtent, setMapExtent] = useState<number[][] | null>(null)

	const { data: hotspotBurntAreaData, isFetching: isHotspotBurntAreaDataLoading } = useQuery({
		queryKey: ['getHotspotBurntArea', selectedHotspots, selectedDateRange, searchSelectedAdmOption, mapExtent],
		queryFn: ({ signal }) =>
			service.mapAnalyze.getHotspotBurntArea(
				{
					inSugarcan: selectedHotspots,
					startDate: selectedDateRange[0].toISOString().split('T')[0],
					endDate: selectedDateRange[1].toISOString().split('T')[0],
					admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
					polygon: JSON.stringify(mapExtent ?? ''),
				},
				{ signal },
			),
		enabled: !!selectedHotspots?.length && (!!searchSelectedAdmOption?.id || !!mapExtent),
		placeholderData: keepPreviousData,
	})

	const { data: burntBurntAreaData, isFetching: isBurntBurntAreaDataLoading } = useQuery({
		queryKey: ['getBurntBurntArea', mapTypeArray, selectedDateRange, searchSelectedAdmOption, mapExtent],
		queryFn: ({ signal }) =>
			service.mapAnalyze.getBurntBurntArea(
				{
					startDate: selectedDateRange[0].toISOString().split('T')[0],
					endDate: selectedDateRange[1].toISOString().split('T')[0],
					admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
					polygon: JSON.stringify(mapExtent ?? ''),
				},
				{ signal },
			),
		enabled: mapTypeArray.includes(mapTypeCode.burnArea) && (!!searchSelectedAdmOption?.id || !!mapExtent),
		placeholderData: keepPreviousData,
	})

	const { data: plantBurntAreaData, isFetching: isPlantBurntAreaDataLoading } = useQuery({
		queryKey: ['getPlantBurntArea', mapTypeArray, selectedDateRange, searchSelectedAdmOption, mapExtent],
		queryFn: ({ signal }) =>
			service.mapAnalyze.getPlantBurntArea(
				{
					startDate: selectedDateRange[0].toISOString().split('T')[0],
					endDate: selectedDateRange[1].toISOString().split('T')[0],
					admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
					polygon: JSON.stringify(mapExtent ?? ''),
				},
				{ signal },
			),
		enabled: mapTypeArray.includes(mapTypeCode.plant) && (!!searchSelectedAdmOption?.id || !!mapExtent),
		placeholderData: keepPreviousData,
	})

	const mapDataHotSpot = useMemo(() => {
		if (selectedHotspots?.length) {
			return hotspotBurntAreaData?.data || []
		} else {
			return []
		}
	}, [selectedHotspots, hotspotBurntAreaData])

	const mapDataBurnt = useMemo(() => {
		if (mapTypeArray?.includes(mapTypeCode.burnArea)) {
			return burntBurntAreaData?.data || []
		} else {
			return []
		}
	}, [mapTypeArray, burntBurntAreaData])

	const mapDataPlant = useMemo(() => {
		if (mapTypeArray?.includes(mapTypeCode.plant)) {
			return plantBurntAreaData?.data || []
		} else {
			return []
		}
	}, [mapTypeArray, plantBurntAreaData])

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
		<Box className={classNames('flex w-full grow flex-col overflow-y-hidden', className)}>
			<BurntSearchFormMain
				className='relative z-10 w-full'
				selectedDateRange={selectedDateRange}
				onSelectedDateRange={(selectedDateRange: Date[]) => setSelectedDateRange(selectedDateRange)}
				selectedHotspots={selectedHotspots}
				handleChange={handleChange}
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
					className='max-w-[calc(80vw)] max-md:hidden'
				/>
				<BurntMapMain
					className='flex w-full flex-1 md:h-full max-md:[&_.maplibregl-ctrl-bottom-right]:bottom-[40px]'
					mapTypeArray={mapTypeArray}
					currentAdmOption={searchSelectedAdmOption}
					hotspotBurntAreaData={mapDataHotSpot}
					burntBurntAreaData={mapDataBurnt}
					plantBurntAreaData={mapDataPlant}
					isHotspotBurntAreaDataLoading={isHotspotBurntAreaDataLoading}
					isBurntBurntAreaDataLoading={isBurntBurntAreaDataLoading}
					isPlantBurntAreaDataLoading={isPlantBurntAreaDataLoading}
					onMapExtentChange={setMapExtent}
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
				/>
			</Box>
		</Box>
	)
}
