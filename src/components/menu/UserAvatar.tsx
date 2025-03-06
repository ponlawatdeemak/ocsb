import { AppPath, enSuffix } from '@/config/app.config'
import { Box, Divider, Menu, MenuItem, Typography } from '@mui/material'
import Avatar from '@mui/material/Avatar'
import { Session } from 'next-auth'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/navigation'
import { DefaultAvatarIcon } from '../svg/AppIcon'
import React, { useCallback, useMemo, useState } from 'react'
import { signOut } from 'next-auth/react'
import useResponsive from '@/hook/responsive'
import { Languages } from '@/enum'
import { getUserImage } from '@/utils/image'

interface UserAvatarProps {
	user?: Session['user']
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user }) => {
	const router = useRouter()
	const firstName = user?.firstName ?? ''

	const lastName = user?.lastName ?? ''
	const { t, i18n } = useTranslation('common')
	const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
	const open = Boolean(anchorEl)
	const { isDesktop } = useResponsive()

	const userImageUrl = useMemo(() => {
		if (user?.hasImage) {
			return getUserImage(`${user.id}`)
		}
	}, [user])

	const logout = useCallback(() => signOut({ callbackUrl: AppPath.Overview }), [])

	const getLetterAvatar = () => {
		let letter = (String(firstName).at(0)?.toUpperCase() ?? '') + (lastName.at(0)?.toUpperCase() ?? '')
		return letter.length == 0 ? (user?.email?.substring(0, 2) ?? 'NA') : letter
	}

	const handleClick = (event: React.MouseEvent<HTMLElement>) => {
		setAnchorEl(event.currentTarget)
	}

	const handleClose = () => {
		setAnchorEl(null)
	}

	return (
		<React.Fragment>
			{user ? (
				<>
					{isDesktop && (
						<Menu
							id='profile-menu'
							anchorEl={anchorEl}
							open={open}
							onClose={handleClose}
							MenuListProps={{ 'aria-labelledby': 'basic-button' }}
							slotProps={{ paper: { style: { width: '200px' } } }}
						>
							<MenuItem className='!text-xs' onClick={() => router.push(AppPath.Profile)}>
								{t('profile')}
							</MenuItem>
							<Divider />
							<MenuItem className='!text-xs' onClick={() => logout()}>
								{t('logout')}
							</MenuItem>
						</Menu>
					)}
					<Box className='flex cursor-pointer items-center gap-2 p-1' onClick={handleClick}>
						{userImageUrl ? (
							<Avatar src={userImageUrl} alt={firstName} className='!h-[36px] !w-[36px]' />
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
								{user.regions
									?.map((item) => {
										return item[`regionName${Languages.TH === i18n.language ? '' : enSuffix}`]
									})
									.join(', ')}
							</Typography>
						</Box>
					</Box>
				</>
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
