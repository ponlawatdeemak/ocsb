import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Box, ToggleButton, ToggleButtonGroup, IconButton, Popover, ButtonGroup, Tooltip } from '@mui/material'
import { useTranslation } from 'next-i18next'
import {
	MapCurrentLocationIcon,
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
import Image from 'next/image'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'

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
	mapId: string
	onBasemapChanged?: (selectedBasemap: BasemapType) => void
	onGetLocation?: (coords: GeolocationCoordinates) => void
	currentBaseMap: BasemapType
}

const MapTools: React.FC<MapToolsProps> = ({ mapId, onBasemapChanged, onGetLocation, currentBaseMap }) => {
	const { t } = useTranslation()
	const { mapLibre, getLayer, removeLayer } = useMapStore()

	const [bearing, setBearing] = useState(0)

	const [basemap, setBasemap] = useState<BasemapType | null>(currentBaseMap ?? null)
	const [anchorBasemap, setAnchorBasemap] = useState<HTMLButtonElement | null>(null)

	const [showMeasure, setShowMeasure] = useState(false)
	const [measureMode, setMeasureMode] = useState<MeasureMode | null>(null)
	const [anchorMeasure, setAnchorMeasure] = useState<HTMLButtonElement | null>(null)
	const [alertLocationInfo, setAlertLocationInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const map = useMemo(() => mapLibre[mapId], [mapLibre, mapId])

	const handleResetBearing = useCallback(() => {
		if (map) {
			map.rotateTo(0, { duration: 500 })
		}
	}, [map])

	const handleZoomIn = useCallback(() => {
		if (map) {
			map.zoomIn({ duration: 200 })
		}
	}, [map])

	const handleZoomOut = useCallback(() => {
		if (map) {
			map.zoomOut({ duration: 200 })
		}
	}, [map])

	const handleBasemapChanged = useCallback(
		(selectedBasemap: BasemapType) => {
			if (selectedBasemap !== null) {
				setBasemap(selectedBasemap)
				onBasemapChanged?.(selectedBasemap)
			}
		},
		[onBasemapChanged],
	)

	const handleExtentLocation = useCallback(() => {
		if (map) {
			const layer = getLayer(layerIdConfig.toolCurrentLocation)

			if (layer) {
				removeLayer(mapId, layerIdConfig.toolCurrentLocation)
			}
			map.fitBounds(thaiExtent, { duration: 3000 })
		}
	}, [map, mapId, getLayer, removeLayer])

	const getLocation = useCallback(() => {
		if (navigator.geolocation) {
			return navigator.geolocation.getCurrentPosition(
				(position: GeolocationPosition) => {
					onGetLocation?.(position.coords)
				},
				(error: GeolocationPositionError) => {
					let message = t('location.default')
					switch (error.code) {
						case error.PERMISSION_DENIED:
							message = t('location.permissionDenied')
							break
						case error.POSITION_UNAVAILABLE:
							message = t('location.positionUnavailable')
							break
						case error.TIMEOUT:
							message = t('location.timeout')
							break
						default:
							break
					}

					setAlertLocationInfo({ open: true, severity: 'error', message })
				},
				{
					// enableHighAccuracy: false,
					timeout: 10000,
					maximumAge: 60000,
				},
			)
		}
	}, [onGetLocation, t])

	const handleGetLocation = useCallback(async () => {
		// Permission API is implemented
		navigator.permissions
			.query({
				name: 'geolocation',
			})
			.then((permission) => {
				// is geolocation granted or prompt?
				if (permission.state === 'granted' || permission.state === 'prompt') {
					getLocation()
				} else {
					setAlertLocationInfo({
						open: true,
						severity: 'error',
						message: t('location.locationBrowser'),
					})
				}

				// Optional: listen for changes in permission state
				permission.onchange = () => {
					if (permission.state === 'granted') {
						getLocation()
					} else if (permission.state === 'denied') {
						setAlertLocationInfo({
							open: true,
							severity: 'error',
							message: t('location.locationDenied'),
						})
					}
				}
			})
			.catch((error) => {
				console.error('Permission query error: ', error)
			})
	}, [getLocation, t])

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
		if (map) {
			setBearing(map.getBearing())
		}
	}, [map])

	useEffect(() => {
		if (map) {
			// Update bearing state when the map rotates
			map.on('rotate', handleBearingChange)
		}

		return () => {
			if (map) {
				map.off('rotate', handleBearingChange)
			}
		}
	}, [map, handleBearingChange])

	return (
		<>
			{/* Tools Controls */}
			<Box className='map-tools absolute right-4 top-[140px] z-10 flex flex-col gap-2 md:right-6 md:top-2.5 [&_button]:bg-white'>
				<Tooltip
					title={t('tools.compass')}
					componentsProps={{
						tooltip: {
							className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
						},
						arrow: {
							className: '!text-white',
						},
					}}
					placement='left'
					arrow
				>
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

				<Tooltip
					title={t('tools.zoom')}
					componentsProps={{
						tooltip: {
							className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
						},
						arrow: {
							className: '!text-white',
						},
					}}
					placement='left'
					arrow
				>
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

				<Tooltip
					title={t('tools.basemap')}
					componentsProps={{
						tooltip: {
							className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
						},
						arrow: {
							className: '!text-white',
						},
					}}
					placement='left'
					arrow
				>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton
							className='!h-6 !w-6 grow !rounded-none !p-1.5'
							onClick={(event) => setAnchorBasemap(event.currentTarget)}
						>
							<MapLayersIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip
					title={t('tools.extent')}
					componentsProps={{
						tooltip: {
							className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
						},
						arrow: {
							className: '!text-white',
						},
					}}
					placement='left'
					arrow
				>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5' onClick={handleExtentLocation}>
							<MapExtentIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip
					title={t('tools.current')}
					componentsProps={{
						tooltip: {
							className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
						},
						arrow: {
							className: '!text-white',
						},
					}}
					placement='left'
					arrow
				>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton className='!h-6 !w-6 grow !rounded-none !p-1.5' onClick={handleGetLocation}>
							<MapCurrentLocationIcon />
						</IconButton>
					</Box>
				</Tooltip>

				<Tooltip
					title={t('tools.measurement')}
					componentsProps={{
						tooltip: {
							className: '!bg-white !text-xs !font-normal !text-black !px-3 !py-1.5',
						},
						arrow: {
							className: '!text-white',
						},
					}}
					placement='left'
					arrow
				>
					<Box className='flex !h-6 !w-6 overflow-hidden !rounded-[3px] !bg-white !shadow-none'>
						<IconButton
							className='!h-6 !w-6 grow !rounded-none !p-[3.5px]'
							onClick={(event) => setAnchorMeasure(event.currentTarget)}
						>
							<MapMeasureIcon />
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
								<Image
									src={item.image}
									width={28}
									height={28}
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

			{map && (
				<Measurement
					map={map}
					mode={measureMode}
					open={showMeasure}
					onClickClose={() => {
						setShowMeasure(false)
						setMeasureMode(null)
					}}
				/>
			)}
			<AlertSnackbar
				alertInfo={alertLocationInfo}
				onClose={() => setAlertLocationInfo({ ...alertLocationInfo, open: false })}
			/>
		</>
	)
}

export default MapTools
