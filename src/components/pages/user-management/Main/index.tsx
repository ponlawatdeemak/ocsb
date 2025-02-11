'use client'

import { useCallback, useState } from 'react'
import { SortType } from '@/enum'
import { useTranslation } from 'next-i18next'
import { Box, Button, Menu, MenuItem, Typography } from '@mui/material'
import { DeleteUMDtoIn, PostActiveUMDtoIn, SearchUMDtoIn } from '@interface/dto/um/um.dto.in'
import UserManagementSearchForm from './SearchForm/index'
import UserManagementTable from './Table/index'
import service from '@/api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { DeleteOutline, FileUploadOutlined, KeyboardArrowDown, PersonAddAltOutlined } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { AppPath } from '@/config/app.config'
import { useSession } from 'next-auth/react'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import AlertDialog from '@/components/common/dialog/AlertDialog'
import useResponsive from '@/hook/responsive'

export const UserManagementMain = () => {
	const router = useRouter()
	const { data: session } = useSession()
	const { isDesktop } = useResponsive()
	const { t } = useTranslation(['common', 'um'])
	const [searchParams, setSearchParams] = useState<SearchUMDtoIn>({
		region: [],
		role: [],
		position: [],
		keyword: '',
		page: 1,
		limit: 10,
		orderBy: 'fullName',
		order: SortType.ASC,
	})
	const [selected, setSelected] = useState<readonly string[]>([])
	const [activeAnchorEl, setActiveAnchorEl] = useState<null | HTMLElement>(null)
	const [busy, setBusy] = useState<boolean>(false)

	const [isConfirmDeleteAllDialogOpen, setIsConfirmDeleteAllDialogOpen] = useState<boolean>(false)
	const [isConfirmActiveAllDialogOpen, setIsConfirmActiveAllDialogOpen] = useState<boolean>(false)
	const [isConfirmInactiveAllDialogOpen, setIsConfirmInactiveAllDialogOpen] = useState<boolean>(false)
	const [alertInfo, setAlertInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	const {
		data: searchUMData,
		refetch: refetchSearchUM,
		isLoading: isSearchUMDataLoading,
	} = useQuery({
		queryKey: ['getSearchUM', searchParams],
		queryFn: async () => {
			setSelected([])
			return await service.um.getSearchUM(searchParams)
		},
	})

	// ModalAction
	const {
		data: _postActiveUMData,
		error: _postActiveUMError,
		mutateAsync: mutatePostActiveUM,
		isPending: isPostActiveUMPending,
	} = useMutation({
		mutationFn: async (payload: PostActiveUMDtoIn) => {
			return await service.um.postActiveUM(payload)
		},
	})

	const {
		data: _deleteAllUMData,
		error: _deleteAllUMError,
		mutateAsync: mutateDeleteAllUM,
		isPending: isDeleteAllUMPending,
	} = useMutation({
		mutationFn: async (payload: DeleteUMDtoIn) => {
			return await service.um.deleteUM(payload)
		},
	})

	const handleActiveMenuClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
		setActiveAnchorEl(event.currentTarget)
	}, [])

	const handleActiveMenuClose = useCallback(() => {
		setActiveAnchorEl(null)
	}, [])

	//Case Delete All
	const handleDeleteAllUsers = useCallback(async () => {
		try {
			setBusy(true)

			const requestMap: DeleteUMDtoIn[] = selected
				.filter((n) => n !== session?.user.id)
				.map((n) => {
					return {
						userId: n,
					}
				})

			const promises = requestMap.map((request) => mutateDeleteAllUM(request))
			Promise.all(promises)
				.then((res) => {
					setAlertInfo({ open: true, severity: 'success', message: 'Deleted All Users Successfully!' })
					refetchSearchUM()
				})
				.catch((error) => {
					console.error(error)
					setAlertInfo({
						open: true,
						severity: 'error',
						message: 'Deleted All Users Failed!',
					})
				})
		} catch (error: any) {
			console.error(error)
		} finally {
			setBusy(false)
			setSelected([])
			setIsConfirmDeleteAllDialogOpen(false)
		}
	}, [mutateDeleteAllUM, selected, session, refetchSearchUM])

	//Case Active All
	const handleActiveAllUsers = useCallback(async () => {
		try {
			setBusy(true)
			// filter out current session userid
			const payload: PostActiveUMDtoIn = { userIds: selected.join(','), isActive: true }
			await mutatePostActiveUM(payload)
			setAlertInfo({ open: true, severity: 'success', message: 'Updated Active All Users Successfully!' })
		} catch (error: any) {
			console.error(error)
			setAlertInfo({
				open: true,
				severity: 'error',
				message: 'Updated Active User Failed!',
			})
		} finally {
			setBusy(false)
			setSelected([])
			setIsConfirmActiveAllDialogOpen(false)
			handleActiveMenuClose()
			refetchSearchUM()
		}
	}, [mutatePostActiveUM, selected, handleActiveMenuClose, refetchSearchUM])

	//Case Inactive All
	const handleInactiveAllUsers = useCallback(async () => {
		try {
			setBusy(true)
			// filter out current session userid
			const payload: PostActiveUMDtoIn = { userIds: selected.join(','), isActive: false }
			await mutatePostActiveUM(payload)
			setAlertInfo({ open: true, severity: 'success', message: 'Updated Inactive All All sUsers Successfully!' })
		} catch (error: any) {
			console.error(error)
			setAlertInfo({
				open: true,
				severity: 'error',
				message: 'Updated Inactive All Users Failed!',
			})
		} finally {
			setBusy(false)
			setSelected([])
			setIsConfirmInactiveAllDialogOpen(false)
			handleActiveMenuClose()
			refetchSearchUM()
		}
	}, [mutatePostActiveUM, selected, handleActiveMenuClose, refetchSearchUM])

	return (
		<div className='relative flex w-[calc(100vw-0px)] flex-col self-center px-4 py-5 lg:px-6'>
			<Box className='absolute left-0 top-0 h-[520px] w-full bg-primary lg:h-[260px]'></Box>
			<Box className='absolute bottom-0 left-0 top-[520px] w-full bg-white lg:top-[260px]'></Box>

			<Box className='z-1 relative'>
				<Box className='pb-4'>
					<Typography className='!text-md !font-normal text-white'>{'การจัดการสิทธ์ผู้ใช้งาน'}</Typography>
				</Box>

				<UserManagementSearchForm searchParams={searchParams} setSearchParams={setSearchParams} />

				<Box className='flex items-center gap-4 max-lg:justify-between'>
					<Box className='flex items-center gap-4'>
						<Button
							className='flex h-[38px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none max-lg:!min-w-[38px] [&_.MuiButton-icon]:m-0'
							variant='contained'
							startIcon={<FileUploadOutlined className='!h-4 !w-4 !fill-white' />}
							onClick={() => console.log('Import!!!')}
						>
							{isDesktop && <Box className='!text-xs text-white'>{'นำเข้าผู้ใช้งาน'}</Box>}
						</Button>
						<Button
							className='flex h-[38px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none max-lg:!min-w-[38px] [&_.MuiButton-icon]:m-0'
							variant='contained'
							startIcon={<PersonAddAltOutlined className='!h-4 !w-4 !fill-white' />}
							onClick={() => router.push(AppPath.UserManagementForm)}
						>
							{isDesktop && <Box className='!text-xs text-white'>{'เพิ่มผู้ใช้งาน'}</Box>}
						</Button>
					</Box>

					{selected.length > 0 && (
						<Box className='flex items-center gap-4'>
							{isDesktop && (
								<>
									<Button
										className='flex h-[38px] !min-w-[105px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none [&_.MuiButton-icon]:m-0'
										variant='contained'
										onClick={() => setIsConfirmActiveAllDialogOpen(true)}
									>
										<Box className='!text-xs normal-case text-white'>{'Active'}</Box>
									</Button>
									<Button
										className='flex h-[38px] !min-w-[105px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none [&_.MuiButton-icon]:m-0'
										variant='contained'
										onClick={() => setIsConfirmInactiveAllDialogOpen(true)}
									>
										<Box className='!text-xs normal-case text-white'>{'Inactive'}</Box>
									</Button>
								</>
							)}

							{!isDesktop && (
								<>
									<Button
										className='flex h-[38px] !min-w-[105px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none [&_.MuiButton-icon]:m-0'
										variant='contained'
										id='active-button'
										aria-controls={activeAnchorEl ? 'active-menu' : undefined}
										aria-haspopup='true'
										aria-expanded={activeAnchorEl ? 'true' : undefined}
										onClick={handleActiveMenuClick}
										endIcon={<KeyboardArrowDown className='h-6 w-6 text-white' />}
									>
										<Box className='whitespace-nowrap !text-sm normal-case text-white'>
											{'การใช้งาน'}
										</Box>
									</Button>

									<Menu
										id='active-menu'
										anchorEl={activeAnchorEl}
										open={Boolean(activeAnchorEl)}
										onClose={handleActiveMenuClose}
										MenuListProps={{
											'aria-labelledby': 'active-button',
										}}
										slotProps={{
											paper: {
												className:
													'mt-2 rounded-lg min-w-[180px] [&_ul>li.Mui-focused]:!bg-green-light2 [&_ul]:py-1 p-1',
											},
										}}
										anchorOrigin={{
											vertical: 'bottom',
											horizontal: 'right',
										}}
										transformOrigin={{
											vertical: 'top',
											horizontal: 'right',
										}}
									>
										<MenuItem
											className='rounded-t-lg border-0 border-b border-solid border-gray'
											onClick={() => setIsConfirmActiveAllDialogOpen(true)}
										>
											{'Active'}
										</MenuItem>
										<MenuItem
											className='rounded-b-lg'
											onClick={() => setIsConfirmInactiveAllDialogOpen(true)}
										>
											{'Inactive'}
										</MenuItem>
									</Menu>
								</>
							)}

							<Button
								className='flex h-[38px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none max-lg:!min-w-[38px] [&_.MuiButton-icon]:m-0'
								variant='contained'
								startIcon={<DeleteOutline className='!h-4 !w-4 !fill-white' />}
								onClick={() => setIsConfirmDeleteAllDialogOpen(true)}
							>
								{isDesktop && <Box className='!text-xs text-white'>{'ลบผู้ใช้งาน'}</Box>}
							</Button>
						</Box>
					)}
				</Box>

				<UserManagementTable
					searchParams={searchParams}
					setSearchParams={setSearchParams}
					tableData={searchUMData?.data ?? []}
					total={searchUMData?.total ?? 0}
					searchDataLoading={isSearchUMDataLoading}
					selected={selected}
					setSelected={setSelected}
					refetchSearchUM={refetchSearchUM}
				/>
			</Box>

			{/* Delete All Users Dialog */}
			<AlertDialog
				open={isConfirmDeleteAllDialogOpen}
				title={'คุณต้องการลบรายการนี้หรือไม่'}
				content={'คุณต้องการลบรายการนี้หรือไม่'}
				onClose={() => {
					setSelected([])
					setIsConfirmDeleteAllDialogOpen(false)
				}}
				onConfirm={handleDeleteAllUsers}
				loading={busy || isDeleteAllUMPending}
				isDisableBackdropClick
			/>

			{/* Active All Users Dialog */}
			<AlertDialog
				open={isConfirmActiveAllDialogOpen}
				title={'คุณต้องการลบรายการนี้หรือไม่'}
				content={'คุณต้องการลบรายการนี้หรือไม่'}
				onClose={() => {
					setSelected([])
					setIsConfirmActiveAllDialogOpen(false)
					handleActiveMenuClose()
				}}
				onConfirm={handleActiveAllUsers}
				loading={busy || isPostActiveUMPending}
				isDisableBackdropClick
			/>

			{/* Inactive All Users Dialog */}
			<AlertDialog
				open={isConfirmInactiveAllDialogOpen}
				title={'คุณต้องการลบรายการนี้หรือไม่'}
				content={'คุณต้องการลบรายการนี้หรือไม่'}
				onClose={() => {
					setSelected([])
					setIsConfirmInactiveAllDialogOpen(false)
					handleActiveMenuClose()
				}}
				onConfirm={handleInactiveAllUsers}
				loading={busy || isPostActiveUMPending}
				isDisableBackdropClick
			/>

			<AlertSnackbar alertInfo={alertInfo} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
		</div>
	)
}
