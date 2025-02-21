import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { appMenuConfig } from '@/config/app.config'
import { Box, Menu, MenuItem, Typography } from '@mui/material'
import SettingDialog from './SettingDialog'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import classNames from 'classnames'
import { ExpandLess, ExpandMore } from '@mui/icons-material'
import { AreaUnitKey, Languages, QuantityUnitKey } from '@/enum'
import useAreaUnit from '@/store/area-unit'
import useQuantityUnit from '@/store/quantity-unit'
import { ResponseLanguage } from '@/api/interface'
import { UserRole } from '@interface/config/um.config'
import { CurrentSettingType } from './AppBar'

interface MenuListOnDesktopProps {
	currentSetting: CurrentSettingType
	setCurrentSetting: React.Dispatch<React.SetStateAction<CurrentSettingType>>
}

const MenuListOnDesktop: React.FC<MenuListOnDesktopProps> = ({ currentSetting, setCurrentSetting }) => {
	const router = useRouter()
	const pathname = usePathname()
	const { data: session } = useSession()
	const { areaUnit } = useAreaUnit()
	const { quantityUnit } = useQuantityUnit()
	const { t, i18n } = useTranslation('common')
	const language = i18n.language as keyof ResponseLanguage
	const splitedPathname = useMemo(() => pathname.split('/').filter((item) => item !== ''), [pathname])

	const [tabValue, setTabValue] = useState<string>(`/${splitedPathname.shift()}`)
	const [anchorMapAnalyzeMenuEl, setAnchorMapAnalyzeMenuEl] = useState<null | HTMLElement>(null)
	const [openSettingDialog, setOpenSettingDialog] = useState<boolean>(false)

	const handleOpenMapAnalyzeMenu = useCallback((event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		setAnchorMapAnalyzeMenuEl(event.currentTarget)
	}, [])

	const handleCloseMapAnalyzeMenu = useCallback(() => {
		setAnchorMapAnalyzeMenuEl(null)
	}, [])

	const handleChangeTabValue = useCallback((pathMenu: string) => {
		const splitedPathname = pathMenu.split('/').filter((item) => item !== '')
		setTabValue(`/${splitedPathname.shift()}`)
	}, [])

	const handleCloseDialog = useCallback(() => {
		setOpenSettingDialog(false)
	}, [])

	const canAccess = useCallback(
		(accessList: UserRole[]) => {
			return session?.user?.role?.roleId ? accessList.includes(session.user.role.roleId) : false
		},
		[session?.user],
	)

	return (
		<React.Fragment>
			<Box className='flex min-h-[38px] items-center gap-responsive-menu-gap p-1'>
				{appMenuConfig.map((menu) =>
					(menu.access?.length || 0) > 0 ? (
						canAccess(menu.access) && (
							<React.Fragment key={menu.id}>
								{menu.children?.length ? (
									<React.Fragment>
										<Box
											className='flex min-h-[30px] min-w-0 cursor-pointer items-center gap-1 !p-1'
											onClick={handleOpenMapAnalyzeMenu}
										>
											<Typography
												className={classNames(
													'overflow-hidden text-ellipsis whitespace-nowrap !text-sm normal-case text-black',
													{
														'!font-semibold !text-primary':
															(!openSettingDialog && tabValue === menu.path) ||
															Boolean(anchorMapAnalyzeMenuEl),
													},
												)}
											>
												{t(menu.label)}
											</Typography>
											{anchorMapAnalyzeMenuEl ? (
												<ExpandLess className='!h-4 !w-4 font-semibold text-primary' />
											) : (
												<ExpandMore
													className={classNames('!h-4 !w-4 text-black', {
														'font-semibold !text-primary':
															(!openSettingDialog && tabValue === menu.path) ||
															Boolean(anchorMapAnalyzeMenuEl),
													})}
												/>
											)}
										</Box>

										<Menu
											anchorEl={anchorMapAnalyzeMenuEl}
											open={Boolean(anchorMapAnalyzeMenuEl)}
											onClose={handleCloseMapAnalyzeMenu}
											className='[&_.MuiPaper-root]:w-40 [&_.MuiPaper-root]:border [&_.MuiPaper-root]:border-solid [&_.MuiPaper-root]:border-gray'
										>
											{menu?.children?.map((subMenu) => (
												<MenuItem
													key={subMenu.id}
													onClick={() => {
														handleChangeTabValue(subMenu.path)
														router.push(subMenu.path)
														handleCloseMapAnalyzeMenu()
													}}
													className='p-3 px-2.5 text-base font-medium'
												>
													{t(subMenu.label)}
												</MenuItem>
											))}
										</Menu>
									</React.Fragment>
								) : (
									<Box
										className='min-h-[30px] min-w-0 cursor-pointer !p-1'
										onClick={() => {
											handleChangeTabValue(menu.path)
											router.push(menu.path)
										}}
									>
										<Typography
											className={classNames(
												'overflow-hidden text-ellipsis whitespace-nowrap !text-sm normal-case text-black',
												{
													'!font-semibold !text-primary':
														!anchorMapAnalyzeMenuEl &&
														!openSettingDialog &&
														tabValue === menu.path,
												},
											)}
										>
											{t(menu.label)}
										</Typography>
									</Box>
								)}
							</React.Fragment>
						)
					) : (
						<Box
							key={menu.id}
							className='min-h-[30px] min-w-0 cursor-pointer !p-1'
							onClick={() => {
								if (menu.id === 'Setting') {
									setCurrentSetting({
										areaUnit: areaUnit || AreaUnitKey.Rai,
										quantityUnit: quantityUnit || QuantityUnitKey.Ton,
										language: language || Languages.TH,
									})
									setOpenSettingDialog(true)
								} else {
									handleChangeTabValue(menu.path)
									router.push(menu.path)
								}
							}}
						>
							<Typography
								className={classNames(
									'overflow-hidden text-ellipsis whitespace-nowrap !text-sm normal-case text-black',
									{
										'!font-semibold !text-primary':
											(!anchorMapAnalyzeMenuEl && !openSettingDialog && tabValue === menu.path) ||
											(openSettingDialog && menu.id === 'Setting'),
									},
								)}
							>
								{t(menu.label)}
							</Typography>
						</Box>
					),
				)}
			</Box>

			<SettingDialog
				open={openSettingDialog}
				currentSetting={currentSetting}
				setCurrentSetting={setCurrentSetting}
				onClose={() => handleCloseDialog()}
			/>
		</React.Fragment>
	)
}

export default MenuListOnDesktop
