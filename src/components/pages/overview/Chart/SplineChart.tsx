import BillboardJS, { IChart } from '@billboard.js/react'
import 'billboard.js/dist/billboard.css'
import bb, { spline } from 'billboard.js'
import { useRef, useMemo, useEffect } from 'react'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { defaultNumber } from '@/utils/text'

const SplineChart = ({
	className = '',
	legendId,
	columns,
	colors,
}: {
	className?: string
	legendId: string
	columns: any[][]
	colors: { [key: string]: string }
}) => {
	const chartRef = useRef<IChart>(null)
	const options = useMemo(() => {
		return {
			data: {
				x: 'x',
				columns: columns,
				type: spline(),
				colors: colors,
			},
			axis: {
				x: {
					type: 'category' as const,
				},
				y: {
					min: 0,
					padding: 0,
					tick: {
						count: 8,
						format: (value: number) => defaultNumber(value, 0),
					},
				},
			},
			grid: {
				x: {
					show: true,
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
	}, [colors, columns, legendId])

	useEffect(() => {
		const chart = chartRef.current?.instance
		if (chartRef.current && chart) {
			chart.load({
				columns: columns,
				colors: colors,
				unload: true,
			})
		}
	}, [columns, colors])

	return (
		<Box className={classNames('relative flex h-full w-full grow flex-col', className)}>
			<BillboardJS
				bb={bb}
				options={options}
				ref={chartRef}
				className='bb h-full w-full [&_.bb-tooltip-container]:text-black [&_.tick]:fill-black [&_svg]:!overflow-visible [&_svg]:lg:absolute'
			/>
			<div
				id={legendId}
				className='absolute right-[10px] top-[-20px] flex w-full flex-wrap justify-end gap-x-3'
			></div>
		</Box>
	)
}

export default SplineChart
