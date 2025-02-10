'use client'

import { SearchUMDtoIn } from '@interface/dto/um/um.dto.in'
import {
	Avatar,
	Box,
	Button,
	Checkbox,
	CircularProgress,
	IconButton,
	Pagination,
	PaginationItem,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
} from '@mui/material'
import classNames from 'classnames'
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react'
import Icon from '@mdi/react'
import { ArrowBack, ArrowForward } from '@mui/icons-material'
import {
	mdiAccountOffOutline,
	mdiAccountOutline,
	mdiFolderOffOutline,
	mdiPencilOutline,
	mdiTrashCanOutline,
} from '@mdi/js'
import { SortType, UserRole } from '@/enum'
import { visuallyHidden } from '@mui/utils'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import useResponsive from '@/hook/responsive'
import { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import { SearchUMDtoOut } from '@interface/dto/um/um.dto-out'
import { useRouter } from 'next/navigation'
import { AppPath } from '@/config/app.config'

interface HeadCell {
	disablePadding: boolean
	id: string
	label: string
	numeric: boolean
	minWidth: string
	maxWidth: string
}

interface UserManagementTableProps {
	className?: string
	searchParams: SearchUMDtoIn
	setSearchParams: Dispatch<SetStateAction<SearchUMDtoIn>>
	tableData: SearchUMDtoOut[]
	total: number
	searchDataLoading: boolean
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
	className = '',
	searchParams,
	setSearchParams,
	tableData,
	total,
	searchDataLoading,
}) => {
	const router = useRouter()
	const { data: session } = useSession()
	const [order, setOrder] = useState<SortType>(SortType.ASC)
	const [orderBy, setOrderBy] = useState<string>('fullName')
	const [selected, setSelected] = useState<readonly string[]>([])

	const { t } = useTranslation(['common', 'um'])
	const { isDesktop } = useResponsive()

	// Define TableHead
	const headCells: readonly HeadCell[] = [
		{
			id: 'fullName',
			numeric: false,
			disablePadding: true,
			label: 'ชื่อ-นามสุกล',
			maxWidth: '',
			minWidth: '292px',
		},
		{
			id: 'region',
			numeric: false,
			disablePadding: false,
			label: 'ภูมิภาค',
			maxWidth: '220px',
			minWidth: '220px',
		},
		{
			id: 'position',
			numeric: false,
			disablePadding: false,
			label: 'ตำแหน่งงาน',
			maxWidth: '150px',
			minWidth: '150px',
		},
		{
			id: 'phone',
			numeric: false,
			disablePadding: false,
			label: 'เบอร์โทร',
			maxWidth: '120px',
			minWidth: '140px',
		},
		{
			id: 'email',
			numeric: false,
			disablePadding: false,
			label: 'อีเมล์',
			maxWidth: '120px',
			minWidth: '160px',
		},
		{
			id: 'role',
			numeric: false,
			disablePadding: false,
			label: 'สิทธิ์การเข้าถึง',
			maxWidth: '120px',
			minWidth: '160px',
		},
		{
			id: 'isActive',
			numeric: false,
			disablePadding: false,
			label: 'การใช้งาน',
			maxWidth: '176px',
			minWidth: '150px',
		},
	]

	// TableData State
	const [currentDeleteId, setCurrentDeleteId] = useState<string>('')
	const [currentEditId, setCurrentEditId] = useState<string>('')
	const [alertInfo, setAlertInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})
	const [isEditOpen, setIsEditOpen] = useState<boolean>(false)
	const [isConfirmDeleteOneOpen, setIsConfirmDeleteOneOpen] = useState<boolean>(false)
	const [isConfirmDeleteManyOpen, setIsConfirmDeleteManyOpen] = useState<boolean>(false)
	const [isConfirmOpenManyOpen, setIsConfirmOpenManyOpen] = useState<boolean>(false)
	const [isConfirmCloseManyOpen, setIsConfirmCloseManyOpen] = useState<boolean>(false)

	// // ModalAction

	// const { data: resData, isLoading: isTableDataLoading } = useQuery({
	// 	queryKey: ['umSearch'],
	// 	queryFn: async () => {
	// 		const res = await um.umSearch(searchParams)
	// 		setIsSearch(false)
	// 		return res
	// 	},
	// 	enabled: isSearch && searchParams && JSON.stringify(searchParams).length !== 0,
	// })

	// const {
	// 	data: patchStatusData,
	// 	error: patchStatusError,
	// 	mutateAsync: mutatePatchStatus,
	// } = useMutation({
	// 	mutationFn: async (payload: PatchStatusDtoIn) => {
	// 		return await um.patchStatus(payload)
	// 	},
	// })

	// const {
	// 	data: deleteProfileData,
	// 	error: deleteProfileError,
	// 	mutateAsync: mutateDeleteProfile,
	// } = useMutation({
	// 	mutationFn: async (payload: DeleteProfileDtoIn) => {
	// 		return await um.deleteProfile(payload)
	// 	},
	// })

	// useEffect(() => {
	// 	setSelected([])
	// }, [isSearch])

	const handleRequestSort = useCallback(
		(event: React.MouseEvent<unknown>, property: string) => {
			const isAsc = orderBy === property && order === SortType.ASC
			setSearchParams((prevSearch) => ({
				...prevSearch,
				order: isAsc ? SortType.DESC : SortType.ASC,
				orderBy: property,
			}))
			setOrder(isAsc ? SortType.DESC : SortType.ASC)
			setOrderBy(property)
		},
		[order, orderBy, setSearchParams],
	)

	const handleSelectAllClick = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (event.target.checked) {
				const newSelected = tableData
					.filter((n) => {
						return n.users_user_id !== session?.user.id && n.role_role_name !== (session?.user.role as any)
					})
					.map((n) => n.users_user_id)
				setSelected(newSelected)
			} else {
				setSelected([])
			}
		},
		[session, tableData],
	)

	const createSortHandler = useCallback(
		(property: string) => (event: React.MouseEvent<unknown>) => {
			handleRequestSort(event, property)
		},
		[handleRequestSort],
	)

	const handleClick = useCallback(
		(event: React.MouseEvent<unknown>, id: string, role?: UserRole) => {
			const selectedIndex = selected.indexOf(id)
			let newSelected: readonly string[] = []
			if (id === session?.user.id || session?.user.role === role) {
				return
			}
			if (selectedIndex === -1) {
				newSelected = newSelected.concat(selected, id)
			} else if (selectedIndex === 0) {
				newSelected = newSelected.concat(selected.slice(1))
			} else if (selectedIndex === selected.length - 1) {
				newSelected = newSelected.concat(selected.slice(0, -1))
			} else if (selectedIndex > 0) {
				newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1))
			}
			setSelected(newSelected)
		},
		[selected, session],
	)

	// Case deleteOne
	// const handleOnClickConfirmDelete = useCallback(
	// 	async (id: string) => {
	// 		try {
	// 			// filter out current session userid
	// 			if (id === session?.user.id) {
	// 				return
	// 			}
	// 			const payload: DeleteProfileDtoIn = { id: id }
	// 			const res = await mutateDeleteProfile(payload)
	// 			queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
	// 			setIsSearch(true)
	// 			setAlertInfo({ open: true, severity: 'success', message: t('profileDeleteSuccess', { ns: 'um' }) })
	// 		} catch (error: any) {
	// 			console.error(error)
	// 			setAlertInfo({
	// 				open: true,
	// 				severity: 'error',
	// 				message: error?.title ? error.title : t('error.somethingWrong'),
	// 			})
	// 		}
	// 	},
	// 	[mutateDeleteProfile, queryClient, searchParams, session?.user.id, setIsSearch, t],
	// )

	// Case deleteMany
	// const handleOnClickDeleteUser = useCallback(async () => {
	// 	try {
	// 		const requestMap: DeleteProfileDtoIn[] = selected
	// 			.filter((n) => n !== session?.user.id)
	// 			.map((n) => {
	// 				return {
	// 					id: n,
	// 				}
	// 			})

	// 		const promises = requestMap.map((request) => mutateDeleteProfile(request))
	// 		Promise.all(promises)
	// 			.then((res) => {
	// 				queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
	// 				setIsSearch(true)
	// 				setAlertInfo({ open: true, severity: 'success', message: t('profileDeleteSuccess', { ns: 'um' }) })
	// 			})
	// 			.catch((error) => {
	// 				console.error(error)
	// 			})
	// 	} catch (error: any) {
	// 		setAlertInfo({
	// 			open: true,
	// 			severity: 'error',
	// 			message: error?.title ? error.title : t('error.somethingWrong'),
	// 		})
	// 	}
	// }, [mutateDeleteProfile, queryClient, searchParams, selected, session?.user.id, setIsSearch, t])

	// Case openMany
	// const handleOnClickOpenUser = useCallback(async () => {
	// 	try {
	// 		const requestMap: PatchStatusDtoIn[] = selected
	// 			.filter((n) => n !== session?.user.id)
	// 			.map((n) => {
	// 				return {
	// 					id: n,
	// 					flagStatus: 'A',
	// 				}
	// 			})
	// 		const promises = requestMap.map((request) => mutatePatchStatus(request))
	// 		Promise.all(promises)
	// 			.then((res) => {
	// 				queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
	// 				setIsSearch(true)
	// 				setAlertInfo({ open: true, severity: 'success', message: t('profileUpdate', { ns: 'um' }) })
	// 			})
	// 			.catch((error) => {
	// 				console.error(error)
	// 			})
	// 	} catch (error: any) {
	// 		console.error(error)
	// 		setAlertInfo({
	// 			open: true,
	// 			severity: 'error',
	// 			message: error?.title ? error.title : t('error.somethingWrong'),
	// 		})
	// 	}
	// }, [mutatePatchStatus, queryClient, searchParams, selected, session?.user.id, setIsSearch, t])

	// Case closeMany
	// const handleOnClickCloseUser = useCallback(async () => {
	// 	try {
	// 		const requestMap: PatchStatusDtoIn[] = selected
	// 			.filter((n) => n !== session?.user.id)
	// 			.map((n) => {
	// 				return {
	// 					id: n,
	// 					flagStatus: 'C',
	// 				}
	// 			})
	// 		const promises = requestMap.map((request) => mutatePatchStatus(request))
	// 		Promise.all(promises)
	// 			.then((res) => {
	// 				queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
	// 				setIsSearch(true)
	// 				setAlertInfo({ open: true, severity: 'success', message: t('profileUpdate', { ns: 'um' }) })
	// 			})
	// 			.catch((error) => {
	// 				console.error('promise err :: ', error)
	// 				setAlertInfo({
	// 					open: true,
	// 					severity: 'error',
	// 					message: error?.title ? error.title : t('error.somethingWrong'),
	// 				})
	// 			})
	// 	} catch (error: any) {
	// 		console.error('error :: ', error)
	// 		setAlertInfo({
	// 			open: true,
	// 			severity: 'error',
	// 			message: error?.title ? error.title : t('error.somethingWrong'),
	// 		})
	// 	}
	// }, [mutatePatchStatus, queryClient, searchParams, selected, session?.user.id, setIsSearch, t])

	const handlePagination = useCallback(
		(event: React.ChangeEvent<unknown>, value: number) => {
			setSearchParams((prevSearch) => ({
				...prevSearch,
				page: value,
			}))
		},
		[setSearchParams],
	)

	const isSelected = useCallback(
		(id: string) => {
			return selected.indexOf(id) !== -1
		},
		[selected],
	)

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = useMemo(() => {
		return searchParams.page > Math.ceil(total / 10) - 1
			? Math.max(0, (1 + searchParams.page) * 2 - tableData.length)
			: 0
	}, [searchParams, tableData, total])

	return (
		<Box className={classNames('', className)}>
			<div
				className={classNames('py-4', {
					'pb-[8px] pt-[12px]': !isDesktop,
				})}
			>
				<Paper className='relative flex flex-col gap-[8px] px-[24px] py-[16px] max-lg:h-[calc(100vh-280px)] max-lg:overflow-y-auto'>
					<Box className='flex flex-col gap-[16px] lg:h-[calc(100vh-315px)]'>
						{/* Table container */}
						<TableContainer
							className='flex flex-col overflow-y-auto'
							sx={{ minHeight: '90%', flex: 1 }}
							component={'div'}
						>
							{selected.length > 0 && (
								<Box
									className={classNames(
										'sticky left-0 top-0 z-[100] inline-flex gap-[8px] !bg-[#F2F2F2]',
										{
											'flex h-[48px] w-auto rounded-[2px] rounded-lg p-2': isDesktop,
											'flex h-[100px] w-auto flex-col rounded-[2px] rounded-lg p-2': !isDesktop,
										},
									)}
								>
									<Typography className='m-4 flex items-center font-medium'>
										{t('selecting', { ns: 'um' })}{' '}
										<span className='inline-block font-bold text-primary'>
											&nbsp;{selected.length}&nbsp;
										</span>{' '}
										{t('names', { ns: 'um' })}
									</Typography>
									<Stack direction='row' spacing={1} className='flex items-center'>
										<Button
											className='flex !h-[30px] shrink-0 gap-[8px] !border-gray !bg-white py-[8px] pl-[12px] pr-[16px] text-sm font-medium !text-[#202020] [&_.MuiButton-startIcon]:m-0'
											variant='outlined'
											color='primary'
											startIcon={
												<Icon path={mdiAccountOutline} size={1} color='var(--black-color)' />
											}
											onClick={() => {
												setIsConfirmOpenManyOpen(true)
											}}
										>
											{isDesktop && t('enableUser', { ns: 'um' })}
										</Button>
										<Button
											className='flex !h-[30px] shrink-0 gap-[8px] !border-gray !bg-white py-[8px] pl-[12px] pr-[16px] text-sm font-medium !text-[#202020] [&_.MuiButton-startIcon]:m-0'
											variant='outlined'
											color='primary'
											startIcon={
												<Icon path={mdiAccountOffOutline} size={1} color='var(--black-color)' />
											}
											onClick={() => {
												setIsConfirmCloseManyOpen(true)
											}}
										>
											{isDesktop && t('disableUser', { ns: 'um' })}
										</Button>
										<Button
											className='flex !h-[30px] shrink-0 gap-[8px] !border-gray !bg-white py-[8px] pl-[12px] pr-[16px] text-sm font-medium !text-error [&_.MuiButton-startIcon]:m-0'
											variant='outlined'
											color='primary'
											startIcon={
												<Icon path={mdiTrashCanOutline} size={1} color='var(--error-color-1)' />
											}
											onClick={() => {
												setIsConfirmDeleteManyOpen(true)
											}}
										>
											{isDesktop && t('deleteUser', { ns: 'um' })}
										</Button>
									</Stack>
								</Box>
							)}
							{total === 0 ? (
								<Box className='flex grow flex-col items-center justify-center'>
									<Box className='flex flex-col items-center'>
										<Icon path={mdiFolderOffOutline} size={6} color='var(--light-gray-color)' />
										<Typography variant='body1' className='!font-semibold text-gray'>
											{t('noData', { ns: 'um' })}
										</Typography>
									</Box>
								</Box>
							) : (
								<Table
									aria-labelledby='tableTitle'
									stickyHeader
									aria-label='sticky table'
									sx={{
										// tableLayout: 'auto',
										width: '100%',
										height: '90%',
										position: 'relative',
									}}
								>
									<TableHead>
										<TableRow
											// sx={{
											// 	position: 'sticky',
											// 	top: selected.length > 0 ? (isDesktop ? '46px' : '78px') : 0,
											// 	zIndex: 9998,
											// }}
											className={classNames('sticky z-[100]', {
												'top-[46px]': selected.length > 0 && isDesktop,
												'top-[78px]': selected.length > 0 && !isDesktop,
											})}
											//change this value according to height of selection control box
										>
											<TableCell padding='checkbox'>
												<Checkbox
													color='primary'
													indeterminate={
														selected.length > 0 && selected.length < tableData.length - 1
													}
													checked={
														total === 0
															? false
															: selected.length ===
																tableData.filter(
																	(n) =>
																		n.users_user_id !== session?.user.id &&
																		n.role_role_name !==
																			(session?.user.role as any),
																).length
													}
													disabled={total === 0}
													onChange={handleSelectAllClick}
													inputProps={{
														'aria-label': 'select all desserts',
													}}
												/>
											</TableCell>
											{headCells.map((headCell) => (
												<TableCell
													key={headCell.id}
													// align={headCell.id === "status" ? 'center':'left'}
													align={'left'}
													padding={headCell.disablePadding ? 'none' : 'normal'}
													sortDirection={
														orderBy === headCell.id ? (order.toLowerCase() as any) : false
													}
													className={`text-sm font-semibold`}
													sx={{
														minWidth: headCell.minWidth,
													}}
												>
													<TableSortLabel
														active={orderBy === headCell.id}
														direction={
															orderBy === headCell.id
																? (order.toLowerCase() as any)
																: 'asc'
														}
														onClick={createSortHandler(headCell.id)}
													>
														{headCell.label}
														{orderBy === headCell.id ? (
															<Box component='span' sx={visuallyHidden}>
																{order === SortType.DESC
																	? 'sorted descending'
																	: 'sorted ascending'}
															</Box>
														) : null}
													</TableSortLabel>
												</TableCell>
											))}
											<TableCell />
										</TableRow>
									</TableHead>
									<TableBody className='overflow-y max-h-[40px] min-h-[40px] [&_.MuiTableCell-root]:!font-medium'>
										{tableData.map((row, index) => {
											const isItemSelected = isSelected(row.users_user_id)
											const labelId = `enhanced-table-checkbox-${index}`
											return (
												<TableRow
													hover
													onClick={(event) =>
														handleClick(
															event,
															row.users_user_id,
															row.role_role_name?.toLowerCase() as UserRole,
														)
													}
													role='checkbox'
													aria-checked={isItemSelected}
													tabIndex={-1}
													key={row.users_user_id}
													selected={isItemSelected}
													sx={{ cursor: 'pointer', height: '78px' }}
												>
													<TableCell padding='checkbox'>
														<Checkbox
															color='primary'
															checked={isItemSelected}
															inputProps={{
																'aria-labelledby': labelId,
															}}
															disabled={
																session?.user.id === row.users_user_id ||
																session?.user.role === (row.role_role_name as any)
															}
														/>
													</TableCell>
													<TableCell component='th' id={labelId} scope='row' padding='none'>
														<Box className='flex items-center'>
															{
																<Avatar
																	className='mr-[4px] h-[24px] w-[24px] bg-primary'
																	// src={row.image}
																/>
															}{' '}
															{row.fullname}
														</Box>
													</TableCell>
													<TableCell>{row.users_email}</TableCell>
													<TableCell>{row.region_region_name}</TableCell>
													<TableCell>{row.position_position_name}</TableCell>
													<TableCell>{row.users_phone}</TableCell>
													<TableCell>{row.users_email}</TableCell>
													<TableCell>
														{
															<div
																className={classNames(
																	'flex h-[25px] w-[72px] items-center justify-center rounded',
																	{
																		'!bg-green-light1': row.users_is_active,
																	},
																)}
															>
																<Typography
																	className={`p-0.5 ${row.users_is_active ? 'text-green-dark' : 'text-error'} !text-xs !font-medium`}
																>
																	{row.users_is_active ? 'Active' : 'Inactive'}
																</Typography>
															</div>
														}
													</TableCell>
													<TableCell>
														<Box>
															<Stack direction='row' spacing={1}>
																<IconButton
																	onClick={(e) => {
																		e.stopPropagation()
																		router.push(
																			`${AppPath.UserManagementForm}?userId=${row.users_user_id}`,
																		)
																	}}
																	disabled={
																		session?.user.role ===
																			(row.role_role_name as any) &&
																		session?.user.id !== row.users_user_id
																	}
																>
																	<Icon
																		path={mdiPencilOutline}
																		size={1}
																		color={
																			session?.user.role ===
																				(row.role_role_name as any) &&
																			session?.user.id !== row.users_user_id
																				? '#c2c5cc'
																				: 'var(--black-color)'
																		}
																	/>
																</IconButton>
																<IconButton
																	onClick={(e) => {
																		// stop event propagation to prevent row select
																		e.stopPropagation()
																		setCurrentDeleteId(row.users_user_id)
																		setIsConfirmDeleteOneOpen(true)
																	}}
																	disabled={
																		session?.user.id === row.users_user_id ||
																		session?.user.role ===
																			(row.role_role_name as any)
																	}
																>
																	<Icon
																		path={mdiTrashCanOutline}
																		size={1}
																		color={
																			session?.user.id === row.users_user_id ||
																			session?.user.role ===
																				(row.role_role_name as any)
																				? '#c2c5cc'
																				: 'var(--error-color-1)'
																		}
																	/>
																</IconButton>
															</Stack>
														</Box>
													</TableCell>
												</TableRow>
											)
										})}
										<TableRow
											className={classNames(`h-[${33 * emptyRows}px]`, {
												'h-[calc(100vh-404px)]': total === 0,
											})}
										>
											<TableCell
												className={classNames('!p-0', {
													'!border-0': emptyRows <= 0,
												})}
												colSpan={10}
											/>
										</TableRow>
									</TableBody>
								</Table>
							)}
						</TableContainer>
						{/* Pagination box */}
						<Box className={'flex w-full items-center justify-between'}>
							<Typography className='text-base font-normal'>
								{total !== 0 && (
									<>
										{t('page', { ns: 'um' })} {searchParams.page} {t('of', { ns: 'um' })}{' '}
										{Math.ceil(total / 10)}
									</>
								)}
							</Typography>
							{total !== 0 && (
								<>
									{/* w around 166px */}
									<Pagination
										className={
											isDesktop
												? 'um-table-pagination [&_ul]:divide-x [&_ul]:divide-y-0 [&_ul]:divide-solid [&_ul]:divide-gray [&_ul]:rounded [&_ul]:border [&_ul]:border-solid [&_ul]:border-gray'
												: 'mobile-um-table-pagination [&_ul]:divide-x [&_ul]:divide-y-0 [&_ul]:divide-solid [&_ul]:divide-gray [&_ul]:rounded [&_ul]:border [&_ul]:border-solid [&_ul]:border-gray'
										}
										count={Math.ceil(total / 10)}
										variant='outlined'
										shape='rounded'
										siblingCount={isDesktop ? 1 : 0}
										boundaryCount={isDesktop ? 1 : 0}
										onChange={handlePagination}
										page={searchParams.page}
										sx={{
											gap: 0,
										}}
										renderItem={(item) => (
											<PaginationItem
												slots={{
													previous: () => (
														<>
															<ArrowBack
															// className='h-[20px] w-[20px]'
															/>
															{isDesktop && t('previous')}
														</>
													),
													next: () => (
														<>
															{isDesktop && t('next')}
															<ArrowForward
															//  className='h-[20px] w-[20px]'
															/>
														</>
													),
												}}
												{...item}
											/>
										)}
									/>
								</>
							)}
						</Box>
					</Box>
					{/* OverlayLoading */}
					<Box
						sx={{
							position: 'absolute',
							top: 0,
							left: 0,
							width: '100%',
							height: '100%',
							display: searchDataLoading ? 'flex' : 'none',
							alignItems: 'center',
							justifyContent: 'center',
							backgroundColor: 'rgba(255, 255, 255, 0.7)',
							zIndex: 10,
							borderRadius: '8px',
						}}
					>
						<CircularProgress />
					</Box>
				</Paper>
			</div>
		</Box>
	)
}

export default UserManagementTable
