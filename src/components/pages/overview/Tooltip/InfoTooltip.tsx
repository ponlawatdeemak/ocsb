import { InfoIcon } from '@/components/svg/MenuIcon'
import { IconButton, Tooltip } from '@mui/material'
import { ReactNode } from 'react'

const InfoTooltip = ({
	title,
	color,
	placement = 'right',
}: {
	title: string | ReactNode
	color?: string
	placement?: string
}) => {
	return (
		<Tooltip
			title={title}
			placement={placement as any}
			componentsProps={{
				tooltip: {
					sx: {
						bgcolor: 'white',
						color: 'black',
						fontSize: '12px',
						padding: '8px',
						boxShadow: '0px 2px 10px -2px rgb(0 0 0 / 0.3)',
					},
				},
				arrow: {
					sx: {
						color: 'white',
					},
				},
			}}
			arrow
		>
			<IconButton className='!p-0 [&_.MuiTooltip-popper]:!bg-white'>
				<InfoIcon fill={color} />
			</IconButton>
		</Tooltip>
	)
}

export default InfoTooltip
