import BillboardJS, { IChart } from '@billboard.js/react'
import 'billboard.js/dist/billboard.css'
import bb, { spline } from 'billboard.js'
import { useRef, useMemo, useEffect } from 'react'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { size } from 'lodash'
// import useResponsive from '@/hook/responsive'

const SplineChart = ({
	className = '',
	// chartId,
	legendId,
	columns,
	colors,
	// groups,
}: {
	className?: string
	// chartId: string
	legendId: string
	columns: any
	colors: { [key: string]: string }
	// groups: any[]
}) => {
	// const { isDesktop } = useResponsive()
	const chartRef = useRef<IChart>(null)

	const options = useMemo(() => {
		return {
			// bindto: `#${chartId}`,
			data: {
				x: 'x',
				columns: columns,
				type: spline(),
				colors: colors,
				// labels: {
				// 	colors: 'black' as string,
				// 	format: function (value: number) {
				// 		return `${value}`
				// 	},
				// 	position: function (type: string) {
				// 		return type == 'y' ? -4 : 0
				// 	},
				// },
			},
			axis: {
				x: {
					type: 'timeseries' as const,
					// categories: columns[0],
					// tick: {
					// 	centered: true,
					// 	text: {
					// 		position: {
					// 			y: 8,
					// 		},
					// 	},
					// },
				},
				// y: {
				// 	tick: {
				// 		count: 5,
				// 		format: (value: number) => value,
				// 		text: {
				// 			position: {
				// 				x: 4,
				// 			},
				// 		},
				// 	},
				// },
			},
			grid: {
				x: {
					show: true,
				},
				// y: {
				// 	show: true,
				// },
			},
			// bar: {
			// 	indices: {
			// 		removeNull: true,
			// 	},
			// 	width: {
			// 		max: 20,
			// 	},
			// },
			legend: {
				show: true,
				contents: {
					bindto: `#${legendId}`,
					template: function (title: string, color: string) {
						return `<div class='flex flex-row items-center gap-2'>
								<div style='background-color:${color}' class='w-2 h-2'></div>
								<span class='text-2xs text-black'>${title}</span>
							</div>`
					},
				},
			},
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
			},
			size: {
				width: 626,
				height: 210,
			},
		}
	}, [colors, columns, legendId])

	useEffect(() => {
		const chart = chartRef.current?.instance

		if (chartRef.current && chart) {
			chart.load({
				columns: columns,
				colors: colors,
				// categories: columns[0],
				// unload: true,
			})
			// chart.resize({
			// 	width: !isDesktop ? 912 : undefined,
			// })
		}
	}, [columns, colors])

	return (
		<Box className={classNames('flex h-full w-full flex-col gap-4 overflow-auto', className)}>
			<BillboardJS
				bb={bb}
				options={options}
				ref={chartRef}
				className='bb [&_.tick]:fill-black [&_svg]:absolute'
			/>
			<div
				id={legendId}
				className='mb-1.5 flex w-full flex-wrap justify-center gap-x-4 gap-y-2 max-lg:min-w-[912px]'
			></div>
		</Box>
	)
}

export default SplineChart
