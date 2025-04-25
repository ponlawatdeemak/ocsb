import { Languages } from '@/enum'
import useAreaUnit from '@/store/area-unit'
import { formatDate } from '@/utils/date'
import { PickingInfo } from '@deck.gl/core'
import { ResponseLanguage } from '@interface/config/app.config'
import { Box } from '@mui/material'
import { centroid } from '@turf/turf'
import classNames from 'classnames'
import { FC, memo } from 'react'
import { useTranslation } from 'react-i18next'

interface Prop {
	popupData: PickingInfo[]
}
const PopupBurnt: FC<Prop> = ({ popupData = [] }: Prop) => {
	const { t, i18n } = useTranslation(['map-analyze'])
	const language = i18n.language as keyof ResponseLanguage
	const { areaUnit } = useAreaUnit()
	const areaUnitTranslate = `common:${areaUnit}`
	const topicStyle = classNames('min-w-[110px] max-w-[110px] font-bold text-[#003491]', {
		'min-w-[140px] !max-w-[140px]': i18n.language === Languages.EN,
	})

	return (
		<div>
			{popupData.map((item, index) => {
				const data = item.object.properties
				console.log('👻 data: ', data)
				const dateFormat = item.layer?.id === 'plant' ? 'yyyy' : 'dd MMMM yyyy'
				let coordinates = []

				let color = ''
				const geometry = item.object.geometry
				const row3 = { title: '', value: '' }
				let date
				if (item.layer?.id === 'hotspot') {
					color = '#FF0000'
					coordinates = geometry.coordinates
					date = formatDate(new Date(data.acq_date), dateFormat, language)
				} else if (item.layer?.id === 'burnt') {
					color = '#FBBF07'
					row3.title = t('map-analyze:popupBurnt.burntScar')
					const areaData = data[`area_${areaUnit}`] as number
					row3.value = Number(areaData.toFixed(2)).toLocaleString()
					coordinates = centroid(geometry).geometry.coordinates
					date = formatDate(new Date(data.detected_d), dateFormat, language)
				} else if (item.layer?.id === 'plant') {
					color = '#8AB62D'
					row3.title = t('map-analyze:popupBurnt.plantingArea')
					const areaData = data[`area_${areaUnit}`] as number
					row3.value = Number(areaData.toFixed(2)).toLocaleString()
					coordinates = centroid(geometry).geometry.coordinates
					date = formatDate(new Date(data.cls_edate), dateFormat, language)
				}
				const fieldAdm3 = `o_adm3${i18n.language === 'th' ? 't' : 'e'}`
				const fieldAdm2 = `o_adm2${i18n.language === 'th' ? 't' : 'e'}`
				const fieldAdm1 = `o_adm1${i18n.language === 'th' ? 't' : 'e'}`
				return (
					<div key={'popup-' + index} className={`font-["Prompt","Montserrat"]`}>
						<Box className={`bg-[${color}] flex px-4 py-2 text-white`}>
							<Box className='w-[110px]'>{t('map-analyze:popupBurnt.date')}</Box>
							<Box>{date}</Box>
						</Box>
						<Box>
							<Box className='flex flex-col px-4 py-2'>
								<Box className='flex'>
									<Box className={topicStyle}>{t('map-analyze:popupBurnt.address')}</Box>
									<Box>{`${data[fieldAdm3]} ${data[fieldAdm2]} ${data[fieldAdm1]}`}</Box>
								</Box>

								<Box className='flex'>
									<Box className={topicStyle}>{t('map-analyze:popupBurnt.coordinates')}</Box>
									<Box>
										{coordinates
											.map((item: number) => item.toFixed(6))
											.reverse()
											.join(', ')}
									</Box>
								</Box>
								{!!row3.title && (
									<Box className='flex'>
										<Box className={topicStyle}>{row3.title}</Box>
										<Box>
											{row3.value} {t(areaUnitTranslate)}
										</Box>
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
