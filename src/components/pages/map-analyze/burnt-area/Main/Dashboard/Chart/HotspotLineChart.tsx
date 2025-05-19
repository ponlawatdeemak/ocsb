import { BackIcon } from '@/components/svg/AppIcon'
import { Box, Button } from '@mui/material'
import { FC, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import bb, { line } from 'billboard.js'
import 'billboard.js/dist/billboard.css'

interface Props {
	onBack: () => void
	data: any
	colors: { [key: string]: string }
}

const HotspotLineChart: FC<Props> = ({ data, colors, onBack }) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common', 'overview'])

	const title = useMemo(() => {
		const date = new Date(data.date)
		const formatter = new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' })
		const monthYear = formatter.format(date)
		return `1 ${monthYear} - ${data.daily.inSugarcane.length} ${monthYear}`
	}, [data, i18n.language])

	const columns = useMemo(() => {
		const date = new Date(data.date)
		const dayInMonths = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
		const labelList: string[] = ['x']
		for (let i = 1; i <= dayInMonths; i++) {
			labelList.push(String(i))
		}

		const inSugarcaneList = [t('map-analyze:barInSugarcane'), ...data.daily.inSugarcane]
		const outSugarcaneList = [t('map-analyze:barOutSugarcane'), ...data.daily.notInSugarcane]
		const result = [labelList, inSugarcaneList, outSugarcaneList]

		return result
	}, [data, t])

	useEffect(() => {
		const colors = {
			[t('map-analyze:barInSugarcane')]: '#FF0000',
			[t('map-analyze:barOutSugarcane')]: '#FFC7C7',
		}

		bb.generate({
			legend: { show: false },
			data: { x: 'x', type: line(), columns, colors },
			axis: {
				x: { label: { text: t('common:date'), position: 'outer-right' } },
				y: {
					label: { text: t('common:point'), position: 'outer-top' },
					min: 0,
					tick: { format: (y: number) => y.toLocaleString() },
				},
			},
			grid: { y: { show: true } },
			bindto: '#hotspot-line',
		})
	}, [data, i18n.language, colors, columns, t])

	return (
		<Box className='w-full p-4'>
			<Box className='flex gap-2'>
				<Button className='!min-w-0 !p-0' onClick={onBack}>
					<BackIcon />
				</Button>
				<Box>{title}</Box>
			</Box>
			<Box className='flex justify-center gap-2'>
				<Box className='flex gap-2'>
					<Box className='flex items-center'>
						<div className='h-[5px] w-[20px] bg-[#FF0000]'></div>
					</Box>
					<Box className='text-[12px] text-[#707070]'>{t('map-analyze:barInSugarcane')}</Box>
				</Box>
				<Box className='flex gap-2'>
					<Box className='flex items-center'>
						<div className='h-[5px] w-[20px] bg-[#FFC7C7]'></div>
					</Box>
					<Box className='text-[12px] text-[#707070]'>{t('map-analyze:barOutSugarcane')}</Box>
				</Box>
			</Box>
			<Box>
				<div
					id={`hotspot-line`}
					className='bb h-full min-h-[400px] w-full [&_*]:font-["Prompt","Montserrat"] [&_.bb-area]:!opacity-100 [&_.bb-tooltip-container]:text-black [&_.bb-ygrid:first-child]:stroke-[#31356E] [&_.bb-ygrid:first-child]:opacity-60 [&_.bb-ygrid]:opacity-30 [&_.bb-ygrid]:[stroke-dasharray:0] [&_.domain]:hidden [&_.tick]:fill-black [&_.tick_line]:hidden [&_g_text_tspan]:fill-[#31356E] [&_svg]:absolute'
				></div>
			</Box>
		</Box>
	)
}

export default HotspotLineChart
