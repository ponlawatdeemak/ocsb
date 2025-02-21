import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import BurntSearchFormMain, { OptionType } from './SearchForm'
import BurntMapMain from './BurntMap'
import BurntDashboardMain from './Dashboard'
import { hotspotType, hotspotTypeCode, mapTypeCode } from '@interface/config/app.config'
import { DateObject } from 'react-multi-date-picker'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]

export const defaultCurrentDateRange: DateObject[] = [new DateObject(), new DateObject()]

interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	const [searchSelectedAdmOption, setSearchSelectedAdmOption] = useState<OptionType | null>(null)
	const [selectedArea, setSelectedArea] = useState<{ id: string; admOption: OptionType | null }[]>([])
	const [selectedCard, setSelectedCard] = useState<string>()
	const [mapTypeArray, setMapTypeArray] = useState<mapTypeCode[]>([mapTypeCode.hotspots])
	const [selectedHotspots, setSelectedHotspots] = useState<hotspotTypeCode[]>(hotspotType.map((type) => type.code))
	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)
	const [currentDateRange, setCurrentDateRange] = useState<DateObject[]>(defaultCurrentDateRange)

	const [mapExtent, setMapExtent] = useState<number[][] | null>(null)

	const { data: hotspotBurntAreaData, isLoading: isHotspotBurntAreaDataLoading } = useQuery({
		queryKey: ['getHotspotBurntArea', selectedHotspots, selectedDateRange, searchSelectedAdmOption, mapExtent],
		queryFn: () =>
			service.mapAnalyze.getHotspotBurntArea({
				inSugarcan: selectedHotspots,
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
				polygon: JSON.stringify(mapExtent ?? ''),
			}),
		enabled: !!searchSelectedAdmOption?.id || !!mapExtent,
	})

	const { data: burntBurntAreaData, isLoading: isBurntBurntAreaDataLoading } = useQuery({
		queryKey: ['getBurntBurntArea', selectedDateRange, searchSelectedAdmOption, mapExtent],
		queryFn: () =>
			service.mapAnalyze.getBurntBurntArea({
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
				polygon: JSON.stringify(mapExtent ?? ''),
			}),
		enabled: mapTypeArray.includes(mapTypeCode.burnArea) && (!!searchSelectedAdmOption?.id || !!mapExtent),
	})

	const { data: plantBurntAreaData, isLoading: isPlantBurntAreaDataLoading } = useQuery({
		queryKey: ['getPlantBurntArea', selectedDateRange, searchSelectedAdmOption, mapExtent],
		queryFn: () =>
			service.mapAnalyze.getPlantBurntArea({
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: searchSelectedAdmOption?.id ? Number(searchSelectedAdmOption.id) : undefined,
				polygon: JSON.stringify(mapExtent ?? ''),
			}),
		enabled: mapTypeArray.includes(mapTypeCode.plant) && (!!searchSelectedAdmOption?.id || !!mapExtent),
	})

	const handleClickAdd = () => {
		const updateArea = [...selectedArea]
		updateArea.push({ id: crypto.randomUUID(), admOption: searchSelectedAdmOption })
		setSelectedArea(updateArea)
	}

	const handleClickDelete = (item: any) => {
		const updateArea = [...selectedArea]
		const index = updateArea.findIndex((area) => area.id === item.id)
		updateArea.splice(index, 1)
		setSelectedArea(updateArea)
	}

	const handleSelectCard = (item: any) => {
		setSelectedCard((selected) => (selected === item.id ? undefined : item.id))
	}

	const handleSelectedAdmOption = useCallback(
		(value: OptionType | null) => {
			setSearchSelectedAdmOption(value)
			if (selectedCard) {
				const updateArea = [...selectedArea]
				const index = selectedArea.findIndex((area) => area.id === selectedCard)
				updateArea[index].admOption = value
				setSelectedArea(updateArea)
			}
		},
		[selectedArea, selectedCard],
	)

	const handleCurrentDateRange = useCallback((value: DateObject[]) => {
		setCurrentDateRange(value)
	}, [])

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
				currentDateRange={currentDateRange}
				handleCurrentDateRange={handleCurrentDateRange}
			/>
			<Box className='absolute flex h-full w-full overflow-y-auto md:relative'>
				<BurntDashboardMain
					selectedArea={selectedArea}
					handleClickAdd={handleClickAdd}
					handleClickDelete={handleClickDelete}
					selectedCard={selectedCard}
					handleSelectCard={handleSelectCard}
					mapTypeArray={mapTypeArray}
					selectedHotspots={selectedHotspots}
					selectedDateRange={selectedDateRange}
					className='max-w-[calc(80vw)] max-md:hidden'
				/>
				<BurntMapMain
					className='h-full w-full flex-1'
					currentAdmOption={searchSelectedAdmOption}
					hotspotBurntAreaData={hotspotBurntAreaData?.data ?? []}
					burntBurntAreaData={burntBurntAreaData?.data ?? []}
					plantBurntAreaData={plantBurntAreaData?.data ?? []}
					isHotspotBurntAreaDataLoading={isHotspotBurntAreaDataLoading}
					isBurntBurntAreaDataLoading={isBurntBurntAreaDataLoading}
					isPlantBurntAreaDataLoading={isPlantBurntAreaDataLoading}
					onMapExtentChange={(polygon: number[][]) => setMapExtent(polygon)}
				/>
			</Box>
		</Box>
	)
}
