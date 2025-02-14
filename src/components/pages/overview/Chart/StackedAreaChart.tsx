import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect, useRef, useMemo } from 'react'
import bb, { area } from 'billboard.js'
import BillboardJS, { IChart } from '@billboard.js/react'
import 'billboard.js/dist/billboard.css'
import { defaultNumber } from '@/utils/text'

const StackedAreaChart = ({
	className = '',
	legendId,
	columns,
	colors,
	groups,
}: {
	legendId: string
	columns: any[][]
	colors: { [key: string]: string }
	className?: string
	groups: any[]
}) => {
	const chartRef = useRef<IChart>(null)

	const options = useMemo(() => {
		return {
			data: {
				x: 'x',
				columns: columns,
				type: area(),
				groups: groups,
				colors: colors,
				order: null,
			},
			axis: {
				x: {
					type: 'category' as const,
				},
				y: {
					min: 0,
					padding: 0,
					tick: {
						count: 4,
						format: (value: number) => defaultNumber(value, 0),
					},
				},
			},
			legend: {
				show: true,
				contents: {
					bindto: `#${legendId}`,
					template: function (title: string, color: string) {
						return `<div class='flex flex-row items-center gap-[2px]'>
								<div style='background-color:${color}' class='w-2 h-2 rounded-full'></div>
								<span class='text-2xs text-black'>${title}</span>
							</div>`
					},
				},
			},
			point: {
				show: false,
			},
			grid: {
				y: {
					show: true,
				},
			},
			padding: {
				top: 0,
				right: 10,
				bottom: 0,
				left: 40,
			},
			tooltip: {
				show: true,
				format: {
					value: function (value: any) {
						return defaultNumber(value)
					},
				},
				// contents: {
				// 	bindto: '#tooltip',
				// 	template:
				// 		'<ul class={=CLASS_TOOLTIP}>{{' +
				// 		'<li class="{=CLASS_TOOLTIP_NAME}"><span>{=VALUE}</span><br>' +
				// 		'<span style=color:{=COLOR}>{=NAME}</span></li>' +
				// 		'}}</ul>',
				// },
			},
		}
	}, [colors, columns, groups, legendId])

	useEffect(() => {
		const chart = chartRef.current?.instance
		if (chartRef.current && chart) {
			chart.load({
				columns: columns,
				colors: colors,
				unload: true,
			})
			chart.groups(groups)
		}
	}, [columns, colors, groups])

	return (
		<Box className={classNames('relative flex h-full w-full grow flex-col', className)}>
			<BillboardJS
				bb={bb}
				options={options}
				ref={chartRef}
				className='bb h-full w-full [&_.bb-area]:!opacity-100 [&_.bb-tooltip-container]:text-black [&_.tick]:fill-black [&_svg]:lg:absolute'
			/>
			<div
				id={legendId}
				className='absolute right-[10px] top-[-20px] flex w-full flex-wrap justify-end gap-x-3'
			></div>
		</Box>
	)
}

export default StackedAreaChart
