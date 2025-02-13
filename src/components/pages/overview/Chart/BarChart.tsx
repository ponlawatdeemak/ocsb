import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect, useRef, useMemo } from 'react'
import bb, { bar } from 'billboard.js'
import BillboardJS, { IChart } from '@billboard.js/react'
import 'billboard.js/dist/billboard.css'

const BarChart = ({
	className = '',
	legendId,
	columns,
	colors,
}: {
	legendId: string
	columns: any[][]
	colors: { [key: string]: string }
	className?: string
}) => {
	const chartRef = useRef<IChart>(null)

	const options = useMemo(() => {
		return {
			data: {
				x: 'x',
				columns: columns,
				type: bar(),
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
						count: 6,
						format: (value: number) => value,
					},
				},
			},
			bar: {
				indices: {
					removeNull: true,
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
		}
	}, [colors, columns, legendId])

	useEffect(() => {
		const chart = chartRef.current?.instance
		if (chartRef.current && chart) {
			chart.load({
				columns: columns,
				colors: colors,
			})
		}
	}, [columns, colors])

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

export default BarChart
