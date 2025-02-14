import 'billboard.js/dist/billboard.css'
import bb, { donut } from 'billboard.js'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@/api/interface'
import BillboardJS, { IChart } from '@billboard.js/react'
import classNames from 'classnames'
import { defaultNumber } from '@/utils/text'

const DonutChart = ({
	columns,
	colors,
	height = 168,
	width = 168,
}: {
	columns: any[][]
	colors: { [key: string]: string }
	height?: number
	width?: number
}) => {
	const { i18n } = useTranslation(['common'])
	const language = i18n.language as keyof ResponseLanguage
	const chartRef = useRef<IChart>(null)

	const options = useMemo(() => {
		return {
			data: {
				columns: columns,
				type: donut(),
				colors: colors ?? {},
			},
			donut: {
				label: {
					show: true,
					format: function (value: any, ratio: any, id: any) {
						return `${id}\n${defaultNumber(ratio * 100, 1)}%`
					},
					ratio: 1.5,
				},
			},
			legend: {
				show: false,
			},
			tooltip: { show: false },
		}
	}, [colors, columns])

	useEffect(() => {
		const chart = chartRef.current?.instance
		if (chart) {
			chart.load({
				columns: columns,
				colors: colors ?? {},
				unload: true,
			})
		}
	}, [language, options, columns, colors])

	return (
		<div className='flex w-full items-center justify-center'>
			<BillboardJS
				bb={bb}
				options={options}
				ref={chartRef}
				className={
					'z-10 [&_.bb-chart-arc_text]:!fill-[#3C0A6D] [&_.bb-chart-arc_text]:!text-2xs [&_svg]:!overflow-visible'
				}
				style={{ height: height, width: width }}
			/>
		</div>
	)
}

export default DonutChart
