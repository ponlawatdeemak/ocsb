import useAreaUnit from '@/store/area-unit'
import { Box } from '@mui/material'
import centroid from '@turf/centroid'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'

interface Prop {
	popupData: any[]
}
const PopupBurnt: FC<Prop> = ({ popupData = [] }: Prop) => {
	const { t, i18n } = useTranslation(['map-analyze'])
	const { areaUnit } = useAreaUnit()
	return (
		<div className=''>
			{popupData.map((item) => {
				const data = item.object.properties
				const date = new Date(data.date).toLocaleDateString('en-GB', {
					day: 'numeric',
					month: 'short',
					year: 'numeric',
				})
				let coordinates = []

				let color = ''
				const geometry = item.object.geometry
				const row3 = {
					title: '',
					value: '',
				}
				if (item.layer.id === 'hotspot') {
					color = '#FF0000'
					coordinates = geometry.coordinates
				} else if (item.layer.id === 'burnt') {
					color = '#FBBF07'
					row3.title = t('map-analyze:popupBurnt.burntScar')
					const areaData = data.area[areaUnit] as Number
					row3.value = Number(areaData.toFixed(2)).toLocaleString()
					coordinates = centroid(geometry).geometry.coordinates
				} else if (item.layer.id === 'plant') {
					color = '#8AB62D'
					row3.title = t('map-analyze:popupBurnt.plantingArea')
					const areaData = data.area[areaUnit] as Number
					row3.value = Number(areaData.toFixed(2)).toLocaleString()
					coordinates = centroid(geometry).geometry.coordinates
				}
				return (
					<div key={data.id} className={`font-["Prompt","Montserrat"]`}>
						<Box className={`bg-[${color}] flex px-4 py-2 text-white`}>
							<Box className='w-[110px]'>{t('map-analyze:popupBurnt.date')}</Box>
							<Box>{date}</Box>
						</Box>
						<Box>
							<Box className='flex flex-col px-4 py-2'>
								<Box className='flex'>
									<Box className='w-[110px] font-bold text-[#003491]'>
										{t('map-analyze:popupBurnt.address')}
									</Box>
									<Box>{`${data.adm3[i18n.language]} ${data.adm2[i18n.language]} ${data.adm1[i18n.language]}`}</Box>
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
								{!!row3.title && (
									<Box className='flex'>
										<Box className='w-[110px] font-bold text-[#003491]'>{row3.title}</Box>
										<Box>{row3.value}</Box>
									</Box>
								)}
							</Box>
						</Box>
					</div>
				)
			})}
		</div>
	)
}

export default memo(PopupBurnt)
