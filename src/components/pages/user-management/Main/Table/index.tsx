'use client'

import { DeleteUMDtoIn, SearchUMDtoIn } from '@interface/dto/um/um.dto.in'
import {
	Avatar,
	Box,
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
import { mdiFolderOffOutline, mdiPencilOutline, mdiTrashCanOutline } from '@mdi/js'
import { SortType } from '@/enum'
import { visuallyHidden } from '@mui/utils'
import { useSession } from 'next-auth/react'
import { useTranslation } from 'next-i18next'
import useResponsive from '@/hook/responsive'
import AlertSnackbar, { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'
import { SearchUMDtoOut } from '@interface/dto/um/um.dto-out'
import { useRouter } from 'next/navigation'
import { AppPath } from '@/config/app.config'
import { QueryObserverResult, RefetchOptions, useMutation } from '@tanstack/react-query'
import service from '@/api'
import { getUserImage } from '@/utils/image'
import { ResponseDto } from '@/api/interface'
import AlertDialog from '@/components/common/dialog/AlertDialog'
import { UserRole } from '@interface/config/um.config'

interface HeadCell {
	disablePadding: boolean
	id: string
	label: string
	align: 'center' | 'left' | 'right' | 'justify' | 'inherit' | undefined
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
	selected: readonly string[]
	setSelected: Dispatch<SetStateAction<readonly string[]>>
	refetchSearchUM: (options?: RefetchOptions) => Promise<QueryObserverResult<ResponseDto<SearchUMDtoOut[]>, Error>>
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
	className = '',
	searchParams,
	setSearchParams,
	tableData,
	total,
	searchDataLoading,
	selected,
	setSelected,
	refetchSearchUM,
}) => {
	const router = useRouter()
	const { data: session } = useSession()
	const [order, setOrder] = useState<SortType>(SortType.ASC)
	const [orderBy, setOrderBy] = useState<string>('fullName')
	const [busy, setBusy] = useState<boolean>(false)

	const { t } = useTranslation(['common', 'um'])
	const { isDesktop } = useResponsive()

	// TableData State
	const [currentDeleteId, setCurrentDeleteId] = useState<string>('')
	const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState<boolean>(false)
	const [alertInfo, setAlertInfo] = useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})

	// Define TableHead
	const headCells: readonly HeadCell[] = [
		{
			id: 'fullName',
			numeric: false,
			disablePadding: true,
			label: 'ชื่อ-นามสุกล',
			align: 'left',
			maxWidth: '',
			minWidth: '292px',
		},
		{
			id: 'region',
			numeric: false,
			disablePadding: false,
			label: 'ภูมิภาค',
			align: 'left',
			maxWidth: '220px',
			minWidth: '220px',
		},
		{
			id: 'position',
			numeric: false,
			disablePadding: false,
			label: 'ตำแหน่งงาน',
			align: 'left',
			maxWidth: '150px',
			minWidth: '150px',
		},
		{
			id: 'phone',
			numeric: false,
			disablePadding: false,
			label: 'เบอร์โทร',
			align: 'left',
			maxWidth: '120px',
			minWidth: '140px',
		},
		{
			id: 'email',
			numeric: false,
			disablePadding: false,
			label: 'อีเมล์',
			align: 'left',
			maxWidth: '120px',
			minWidth: '160px',
		},
		{
			id: 'role',
			numeric: false,
			disablePadding: false,
			label: 'สิทธิ์การเข้าถึง',
			align: 'left',
			maxWidth: '120px',
			minWidth: '160px',
		},
		{
			id: 'isActive',
			numeric: false,
			disablePadding: false,
			label: 'การใช้งาน',
			align: 'center',
			maxWidth: '176px',
			minWidth: '150px',
		},
	]

	// ModalAction
	const {
		data: _deleteUMData,
		error: _deleteUMError,
		mutateAsync: mutateDeleteUM,
		isPending: isDeleteUMPending,
	} = useMutation({
		mutationFn: async (payload: DeleteUMDtoIn) => {
			return await service.um.deleteUM(payload)
		},
	})

	//Case deleteOne
	const handleDeleteUser = useCallback(
		async (id: string) => {
			try {
				setBusy(true)
				// filter out current session userid
				if (id === session?.user.id) {
					return
				}
				const payload: DeleteUMDtoIn = { userId: id }
				await mutateDeleteUM(payload)
				setAlertInfo({ open: true, severity: 'success', message: 'Deleted User Successfully!' })
			} catch (error: any) {
				console.error(error)
				setAlertInfo({
					open: true,
					severity: 'error',
					message: 'Deleted User Failed!',
				})
			} finally {
				setBusy(false)
				setCurrentDeleteId('')
				setIsConfirmDeleteDialogOpen(false)
				refetchSearchUM()
			}
		},
		[mutateDeleteUM, session, refetchSearchUM],
	)

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

	const createSortHandler = useCallback(
		(property: string) => (event: React.MouseEvent<unknown>) => {
			handleRequestSort(event, property)
		},
		[handleRequestSort],
	)

	const handleSelectAllClick = useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (event.target.checked) {
				const newSelected = tableData
					.filter((n) => {
						return n.users_user_id !== session?.user.id && n.role_role_id !== session?.user.role.roleId
					})
					.map((n) => n.users_user_id)
				setSelected(newSelected)
			} else {
				setSelected([])
			}
		},
		[session, tableData, setSelected],
	)

	const handleClick = useCallback(
		(event: React.MouseEvent<unknown>, id: string, role?: UserRole) => {
			const selectedIndex = selected.indexOf(id)

			let newSelected: readonly string[] = []
			if (id === session?.user.id || session?.user.role.roleId === role) {
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
		[selected, session, setSelected],
	)

	const handlePagination = useCallback(
		(event: React.ChangeEvent<unknown>, value: number) => {
			setSearchParams((prevSearch) => ({
				...prevSearch,
				page: value,
			}))
			setSelected([])
		},
		[setSearchParams, setSelected],
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
							{total === 0 && !searchDataLoading ? (
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
										<TableRow className='sticky z-[100]'>
											<TableCell padding='checkbox'>
												<Checkbox
													color='primary'
													indeterminate={
														selected.length > 0 && selected.length < tableData.length
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
													align={headCell.align}
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
															row.role_role_id as UserRole,
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
																session?.user.role.roleId === row.role_role_id
															}
														/>
													</TableCell>
													<TableCell component='th' id={labelId} scope='row' padding='none'>
														<Box className='flex items-center'>
															{
																<Avatar
																	className='mr-[4px] h-[24px] w-[24px] bg-primary'
																	src={getUserImage(row.users_user_id)}
																/>
															}{' '}
															{row.fullname}
														</Box>
													</TableCell>
													<TableCell>{row.region_region_name}</TableCell>
													<TableCell>{row.position_position_name}</TableCell>
													<TableCell>{row.users_phone}</TableCell>
													<TableCell>{row.users_email}</TableCell>
													<TableCell>{row.role_role_name}</TableCell>
													<TableCell align='center'>
														<Typography
															className={classNames(
																'p-0.5 !text-xs !font-medium text-[#A2A2A2]',
																{ '!text-success': row.users_is_active },
															)}
														>
															{row.users_is_active ? 'Active' : 'Inactive'}
														</Typography>
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
																		session?.user.role.roleId ===
																			row.role_role_id &&
																		session?.user.id !== row.users_user_id
																	}
																>
																	<Icon
																		path={mdiPencilOutline}
																		size={1}
																		color={
																			session?.user.role.roleId ===
																				row.role_role_id &&
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
																		setIsConfirmDeleteDialogOpen(true)
																	}}
																	disabled={
																		session?.user.id === row.users_user_id ||
																		session?.user.role.roleId === row.role_role_id
																	}
																>
																	<Icon
																		path={mdiTrashCanOutline}
																		size={1}
																		color={
																			session?.user.id === row.users_user_id ||
																			session?.user.role.roleId ===
																				row.role_role_id
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

			<AlertDialog
				open={isConfirmDeleteDialogOpen}
				title={'คุณต้องการลบรายการนี้หรือไม่'}
				content={'คุณต้องการลบรายการนี้หรือไม่'}
				onClose={() => {
					setCurrentDeleteId('')
					setIsConfirmDeleteDialogOpen(false)
				}}
				onConfirm={() => handleDeleteUser(currentDeleteId)}
				loading={busy || isDeleteUMPending}
				isDisableBackdropClick
			/>

			<AlertSnackbar alertInfo={alertInfo} onClose={() => setAlertInfo({ ...alertInfo, open: false })} />
		</Box>
	)
}

export default UserManagementTable
