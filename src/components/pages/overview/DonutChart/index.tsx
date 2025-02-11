import 'billboard.js/dist/billboard.css'
import bb, { donut } from 'billboard.js'
import { useEffect, useMemo, useRef } from 'react'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@/api/interface'
import BillboardJS, { IChart } from '@billboard.js/react'
import classNames from 'classnames'

const DonutChart = ({
	columns,
	colors,
	height = 168,
	width = 168,
	isHideLabel = false,
}: {
	columns: [string, number][]
	colors: { [key: string]: string }
	height?: number
	width?: number
	isHideLabel?: boolean
}) => {
	const { i18n } = useTranslation(['common'])
	const language = i18n.language as keyof ResponseLanguage
	const historyBarChart = useRef<IChart>(null)

	const donutColumns = useMemo(() => {
		return [
			...columns,
			// , ['ไม่มีข้อมูล', 100 - columns[0][1]]
		]
	}, [columns])

	const donutColors = useMemo(() => {
		return {
			...colors,
			// , ['ไม่มีข้อมูล']: '#f5f5f6'
		}
	}, [colors])

	const options = useMemo(() => {
		return {
			data: {
				columns: donutColumns,
				type: donut(),
				colors: donutColors ?? {},
			},
			donut: {
				label: {
					show: false,
				},
				width: 35,
			},
			legend: {
				show: false,
			},
			tooltip: { show: false },
		}
	}, [donutColors, donutColumns])

	useEffect(() => {
		const chart = historyBarChart.current?.instance
		if (chart) {
			chart.load({
				columns: donutColumns,
				colors: donutColors ?? {},
				unload: true,
			})
		}
	}, [donutColumns, language, options, donutColors])

	return (
		<div className='flex w-full items-center justify-center'>
			{/* <div
				className={classNames(
					"absolute flex flex-col items-center justify-center gap-1 px-8 font-['Prompt','Montserrat']",
				)}
				style={{ height: height, width: width }}
			>
				{!isHideLabel && <span className='text-center text-sm'>{donutColumns[0][0]}</span>}
				<span className='text-xl font-semibold'>{donutColumns[0][1]}%</span>
			</div> */}
			<BillboardJS
				bb={bb}
				options={options}
				ref={historyBarChart}
				className={'z-10'}
				style={{ height: height, width: width }}
			/>
		</div>
	)
}

export default DonutChart
