import MapView from '@/components/common/map/MapView'
import useMapStore from '@/components/common/map/store/map'
import { Box, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import { useSession } from 'next-auth/react'
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { OptionType } from '../SearchForm'
import { GeoJsonLayer } from '@deck.gl/layers'
import { CountViewerIcon, RegionPinIcon } from '@/components/svg/AppIcon'
import { yieldMapTypeCode } from '@interface/config/app.config'
import { useTranslation } from 'next-i18next'
import { useQuery } from '@tanstack/react-query'
import service from '@/api'
import { booleanPointInPolygon, centroid } from '@turf/turf'
import { AreaUnitKey, Languages, QuantityUnitKey } from '@/enum'
import { enSuffix } from '@/config/app.config'
import { Popup } from 'maplibre-gl'
import { PickingInfo } from '@deck.gl/core'
import CloseIcon from '@mui/icons-material/Close'
import { GetLookupDtoOut, GetRepeatAreaLookupDtoOut } from '@interface/dto/lookup/lookup.dto-out'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { defaultNumber } from '@/utils/text'
import {
	GetPlantYieldAreaDtoOut,
	GetProductYieldAreaDtoOut,
	GetReplantYieldAreaDtoOut,
} from '@interface/dto/yield-area/yield-area.dto-out'
import PopupPlant from './PopupPlant'
import { FillStyleExtension } from '@deck.gl/extensions'

import { Feature, GeoJsonProperties, Geometry } from 'geojson'
export const PLANTING_MAP_ID = 'planting-map'

interface PlantingMapMainProps {
	className?: string
	mapTypeArray: yieldMapTypeCode[]
	currentAdmOption: OptionType | null
	selectedRepeatArea: GetRepeatAreaLookupDtoOut | undefined
	plantYieldAreaData: GetPlantYieldAreaDtoOut[]
	productYieldAreaData: GetProductYieldAreaDtoOut[]
	replantYieldAreaData: GetReplantYieldAreaDtoOut[]
	isPlantYieldAreaDataLoading: boolean
	isProductYieldAreaDataLoading: boolean
	isReplantYieldAreaDataLoading: boolean
	onMapExtentChange: (polygon: number[][]) => void
}

const PlantingMapMain: React.FC<PlantingMapMainProps> = ({
	className = '',
	mapTypeArray,
	selectedRepeatArea,
	currentAdmOption,
	plantYieldAreaData,
	productYieldAreaData,
	replantYieldAreaData,
	isPlantYieldAreaDataLoading,
	isProductYieldAreaDataLoading,
	isReplantYieldAreaDataLoading,
	onMapExtentChange,
}) => {
	const { data: session } = useSession()
	const { mapLibre, overlays } = useMapStore()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const quantityLang = `common:${quantityUnit}`
	const areaLang = `common:${areaUnit}`
	const { t, i18n } = useTranslation(['map-analyze', 'common'])

	const currentRegionLanguageKey = `regionName${Languages.TH === i18n.language ? '' : enSuffix}`
	const [currentRegion, setCurrentRegion] = useState<GetLookupDtoOut>()
	const [isCurrentRegionOpen, setIsCurrentRegionOpen] = useState<boolean>(true)

	const popupNode = useRef<HTMLDivElement>(null)
	const [popupData, setPopupData] = useState<PickingInfo[]>([])
	const popup = useMemo(() => new Popup({ closeOnClick: false, closeButton: false }), [])

	const { data: regionData, isPending: isRegionLoading } = useQuery({
		queryKey: ['getRegion'],
		queryFn: () => service.lookup.getRegion(),
	})

	const plantingMap = useMemo(() => mapLibre[PLANTING_MAP_ID], [mapLibre])
	const plantingOverlay = useMemo(() => overlays[PLANTING_MAP_ID], [overlays])

	const tonPerSqm = useMemo(() => ({ fifteen: 0.009375, ten: 0.00625, five: 0.003125, nine: 0.005625 }), [])
	const tonPerSqkm = useMemo(() => ({ fifteen: 9375, ten: 6250, five: 3125, nine: 5625 }), [])
	const tonPerRai = useMemo(() => ({ fifteen: 15, ten: 10, five: 5, nine: 9 }), [])
	const tonPerHexa = useMemo(() => ({ fifteen: 93.75, ten: 62.5, five: 31.25, nine: 56.25 }), [])

	const kgPerSqm = useMemo(() => ({ fifteen: 9.375, ten: 6.25, five: 3.125, nine: 5.625 }), [])
	const kgPerSqkm = useMemo(() => ({ fifteen: 9375000, ten: 6250000, five: 3125000, nine: 5625000 }), [])
	const kgPerRai = useMemo(() => ({ fifteen: 15000, ten: 10000, five: 5000, nine: 9000 }), [])
	const kgPerHexa = useMemo(() => ({ fifteen: 93750, ten: 62500, five: 31250, nine: 56250 }), [])

	const yieldLegendNumber = useMemo(() => {
		if (quantityUnit === QuantityUnitKey.Ton) {
			if (areaUnit === AreaUnitKey.Sqm) {
				return tonPerSqm
			} else if (areaUnit === AreaUnitKey.Sqkm) {
				return tonPerSqkm
			} else if (areaUnit === AreaUnitKey.Rai) {
				return tonPerRai
			} else if (areaUnit === AreaUnitKey.Hexa) {
				return tonPerHexa
			} else {
				return { fifteen: '-', ten: '-', five: '-', nine: '-' }
			}
		} else if (quantityUnit === QuantityUnitKey.Kilogram) {
			if (areaUnit === AreaUnitKey.Sqm) {
				return kgPerSqm
			} else if (areaUnit === AreaUnitKey.Sqkm) {
				return kgPerSqkm
			} else if (areaUnit === AreaUnitKey.Rai) {
				return kgPerRai
			} else if (areaUnit === AreaUnitKey.Hexa) {
				return kgPerHexa
			} else {
				return { fifteen: '-', ten: '-', five: '-', nine: '-' }
			}
		} else {
			return { fifteen: '-', ten: '-', five: '-', nine: '-' }
		}
	}, [areaUnit, kgPerHexa, kgPerRai, kgPerSqkm, kgPerSqm, quantityUnit, tonPerHexa, tonPerRai, tonPerSqkm, tonPerSqm])

	// map event
	useEffect(() => {
		if (plantingMap && regionData?.length) {
			let previousZoom = 0
			plantingMap.on('moveend', () => {
				const bound = plantingMap.getBounds()
				const sw = bound.getSouthWest()
				const ne = bound.getNorthEast()
				const polygon = [
					[sw.lng, sw.lat],
					[ne.lng, sw.lat],
					[ne.lng, ne.lat],
					[sw.lng, ne.lat],
					[sw.lng, sw.lat],
				]

				const currentZoom = plantingMap.getZoom()

				if (previousZoom) {
					if (currentZoom <= previousZoom) {
						onMapExtentChange(polygon)
					}
				} else {
					onMapExtentChange(polygon)
				}

				previousZoom = currentZoom
				const center = plantingMap.getCenter()

				const insideRegion = regionData.find((reg) => {
					let result = false
					if (reg.geometry) {
						result = booleanPointInPolygon(
							{ type: 'Point', coordinates: [center.lng, center.lat] },
							reg.geometry as any,
						)
					}
					return result
				})
				setCurrentRegion(insideRegion)
			})
		}
	}, [onMapExtentChange, regionData, i18n, plantingMap])

	// zoom to search area or default user region
	useEffect(() => {
		if (plantingMap && regionData?.length) {
			const userGeometry = currentAdmOption?.geometry || session?.user?.geometry
			if (userGeometry) {
				plantingMap.fitBounds(userGeometry, { padding: 100 })
			}
		}
	}, [currentAdmOption?.geometry, session?.user?.geometry, plantingMap, regionData?.length])

	const onMapClick = useCallback(
		(info: PickingInfo) => {
			if (plantingMap && plantingOverlay) {
				const pickItem = plantingOverlay.pickMultipleObjects(info)
				if (popupNode.current && pickItem.length) {
					popup
						?.setLngLat(info.coordinate as [number, number])
						.setDOMContent(popupNode.current)
						.addTo(plantingMap)

					setPopupData(pickItem)
				}
			}
		},
		[plantingMap, plantingOverlay, popup],
	)

	// update layer
	useEffect(() => {
		if (plantingMap && plantingOverlay) {
			//#region deck.gl layer
			const layers = [
				new GeoJsonLayer({
					id: 'plant',
					beforeId: 'custom-referer-layer',
					data: plantYieldAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [138, 182, 45, 180],
					getLineColor: () => [138, 182, 45, 180],
				}),

				new GeoJsonLayer({
					id: 'product',
					beforeId: 'custom-referer-layer',
					data: productYieldAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: (d: any) => {
						if (d.properties.product.ton.rai > 15) {
							return [0, 52, 145, 180]
						} else if (d.properties.product.ton.rai >= 10 && d.properties.product.ton.rai <= 15) {
							return [29, 178, 64, 180]
						} else if (d.properties.product.ton.rai >= 5 && d.properties.product.ton.rai < 10) {
							return [240, 233, 39, 180]
						} else if (d.properties.product.ton.rai < 5) {
							return [255, 149, 0, 180]
						} else {
							return [0, 0, 0, 0]
						}
					},
					getLineColor: (d: any) => {
						if (d.properties.product.ton.rai > 15) {
							return [0, 52, 145, 180]
						} else if (d.properties.product.ton.rai >= 10 && d.properties.product.ton.rai <= 15) {
							return [29, 178, 64, 180]
						} else if (d.properties.product.ton.rai >= 5 && d.properties.product.ton.rai < 10) {
							return [240, 233, 39, 180]
						} else if (d.properties.product.ton.rai < 5) {
							return [255, 149, 0, 180]
						} else {
							return [0, 0, 0, 0]
						}
					},
				}),

				new GeoJsonLayer({
					id: 'replant',
					beforeId: 'custom-referer-layer',
					data: replantYieldAreaData as any,
					pickable: true,
					stroked: true,
					filled: true,
					lineWidthMinPixels: 1,
					getPolygon: (d: any) => d.geometry.coordinates,
					getFillColor: () => [138, 182, 45, 180],
					getLineColor: () => [138, 182, 45, 180],

					fillPatternMask: true,
					fillPatternAtlas: '/images/map/pattern.png',
					fillPatternMapping: {
						pattern: {
							x: 4,
							y: 4,
							width: 120,
							height: 120,
							mask: true,
						},
					},
					getFillPattern: () => 'pattern',
					getFillPatternScale: 1,
					getFillPatternOffset: [0, 0],
					extensions: [new FillStyleExtension({ pattern: true })],
				}),
			]

			plantingOverlay.setProps({
				layers: [layers],
				onClick: onMapClick,
				getCursor: (state) => (state.isHovering ? 'pointer' : 'default'),
			})
			//#endregion
		}
	}, [onMapClick, plantYieldAreaData, productYieldAreaData, replantYieldAreaData, plantingOverlay, plantingMap])

	useEffect(() => {
		if (plantingMap) {
			//#region heatmap layer

			//update heat data
			if (plantingMap?.getSource('heat') && plantingMap?.getLayer('heat-layer')) {
				plantingMap.removeLayer('heat-layer')
				plantingMap.removeSource('heat')
			}

			if (!plantingMap.getSource('heat') && productYieldAreaData.length > 0) {
				plantingMap.addSource('heat', {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: productYieldAreaData.map((item) => {
							return {
								...item,
								geometry: {
									type: 'Point',
									coordinates: centroid(item.geometry as any).geometry.coordinates,
								},
							}
						}) as Feature<Geometry, GeoJsonProperties>[],
					},
				})
			}
			if (!plantingMap.getLayer('heat-layer') && productYieldAreaData.length > 0) {
				plantingMap.addLayer({
					id: 'heat-layer',
					type: 'heatmap',
					source: 'heat',
					maxzoom: 9,
					paint: {
						'heatmap-color': [
							'interpolate',
							['linear'],
							['heatmap-density'],
							0,
							'rgba(33,102,172,0)',
							0.2,
							'rgb(103,169,207)',
							0.4,
							'rgb(209,229,240)',
							0.6,
							'rgb(253,219,199)',
							0.8,
							'rgb(239,138,98)',
							1,
							'rgb(178,24,43)',
						],
						'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 1, 6, 3, 9, 8],
						'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 8, 1, 9, 0],
					},
				})
			}
			//#endregion
		}
	}, [plantYieldAreaData, plantingMap, plantingOverlay, productYieldAreaData, replantYieldAreaData])

	const handleCurrentRegionToggle = useCallback(() => {
		setIsCurrentRegionOpen(!isCurrentRegionOpen)
	}, [isCurrentRegionOpen])

	return (
		<Box className={classNames('', className)}>
			<Box className='relative flex h-full grow'>
				<Box className='absolute bottom-[88px] left-3 z-10 flex items-end gap-4 md:bottom-12'>
					<IconButton
						className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {
							'!bg-white': !isCurrentRegionOpen,
						})}
						onClick={handleCurrentRegionToggle}
					>
						<RegionPinIcon color={isCurrentRegionOpen ? 'white' : '#003491'} />
					</IconButton>
					{isCurrentRegionOpen && currentRegion && (
						<Box className='flex flex-col gap-1 rounded-[5px] bg-white p-2'>
							<Typography className='!text-2xs text-black'>{`${t('common:currentRegion')} : ${currentRegion[currentRegionLanguageKey]}`}</Typography>
						</Box>
					)}
				</Box>
				<Box className='absolute bottom-[52px] left-3 z-10 flex items-end gap-4 md:bottom-3'>
					<IconButton className={classNames('h-6 w-6 !rounded-[5px] !bg-primary !p-1', {})}>
						<CountViewerIcon color='white' />
					</IconButton>
				</Box>

				<Box
					className={classNames(
						'absolute bottom-[52px] left-[52px] z-10 flex max-w-[60%] items-center gap-3 overflow-auto rounded-[5px] bg-white py-1 pl-2 pr-3 md:bottom-3',
						{ '!hidden': mapTypeArray.length === 0 && selectedRepeatArea === undefined },
					)}
				>
					<Box
						className={classNames('hidden shrink-0 items-center gap-1.5', {
							'!flex': mapTypeArray.includes(yieldMapTypeCode.plant),
						})}
					>
						<Box className='h-3 w-3 rounded-full bg-[#8AB62D]'></Box>
						<Typography className='!text-2xs text-black'>{t('plantingArea')}</Typography>
					</Box>
					<Box
						className={classNames('hidden shrink-0 items-center gap-3', {
							'!flex': mapTypeArray.includes(yieldMapTypeCode.product),
						})}
					>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#003491]'></Box>
							<Typography className='!text-2xs text-black'>{`${t('moreThan')} ${defaultNumber(yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#1DB240]'></Box>
							<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber.ten, 6)}-${defaultNumber(yieldLegendNumber.fifteen, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#F0E927]'></Box>
							<Typography className='!text-2xs text-black'>{`${defaultNumber(yieldLegendNumber.five, 6)}-${defaultNumber(yieldLegendNumber.nine, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
						<Box className={'flex items-center gap-1.5'}>
							<Box className='h-3 w-3 rounded-full bg-[#FF9500]'></Box>
							<Typography className='!text-2xs text-black'>{`${t('lessThan')} ${defaultNumber(yieldLegendNumber.five, 6)} ${t(quantityLang)}/${t(areaLang)}`}</Typography>
						</Box>
					</Box>
					<Box
						className={classNames('hidden shrink-0 items-center gap-1.5', {
							'!flex': selectedRepeatArea,
						})}
					>
						<Box className='h-3 w-3 rotate-[45deg] rounded-full bg-[repeating-linear-gradient(to_right,#8AB62D_0px,#8AB62D_1px,#ffffff_1px,#ffffff_2px)]'></Box>
						<Typography className='!text-2xs text-black'>{`${t('replantingArea')} ${selectedRepeatArea?.name ?? '-'} ${t('common:year')}`}</Typography>
					</Box>
				</Box>

				<MapView
					mapId={PLANTING_MAP_ID}
					loading={
						isPlantYieldAreaDataLoading ||
						isProductYieldAreaDataLoading ||
						isReplantYieldAreaDataLoading ||
						isRegionLoading
					}
				/>
				<div
					ref={popupNode}
					className={`relative w-full min-w-[300px] flex-col ${popupData?.length ? 'flex' : 'hidden'}`}
				>
					<Box className='absolute right-1 top-1 flex justify-end'>
						<IconButton
							onClick={() => {
								setPopupData([])
								popup.remove()
							}}
							className='mr-2 p-0'
						>
							<CloseIcon className='text-white' sx={{ fontSize: 12 }} />
						</IconButton>
					</Box>
					<PopupPlant popupData={popupData} />
				</div>
			</Box>
		</Box>
	)
}

export default memo(PlantingMapMain)
