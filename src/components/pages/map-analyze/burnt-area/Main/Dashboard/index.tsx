import { Box } from '@mui/material'
import classNames from 'classnames'
import React from 'react'

interface BurntDashboardMainProps {
	className?: string
}

const BurntDashboardMain: React.FC<BurntDashboardMainProps> = ({ className = '' }) => {
	return <Box className={classNames('', className)}>BurntDashboardMain</Box>
}

export default BurntDashboardMain
