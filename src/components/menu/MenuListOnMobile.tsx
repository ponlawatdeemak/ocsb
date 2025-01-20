import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { appMenuConfig } from '@/config/app.config'
import { Collapse, List, ListItemButton, ListItemText } from '@mui/material'
import SettingDialog from './SettingDialog'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import classNames from 'classnames'
import { ExpandLess, ExpandMore } from '@mui/icons-material'

interface MenuListOnMobileProps {
	onCloseMenuDrawer: () => void
}

const MenuListOnMobile: React.FC<MenuListOnMobileProps> = ({ onCloseMenuDrawer }) => {
	const router = useRouter()
	const pathname = usePathname()
	const { data: session } = useSession()
	const { t } = useTranslation('common')
	const splitedPathname = useMemo(() => pathname.split('/').filter((item) => item !== ''), [pathname])

	const [tabValue, setTabValue] = useState<string>(`/${splitedPathname.shift()}`)
	const [mapAnalyzeListOpen, setMapAnalyzeListOpen] = useState(false)
	const [openSettingDialog, setOpenSettingDialog] = useState<boolean>(false)

	const handleOpenMapAnalyzeListMenu = useCallback(() => {
		setMapAnalyzeListOpen(!mapAnalyzeListOpen)
	}, [mapAnalyzeListOpen])

	const handleChangeTabValue = useCallback((pathMenu: string) => {
		const splitedPathname = pathMenu.split('/').filter((item) => item !== '')
		setTabValue(`/${splitedPathname.shift()}`)
	}, [])

	const handleCloseDialog = useCallback(() => {
		setOpenSettingDialog(false)
	}, [])

	return (
		<React.Fragment>
			<List className='w-full !p-0' component='nav'>
				{appMenuConfig.map((menu) =>
					(menu.access?.length || 0) > 0 ? (
						menu.access?.includes(session?.user.role ?? '') && (
							<React.Fragment key={menu.id}>
								{(menu.children?.length || 0) > 0 ? (
									<React.Fragment>
										<ListItemButton
											className='cursor-pointer !border-0 !border-b !border-solid !border-gray !p-2'
											onClick={handleOpenMapAnalyzeListMenu}
										>
											<ListItemText
												className={classNames('[&_span]:text-sm [&_span]:text-black', {
													'[&_span]:!font-semibold [&_span]:!text-primary':
														(!openSettingDialog && tabValue === menu.path) ||
														Boolean(mapAnalyzeListOpen),
												})}
												primary={t(menu.label)}
											/>
											{mapAnalyzeListOpen ? <ExpandLess /> : <ExpandMore />}
										</ListItemButton>

										<Collapse in={mapAnalyzeListOpen} timeout='auto' unmountOnExit>
											<List className='!pl-6' component='div' disablePadding>
												{menu?.children?.map((subMenu) => (
													<ListItemButton
														key={subMenu.id}
														onClick={() => {
															handleChangeTabValue(subMenu.path)
															router.push(subMenu.path)
															onCloseMenuDrawer()
														}}
														className='cursor-pointer !border-0 !border-b !border-solid !border-gray !p-2'
													>
														<ListItemText
															className='[&_span]:text-sm [&_span]:text-black'
															primary={t(subMenu.label)}
														/>
													</ListItemButton>
												))}
											</List>
										</Collapse>
									</React.Fragment>
								) : (
									<ListItemButton
										className='cursor-pointer !border-0 !border-b !border-solid !border-gray !p-2'
										onClick={() => {
											handleChangeTabValue(menu.path)
											router.push(menu.path)
											onCloseMenuDrawer()
											setMapAnalyzeListOpen(false)
										}}
									>
										<ListItemText
											className={classNames('[&_span]:text-sm [&_span]:text-black', {
												'[&_span]:!font-semibold [&_span]:!text-primary':
													!mapAnalyzeListOpen && !openSettingDialog && tabValue === menu.path,
											})}
											primary={t(menu.label)}
										/>
									</ListItemButton>
								)}
							</React.Fragment>
						)
					) : (
						<ListItemButton
							key={menu.id}
							className='cursor-pointer !border-0 !border-b !border-solid !border-gray !p-2'
							onClick={() => {
								if (menu.id === 'Setting') {
									setOpenSettingDialog(true)
									setMapAnalyzeListOpen(false)
								} else {
									handleChangeTabValue(menu.path)
									router.push(menu.path)
									onCloseMenuDrawer()
									setMapAnalyzeListOpen(false)
								}
							}}
						>
							<ListItemText
								className={classNames('[&_span]:text-sm [&_span]:text-black', {
									'[&_span]:!font-semibold [&_span]:!text-primary':
										(!mapAnalyzeListOpen && !openSettingDialog && tabValue === menu.path) ||
										(openSettingDialog && menu.id === 'Setting'),
								})}
								primary={t(menu.label)}
							/>
						</ListItemButton>
					),
				)}
			</List>

			<SettingDialog open={openSettingDialog} onClose={() => handleCloseDialog()} />
		</React.Fragment>
	)
}

export default MenuListOnMobile
