import { Box } from '@mui/material'
import classNames from 'classnames'
import React from 'react'

interface DashboardCardMainProps {
	className?: string
}

const DashboardCardMain: React.FC<DashboardCardMainProps> = ({ className = '' }) => {
	return <Box className={classNames('', className)}>DashboardCardMain</Box>
}

export default DashboardCardMain
