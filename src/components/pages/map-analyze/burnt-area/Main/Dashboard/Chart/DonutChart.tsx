import 'billboard.js/dist/billboard.css'
import bb, { donut } from 'billboard.js'
import { useCallback, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@/api/interface'
import classNames from 'classnames'
import { defaultNumber } from '@/utils/text'

interface TooltipDataType {
	id: string
	index: number
	name: string
	value: number
	color: string
}

const DonutChart = ({
	chartId,
	columns,
	colors,
	percent,
	height = 168,
	width = 168,
	handleClickData,
	handleClickNoData,
}: {
	chartId: string
	columns: any[][]
	colors: { [key: string]: string }
	percent: number
	height?: number
	width?: number
	handleClickData: () => void
	handleClickNoData: () => void
}) => {
	const { t, i18n } = useTranslation(['map-analyze', 'common'])
	const language = i18n.language as keyof ResponseLanguage

	const generateTooltips = useCallback(
		(data: TooltipDataType[]) => {
			let tooltipOverview = '<div class="absolute left-4 top-2 bg-white p-2 rounded-md shadow flex flex-col">'
			data.forEach(
				(item) =>
					(tooltipOverview += `<div class="text-[12px] text-nowrap">${item.name === 'data' ? t('จุดความร้อนที่ตกในแปลงอ้อย') : t('จุดความร้อนที่ไม่ตกในแปลงอ้อย')} : ${defaultNumber(item.value)} ${t(`จุด`)}</div>`),
			)

			tooltipOverview += '</div>'

			return tooltipOverview
		},
		[t],
	)

	useEffect(() => {
		bb.generate({
			bindto: '#donut-' + chartId,
			data: {
				columns: columns,
				type: donut(),
				colors: colors ?? {},
				order: null,
				onclick: function (d) {
					if (d.name === 'data') {
						handleClickData()
					} else if (d.name === 'noData') {
						handleClickNoData()
					}
				},
			},
			donut: {
				label: {
					show: false,
				},
				width: 15,
			},
			arc: {
				cornerRadius: 0,
			},
			legend: {
				show: false,
			},
			tooltip: {
				contents: function (d: any, _arg1: any, _arg2: any, color: any) {
					const data: TooltipDataType[] = d.map((item: any, index: number) => ({
						id: item.id,
						index: item.index,
						name: item.name,
						value: item.value,
						color: color(d[index]),
					}))
					return generateTooltips(data)
				},
			},
			size: {
				width: 130,
				height: 130,
			},
		})
	}, [chartId, colors, columns, generateTooltips, handleClickData, handleClickNoData])

	return (
		<div className='relative flex h-full w-full items-center justify-center'>
			<div
				className={classNames(
					"absolute flex flex-col items-center justify-center gap-1 px-8 font-['Prompt','Montserrat']",
				)}
				style={{ height: height, width: width }}
			>
				<span className='text-xl'>{defaultNumber(percent, 0)}%</span>
			</div>
			<div id={`donut-${chartId}`}></div>
		</div>
	)
}

export default DonutChart
