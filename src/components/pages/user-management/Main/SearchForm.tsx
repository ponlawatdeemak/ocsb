'use client'

import { Button, FormControl, Input, InputAdornment, Paper, Box } from '@mui/material'
import { FormMain } from '../Form'
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined'
import GroupAddOutlinedIcon from '@mui/icons-material/GroupAddOutlined'
import SystemUpdateAltIcon from '@mui/icons-material/SystemUpdateAlt'
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { GetSearchUMDtoIn } from '@/api/um/dto-in.dto'
import { useTranslation } from 'next-i18next'
import useResponsive from '@/hook/responsive'
import { FormImport } from '../Import'
import { UserDialogMode } from '@/enum'
import clsx from 'clsx'

export interface UserManagementSearchFormProps {
	searchParams: GetSearchUMDtoIn
	setSearchParams: React.Dispatch<React.SetStateAction<GetSearchUMDtoIn>>
	setIsSearch: React.Dispatch<React.SetStateAction<boolean>>
	setPage: React.Dispatch<React.SetStateAction<number>>
}

const UserManagementSearchForm: React.FC<UserManagementSearchFormProps> = ({
	searchParams,
	setSearchParams,
	setIsSearch,
	setPage,
}) => {
	const [openForm, setOpenForm] = useState<boolean>(false)
	const [openImport, setOpenImport] = useState<boolean>(false)
	const { t, i18n } = useTranslation(['common', 'um'])
	const { isDesktop } = useResponsive()
	const [previousInput, setPreviousInput] = useState<string>('')

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		setSearchParams((prevSearch) => ({
			...prevSearch,
			offset: 0,
			keyword: event.target.value,
			respLang: i18n.language,
		}))
	}

	const handleOnSubmint = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsSearch(true)
		setSearchParams((prevSearch) => ({
			...prevSearch,
			offset: 0,
		}))
		setPage(1)
		setPreviousInput(searchParams.keyword)
	}

	const handleOnBlur = () => {
		if (searchParams.keyword === previousInput) return

		setIsSearch(true)
		setSearchParams((prevSearch) => ({
			...prevSearch,
			offset: 0,
		}))
		setPage(1)
		setPreviousInput(searchParams.keyword)
	}

	return (
		<>
			<Paper className='flex flex-col items-center gap-[30px] !bg-background !shadow-none'>
				<Box className='w-full'>
					<form onSubmit={handleOnSubmint} className='flex w-full items-center'>
						<FormControl fullWidth variant='standard' className='h-[40px] rounded-[8px] bg-white'>
							<Input
								className='ml-[8px] mr-[6px] flex h-[40px] gap-[8px] pr-[6px] [&_.MuiInputAdornment-positionStart]:m-0'
								id='standard-search'
								placeholder={`${t('search', { ns: 'um' })} ${isDesktop ? `${t('name', { ns: 'um' })}, ${t('email')}, ${t('org')}, ${t('role')}, ${t('province')}, ${t('district')}` : ''}`}
								type='search'
								startAdornment={
									<InputAdornment position='start'>
										<SearchOutlinedIcon className='h-[24px] w-[24px] text-black' />
									</InputAdornment>
								}
								onChange={handleSearchChange}
								onBlur={handleOnBlur}
								disableUnderline={true}
								inputProps={{ maxLength: 100 }}
							/>
						</FormControl>
					</form>
				</Box>
				<div className='flex gap-4'>
					<Button
						className={clsx(
							'flex h-[40px] shrink-0 gap-[8px] py-[8px] pl-[12px] pr-[16px] text-sm !font-normal !text-white [&_.MuiButton-startIcon]:m-0',
							{
								'w-[160px]': isDesktop,
							},
						)}
						variant='contained'
						color='primary'
						startIcon={<SystemUpdateAltIcon className={`h-[24px] w-[24px] ${!isDesktop && '!mr-auto'}`} />}
						onClick={() => setOpenImport(true)}
					>
						{isDesktop && t('importUser', { ns: 'um' })}
					</Button>
					<Button
						className={clsx(
							`flex h-[40px] shrink-0 gap-[8px] py-[8px] pl-[12px] pr-[16px] text-sm !font-normal !text-white [&_.MuiButton-startIcon]:m-0`,
							{
								'w-[131px]': isDesktop,
							},
						)}
						variant='contained'
						startIcon={<GroupAddOutlinedIcon className={`h-[24px] w-[24px] ${!isDesktop && 'ml-[8px]'}`} />}
						onClick={() => setOpenForm(true)}
					>
						{isDesktop && t('addUser', { ns: 'um' })}
					</Button>
				</div>
			</Paper>

			{/* <FormMain
				open={openForm}
				onClose={() => setOpenForm(false)}
				userId=''
				isEdit={false}
				setOpen={setOpenForm}
				setIsSearch={setIsSearch}
				userDialogMode={UserDialogMode.UserAdd}
			/>
			<FormImport
				open={openImport}
				onClose={() => setOpenImport(false)}
				setOpen={setOpenImport}
				setIsSearch={setIsSearch}
			/> */}
		</>
	)
}

export default UserManagementSearchForm
