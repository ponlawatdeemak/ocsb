import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
	Box,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	IconButton,
	Popover,
	styled,
	Switch,
	ButtonGroup,
} from '@mui/material'
import { useTranslation } from 'next-i18next'
import {
	MapCompassIcon,
	MapCurrentLocationIcon,
	MapFullscreenIcon,
	MapLayersIcon,
	MapZoomInIcon,
	MapZoomOutIcon,
} from '@/components/svg/MenuIcon'
import { BaseMap, BasemapType, MapLayer } from '../interface/map'
import useMapStore from '../store/map'
import classNames from 'classnames'
import maplibregl from 'maplibre-gl'

const basemapList: BaseMap[] = [
	{ value: BasemapType.CartoLight, image: '/images/map/basemap_street.png', label: 'map.street' },
	{ value: BasemapType.CartoDark, image: '/images/map/basemap_dark.png', label: 'map.satellite' },
	{ value: BasemapType.Google, image: '/images/map/basemap_hybrid.png', label: 'map.hybrid' },
]

interface MapToolsProps {
	layerList?: MapLayer[]
	onBasemapChanged?: (basemap: BasemapType) => void
	onGetLocation?: (coords: GeolocationCoordinates) => void
	currentBaseMap: BasemapType
	legendSelectorLabel?: string
	hiddenZoomButton?: boolean
	hiddenFullscreenButton?: boolean
	hiddenLayersButton?: boolean
	hiddenCurrentLocationButton?: boolean
	hiddenScaleControl?: boolean
}

const MapTools: React.FC<MapToolsProps> = ({
	layerList,
	onBasemapChanged,
	onGetLocation,
	currentBaseMap,
	legendSelectorLabel,
	hiddenZoomButton,
	hiddenFullscreenButton,
	hiddenLayersButton,
	hiddenCurrentLocationButton,
	hiddenScaleControl,
}) => {
	const { t } = useTranslation()
	const { layers, setLayers, mapLibre, switchState, setSwitchState } = useMapStore()

	const [basemap, setBasemap] = useState<BasemapType | null>(currentBaseMap ?? null)
	const [anchorBasemap, setAnchorBasemap] = useState<HTMLButtonElement | null>(null)
	const [anchorLegend, setAnchorLegend] = useState<HTMLButtonElement | null>(null)

	//reload switchState
	useEffect(() => {
		if (mapLibre === null) {
			setSwitchState(layerList?.map((item) => ({ id: item.id, isOn: true })) ?? null)
		}
	}, [layerList, mapLibre, layers, setSwitchState])

	const onToggleLayer = useCallback(
		(layerId: string) => {
			if (switchState && layers?.length) {
				const state = [...switchState]
				const objIndex = state.findIndex((item) => item.id === layerId)
				state[objIndex].isOn = !switchState[objIndex].isOn
				setSwitchState([...state])
				let tempList = layers.map((mapLayer) => {
					let tempSplit = mapLayer.id.split('-')
					tempSplit.pop()
					const tempId = tempSplit.join('-')
					const switchItem = switchState.find((sw) => sw.id === tempId)

					let visible: boolean | undefined = true
					if (switchItem) {
						visible = switchItem?.isOn === true ? true : undefined
					}
					return mapLayer.clone({ visible })
				})

				setLayers(tempList)
			}
		},
		[switchState, layers, setSwitchState, setLayers],
	)

	const handleBasemapChanged = useCallback(
		(basemap: BasemapType) => {
			if (basemap !== null) {
				setBasemap(basemap)
				onBasemapChanged?.(basemap)
			}
		},
		[onBasemapChanged],
	)

	const handleGetLocation = useCallback(() => {
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

	const ToggleSwitch = styled(Switch)(({ theme }) => ({
		width: 33,
		height: 16,
		padding: 0,
		display: 'flex',
		'&:active': {
			'& .MuiSwitch-thumb': {
				width: 15,
			},
			'& .MuiSwitch-switchBase.Mui-checked': {
				transform: 'translateX(19.5px)',
			},
		},
		'& .MuiSwitch-switchBase': {
			padding: 2,
			'&.Mui-checked': {
				transform: 'translateX(16.5px)',
				color: '#fff',
				'& + .MuiSwitch-track': {
					opacity: 1,
					// backgroundColor: '#1890ff',
					...theme.applyStyles('dark', {
						// backgroundColor: '#177ddc',
					}),
				},
			},
		},
		'& .MuiSwitch-thumb': {
			boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
			width: 12,
			height: 12,
			borderRadius: 6,
			transition: theme.transitions.create(['width'], {
				duration: 200,
			}),
		},
		'& .MuiSwitch-track': {
			borderRadius: 16 / 2,
			opacity: 1,
			backgroundColor: 'rgba(0,0,0,.25)',
			boxSizing: 'border-box',
			...theme.applyStyles('dark', {
				backgroundColor: 'rgba(255,255,255,.35)',
			}),
		},
	}))

	const onZoomIn = useCallback(() => {
		mapLibre?.zoomIn({ duration: 200 })
	}, [mapLibre])

	const onZoomOut = useCallback(() => {
		mapLibre?.zoomOut({ duration: 200 })
	}, [mapLibre])

	const zoomButtons = useMemo(() => {
		return (
			<Box className='flex [&_button]:bg-transparent [&_button]:p-0 hover:[&_button]:bg-black/[0.05]'>
				{!hiddenZoomButton && (
					<ButtonGroup
						orientation='vertical'
						className='h-16 w-8 divide-y divide-solid divide-gray overflow-hidden rounded border-[0.5px] border-solid border-gray bg-white shadow-[0_0.5px_1px_0_rgba(0,0,0,0.08),0_2px_2px_0_rgba(0,0,0,0.04)]'
						variant='contained'
					>
						<IconButton className='pointer-events-auto grow rounded-none' onClick={onZoomIn}>
							<MapZoomInIcon />
						</IconButton>
						<IconButton className='pointer-events-auto grow rounded-none' onClick={onZoomOut}>
							<MapZoomOutIcon />
						</IconButton>
					</ButtonGroup>
				)}
			</Box>
		)
	}, [hiddenZoomButton, onZoomIn, onZoomOut])

	const mapToolButtons = useMemo(() => {
		return (
			<Box
				className={classNames(
					'absolute flex flex-col gap-3 [&_button]:bg-white [&_button]:p-0 hover:[&_button]:bg-white hover:[&_button]:opacity-80',
					{
						'top-0': hiddenZoomButton && hiddenFullscreenButton,
						'top-[44px]': hiddenZoomButton && !hiddenFullscreenButton,
						'top-[76px]': hiddenFullscreenButton && !hiddenZoomButton,
						'top-[120px]': !hiddenZoomButton && !hiddenFullscreenButton,
					},
				)}
			>
				{!hiddenLayersButton && (
					<IconButton
						className='pointer-events-auto h-8 w-8 rounded border-[0.5px] border-solid border-gray shadow-[0_0.5px_1px_0_rgba(0,0,0,0.08),0_2px_2px_0_rgba(0,0,0,0.04)]'
						onClick={(event) => setAnchorBasemap(event.currentTarget)}
					>
						<MapLayersIcon />
					</IconButton>
				)}

				{!hiddenCurrentLocationButton && (
					<IconButton
						className='pointer-events-auto h-8 w-8 rounded border-[0.5px] border-solid border-gray shadow-[0_0.5px_1px_0_rgba(0,0,0,0.08),0_2px_2px_0_rgba(0,0,0,0.04)]'
						onClick={handleGetLocation}
					>
						<MapCurrentLocationIcon />
					</IconButton>
				)}
			</Box>
		)
	}, [handleGetLocation, hiddenCurrentLocationButton, hiddenFullscreenButton, hiddenLayersButton, hiddenZoomButton])

	// Fullscreen Controls
	useEffect(() => {
		if (!mapLibre) return

		const fullscreenControl = new maplibregl.FullscreenControl()

		if (!hiddenFullscreenButton) {
			mapLibre.addControl(fullscreenControl, 'top-left')
		}

		const topLeftControl = document.querySelector('.maplibregl-ctrl-top-left') as HTMLElement
		const ctrlFullscreenElement = document.querySelector(
			'.maplibregl-ctrl-top-left .maplibregl-ctrl-group',
		) as HTMLElement
		const fullscreenButton = document.querySelector('.maplibregl-ctrl-fullscreen') as HTMLElement

		const customizeIcons = () => {
			if (topLeftControl) {
				const customTopDiv = document.createElement('div')
				customTopDiv.style.display = 'flex'
				customTopDiv.style.position = 'absolute'

				const rootTop = createRoot(customTopDiv)
				rootTop.render(zoomButtons)

				topLeftControl.appendChild(customTopDiv)

				const customBottomDiv = document.createElement('div')
				customBottomDiv.style.display = 'flex'
				customBottomDiv.style.position = 'absolute'

				const rootBottom = createRoot(customBottomDiv)
				rootBottom.render(mapToolButtons)

				topLeftControl.appendChild(customBottomDiv)
			}

			if (ctrlFullscreenElement) {
				ctrlFullscreenElement.style.position = 'absolute'
				ctrlFullscreenElement.style.top = '76px'

				if (hiddenZoomButton) ctrlFullscreenElement.style.top = '0px'
			}

			if (fullscreenButton) {
				fullscreenButton.style.display = 'none'
				fullscreenButton.innerHTML = ''
				const root = createRoot(fullscreenButton)
				root.render(<MapFullscreenIcon />)

				if (!hiddenFullscreenButton) fullscreenButton.style.display = 'flex'
			}
		}

		setTimeout(customizeIcons, 0)

		return () => {
			if (!hiddenFullscreenButton) mapLibre.removeControl(fullscreenControl)
			if (!hiddenFullscreenButton && fullscreenButton) fullscreenButton.style.display = 'none'
			if (hiddenZoomButton && ctrlFullscreenElement) topLeftControl.style.top = '76px'
		}
	}, [mapLibre, zoomButtons, mapToolButtons, hiddenZoomButton, hiddenFullscreenButton])

	useEffect(() => {
		if (mapLibre && !hiddenScaleControl) {
			const scale = new maplibregl.ScaleControl({
				maxWidth: 80,
				unit: 'metric',
			})

			mapLibre.addControl(scale, 'bottom-right')

			const bottomRightControl = document.querySelector('.maplibregl-ctrl-bottom-right') as HTMLElement
			const scaleButton = document.querySelector('.maplibregl-ctrl-scale') as HTMLElement
			const mapCompass = document.querySelector('.map-compass') as HTMLElement

			if (bottomRightControl && bottomRightControl.contains(mapCompass) && mapCompass)
				bottomRightControl.removeChild(mapCompass)

			const customizeIcons = () => {
				if (bottomRightControl) {
					const customDiv = document.createElement('div')
					customDiv.style.display = 'flex'
					customDiv.style.position = 'absolute'
					customDiv.style.bottom = '45px'
					customDiv.style.right = '100px'
					customDiv.className = 'map-compass'

					const root = createRoot(customDiv)
					root.render(<MapCompassIcon />)

					bottomRightControl.appendChild(customDiv)
				}

				if (scaleButton) {
					scaleButton.style.position = 'absolute'
					scaleButton.style.bottom = '45px'
					scaleButton.style.right = '0px'
				}
			}

			setTimeout(customizeIcons, 0)

			return () => {
				mapLibre.removeControl(scale)
			}
		}
	}, [mapLibre, hiddenScaleControl])

	return (
		<>
			{/* Basemap Selector */}
			<Popover
				open={Boolean(anchorBasemap)}
				anchorEl={anchorBasemap}
				slotProps={{
					paper: {
						className: 'ml-3',
					},
				}}
				anchorOrigin={{
					vertical: 'top',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
				elevation={0}
				onClose={() => setAnchorBasemap(null)}
			>
				<Box className='bg-white p-2 drop-shadow-md'>
					<Typography variant={'body2'} className='mb-2 inline-block px-2 font-bold max-md:hidden'>
						{t('map.mapType')}
					</Typography>
					<ToggleButtonGroup
						size='small'
						exclusive
						color='primary'
						value={basemap}
						onChange={(_, value) => handleBasemapChanged(value)}
						className='flex w-full items-center justify-center [&_.Mui-selected>img]:rounded [&_.Mui-selected>img]:border [&_.Mui-selected>img]:border-solid [&_.Mui-selected>img]:border-primary [&_.Mui-selected]:!bg-transparent'
					>
						{basemapList.map((item, index) => {
							return (
								<ToggleButton
									key={index}
									className='!m-0 flex w-full flex-col rounded-none !border-none p-2 max-md:max-w-[80px]'
									value={item.value}
								>
									<img src={item.image} className='box-border h-[60px] w-[60px] max-w-none' />
									<Typography variant={'body2'} align='center' className='text-sm'>
										{t(`${item.label}`)}
									</Typography>
								</ToggleButton>
							)
						})}
					</ToggleButtonGroup>
				</Box>
			</Popover>

			{/* Layer Legend */}
			{layerList && (
				<>
					{/* <Box className='absolute bottom-10 left-2 z-10 md:bottom-2'>
						<IconButton
							onClick={(event) => setAnchorLegend(event.currentTarget)}
							className='box-shadow rounded-lg bg-white'
						>
							<MapLayerIcon />
						</IconButton>
					</Box> */}
					<Popover
						open={Boolean(anchorLegend)}
						anchorEl={anchorLegend}
						onClose={() => setAnchorLegend(null)}
						elevation={0}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						transformOrigin={{
							vertical: 'bottom',
							horizontal: 'left',
						}}
					>
						<Box className='flex flex-col gap-[6px] rounded-[4px] bg-white px-[16px] py-[10px] drop-shadow-md'>
							{legendSelectorLabel ? (
								<p className='text-[14px] font-bold'>{legendSelectorLabel}</p>
							) : null}
							{layerList.map((item, index) => {
								if (!item.isHide) {
									return (
										<div key={index} className='flex items-center justify-between gap-[14px]'>
											<div className='flex gap-[8px]'>
												<div
													className={`h-[23px] w-[23px] rounded-[2px]`}
													style={{ backgroundColor: item.color }}
												></div>
												<p className='text-[14px] font-light'>{item.label}</p>
											</div>
											<ToggleSwitch
												checked={switchState?.find((sw) => sw.id === item.id)?.isOn}
												onChange={() => {
													onToggleLayer(item.id)
												}}
											/>
										</div>
									)
								}
							})}
						</Box>
					</Popover>
				</>
			)}
		</>
	)
}

export default MapTools
