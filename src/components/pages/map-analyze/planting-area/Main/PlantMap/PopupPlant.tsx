import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { defaultNumber } from '@/utils/text'
import { Box } from '@mui/material'
import centroid from '@turf/centroid'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'

interface Prop {
	popupData: any[]
}
const PopupPlant: FC<Prop> = ({ popupData = [] }: Prop) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const areaUnitTranslate = `common:${areaUnit}`
	const quantityUnitTranslate = `common:${quantityUnit}`

	return (
		<div>
			{popupData.map((item, index) => {
				const data = item.object.properties
				const date = new Date(data.date).toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				})

				let coordinates: any[] = []
				let color = ''
				const geometry = item.object.geometry

				if (item.layer.id === 'plant') {
					color = '#8AB62D'
					coordinates = centroid(geometry).geometry.coordinates
				} else if (item.layer.id === 'product') {
					color = '#40C4FF'
					coordinates = centroid(geometry).geometry.coordinates
				} else if (item.layer.id === 'replant') {
					color = '#A7A7A7'
					coordinates = centroid(geometry).geometry.coordinates
				}
				return (
					<div key={'popup-' + index} className={`font-["Prompt","Montserrat"]`}>
						<Box className={`flex px-4 py-2 text-white`} sx={{ backgroundColor: color }}>
							<Box className='w-[110px]'>{t('map-analyze:popupBurnt.date')}</Box>
							<Box>{date}</Box>
						</Box>
						<Box>
							<Box className='flex flex-col px-4 py-2'>
								<Box className='flex'>
									<Box className='w-[110px] font-bold text-[#003491]'>
										{t('map-analyze:popupBurnt.address')}
									</Box>
									<Box>{data.adm[i18n.language]}</Box>
								</Box>

								<Box className='flex'>
									<Box className='w-[110px] font-bold text-[#003491]'>
										{t('map-analyze:popupBurnt.coordinates')}
									</Box>
									<Box>
										{coordinates
											.map((item: number) => item.toFixed(6))
											.reverse()
											.join(', ')}
									</Box>
								</Box>

								{(item.layer.id === 'plant' || item.layer.id === 'replant') && (
									<Box className='flex'>
										<Box className='w-[110px] font-bold text-[#003491]'>
											{t('map-analyze:popupBurnt.plantingArea')}
										</Box>
										<Box>{`${defaultNumber(data.area[areaUnit])} ${t(areaUnitTranslate)}`}</Box>
									</Box>
								)}

								{item.layer.id === 'replant' && (
									<Box className='flex'>
										<Box className='w-[110px] font-bold text-[#003491]'>
											{t('map-analyze:replantingArea')}
										</Box>
										<Box>{`${data.repeat} ${t('common:year')}`}</Box>
									</Box>
								)}

								{item.layer.id === 'product' && (
									<>
										<Box className='flex'>
											<Box className='w-[110px] font-bold text-[#003491]'>
												{t('overview:sugarCaneYield')}
											</Box>
											<Box>{`${defaultNumber(data.product[quantityUnit][areaUnit])} ${t(quantityUnitTranslate)}/${t(areaUnitTranslate)}`}</Box>
										</Box>
										<Box className='flex'>
											<Box className='w-[110px] font-bold text-[#003491]'>
												{t('overview:SugarCaneQuantity')}
											</Box>
											<Box>{`${defaultNumber(data.volumn[quantityUnit])} ${t(quantityUnitTranslate)}`}</Box>
										</Box>
									</>
								)}
							</Box>
						</Box>
					</div>
				)
			})}
		</div>
	)
}

export default memo(PopupPlant)
