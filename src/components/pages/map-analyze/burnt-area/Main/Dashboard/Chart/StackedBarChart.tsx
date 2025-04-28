import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect, useMemo } from 'react'
import bb, { bar } from 'billboard.js'
import 'billboard.js/dist/billboard.css'
import { getStepValue, nFormatter } from '@/utils/text'

const BAR_CHART_STEP = 5

const StackedBarChart = ({
	chartId,
	className = '',
	columns,
	colors,
	groups,
	hideData,
	handleClickOnChart,
	maxValues,
}: {
	chartId: string
	columns: any[][]
	colors: { [key: string]: string }
	groups?: any[][]
	hideData?: string[]
	handleClickOnChart: (name: string, info?: any) => void
	className?: string
	maxValues: Record<string, number>
}) => {
	const stepValue = useMemo(() => {
		if (Object.keys(maxValues).length === 0) return 0

		const maxValue = Math.max(...Object.values(maxValues))
		const step = getStepValue(maxValue, BAR_CHART_STEP)

		return Math.round(step)
	}, [maxValues])

	useEffect(() => {
		bb.generate({
			bindto: '#stackedBar-' + chartId,
			data: {
				x: 'x',
				columns: columns,
				type: bar(),
				colors: colors,
				groups: groups,
				order: null,
				hide: hideData,
				onclick: function (d) {
					handleClickOnChart(d.name ?? '', d)
				},
			},
			axis: {
				rotated: true,
				x: { type: 'category' as const },
				y: {
					max: BAR_CHART_STEP * stepValue,
					tick: {
						count: BAR_CHART_STEP,
						format: (value: number) => nFormatter(value, 2),
						values: () => {
							if (!stepValue) return [0]

							const tickValues = Array.from(
								{ length: BAR_CHART_STEP + 1 },
								(_, index) => index * stepValue,
							)

							return tickValues
						},
					},
				},
			},
			legend: { show: false },
			grid: { y: { show: true } },
			padding: {
				top: 10,
				right: 20,
				bottom: 20,
				left: 60,
			},
			bar: { width: 25 },
		})
	}, [chartId, colors, columns, groups, handleClickOnChart, hideData, stepValue])

	return (
		<Box className={classNames('flex h-full w-full grow flex-col', className)}>
			<div
				id={`stackedBar-${chartId}`}
				className='bb h-full min-h-[400px] w-full [&_*]:font-["Prompt","Montserrat"] [&_.bb-area]:!opacity-100 [&_.bb-tooltip-container]:text-black [&_.bb-ygrid:first-child]:stroke-[#31356E] [&_.bb-ygrid:first-child]:opacity-60 [&_.bb-ygrid]:opacity-30 [&_.bb-ygrid]:[stroke-dasharray:0] [&_.domain]:hidden [&_.tick]:fill-black [&_.tick_line]:hidden [&_g_text_tspan]:fill-[#31356E] [&_svg]:absolute'
			></div>
		</Box>
	)
}

export default StackedBarChart
