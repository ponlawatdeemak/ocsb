'use client'

import service from '@/api'
import MultipleSelectCheckmarks from '@/components/common/select/MultipleSelectCheckmarks'
import { Languages } from '@/enum'
import { ResponseLanguage } from '@interface/config/app.config'
import { SearchUMDtoIn } from '@interface/dto/um/um.dto.in'
import { Box, FormControl, FormLabel, OutlinedInput, SelectChangeEvent } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import { ChangeEvent, Dispatch, SetStateAction, useCallback, useMemo } from 'react'

export interface UserManagementSearchFormProps {
	className?: string
	searchParams: SearchUMDtoIn
	setSearchParams: Dispatch<SetStateAction<SearchUMDtoIn>>
}

const UserManagementSearchForm: React.FC<UserManagementSearchFormProps> = ({
	className = '',
	searchParams,
	setSearchParams,
}) => {
	const { t, i18n } = useTranslation(['common', 'um'])
	const language = i18n.language as keyof ResponseLanguage

	const { data: regionsLookupData, isLoading: isRegionsDataLoading } = useQuery({
		queryKey: ['getRegionsSearchForm'],
		queryFn: async () => {
			const response = await service.lookup.get({ name: 'regions' })

			if (!response) return
			setSearchParams((prevSearch) => ({
				...prevSearch,
				region: response.map((region: any) => region.regionId.toString()),
			}))
			return response
		},
	})

	const { data: rolesLookupData, isLoading: isRolesDataLoading } = useQuery({
		queryKey: ['getRolesSearchForm'],
		queryFn: async () => {
			const response = await service.lookup.get({ name: 'roles' })

			if (!response) return
			setSearchParams((prevSearch) => ({
				...prevSearch,
				role: response.map((role: any) => role.roleId.toString()),
			}))
			return response
		},
	})

	const { data: positionLookupData, isLoading: isPositionDataLoading } = useQuery({
		queryKey: ['getPositionSearchForm'],
		queryFn: async () => {
			const response = await service.lookup.get({ name: 'position' })

			if (!response) return
			setSearchParams((prevSearch) => ({
				...prevSearch,
				position: response.map((position: any) => position.positionId.toString()),
			}))
			return response
		},
	})

	const regionOptions = useMemo(() => {
		if (!regionsLookupData) return []
		return regionsLookupData.map((region: any) => ({
			id: region.regionId.toString(),
			name: language === Languages.TH ? region.regionName : region.regionNameEn,
		}))
	}, [regionsLookupData, language])

	const roleOptions = useMemo(() => {
		if (!rolesLookupData) return []
		return rolesLookupData.map((role: any) => ({
			id: role.roleId.toString(),
			name: role.roleName,
		}))
	}, [rolesLookupData])

	const positionOptions = useMemo(() => {
		if (!positionLookupData) return []
		return positionLookupData.map((position: any) => ({
			id: position.positionId.toString(),
			name: language === Languages.TH ? position.positionName : position.positionNameEn,
		}))
	}, [positionLookupData, language])

	const handleRegionChange = useCallback(
		(event: SelectChangeEvent<typeof searchParams.region>) => {
			const { value } = event.target
			setSearchParams((prevSearch) => ({
				...prevSearch,
				region: typeof value === 'string' ? value.split(',') : value,
			}))
		},
		[searchParams, setSearchParams],
	)

	const handleRoleChange = useCallback(
		(event: SelectChangeEvent<typeof searchParams.role>) => {
			const { value } = event.target
			setSearchParams((prevSearch) => ({
				...prevSearch,
				role: typeof value === 'string' ? value.split(',') : value,
			}))
		},
		[searchParams, setSearchParams],
	)

	const handlePositionChange = useCallback(
		(event: SelectChangeEvent<typeof searchParams.position>) => {
			const { value } = event.target
			setSearchParams((prevSearch) => ({
				...prevSearch,
				position: typeof value === 'string' ? value.split(',') : value,
			}))
		},
		[searchParams, setSearchParams],
	)

	const handleSearchChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			setSearchParams((prevSearch) => ({
				...prevSearch,
				keyword: event.target.value,
			}))
		},
		[setSearchParams],
	)

	return (
		<Box className={classNames('mb-[30px] flex items-center gap-4', className)}>
			<MultipleSelectCheckmarks
				className='w-[206px]'
				label='ภูมิภาค'
				options={regionOptions}
				multipleSelected={searchParams.region ?? []}
				onChange={handleRegionChange}
				fixedRenderValue='เลือกภูมิภาค'
			/>

			<MultipleSelectCheckmarks
				className='w-[206px]'
				label='ตำแหน่งงาน'
				options={roleOptions}
				multipleSelected={searchParams.role ?? []}
				onChange={handleRoleChange}
				fixedRenderValue='เลือกตำแหน่งงาน'
			/>

			<MultipleSelectCheckmarks
				className='w-[206px]'
				label='สิทธิ์การเข้าถึง'
				options={positionOptions}
				multipleSelected={searchParams.position ?? []}
				onChange={handlePositionChange}
				fixedRenderValue='เลือกสิทธิ์การเข้าถึง'
			/>

			<FormControl className='w-[206px] [&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white'>
				<FormLabel className='mb-1.5 !text-xs !text-white'>{'คำค้นหา'}</FormLabel>
				<OutlinedInput
					id='keyword-search'
					className='[&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
					onChange={handleSearchChange}
					placeholder='ระบุชื่อ เบอร์โทรศัพท์หรืออีเมล์'
				/>
			</FormControl>
		</Box>
	)
}

export default UserManagementSearchForm
