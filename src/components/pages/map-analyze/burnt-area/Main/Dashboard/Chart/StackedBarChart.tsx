import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect, useCallback } from 'react'
import bb, { bar } from 'billboard.js'
import 'billboard.js/dist/billboard.css'
import { defaultNumber } from '@/utils/text'
import { useTranslation } from 'next-i18next'

interface TooltipDataType {
	id: string
	index: number
	name: string
	value: number
	color: string
}

const StackedBarChart = ({
	chartId,
	className = '',
	columns,
	colors,
	groups,
	hideData,
}: {
	chartId: string
	columns: any[][]
	colors: { [key: string]: string }
	groups?: any[][]
	hideData?: string[]
	className?: string
}) => {
	const { t } = useTranslation(['overview', 'common'])

	// const generateTooltips = useCallback(
	// 	(data: TooltipDataType[]) => {
	// 		let tooltipOverview = '<div class="bg-white p-2 rounded-md shadow flex flex-col">'
	// 		data.forEach(
	// 			(item) =>
	// 				(tooltipOverview += `<div class="text-[12px]">${t('replant')}(${item.name}) : ${defaultNumber(item.value)}%</div>`),
	// 		)

	// 		tooltipOverview += '</div>'

	// 		return tooltipOverview
	// 	},
	// 	[t],
	// )

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
			// tooltip: {
			// 	grouped: false,
			// 	contents: function (d: any, _arg1: any, _arg2: any, color: any) {
			// 		const data: TooltipDataType[] = d.map((item: any, index: number) => ({
			// 			id: item.id,
			// 			index: item.index,
			// 			name: item.name,
			// 			value: item.value,
			// 			color: color(d[index]),
			// 		}))
			// 		return generateTooltips(data)
			// 	},
			// },
		})
	}, [chartId, colors, columns, groups, hideData])

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
