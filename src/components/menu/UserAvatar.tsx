import { AppPath } from '@/config/app.config'
import { Box, Typography } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import { Session } from 'next-auth'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import { DefaultAvatarIcon } from '../svg/AppIcon'
import React from 'react'

interface UserAvatarProps {
	user?: Session['user']
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
	const router = useRouter()
	const firstName = user?.firstName ?? ''
	const lastName = user?.lastName ?? ''
	const { t } = useTranslation('common')

	const getLetterAvatar = () => {
		let letter = (firstName.at(0)?.toUpperCase() ?? '') + (lastName.at(0)?.toUpperCase() ?? '')
		return letter.length == 0 ? (user?.email?.substring(0, 2) ?? 'NA') : letter
	}

	return (
		<React.Fragment>
			{user ? (
				<Box
					className='flex cursor-pointer items-center gap-2 p-1'
					onClick={() => router.push(AppPath.Profile)}
				>
					{user.image ? (
						<Avatar src={user.image} alt={firstName} className='!h-[36px] !w-[36px]' />
					) : (
						<Avatar alt={firstName} className='!h-[36px] !w-[36px] !bg-[##8E8E8E]'>
							{getLetterAvatar()}
						</Avatar>
					)}
					<Box className='flex flex-col justify-center'>
						<Typography className='max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap !text-xs text-black'>
							{`${firstName} ${lastName}`}
						</Typography>
						<Typography className='max-w-[140px] overflow-hidden text-ellipsis whitespace-nowrap !text-xs text-[#8E8E8E]'>
							{'ภาค 1, ภาค 2, ภาค 3, ภาค 4 '}
						</Typography>
					</Box>
				</Box>
			) : (
				<Box className='flex cursor-pointer items-center gap-2 p-2' onClick={() => router?.push(AppPath.Login)}>
					<Avatar className='!h-[36px] !w-[36px] !bg-transparent'>
						<DefaultAvatarIcon width={36} height={36} fill='#8E8E8E' />
					</Avatar>
					<Typography className='overflow-hidden text-ellipsis whitespace-nowrap !text-xs text-black'>
						{t('login')}
					</Typography>
				</Box>
			)}
		</React.Fragment>
	)
}

export default UserAvatar
