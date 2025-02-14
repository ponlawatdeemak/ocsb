import { GetProductOverviewDtoOut } from '@interface/dto/overview/overview.dto-out'
import { Typography, Divider } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'

const OverviewProductMain = ({
	productData,
	className,
}: {
	productData: GetProductOverviewDtoOut | undefined
	className?: string
}) => {
	const { t } = useTranslation(['overview', 'common'])

	return (
		<div
			className={classNames(
				'flex h-full flex-col justify-start gap-4 rounded-[10px] bg-primary p-4 text-white shadow max-lg:w-full lg:flex-[1]',
				className,
			)}
		>
			<Typography>{t('sugarCaneYield')}</Typography>
			<div className='flex flex-col gap-4'>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test1</Typography>
						<Typography className='!text-sm'>120</Typography>
					</div>
					<Divider className='!border-white !border-opacity-25' />
				</div>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test2</Typography>
						<Typography className='!text-sm'>80</Typography>
					</div>
					<Divider className='!border-white !border-opacity-25' />
				</div>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test3</Typography>
						<Typography className='!text-sm'>10</Typography>
					</div>
					<Divider className='!border-white !border-opacity-25' />
				</div>
				<div className='flex flex-col gap-2'>
					<div className='flex items-center justify-between'>
						<Typography className='!text-xs'>test4</Typography>
						<Typography className='!text-sm'>5</Typography>
					</div>
					<Divider className='!border-white !border-opacity-25' />
				</div>
			</div>
		</div>
	)
}

export default OverviewProductMain
