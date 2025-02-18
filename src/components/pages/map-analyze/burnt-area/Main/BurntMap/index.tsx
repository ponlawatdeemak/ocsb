import MapView from '@/components/common/map/MapView'
import { Box } from '@mui/material'
import classNames from 'classnames'
import React from 'react'

interface BurntMapMainProps {
	className?: string
}

const BurntMapMain: React.FC<BurntMapMainProps> = ({ className = '' }) => {
	return (
		<Box className={classNames('', className)}>
			<Box className='flex h-full grow'>
				<MapView />
			</Box>
		</Box>
	)
}

export default BurntMapMain
