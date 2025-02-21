import React, { useCallback, useEffect, useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, IconButton, Popover, ButtonGroup, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import {
	MapCurrentLocationIcon,
	MapExportIcon,
	MapExtentIcon,
	MapLayersIcon,
	MapMeasureIcon,
	MapZoomInIcon,
	MapZoomOutIcon,
} from '@/components/svg/MenuIcon'
import { BaseMap, BasemapType } from '../interface/map'
import useMapStore from '../store/map'
import Measurement from './measurement'
import classNames from 'classnames'
import { layerIdConfig, thaiExtent } from '@/config/app.config'
import { NavigationOutlined } from '@mui/icons-material'
import PolygonMeasure from './measurement/PolygonMeasure'
import LineMeasure from './measurement/LineMeasure'

const basemapList: BaseMap[] = [
	{ label: 'hybrid', value: BasemapType.Google, image: '/images/map/basemap_hybrid.png' },
	{ label: 'street', value: BasemapType.CartoLight, image: '/images/map/basemap_street.png' },
	{ label: 'satellite', value: BasemapType.CartoDark, image: '/images/map/basemap_dark.png' },
]

enum MeasureMode {
	Line,
	Polygon,
}

interface MapToolsProps {
	onBasemapChanged?: (basemap: BasemapType) => void
	onGetLocation?: (coords: GeolocationCoordinates) => void
	currentBaseMap: BasemapType
}

const MapTools: React.FC<MapToolsProps> = ({ onBasemapChanged, onGetLocation, currentBaseMap }) => {
	const { t } = useTranslation()
	const { mapLibre, getLayer, removeLayer } = useMapStore()

	const [bearing, setBearing] = useState(0)

	const [basemap, setBasemap] = useState<BasemapType | null>(currentBaseMap ?? null)
	const [anchorBasemap, setAnchorBasemap] = useState<HTMLButtonElement | null>(null)

	const [showMeasure, setShowMeasure] = useState(false)
	const [measureMode, setMeasureMode] = useState<MeasureMode | null>(null)
	const [anchorMeasure, setAnchorMeasure] = useState<HTMLButtonElement | null>(null)

	const handleResetBearing = useCallback(() => {
		if (mapLibre) {
			mapLibre.rotateTo(0, { duration: 500 })
		}
	}, [mapLibre])

	const handleZoomIn = useCallback(() => {
		if (mapLibre) {
			mapLibre.zoomIn({ duration: 200 })
		}
	}, [mapLibre])

	const handleZoomOut = useCallback(() => {
		if (mapLibre) {
			mapLibre.zoomOut({ duration: 200 })
		}
	}, [mapLibre])

	const handleBasemapChanged = useCallback(
		(basemap: BasemapType) => {
			if (basemap !== null) {
				setBasemap(basemap)
				onBasemapChanged?.(basemap)
			}
		},
		[onBasemapChanged],
	)

	const handleExtentLocation = useCallback(() => {
		if (mapLibre) {
			const layer = getLayer(layerIdConfig.toolCurrentLocation)

			if (layer) {
				removeLayer(layerIdConfig.toolCurrentLocation)
			}
			mapLibre.fitBounds(thaiExtent, { duration: 3000 })
		}
	}, [mapLibre, getLayer, removeLayer])

	const handleCurrentLocation = useCallback(() => {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(
				(position) => {
					onGetLocation?.(position.coords)
				},
				(error) => {
					console.error('Error fetching location:', error)
				},
			)
		} else {
			console.error('Geolocation is not supported by this browser.')
		}
	}, [onGetLocation])

	const handleChangeMode = useCallback(
		(value: MeasureMode) => {
			if (value !== null) {
				if (!showMeasure) {
					setShowMeasure(true)
				}
				setMeasureMode(value)
			}
			setAnchorMeasure(null)
		},
		[showMeasure],
	)

	const handleBearingChange = useCallback(() => {
		if (mapLibre) {
			setBearing(mapLibre.getBearing())
		}
	}, [mapLibre])

	useEffect(() => {
		if (mapLibre) {
			// Update bearing state when the map rotates
			mapLibre.on('rotate', handleBearingChange)
		}

		return () => {
			if (mapLibre) {
				mapLibre.off('rotate', handleBearingChange)
			}
		}
	}, [mapLibre, handleBearingChange])

	return (
		<>
			{/* Tools Controls */}
			<Box className='absolute right-4 top-[140px] z-10 flex flex-col gap-2 md:right-6 md:top-2.5 [&_button]:bg-white'>
				<Tooltip title={t('tools.compass')} placement='left' arrow>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton
							className='!h-6 !w-6 grow !rounded-none !p-1'
							sx={{
								transform: `rotate(${-bearing}deg)`,
								transition: 'transform 0.2s ease-out',
							}}
							onClick={handleResetBearing}
						>
							<NavigationOutlined className='!h-4 !w-4 !fill-black' />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip title={t('tools.zoom')} placement='left' arrow>
					<ButtonGroup
						orientation='vertical'
						className='flex !h-12 !w-6 items-center divide-y divide-solid divide-gray overflow-hidden !rounded-[3px] !bg-white !shadow-none'
					>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5' onClick={handleZoomIn}>
							<MapZoomInIcon />
						</IconButton>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5' onClick={handleZoomOut}>
							<MapZoomOutIcon />
						</IconButton>
					</ButtonGroup>
				</Tooltip>

				<Tooltip title={t('tools.basemap')} placement='left' arrow>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton
							className='!h-6 !w-6 grow !rounded-none !p-1.5'
							onClick={(event) => setAnchorBasemap(event.currentTarget)}
						>
							<MapLayersIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip title={t('tools.extent')} placement='left' arrow>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5' onClick={handleExtentLocation}>
							<MapExtentIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip title={t('tools.current')} placement='left' arrow>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5' onClick={handleCurrentLocation}>
							<MapCurrentLocationIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip title={t('tools.measurement')} placement='left' arrow>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton
							className='!h-6 !w-6 grow !rounded-none !p-[3.5px]'
							onClick={(event) => setAnchorMeasure(event.currentTarget)}
						>
							<MapMeasureIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip title={t('tools.export')} placement='left' arrow>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5'>
							<MapExportIcon />
						</IconButton>
					</Box>
				</Tooltip>
			</Box>

			{/* Basemap Selector */}
			<Popover
				open={Boolean(anchorBasemap)}
				anchorEl={anchorBasemap}
				slotProps={{
					paper: {
						className: 'p-2.5 !bg-transparent',
					},
				}}
				anchorOrigin={{
					vertical: 'center',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'center',
					horizontal: 'right',
				}}
				elevation={0}
				onClose={() => setAnchorBasemap(null)}
			>
				<Box className='relative flex flex-col rounded-[5px] bg-white p-[5px]'>
					<div className='absolute bottom-1/2 right-[-4px] h-0 w-0 translate-y-1/2 border-b-4 border-l-4 border-t-4 border-transparent border-l-white'></div>

					<ToggleButtonGroup
						size='small'
						exclusive
						color='primary'
						className='gap-[5px] [&_.MuiToggleButtonGroup-grouped]:!border-none'
						value={basemap}
						onChange={(_, value) => handleBasemapChanged(value)}
					>
						{basemapList.map((item) => (
							<ToggleButton
								key={item.label}
								className='!m-0 flex flex-col !rounded-[3px] !p-0'
								value={item.value}
							>
								<img
									src={item.image}
									className={classNames('h-7 w-7 rounded-[3px]', {
										'border border-primary': item.value === basemapList[currentBaseMap].value,
									})}
									alt={`${item.label}`}
								/>
							</ToggleButton>
						))}
					</ToggleButtonGroup>
				</Box>
			</Popover>

			{/* Measure Selector */}
			<Popover
				open={Boolean(anchorMeasure)}
				anchorEl={anchorMeasure}
				slotProps={{
					paper: {
						className: 'p-2.5 !bg-transparent',
					},
				}}
				anchorOrigin={{
					vertical: 'center',
					horizontal: 'left',
				}}
				transformOrigin={{
					vertical: 'center',
					horizontal: 'right',
				}}
				elevation={0}
				onClose={() => setAnchorMeasure(null)}
			>
				<Box className='relative flex flex-col rounded-[5px] bg-white px-1.5 py-[5px]'>
					<div className='absolute bottom-1/2 right-[-4px] h-0 w-0 translate-y-1/2 border-b-4 border-l-4 border-t-4 border-transparent border-l-white'></div>

					<ToggleButtonGroup
						size='small'
						exclusive
						color='primary'
						className='gap-1.5 [&_.Mui-selected]:!border-primary [&_.Mui-selected]:!bg-white [&_.MuiButtonBase-root.MuiToggleButtonGroup-grouped]:border-gray'
						value={measureMode}
						onChange={(_, value) => handleChangeMode(value)}
					>
						<ToggleButton
							className='flex h-[27px] w-[27px] flex-col !rounded-[3px] border !p-0'
							value={MeasureMode.Line}
						>
							<LineMeasure />
						</ToggleButton>
						<ToggleButton
							className='flex h-[27px] w-[27px] flex-col !rounded-[3px] border !p-0'
							value={MeasureMode.Polygon}
						>
							<PolygonMeasure />
						</ToggleButton>
					</ToggleButtonGroup>
				</Box>
			</Popover>

			{mapLibre && (
				<Measurement
					map={mapLibre}
					mode={measureMode}
					open={showMeasure}
					onClickClose={() => {
						setShowMeasure(false)
						setMeasureMode(null)
					}}
				/>
			)}
		</>
	)
}

export default MapTools
