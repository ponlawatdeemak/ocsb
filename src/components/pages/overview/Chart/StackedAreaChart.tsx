import { Box } from '@mui/material'
import classNames from 'classnames'
import { useEffect, useCallback } from 'react'
import bb, { area } from 'billboard.js'
import 'billboard.js/dist/billboard.css'
import { defaultNumber } from '@/utils/text'
import { useTranslation } from 'next-i18next'
import useQuantityUnit from '@/store/quantity-unit'
import { Languages, QuantityUnitKey } from '@/enum'
import useResponsive from '@/hook/responsive'

interface TooltipDataType {
	id: string
	index: number
	name: string
	value: number
	color: string
}

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
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { quantityUnit } = useQuantityUnit()
	const { isDesktopXl } = useResponsive()

	const generateTooltips = useCallback(
		(data: TooltipDataType[]) => {
			let tooltipOverview = '<div class="bg-white p-2 rounded-md shadow flex flex-col">'
			data.forEach(
				(item) =>
					(tooltipOverview += `<div class="text-[12px]">${t('common:quantity')} (${item.name}) : ${defaultNumber(item.value)} ${t('common:' + quantityUnit)}</div>`),
			)

			tooltipOverview += '</div>'

			return tooltipOverview
		},
		[quantityUnit, t],
	)

	useEffect(() => {
		bb.generate({
			bindto: '#stackedArea',
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
				r: 0,
			},
			grid: {
				y: {
					show: true,
				},
			},
			padding: {
				top: 0,
				right: i18n.language === Languages.TH ? 15 : 24,
				bottom: isDesktopXl ? 0 : 20,
				left: quantityUnit === QuantityUnitKey.Ton ? 62 : 80,
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
	}, [colors, columns, generateTooltips, groups, i18n.language, isDesktopXl, legendId, quantityUnit])

	return (
		<Box className={classNames('relative flex h-full w-full grow flex-col', className)}>
			<div
				id='stackedArea'
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
			>{`${t('common:quantity')} (${t('common:' + quantityUnit)})`}</div>
			<div className='absolute bottom-[-1px] right-[0px] text-[10px] text-black'>{t('common:region')}</div>
		</Box>
	)
}

export default StackedAreaChart
