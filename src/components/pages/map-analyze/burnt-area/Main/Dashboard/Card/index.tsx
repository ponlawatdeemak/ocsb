import { Box, IconButton, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import CloseIcon from '@mui/icons-material/Close'

interface DashboardCardMainProps {
	handleClickDelete: () => void
	isSelectedCard: boolean
	handleSelectCard: () => void
	className?: string
}

const DashboardCardMain: React.FC<DashboardCardMainProps> = ({
	handleClickDelete,
	isSelectedCard,
	handleSelectCard,
	className = '',
}) => {
	return (
		<Box className={classNames('flex h-full w-[300px] min-w-0 bg-white', className)}>
			<div
				className={classNames(
					'flex h-fit w-full items-start justify-between bg-[#EBF5FF] px-5 py-4 hover:cursor-pointer',
				)}
				style={{
					outlineStyle: isSelectedCard ? 'solid' : 'none',
					outlineOffset: '-2px',
					outlineColor: '#003491',
				}}
				onClick={handleSelectCard}
			>
				<Typography className='break-all'>DashboardCardMain</Typography>
				<IconButton
					onClick={(e) => {
						e.preventDefault()
						e.stopPropagation()
						handleClickDelete()
					}}
				>
					<CloseIcon className='!h-3 !w-3' />
				</IconButton>
			</div>
		</Box>
	)
}

export default DashboardCardMain
