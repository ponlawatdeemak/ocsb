'use client'

import * as React from 'react'
import {
	Box,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	TableSortLabel,
	Typography,
	Paper,
	Checkbox,
	Avatar,
	Button,
	IconButton,
	Stack,
	Pagination,
	Snackbar,
	Alert,
	PaginationItem,
	CircularProgress,
} from '@mui/material'
import { visuallyHidden } from '@mui/utils'
import { SortType, UserDialogMode, UserRole } from '@/enum'
import um from '@/api/um'
import { DeleteProfileDtoIn, GetSearchUMDtoIn, PatchStatusDtoIn } from '@/api/um/dto-in.dto'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useTranslation } from 'next-i18next'
// import { useSwitchLanguage } from '@/i18n/client'
// import { Language } from '@/enum'
import { GetSearchUMDtoOut } from '@/api/um/dto-out.dto'
import { ResponseLanguage } from '@/api/interface'
import { mdiTrashCanOutline, mdiPencilOutline } from '@mdi/js'
import Icon from '@mdi/react'
import { useSession } from 'next-auth/react'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import useResponsive from '@/hook/responsive'
import classNames from 'classnames'
import { mdiAccount } from '@mdi/js'
import { mdiAccountOutline } from '@mdi/js'

import { mdiAccountOff } from '@mdi/js'
import { mdiAccountOffOutline } from '@mdi/js'
import { FormMain } from '../Form'
import { mdiFolderOffOutline } from '@mdi/js' // no data bottom
import clsx from 'clsx'
import AlertDialog from '@/components/common/dialog/AlertDialog'
import { AlertInfoType } from '@/components/common/snackbar/AlertSnackbar'

interface Data {
	id: string
	firstName: string
	email: string
	orgCode: string
	responsibleProvinceName: string
	responsibleDistrictName: string
	role: string
	status: string
	control: string
}

interface HeadCell {
	disablePadding: boolean
	id: string
	label: string
	numeric: boolean
	minWidth: string
	maxWidth: string
}

interface UserManagementTableProps {
	searchParams: GetSearchUMDtoIn
	setSearchParams: React.Dispatch<React.SetStateAction<GetSearchUMDtoIn>>
	isSearch: boolean
	setIsSearch: React.Dispatch<React.SetStateAction<boolean>>
	page: number
	setPage: React.Dispatch<React.SetStateAction<number>>
}

const UserManagementTable: React.FC<UserManagementTableProps> = ({
	searchParams,
	setSearchParams,
	isSearch,
	setIsSearch,
	page,
	setPage,
}) => {
	const { data: session } = useSession()
	const [order, setOrder] = React.useState<SortType>(SortType.ASC)
	const [orderBy, setOrderBy] = React.useState<string>('firstName')
	const [selected, setSelected] = React.useState<readonly string[]>([])
	const [dense, setDense] = React.useState(false)
	const queryClient = useQueryClient()

	const { t, i18n } = useTranslation(['common', 'um'])
	// const { i18n: i18nWithCookie } = useSwitchLanguage(i18n.language as Language, 'appbar')
	const { isDesktop } = useResponsive()

	// Define TableHead
	const headCells: readonly HeadCell[] = [
		{
			id: 'firstName',
			numeric: false,
			disablePadding: true,
			label: t('nameSurname'),
			maxWidth: '',
			minWidth: '292px',
		},
		{
			id: 'email',
			numeric: false,
			disablePadding: false,
			label: t('email'),
			maxWidth: '220px',
			minWidth: '220px',
		},
		{
			id: 'orgCode',
			numeric: false,
			disablePadding: false,
			label: t('org'),
			maxWidth: '120px',
			minWidth: '120px',
		},
		{
			id: 'role',
			numeric: false,
			disablePadding: false,
			label: t('role'),
			maxWidth: '120px',
			minWidth: '140px',
		},
		{
			id: 'respProvince',
			numeric: false,
			disablePadding: false,
			label: t('belongProvince', { ns: 'um' }),
			maxWidth: '120px',
			minWidth: '160px',
		},
		{
			id: 'respDistrict',
			numeric: false,
			disablePadding: false,
			label: t('belongDistrict', { ns: 'um' }),
			maxWidth: '120px',
			minWidth: '160px',
		},
		{
			id: 'status',
			numeric: false,
			disablePadding: false,
			label: t('status'),
			maxWidth: '176px',
			minWidth: '100px',
		},
	]

	// TableData State
	const [tableData, setTableData] = React.useState<GetSearchUMDtoOut[]>([])
	const [total, setTotal] = React.useState<number>(0)
	const [currentDeleteId, setCurrentDeleteId] = React.useState<string>('')
	const [currentEditId, setCurrentEditId] = React.useState<string>('')
	const [alertInfo, setAlertInfo] = React.useState<AlertInfoType>({
		open: false,
		severity: 'success',
		message: '',
	})
	const [isEditOpen, setIsEditOpen] = React.useState<boolean>(false)
	const [isConfirmDeleteOneOpen, setIsConfirmDeleteOneOpen] = React.useState<boolean>(false)
	const [isConfirmDeleteManyOpen, setIsConfirmDeleteManyOpen] = React.useState<boolean>(false)
	const [isConfirmOpenManyOpen, setIsConfirmOpenManyOpen] = React.useState<boolean>(false)
	const [isConfirmCloseManyOpen, setIsConfirmCloseManyOpen] = React.useState<boolean>(false)

	// ModalAction

	// const { data: resData, isLoading: isTableDataLoading } = useQuery({
	// 	queryKey: ['umSearch'],
	// 	queryFn: async () => {
	// 		const res = await um.umSearch(searchParams)
	// 		setIsSearch(false)
	// 		return res
	// 	},
	// 	enabled: isSearch && searchParams && JSON.stringify(searchParams).length !== 0,
	// })

	const {
		data: patchStatusData,
		error: patchStatusError,
		mutateAsync: mutatePatchStatus,
	} = useMutation({
		mutationFn: async (payload: PatchStatusDtoIn) => {
			return await um.patchStatus(payload)
		},
	})

	const {
		data: deleteProfileData,
		error: deleteProfileError,
		mutateAsync: mutateDeleteProfile,
	} = useMutation({
		mutationFn: async (payload: DeleteProfileDtoIn) => {
			return await um.deleteProfile(payload)
		},
	})

	React.useEffect(() => {
		setIsSearch(true)
	}, [setIsSearch])

	React.useEffect(() => {
		const mockGetSearchUMDtoOuts: GetSearchUMDtoOut[] = [
			{
				id: '123456',
				username: 'johndoe',
				firstName: 'John',
				lastName: 'Doe',
				email: 'johndoe@example.com',
				image: 'https://example.com/image.jpg',
				orgCode: 'ORG001',
				role: 'admin',
				responsibleProvinceCode: 'PROV001',
				responsibleDistrictCode: 'DIST001',
				orgName: {
					en: 'Global Organization',
					th: 'องค์กรระดับโลก',
				},
				roleName: {
					en: 'Administrator',
					th: 'ผู้ดูแลระบบ',
				},
				responsibleProvinceName: {
					en: 'Province One',
					th: 'จังหวัดหนึ่ง',
				},
				responsibleDistrictName: {
					en: 'District One',
					th: 'เขตหนึ่ง',
				},
				flagStatusName: {
					en: 'Active',
					th: 'ใช้งาน',
				},
				flagStatus: 'active',
			},
			{
				id: '789101',
				username: 'janedoe',
				firstName: 'Jane',
				lastName: 'Doe',
				email: 'janedoe@example.com',
				image: 'https://example.com/image2.jpg',
				orgCode: 'ORG002',
				role: 'user',
				responsibleProvinceCode: 'PROV002',
				responsibleDistrictCode: 'DIST002',
				orgName: {
					en: 'Tech Corp',
					th: 'เทคคอร์ป',
				},
				roleName: {
					en: 'User',
					th: 'ผู้ใช้งาน',
				},
				responsibleProvinceName: {
					en: 'Province Two',
					th: 'จังหวัดสอง',
				},
				responsibleDistrictName: {
					en: 'District Two',
					th: 'เขตสอง',
				},
				flagStatusName: {
					en: 'Inactive',
					th: 'ไม่ใช้งาน',
				},
				flagStatus: 'inactive',
			},
			{
				id: '112233',
				username: 'samsmith',
				firstName: 'Sam',
				lastName: 'Smith',
				email: 'samsmith@example.com',
				image: 'https://example.com/image3.jpg',
				orgCode: 'ORG003',
				role: 'manager',
				responsibleProvinceCode: 'PROV003',
				responsibleDistrictCode: 'DIST003',
				orgName: {
					en: 'Regional Office',
					th: 'สำนักงานภูมิภาค',
				},
				roleName: {
					en: 'Manager',
					th: 'ผู้จัดการ',
				},
				responsibleProvinceName: {
					en: 'Province Three',
					th: 'จังหวัดสาม',
				},
				responsibleDistrictName: {
					en: 'District Three',
					th: 'เขตสาม',
				},
				flagStatusName: {
					en: 'Pending',
					th: 'รอดำเนินการ',
				},
				flagStatus: 'pending',
			},
			{
				id: '445566',
				username: 'alicejohnson',
				firstName: 'Alice',
				lastName: 'Johnson',
				email: 'alicejohnson@example.com',
				image: 'https://example.com/image4.jpg',
				orgCode: 'ORG004',
				role: 'guest',
				responsibleProvinceCode: 'PROV004',
				responsibleDistrictCode: 'DIST004',
				orgName: {
					en: 'Guest Services',
					th: 'บริการแขก',
				},
				roleName: {
					en: 'Guest',
					th: 'แขก',
				},
				responsibleProvinceName: {
					en: 'Province Four',
					th: 'จังหวัดสี่',
				},
				responsibleDistrictName: {
					en: 'District Four',
					th: 'เขตสี่',
				},
				flagStatusName: {
					en: 'Blocked',
					th: 'ถูกบล็อก',
				},
				flagStatus: 'blocked',
			},
		]

		if (mockGetSearchUMDtoOuts) {
			setTableData(mockGetSearchUMDtoOuts || [])
			setTotal(mockGetSearchUMDtoOuts.length || 0)
		}
	}, [])

	React.useEffect(() => {
		setSelected([])
	}, [isSearch])

	const handleRequestSort = React.useCallback(
		(event: React.MouseEvent<unknown>, property: string) => {
			const isAsc = orderBy === property && order === SortType.ASC
			setSearchParams((prevSearch) => ({
				...prevSearch,
				sortField: property,
				sortOrder: isAsc ? SortType.DESC : SortType.ASC,
				respLang: i18n.language,
			}))
			setIsSearch(true)
			setOrder(isAsc ? SortType.DESC : SortType.ASC)
			setOrderBy(property)
		},
		[order, orderBy, setIsSearch, setSearchParams],
	)

	const handleSelectAllClick = React.useCallback(
		(event: React.ChangeEvent<HTMLInputElement>) => {
			if (event.target.checked) {
				const newSelected = tableData
					.filter((n) => {
						return n.id !== session?.user.id && n.role !== session?.user.role
					})
					.map((n) => n.id)
				setSelected(newSelected)
			} else {
				setSelected([])
			}
		},
		[session?.user.id, tableData],
	)

	const createSortHandler = React.useCallback(
		(property: string) => (event: React.MouseEvent<unknown>) => {
			handleRequestSort(event, property)
		},
		[handleRequestSort],
	)

	const handleClick = React.useCallback(
		(event: React.MouseEvent<unknown>, id: string, role: UserRole) => {
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
		[selected, session?.user.id],
	)

	// Case deleteOne
	const handleOnClickConfirmDelete = React.useCallback(
		async (id: string) => {
			try {
				// filter out current session userid
				if (id === session?.user.id) {
					return
				}
				const payload: DeleteProfileDtoIn = { id: id }
				const res = await mutateDeleteProfile(payload)
				queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
				setIsSearch(true)
				setAlertInfo({ open: true, severity: 'success', message: t('profileDeleteSuccess', { ns: 'um' }) })
			} catch (error: any) {
				console.error(error)
				setAlertInfo({
					open: true,
					severity: 'error',
					message: error?.title ? error.title : t('error.somethingWrong'),
				})
			}
		},
		[mutateDeleteProfile, queryClient, searchParams, session?.user.id, setIsSearch, t],
	)

	// Case deleteMany
	const handleOnClickDeleteUser = React.useCallback(async () => {
		try {
			const requestMap: DeleteProfileDtoIn[] = selected
				.filter((n) => n !== session?.user.id)
				.map((n) => {
					return {
						id: n,
					}
				})

			const promises = requestMap.map((request) => mutateDeleteProfile(request))
			Promise.all(promises)
				.then((res) => {
					queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
					setIsSearch(true)
					setAlertInfo({ open: true, severity: 'success', message: t('profileDeleteSuccess', { ns: 'um' }) })
				})
				.catch((error) => {
					console.error(error)
				})
		} catch (error: any) {
			setAlertInfo({
				open: true,
				severity: 'error',
				message: error?.title ? error.title : t('error.somethingWrong'),
			})
		}
	}, [mutateDeleteProfile, queryClient, searchParams, selected, session?.user.id, setIsSearch, t])

	// Case openMany
	const handleOnClickOpenUser = React.useCallback(async () => {
		try {
			const requestMap: PatchStatusDtoIn[] = selected
				.filter((n) => n !== session?.user.id)
				.map((n) => {
					return {
						id: n,
						flagStatus: 'A',
					}
				})
			const promises = requestMap.map((request) => mutatePatchStatus(request))
			Promise.all(promises)
				.then((res) => {
					queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
					setIsSearch(true)
					setAlertInfo({ open: true, severity: 'success', message: t('profileUpdate', { ns: 'um' }) })
				})
				.catch((error) => {
					console.error(error)
				})
		} catch (error: any) {
			console.error(error)
			setAlertInfo({
				open: true,
				severity: 'error',
				message: error?.title ? error.title : t('error.somethingWrong'),
			})
		}
	}, [mutatePatchStatus, queryClient, searchParams, selected, session?.user.id, setIsSearch, t])

	// Case closeMany
	const handleOnClickCloseUser = React.useCallback(async () => {
		try {
			const requestMap: PatchStatusDtoIn[] = selected
				.filter((n) => n !== session?.user.id)
				.map((n) => {
					return {
						id: n,
						flagStatus: 'C',
					}
				})
			const promises = requestMap.map((request) => mutatePatchStatus(request))
			Promise.all(promises)
				.then((res) => {
					queryClient.invalidateQueries({ queryKey: ['getSearchUM', searchParams] })
					setIsSearch(true)
					setAlertInfo({ open: true, severity: 'success', message: t('profileUpdate', { ns: 'um' }) })
				})
				.catch((error) => {
					console.error('promise err :: ', error)
					setAlertInfo({
						open: true,
						severity: 'error',
						message: error?.title ? error.title : t('error.somethingWrong'),
					})
				})
		} catch (error: any) {
			console.error('error :: ', error)
			setAlertInfo({
				open: true,
				severity: 'error',
				message: error?.title ? error.title : t('error.somethingWrong'),
			})
		}
	}, [mutatePatchStatus, queryClient, searchParams, selected, session?.user.id, setIsSearch, t])

	const handlePagination = React.useCallback(
		(event: React.ChangeEvent<unknown>, value: number) => {
			if (value === page + 1 || value === page - 1) {
				setSearchParams((prevSearch) => ({
					...prevSearch,
					offset: page < value ? prevSearch.offset + 10 : prevSearch.offset - 10,
					respLang: i18n.language,
				}))
			} else {
				setSearchParams((prevSearch) => ({
					...prevSearch,
					offset: (value - 1) * 10,
					respLang: i18n.language,
				}))
			}
			setIsSearch(true)
			setPage(value)
		},
		[setSearchParams, setIsSearch, setPage, page],
	)

	const isSelected = (id: string) => selected.indexOf(id) !== -1

	// Avoid a layout jump when reaching the last page with empty rows.
	const emptyRows = page > Math.ceil(total / 10) - 1 ? Math.max(0, (1 + page) * 2 - tableData.length) : 0

	return (
		<div
			className={classNames('py-[16px]', {
				'pb-[8px] pt-[12px]': !isDesktop,
			})}
		>
			<Paper className='relative flex flex-col gap-[8px] px-[24px] py-[16px] max-lg:h-[calc(100vh-280px)] max-lg:overflow-y-auto'>
				{/* <div className='flex items-baseline gap-[12px]'>
					<Typography variant='body1' className='!font-semibold'>
						{t('userList', { ns: 'um' })}
					</Typography>
					<Typography variant='body2' className='!font-medium !text-[#7A7A7A]'>
						{total !== 0 && (
							<>
								{t('showing', { ns: 'um' })} {(page - 1) * 10 + 1}-{Math.min(page * 10, total)}{' '}
								{t('of', { ns: 'um' })} {total} {t('item', { ns: 'um' })}
							</>
						)}
					</Typography>
				</div> */}

				<Box className='flex flex-col gap-[16px] lg:h-[calc(100vh-315px)]'>
					{/* Table container */}
					<TableContainer
						className='flex flex-col overflow-y-auto'
						sx={{ minHeight: '90%', flex: 1 }}
						component={'div'}
					>
						{selected.length > 0 && (
							<Box
								// sx={{ display: 'inline-flex', backgroundColor: '#F8FAFD', position: 'sticky', left: 0 }}
								// className={
								// 	isDesktop
								// 		? 'flex h-[48px] w-auto rounded-[2px] rounded-lg p-2'
								// 		: 'flex h-[100px] w-auto flex-col rounded-[2px] rounded-lg p-2'
								// }
								className={clsx('sticky left-0 top-0 z-[100] inline-flex gap-[8px] !bg-[#F2F2F2]', {
									'flex h-[48px] w-auto rounded-[2px] rounded-lg p-2': isDesktop,
									'flex h-[100px] w-auto flex-col rounded-[2px] rounded-lg p-2': !isDesktop,
								})}
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
								size={dense ? 'small' : 'medium'}
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
										className={clsx('sticky z-[100]', {
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
																	n.id !== session?.user.id &&
																	n.role !== session?.user.role,
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
												sortDirection={orderBy === headCell.id ? order : false}
												className={`text-sm font-semibold`}
												sx={{
													minWidth: headCell.minWidth,
												}}
											>
												<TableSortLabel
													active={orderBy === headCell.id}
													direction={orderBy === headCell.id ? order : SortType.ASC}
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
										const isItemSelected = isSelected(row.id)
										const labelId = `enhanced-table-checkbox-${index}`
										return (
											<TableRow
												hover
												onClick={(event) => handleClick(event, row.id, row.role as UserRole)}
												role='checkbox'
												aria-checked={isItemSelected}
												tabIndex={-1}
												key={row.id}
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
															session?.user.id === row.id ||
															session?.user.role === row.role
														}
													/>
												</TableCell>
												<TableCell component='th' id={labelId} scope='row' padding='none'>
													<Box className='flex items-center'>
														{
															<Avatar
																className='mr-[4px] h-[24px] w-[24px] bg-primary'
																src={row.image}
															/>
														}{' '}
														{row.firstName} {row.lastName}
													</Box>
												</TableCell>
												<TableCell>{row.email}</TableCell>
												<TableCell>
													{row.orgName[i18n.language as keyof ResponseLanguage]}
												</TableCell>
												<TableCell>
													{row.roleName[i18n.language as keyof ResponseLanguage]}
												</TableCell>
												<TableCell>
													{
														row.responsibleProvinceName[
															i18n.language as keyof ResponseLanguage
														]
													}
												</TableCell>
												<TableCell>
													{
														row.responsibleDistrictName[
															i18n.language as keyof ResponseLanguage
														]
													}
												</TableCell>
												<TableCell>
													{
														<div
															className={`flex items-center justify-center rounded ${row.flagStatus === 'A' ? '!bg-green-light1' : '!bg-green-light1'} h-[25px] w-[72px]`}
														>
															<Typography
																className={`p-0.5 ${row.flagStatus === 'A' ? 'text-green-dark' : 'text-error'} !text-xs !font-medium`}
															>
																{
																	row.flagStatusName[
																		i18n.language as keyof ResponseLanguage
																	]
																}
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
																	setCurrentEditId(row.id)
																	setIsEditOpen(true)
																}}
																disabled={
																	session?.user.role === row.role &&
																	session?.user.id !== row.id
																}
															>
																<Icon
																	path={mdiPencilOutline}
																	size={1}
																	color={
																		session?.user.role === row.role &&
																		session?.user.id !== row.id
																			? '#c2c5cc'
																			: 'var(--black-color)'
																	}
																/>
															</IconButton>
															<IconButton
																onClick={(e) => {
																	// stop event propagation to prevent row select
																	e.stopPropagation()
																	setCurrentDeleteId(row.id)
																	setIsConfirmDeleteOneOpen(true)
																}}
																disabled={
																	session?.user.id === row.id ||
																	session?.user.role === row.role
																}
															>
																<Icon
																	path={mdiTrashCanOutline}
																	size={1}
																	color={
																		session?.user.id === row.id ||
																		session?.user.role === row.role
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
									{/* {emptyRows > 0 && ( */}
									<TableRow
										// style={{
										// 	// height: (dense ? 33 : 53) * emptyRows,
										// 	height: total === 0 ? '100%' : 168 * emptyRows, //total height is around 396px at dev screen height when total === 0
										// }}
										className={clsx(`h-[${33 * emptyRows}px]`, {
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
									{/* )} */}
								</TableBody>
							</Table>
						)}
					</TableContainer>
					{/* Pagination box */}
					<Box className={'flex w-full items-center justify-between'}>
						<Typography className='text-base font-normal'>
							{total !== 0 && (
								<>
									{t('page', { ns: 'um' })} {page} {t('of', { ns: 'um' })} {Math.ceil(total / 10)}
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
									page={page}
									sx={{
										gap: 0,
									}}
									renderItem={(item) => (
										<PaginationItem
											slots={{
												previous: () => (
													<>
														<ArrowBackIcon
														// className='h-[20px] w-[20px]'
														/>
														{isDesktop && t('previous')}
													</>
												),
												next: () => (
													<>
														{isDesktop && t('next')}
														<ArrowForwardIcon
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
						display: tableData.length === 0 ? 'flex' : 'none',
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
			{/* <AlertConfirm/> x 4 forEach function */}
			{/* Alert Confirm DeleteOne */}
			<AlertDialog
				open={isConfirmDeleteOneOpen}
				title={t('alert.deleteUserProfile', { ns: 'um' })}
				content={t('alert.confirmDeleteUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmDeleteOneOpen(false)
				}}
				onConfirm={() => {
					handleOnClickConfirmDelete(currentDeleteId)
					setIsConfirmDeleteOneOpen(false)
				}}
			/>
			{/* Alert Confirm Delete Many */}
			<AlertDialog
				open={isConfirmDeleteManyOpen}
				title={t('alert.deleteUserProfile', { ns: 'um' })}
				content={t('alert.confirmDeleteUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmDeleteManyOpen(false)
				}}
				onConfirm={() => {
					handleOnClickDeleteUser()
					setIsConfirmDeleteManyOpen(false)
				}}
			/>
			{/* Alert Confirm Open Many */}
			<AlertDialog
				open={isConfirmOpenManyOpen}
				title={t('alert.enableUserProfile', { ns: 'um' })}
				content={t('alert.confirmEnableUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmOpenManyOpen(false)
				}}
				onConfirm={() => {
					handleOnClickOpenUser()
					setIsConfirmOpenManyOpen(false)
				}}
			/>
			{/* Alert Confirm Close Many */}
			<AlertDialog
				open={isConfirmCloseManyOpen}
				title={t('alert.disableUserProfile', { ns: 'um' })}
				content={t('alert.confirmDisableUserProfile', { ns: 'um' })}
				onClose={() => {
					setIsConfirmCloseManyOpen(false)
				}}
				onConfirm={() => {
					handleOnClickCloseUser()
					setIsConfirmCloseManyOpen(false)
				}}
			/>
			<Snackbar
				anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
				open={alertInfo.open}
				autoHideDuration={6000}
				onClose={() => setAlertInfo({ ...alertInfo, open: false })}
				className='w-[300px]'
			>
				<Alert
					onClose={() => setAlertInfo({ ...alertInfo, open: false })}
					severity={alertInfo.severity}
					className='w-full'
				>
					{alertInfo.message}
				</Alert>
			</Snackbar>

			<FormMain
				open={isEditOpen}
				onClose={() => setIsEditOpen(false)}
				userId={currentEditId}
				isEdit={true}
				setOpen={setIsEditOpen}
				setIsSearch={setIsSearch}
				userDialogMode={UserDialogMode.UserEdit}
			/>
		</div>
	)
}

export default UserManagementTable
