import BillboardJS, { IChart } from '@billboard.js/react'
import 'billboard.js/dist/billboard.css'
import bb, { spline } from 'billboard.js'
import { useRef, useMemo, useEffect, useCallback } from 'react'
import { Box } from '@mui/material'
import classNames from 'classnames'
import { defaultNumber } from '@/utils/text'
import useAreaUnit from '@/store/area-unit'
import { AreaUnitKey, Languages } from '@/enum'
import { useTranslation } from 'next-i18next'
import useResponsive from '@/hook/responsive'

interface TooltipDataType {
	id: string
	index: number
	name: string
	value: number
	color: string
}

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
	const { areaUnit } = useAreaUnit()
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { isDesktopXl } = useResponsive()

	const generateTooltips = useCallback(
		(data: TooltipDataType[]) => {
			let tooltipOverview = '<div class="bg-white p-2 rounded-md shadow flex flex-col">'
			data.forEach(
				(item) =>
					(tooltipOverview += `<div class="text-[12px]">${t('burntScar')}(${item.name}) : ${defaultNumber(item.value)} ${t(`common:${areaUnit}`)}</div>`),
			)

			tooltipOverview += '</div>'

			return tooltipOverview
		},
		[areaUnit, t],
	)

	const lines = columns[0].map((item) => ({ value: item }))

	useEffect(() => {
		bb.generate({
			bindto: '#spline',
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
					padding: { top: 3, bottom: isDesktopXl ? 10 : 15 },
					tick: {
						count: 8,
						format: (value: number) => defaultNumber(value, 0),
					},
				},
			},
			grid: {
				x: {
					lines: lines,
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
				right: isDesktopXl ? (i18n.language === Languages.TH ? 25 : 50) : 0,
				bottom: isDesktopXl ? 5 : 35,
				left: areaUnit === AreaUnitKey.Sqm ? 70 : 50,
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
	}, [areaUnit, colors, columns, generateTooltips, i18n.language, isDesktopXl, legendId, lines])

	return (
		<Box className={classNames('relative flex h-full w-full grow flex-col', className)}>
			<div
				id='spline'
				className='bb h-full w-full [&_*]:font-["Prompt","Montserrat"] [&_.bb-axis-x_g_text_tspan]:fill-[#31356E] [&_.bb-tooltip-container]:text-black [&_.bb-xgrid-lines]:opacity-20 [&_.domain]:hidden [&_.tick]:fill-black [&_.tick_line]:hidden [&_svg]:!overflow-visible [&_svg]:xl:absolute'
			></div>
			<div
				id={legendId}
				className='absolute right-[10px] top-[-20px] flex w-full flex-wrap justify-end gap-x-3'
			></div>
			<div
				className={classNames('absolute left-[5px] top-[-20px] text-[10px] text-black', {
					'!top-[-40px]': !isDesktopXl,
				})}
			>{`${t('common:area')} (${t(`common:${areaUnit}`)})`}</div>
			<div className='absolute bottom-0 right-[0px] text-[10px] text-black xl:bottom-[5px]'>{`${t('common:month')}/${t(`common:year`)}`}</div>
		</Box>
	)
}

export default SplineChart
