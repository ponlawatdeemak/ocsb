import { Box, Typography } from '@mui/material'
import React from 'react'
import Icon from '@mdi/react'
import { mdiFolderOffOutline } from '@mdi/js'
import { useTranslation } from 'next-i18next'

const NoDataDisplay = () => {
	const { t } = useTranslation('common')

	return (
		<Box className='flex h-full flex-col items-center justify-center gap-1'>
			<Icon path={mdiFolderOffOutline} size={2} color='var(--light-gray-color)' />
			<Typography className='text-gray'>{t('noData')}</Typography>
		</Box>
	)
}

export default NoDataDisplay
