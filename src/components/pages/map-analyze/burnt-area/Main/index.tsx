import { Box } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import BurntSearchFormMain from './SearchForm'
import BurntMapMain from './BurntMap'
import BurntDashboardMain from './Dashboard'

interface BurntAreaMainProps {
	className?: string
}

export const BurntAreaMain: React.FC<BurntAreaMainProps> = ({ className = '' }) => {
	return (
		<Box className={classNames('flex h-full w-full flex-col', className)}>
			<BurntSearchFormMain className='z-10 w-full' />
			<Box className='flex h-full w-full flex-1'>
				<BurntDashboardMain className='max-w-[calc(80vw)]' />
				<BurntMapMain className='h-full w-full flex-1 max-md:absolute' />
			</Box>
		</Box>
	)
}
