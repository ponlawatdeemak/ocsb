import service from '@/api'
import { Box, Typography } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

const UsageCount: FC = () => {
	const { t } = useTranslation(['overview', 'common'])
	const { data: usageData } = useQuery({
		queryKey: ['usage'],
		queryFn: () => {
			let usageId = sessionStorage.getItem('usageId')
			const update = !usageId
			return service.overview.getUsage({ update }).then((res) => {
				sessionStorage.setItem('usageId', new Date().getTime().toString())
				return res
			})
		},
	})

	return (
		<Box>
			<Typography className='!text-xs text-black'>{`${t('viewer')} : ${usageData?.data?.count} ${t('person')}`}</Typography>
		</Box>
	)
}

export default UsageCount
