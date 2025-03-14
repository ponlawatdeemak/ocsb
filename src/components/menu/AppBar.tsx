import AppLogo from '@/components/svg/AppLogo'
import { Box, Drawer, IconButton, Typography } from '@mui/material'
import { useSession } from 'next-auth/react'
import React, { useCallback, useState } from 'react'
import { APP_TITLE_EN, APP_TITLE_TH } from '../../../webapp.config'
import UserAvatar from './UserAvatar'
import useResponsive from '@/hook/responsive'
import { Close, MenuRounded } from '@mui/icons-material'
import MenuListOnDesktop from './MenuListOnDesktop'
import MenuListOnMobile from './MenuListOnMobile'
import useAreaUnit from '@/store/area-unit'
import { AreaUnitKey, Languages, QuantityUnitKey } from '@/enum'
import useQuantityUnit from '@/store/quantity-unit'
import { useTranslation } from 'next-i18next'
import { ResponseLanguage } from '@/api/interface'

export interface CurrentSettingType {
	areaUnit: AreaUnitKey
	quantityUnit: QuantityUnitKey
	language: keyof ResponseLanguage
}

interface AppBarProps {
	className?: string
}

const AppBar: React.FC<AppBarProps> = ({ className }) => {
	const { data: session } = useSession()
	const { isDesktop } = useResponsive()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const [drawerMenuOpen, setDrawerMenuOpen] = useState<boolean>(false)
	const { i18n } = useTranslation('common')
	const language = i18n.language as keyof ResponseLanguage

	const [currentSetting, setCurrentSetting] = useState<CurrentSettingType>({
		areaUnit: areaUnit || AreaUnitKey.Rai,
		quantityUnit: quantityUnit || QuantityUnitKey.Ton,
		language: language || Languages.TH,
	})

	const toggleMenuDrawer = useCallback(
		(newOpen: boolean) => () => {
			setDrawerMenuOpen(newOpen)
		},
		[],
	)

	return (
		<Box className='flex h-[80px] items-center justify-between bg-white px-4 shadow-[0_2px_6px_0_rgba(0,0,0,0.1)] lg:px-5'>
			<Box className='flex items-center gap-responsive-bar-gap'>
				<Box className='flex items-center'>
					<AppLogo />
					<Box className='flex flex-col'>
						<Typography className='overflow-hidden text-ellipsis whitespace-nowrap !text-xs text-primary'>
							{APP_TITLE_TH}
						</Typography>
						<Typography className='overflow-hidden text-ellipsis whitespace-nowrap !text-xs text-[#049334]'>
							{APP_TITLE_EN}
						</Typography>
					</Box>
				</Box>
				{isDesktop && (
					<MenuListOnDesktop currentSetting={currentSetting} setCurrentSetting={setCurrentSetting} />
				)}
			</Box>
			{isDesktop ? (
				<div className='flex items-center gap-4'>
					<UserAvatar user={session?.user} />
				</div>
			) : (
				<IconButton onClick={toggleMenuDrawer(true)}>
					<MenuRounded className='!h-12 !w-12 !fill-primary' />
				</IconButton>
			)}

			{!isDesktop && (
				<Drawer
					PaperProps={{ className: '!h-full' }}
					anchor='right'
					open={drawerMenuOpen}
					onClose={toggleMenuDrawer(false)}
				>
					<Box className='h-full w-[300px] p-4'>
						<Box className='mb-8 mt-3 flex justify-between'>
							<UserAvatar user={session?.user} />
							<IconButton onClick={toggleMenuDrawer(false)}>
								<Close className='text-black' />
							</IconButton>
						</Box>
						<Box className='h-[calc(100%-116px)] overflow-auto'>
							<MenuListOnMobile
								currentSetting={currentSetting}
								setCurrentSetting={setCurrentSetting}
								onCloseMenuDrawer={() => setDrawerMenuOpen(false)}
							/>
						</Box>
					</Box>
				</Drawer>
			)}
		</Box>
	)
}

export default AppBar
