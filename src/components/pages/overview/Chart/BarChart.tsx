import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect, useCallback, useRef, useMemo } from 'react'
import bb, { bar, Chart, DataRow } from 'billboard.js'
import 'billboard.js/dist/billboard.css'
import { defaultNumber, getRoundedMax } from '@/utils/text'
import { useTranslation } from 'next-i18next'
import useResponsive from '@/hook/responsive'

interface TooltipDataType {
	id: string
	index: number
	name: string
	value: number
	color: string
}

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
	const { t } = useTranslation(['overview', 'common'])
	const { isDesktopXl } = useResponsive()

	const chartRef = useRef<Chart | null>(null)

	const generateTooltips = useCallback(
		(data: TooltipDataType[]) => {
			let tooltipOverview = '<div class="bg-white p-2 rounded-md shadow flex flex-col">'
			data.forEach(
				(item) =>
					(tooltipOverview += `<div class="text-[12px]">${t('replant')} (${item.name}) : ${defaultNumber(item.value)}%</div>`),
			)

			tooltipOverview += '</div>'

			return tooltipOverview
		},
		[t],
	)

	const maxValue = useMemo(() => {
		return Math.max(
			...columns
				.slice(1)
				.flat()
				.filter((n) => typeof n === 'number'),
		)
	}, [columns])

	const findMaxValue = useCallback((data: DataRow<number>[]) => {
		if (!data.length) return 0

		let maxValue = 0

		data.forEach((row) => {
			row.values.forEach((item) => {
				if (item.value > maxValue) {
					maxValue = item.value
				}
			})
		})

		return maxValue
	}, [])

	useEffect(() => {
		const chart = bb.generate({
			bindto: '#bar',
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
					tick: {
						count: 8,
						format: (value: number) => defaultNumber(value, 0),
						values: () => {
							const data = chartRef.current?.data?.shown() ?? []

							let maximumValue = findMaxValue(data)
							const { step } = getRoundedMax(maximumValue || maxValue, 8)
							const tickValues = Array.from({ length: 9 }, (_, i) => i * step)

							if (chartRef.current?.data().length && !maximumValue) return [0]

							return tickValues
						},
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
				right: 20,
				bottom: isDesktopXl ? 0 : 20,
				left: 40,
			},
			tooltip: {
				grouped: false,
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
		})

		chartRef.current = chart

		return () => {
			chartRef.current?.destroy()
			chartRef.current = null
		}
	}, [colors, columns, generateTooltips, isDesktopXl, legendId, findMaxValue, maxValue])

	return (
		<Box className={classNames('relative flex h-full w-full grow flex-col', className)}>
			<div
				id='bar'
				className='bb h-full w-full [&_*]:font-["Prompt","Montserrat"] [&_.bb-area]:!opacity-100 [&_.bb-axis-x_g_text_tspan]:fill-[#31356E] [&_.bb-tooltip-container]:text-black [&_.bb-ygrid:first-child]:stroke-[#31356E] [&_.bb-ygrid:first-child]:opacity-60 [&_.bb-ygrid]:opacity-30 [&_.bb-ygrid]:[stroke-dasharray:0] [&_.domain]:hidden [&_.tick]:fill-black [&_.tick_line]:hidden [&_svg]:xl:absolute'
			></div>
			<div
				id={legendId}
				className='absolute right-[10px] top-[-20px] flex w-full flex-wrap justify-end gap-x-3'
			></div>
			<div
				className={classNames('absolute top-[-20px] text-[10px] text-black', {
					'!top-[-40px]': !isDesktopXl,
				})}
			>
				{t('replant') + ' %'}
			</div>
			<div className='absolute bottom-[-1px] right-[0px] text-[10px] text-black'>{t('common:region')}</div>
		</Box>
	)
}

export default BarChart
