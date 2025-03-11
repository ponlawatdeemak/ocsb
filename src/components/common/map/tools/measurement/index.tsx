import MapboxDraw from '@mapbox/mapbox-gl-draw'
import { Box, IconButton, SelectChangeEvent, Typography } from '@mui/material'

import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import 'mapbox-gl/dist/mapbox-gl.css'
import { useTranslation } from 'next-i18next'
import { Close } from '@mui/icons-material'
import FilterSelect, { FilterSelectOptionType } from '@/components/common/select/FilterSelect'
import { area, length } from '@turf/turf'

enum MeasureMode {
	Line,
	Polygon,
}

enum LineUnit {
	Meter,
	Kilometer,
}

enum PolygonUnit {
	SquareMeter,
	SquareKilometer,
}

const Measurement = ({
	map,
	mode,
	open,
	onClickClose,
}: {
	map: maplibregl.Map | undefined
	mode: MeasureMode | null
	open: boolean
	onClickClose: () => void
}) => {
	const { t } = useTranslation('common')
	const [totalDistance, setTotalDistance] = useState<number>(0)
	const [selectedUnit, setSelectedUnit] = useState<{ id: string; name: string }>({
		id: '0',
		name: t('measurement.line.meters'),
	})

	const lutLintUnit: FilterSelectOptionType[] = useMemo(
		() => [
			{ id: '0', name: t('measurement.line.meters') },
			{ id: '1', name: t('measurement.line.kilometers') },
		],
		[t],
	)

	const lutPolygonUnit: FilterSelectOptionType[] = useMemo(
		() => [
			{ id: '0', name: t('measurement.polygon.squareMeters') },
			{ id: '1', name: t('measurement.polygon.squareKilometers') },
		],
		[t],
	)

	const draw = useMemo(() => {
		return new MapboxDraw({
			displayControlsDefault: false,
			// Select which mapbox-gl-draw control buttons to add to the map.
			// controls: {
			//   trash: true,
			// },
			// Set mapbox-gl-draw to draw by default.
			// The user does not have to click the polygon control button first.
			defaultMode: 'draw_polygon',
			styles: [
				{
					id: 'gl-draw-line',
					type: 'line',
					layout: {
						'line-cap': 'round',
						'line-join': 'round',
					},
					paint: {
						'line-color': '#001AFF',
						'line-dasharray': [1, 0],
						'line-width': 3,
					},
				},
				{
					id: 'highlight-points',
					type: 'circle',
					paint: {
						'circle-radius': 4,
						'circle-color': '#ffffff',
						'circle-stroke-color': '#001AFF',
						'circle-stroke-width': 2,
					},
				},
				{
					id: 'gl-draw-polygon-fill',
					type: 'fill',
					filter: ['all', ['==', '$type', 'Polygon'], ['!=', 'mode', 'static']],
					paint: {
						'fill-color': '#1400FF',
						'fill-opacity': 0.4,
					},
				},
			],
		})
	}, [])

	const updateRoute = useCallback(
		(e: any) => {
			const data = draw.getAll()

			if (data.features.length > 0) {
				const area = length(data, { units: 'meters' })

				if (data) {
					setTotalDistance(area)
				}
			}
			if (e.type === 'draw.delete') {
				draw.changeMode('draw_line_string')
			}
		},
		[draw],
	)

	const updateArea = useCallback(
		(e: any) => {
			const data = draw.getAll()
			if (data.features.length > 0) {
				const temp = area(data)
				setTotalDistance(temp)
			}
			if (e.type === 'draw.delete') {
				draw.changeMode('draw_polygon')
			}
		},
		[draw],
	)

	useEffect(() => {
		if (!map || !draw) return

		setTotalDistance(0)

		if (map.hasControl(draw as any)) {
			map.removeControl(draw as any)
		}

		if (map.getLayer('points')) {
			map.removeLayer('points')
			map.removeSource('sourcePoints')
		}

		map.off('draw.create', updateRoute)
		map.off('draw.update', updateRoute)
		map.off('draw.delete', updateRoute)
		map.off('draw.render', updateRoute)
		map.off('draw.create', updateArea)
		map.off('draw.update', updateArea)
		map.off('draw.delete', updateArea)
		map.off('draw.render', updateArea)

		if (open) {
			map.addControl(draw as any, 'top-left')
			map.getCanvasContainer().style.cursor = 'default'
			map.getCanvas().style.cursor = 'default'

			if (mode === MeasureMode.Line) {
				setSelectedUnit(lutLintUnit[0])
				draw.changeMode('draw_line_string')
				map.on('draw.create', updateRoute)
				map.on('draw.update', updateRoute)
				map.on('draw.delete', updateRoute)
				map.on('draw.render', updateRoute)
			} else if (mode === MeasureMode.Polygon) {
				draw.changeMode('draw_polygon')
				setSelectedUnit(lutPolygonUnit[0])
				map.on('draw.create', updateArea)
				map.on('draw.delete', updateArea)
				map.on('draw.update', updateArea)
				map.on('draw.render', updateArea)
			}
		}
	}, [map, mode, open, lutLintUnit, lutPolygonUnit, draw, updateRoute, updateArea])

	const lutUnit = useMemo(() => {
		switch (mode) {
			case MeasureMode.Line:
				return lutLintUnit
			case MeasureMode.Polygon:
				return lutPolygonUnit
			default:
				return lutLintUnit
		}
	}, [mode, lutLintUnit, lutPolygonUnit])

	const handleChangeUnit = useCallback(
		(event: SelectChangeEvent) => {
			const temp = event.target.value
			const matchItem = lutUnit.find((item) => item.id === temp)
			if (matchItem) {
				setSelectedUnit(matchItem)
			}
		},
		[lutUnit],
	)

	const displayLineValue = useMemo(() => {
		if (totalDistance) {
			if (selectedUnit.id === LineUnit.Meter.toString()) {
				return `${Number(totalDistance.toFixed(2)).toLocaleString()} ${selectedUnit.name}`
			} else if (selectedUnit.id === LineUnit.Kilometer.toString()) {
				const kilometerValue = totalDistance / 1000

				return `${Number(kilometerValue.toFixed(2)).toLocaleString()} ${selectedUnit.name}`
			}
		} else {
			return '-'
		}
	}, [totalDistance, selectedUnit])

	const displayPolygonValue = useMemo(() => {
		if (totalDistance) {
			if (selectedUnit.id === PolygonUnit.SquareMeter.toString()) {
				return `${Number(totalDistance.toFixed(2)).toLocaleString()} ${selectedUnit.name}`
			} else if (selectedUnit.id === PolygonUnit.SquareKilometer.toString()) {
				const kilometerValue = totalDistance / 1000000

				return `${Number(kilometerValue.toFixed(2)).toLocaleString()} ${selectedUnit.name}`
			}
		} else {
			return '-'
		}
	}, [selectedUnit, totalDistance])

	return (
		<Box
			style={{ display: open ? undefined : 'none' }}
			className='absolute bottom-[75px] right-6 z-20 w-[266px] overflow-hidden rounded-[15px] bg-white'
		>
			<Box className='flex h-[38px] items-center justify-between bg-primary px-3 py-2.5'>
				<Typography className='!text-sm text-white'>{t('measurement.title')}</Typography>

				<IconButton className='!p-1' aria-label='close' onClick={onClickClose}>
					<Close className='!h-4 !w-4 !fill-white' />
				</IconButton>
			</Box>

			<Box className='flex flex-col gap-6 p-6'>
				<Box className='flex items-center justify-between'>
					<Typography className='!text-sm text-black'>{t('measurement.unitTitle')}</Typography>
					<FilterSelect
						className='w-[149px]'
						fullWidth={false}
						id='measureUnit'
						value={selectedUnit.id}
						data={lutUnit}
						onChange={handleChangeUnit}
					/>
				</Box>

				<Box className='flex items-center justify-between'>
					<Typography className='!text-sm text-black'>
						{mode === MeasureMode.Line
							? t('measurement.lengthTitle') + ':'
							: t('measurement.areaTitle') + ':'}
					</Typography>
					<Typography className='!text-sm text-primary'>
						{mode === MeasureMode.Line ? displayLineValue : displayPolygonValue}
					</Typography>
				</Box>
			</Box>
		</Box>
	)
}

export default memo(Measurement)
