import MultipleSelectCheckmarks, { MultipleSelectedType } from '@/components/common/select/MultipleSelectCheckmarks'
import { EventNoteOutlined } from '@mui/icons-material'
import { Box, Button, FormControl, OutlinedInput, SelectChangeEvent, Typography } from '@mui/material'
import classNames from 'classnames'
import React, { useCallback, useMemo, useState } from 'react'

interface BurntSearchFormMainProps {
	className?: string
}

const BurntSearchFormMain: React.FC<BurntSearchFormMainProps> = ({ className = '' }) => {
	const [selectedHotspots, setSelectedHotspots] = useState<string[]>(['1', '2'])

	const hotspotOptions: MultipleSelectedType[] = useMemo(
		() => [
			{ id: '1', name: 'จุดความร้อนที่ตกในแปลงอ้อย' },
			{ id: '2', name: 'จุดความร้อนที่ไม่ตกในแปลงอ้อย' },
		],
		[],
	)

	const handleHotspotChange = useCallback((event: SelectChangeEvent<typeof selectedHotspots>) => {
		const { value } = event.target
		setSelectedHotspots(typeof value === 'string' ? value.split(',') : value)
	}, [])

	return (
		<Box
			className={classNames(
				'flex flex-col gap-2 px-4 py-6 md:px-6 md:py-4 xl:flex-row xl:items-center xl:justify-between xl:gap-12',
				className,
			)}
		>
			<Typography className='whitespace-nowrap !text-md text-primary max-md:hidden'>
				{'การวิเคราะห์จุดความร้อน และร่องรอยการเผาไหม้ในพื้นที่'}
			</Typography>
			<Box className='flex items-center gap-4'>
				<Box className='flex w-[26%] items-center gap-4'>
					<FormControl className='w-full [&_.MuiInputBase-root]:rounded-[5px] [&_.MuiInputBase-root]:bg-white'>
						<OutlinedInput
							id='burnt-area-search'
							className='[&_fieldset]:border-none [&_input]:box-border [&_input]:h-[38px] [&_input]:px-3 [&_input]:py-2 [&_input]:text-sm'
							placeholder={'ค้นหาพื้นที่'}
						/>
					</FormControl>
				</Box>

				<Box className='flex w-[74%] items-center gap-4'>
					<MultipleSelectCheckmarks
						className='[&_.MuiInputBase-root]:!border-none [&_.MuiSelect-select>div]:!text-black'
						options={hotspotOptions}
						multipleSelected={selectedHotspots}
						onChange={handleHotspotChange}
						fixedRenderValue={'จุดความร้อน'}
					/>

					<Button
						className='h-[38px] !rounded-[5px] !bg-white !px-4 !py-2.5 !shadow-none'
						variant='contained'
					>
						<Typography className='flex-1 truncate !text-sm text-black'>{'ร่องรอยการเผาไหม้'}</Typography>
					</Button>

					<Button
						className='h-[38px] !rounded-[5px] !bg-white !px-4 !py-2.5 !shadow-none'
						variant='contained'
					>
						<Typography className='flex-1 truncate !text-sm text-black'>{'พื้นที่ปลูกอ้อย'}</Typography>
					</Button>

					<Button
						className='h-[38px] w-[200px] !justify-between !rounded-[5px] !bg-white !px-3 !py-2.5 !shadow-none [&_.MuiButton-endIcon]:m-0'
						variant='contained'
						endIcon={<EventNoteOutlined />}
					>
						<Typography className='!text-sm text-[#8E8E8E]'>{'กรุณาระบุวันที่'}</Typography>
					</Button>
				</Box>
			</Box>
		</Box>
	)
}

export default BurntSearchFormMain
