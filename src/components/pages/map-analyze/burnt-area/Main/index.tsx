import { Box } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useState } from 'react'
import BurntSearchFormMain, { OptionType } from './SearchForm'
import BurntMapMain from './BurntMap'
import BurntDashboardMain from './Dashboard'
import { hotspotType, hotspotTypeCode, mapTypeCode } from '@interface/config/app.config'
import { GetDashBoardBurntAreaDtoOut } from '@interface/dto/brunt-area/brunt-area.dto.out'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'

const defaultSelectedDateRange: Date[] = [new Date(), new Date()]

interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	const [selectedArea, setSelectedArea] = useState<
		{ id: string; adm: OptionType | null; dashboard: GetDashBoardBurntAreaDtoOut | null }[]
	>([])
	const [selectedCard, setSelectedCard] = useState<number>()
	const [mapTypeArray, setMapTypeArray] = useState<mapTypeCode[]>([mapTypeCode.hotspots])
	const [selectedHotspots, setSelectedHotspots] = useState<hotspotTypeCode[]>(hotspotType.map((type) => type.code))

	const [selectedDateRange, setSelectedDateRange] = useState<Date[]>(defaultSelectedDateRange)

	const [currentAdmOption, setCurrentAdmOption] = useState<OptionType | null>(null)
	const [currentDashboardData, setCurrentDashboardData] = useState<GetDashBoardBurntAreaDtoOut | null>(null)

	const [mapExtent, setMapExtent] = useState<number[][] | null>(null)

	const { data: hotspotBurntAreaData, isLoading: isHotspotBurntAreaDataLoading } = useQuery({
		queryKey: ['getHotspotBurntArea', selectedHotspots, selectedDateRange, currentAdmOption, mapExtent],
		queryFn: () =>
			service.mapAnalyze.getHotspotBurntArea({
				inSugarcan: selectedHotspots,
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: currentAdmOption?.id ? Number(currentAdmOption.id) : undefined,
				polygon: JSON.stringify(mapExtent ?? ''),
			}),
		enabled: !!currentAdmOption?.id || !!mapExtent,
	})

	const { data: burntBurntAreaData, isLoading: isBurntBurntAreaDataLoading } = useQuery({
		queryKey: ['getBurntBurntArea', selectedDateRange, currentAdmOption, mapExtent],
		queryFn: () =>
			service.mapAnalyze.getBurntBurntArea({
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: currentAdmOption?.id ? Number(currentAdmOption.id) : undefined,
				polygon: JSON.stringify(mapExtent ?? ''),
			}),
		enabled: mapTypeArray.includes(mapTypeCode.burnArea) && (!!currentAdmOption?.id || !!mapExtent),
	})

	const { data: plantBurntAreaData, isLoading: isPlantBurntAreaDataLoading } = useQuery({
		queryKey: ['getPlantBurntArea', selectedDateRange, currentAdmOption, mapExtent],
		queryFn: () =>
			service.mapAnalyze.getPlantBurntArea({
				startDate: selectedDateRange[0].toISOString().split('T')[0],
				endDate: selectedDateRange[1].toISOString().split('T')[0],
				admC: currentAdmOption?.id ? Number(currentAdmOption.id) : undefined,
				polygon: JSON.stringify(mapExtent ?? ''),
			}),
		enabled: mapTypeArray.includes(mapTypeCode.plant) && (!!currentAdmOption?.id || !!mapExtent),
	})

	const handleClickAdd = () => {
		const updateArea = [...selectedArea]
		updateArea.push({ id: crypto.randomUUID(), adm: currentAdmOption, dashboard: currentDashboardData })
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

	const handleGetDashboardData = (
		admOption: OptionType | null,
		dashboardData: GetDashBoardBurntAreaDtoOut | null,
	) => {
		setCurrentAdmOption(admOption)
		setCurrentDashboardData(dashboardData)
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
				handleGetDashboardData={handleGetDashboardData}
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
					isDisabledAdd={!currentDashboardData}
					className='max-w-[calc(80vw)] max-lg:hidden'
				/>
				<BurntMapMain
					className='h-full w-full flex-1'
					currentAdmOption={currentAdmOption}
					hotspotBurntAreaData={hotspotBurntAreaData?.data ?? []}
					burntBurntAreaData={burntBurntAreaData?.data ?? []}
					plantBurntAreaData={plantBurntAreaData?.data ?? []}
					isHotspotBurntAreaDataLoading={isHotspotBurntAreaDataLoading}
					isBurntBurntAreaDataLoading={isBurntBurntAreaDataLoading}
					isPlantBurntAreaDataLoading={isPlantBurntAreaDataLoading}
					onMapExtentChange={setMapExtent}
				/>
			</Box>
		</Box>
	)
}
