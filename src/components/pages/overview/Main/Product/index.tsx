import { GetProductOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography, Divider, Box } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import { Languages } from '@/enum'
import * as _ from 'lodash'
import useAreaUnit from '@/store/area-unit'
import { defaultNumber } from '@/utils/text'
import useQuantityUnit from '@/store/quantity-unit'
import NoDataDisplay from '@/components/common/empty/NoDataDisplay'
import InfoTooltip from '../../Tooltip/InfoTooltip'

const OverviewProductMain = ({
	productData,
	className,
}: {
	productData: GetProductOverviewDtoOut[] | undefined
	className?: string
}) => {
	const { t, i18n } = useTranslation(['overview', 'common'])
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 text-white shadow max-xl:w-full xl:flex-[1]',
				className,
			)}
		>
			<div className='flex w-full items-baseline justify-between'>
				<Box className='flex flex-wrap gap-x-2'>
					<Typography>{`${t('sugarCaneYieldWithUnit1')}`}</Typography>
					<Typography>{`${t('sugarCaneYieldWithUnit2')}`}</Typography>
				</Box>
				<Box>
					<InfoTooltip title={`${t('tooltipYieldWithUnit')}`} placement='bottom' />
				</Box>
			</div>
			<div className='flex flex-col gap-4'>
				{productData ? (
					productData.map((item) => (
						<div key={item.regionId} className='flex flex-col gap-2'>
							<div className='flex items-center justify-between'>
								<Typography className='!text-xs'>
									{`${
										item[
											_.camelCase(
												`regionName-${i18n.language === Languages.TH ? '' : i18n.language}`,
											) as keyof GetProductOverviewDtoOut
										] as string
									} (${(
										item[
											_.camelCase(
												`provinces-${i18n.language === Languages.TH ? '' : i18n.language}`,
											) as keyof GetProductOverviewDtoOut
										] as string[]
									).join(',')})`}
								</Typography>
								<Typography className='!text-sm'>
									{defaultNumber(item[quantityUnit][areaUnit])}
								</Typography>
							</div>
							<Divider className='!border-white !border-opacity-25' />
						</div>
					))
				) : (
					<div className='flex h-[170px] w-full items-center justify-center'>
						<NoDataDisplay />
					</div>
				)}
			</div>
		</div>
	)
}

export default OverviewProductMain
