import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect } from 'react'
import bb, { bar } from 'billboard.js'
import 'billboard.js/dist/billboard.css'
import { defaultNumber } from '@/utils/text'

const StackedBarChart = ({
	chartId,
	className = '',
	columns,
	colors,
	groups,
	hideData,
	handleClickOnChart,
}: {
	chartId: string
	columns: any[][]
	colors: { [key: string]: string }
	groups?: any[][]
	hideData?: string[]
	handleClickOnChart: (name: string) => void
	className?: string
}) => {
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
					handleClickOnChart(d.name ?? '')
				},
			},
			axis: {
				rotated: true,
				x: {
					type: 'category' as const,
				},
				y: {
					min: 0,
					padding: 0,
					tick: {
						count: 7,
						format: (value: number) => defaultNumber(value, 0),
					},
				},
			},
			legend: {
				show: false,
			},
			grid: {
				y: {
					show: true,
				},
			},
			padding: {
				top: 10,
				right: 20,
				bottom: 20,
				left: 60,
			},
		})
	}, [chartId, colors, columns, groups, handleClickOnChart, hideData])

	return (
		<Box className={classNames('flex h-full w-full grow flex-col', className)}>
			<div
				id={`stackedBar-${chartId}`}
				className='bb h-full w-full [&_*]:font-["Prompt","Montserrat"] [&_.bb-area]:!opacity-100 [&_.bb-tooltip-container]:text-black [&_.bb-ygrid:first-child]:stroke-[#31356E] [&_.bb-ygrid:first-child]:opacity-60 [&_.bb-ygrid]:opacity-30 [&_.bb-ygrid]:[stroke-dasharray:0] [&_.domain]:hidden [&_.tick]:fill-black [&_.tick_line]:hidden [&_g_text_tspan]:fill-[#31356E] [&_svg]:absolute'
			></div>
		</Box>
	)
}

export default StackedBarChart
