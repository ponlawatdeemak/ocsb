'use client'

import { useState } from 'react'
import { SortType } from '@/enum'
import { useTranslation } from 'next-i18next'
import { Box, Button, Typography } from '@mui/material'
import { SearchUMDtoIn } from '@interface/dto/um/um.dto.in'
import UserManagementSearchForm from './SearchForm/index'
import UserManagementTable from './Table/index'
import service from '@/api'
import { useQuery } from '@tanstack/react-query'
import { FileUploadOutlined, PersonAddAltOutlined } from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { AppPath } from '@/config/app.config'

export const UserManagementMain = () => {
	const router = useRouter()
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

	const { data: searchUMData, isLoading: isSearchUMDataLoading } = useQuery({
		queryKey: ['getSearchUM', searchParams],
		queryFn: () => service.um.getSearchUM(searchParams),
	})

	return (
		<div className='relative flex w-[calc(100vw-50px)] flex-col self-center px-0 py-5 lg:w-[calc(100vw-0px)] lg:px-6 lg:py-5'>
			<Box className='absolute left-0 top-0 h-[260px] w-full bg-primary'></Box>
			<Box className='absolute bottom-0 left-0 top-[260px] w-full bg-white'></Box>

			<Box className='z-1 relative'>
				<Box className='pb-4'>
					<Typography className='!text-md !font-normal text-white'>{'การจัดการสิทธ์ผู้ใช้งาน'}</Typography>
				</Box>

				<UserManagementSearchForm searchParams={searchParams} setSearchParams={setSearchParams} />

				<Box className='flex items-center gap-4'>
					<Button
						className='flex h-[38px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none [&_.MuiButton-icon]:m-0'
						variant='contained'
						startIcon={<FileUploadOutlined className='!h-4 !w-4 !fill-white' />}
						onClick={() => console.log('Import!!!')}
					>
						<Box className='!text-xs text-white'>{'นำเข้าผู้ใช้งาน'}</Box>
					</Button>
					<Button
						className='flex h-[38px] items-center gap-1.5 !rounded-[5px] !bg-white/10 !px-3 !py-2.5 shadow-none hover:shadow-none [&_.MuiButton-icon]:m-0'
						variant='contained'
						startIcon={<PersonAddAltOutlined className='!h-4 !w-4 !fill-white' />}
						onClick={() => router.push(AppPath.UserManagementForm)}
					>
						<Box className='!text-xs text-white'>{'เพิ่มผู้ใช้งาน'}</Box>
					</Button>
				</Box>

				<UserManagementTable
					searchParams={searchParams}
					setSearchParams={setSearchParams}
					tableData={searchUMData?.data ?? []}
					total={searchUMData?.total ?? 0}
					searchDataLoading={isSearchUMDataLoading}
				/>
			</Box>
		</div>
	)
}
