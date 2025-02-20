import MultipleSelectCheckmarks, { MultipleSelectedType } from '@/components/common/select/MultipleSelectCheckmarks'
import { hotspotType, mapType, mapTypeCode, ResponseLanguage } from '@interface/config/app.config'
import { EventNoteOutlined } from '@mui/icons-material'
import { Box, Button, FormControl, OutlinedInput, Typography } from '@mui/material'
import classNames from 'classnames'
import { useTranslation } from 'next-i18next'
import React, { useMemo } from 'react'

interface BurntSearchFormMainProps {
	selectedHotspots: string[]
	handleChange: (event: any) => void
	mapTypeArray: string[]
	className?: string
}

const BurntSearchFormMain: React.FC<BurntSearchFormMainProps> = ({
	selectedHotspots,
	handleChange,
	mapTypeArray,
	className = '',
}) => {
	const { i18n } = useTranslation(['map-analyze', 'common', 'overview'])
	const language = i18n.language as keyof ResponseLanguage

	const hotspotOptions: MultipleSelectedType[] = useMemo(
		() => hotspotType.map((type) => ({ id: type.code, name: type.label[language] })),
		[language],
	)

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
					{mapType.map((item) => {
						if (item.code === mapTypeCode.hotspots) {
							return (
								<MultipleSelectCheckmarks
									key={item.code}
									name={item.code}
									className='[&_.MuiInputBase-root]:!border-none [&_.MuiSelect-select>div]:!text-black'
									options={hotspotOptions}
									multipleSelected={selectedHotspots}
									onChange={handleChange}
									fixedRenderValue={item.label[language]}
								/>
							)
						} else {
							return (
								<Button
									key={item.code}
									className={classNames(
										'h-[38px] !truncate !rounded-[5px] !px-4 !py-2.5 !text-sm !shadow-none',
										{ '!bg-[#EBF5FF] !text-primary': mapTypeArray.includes(item.code) },
										{ '!bg-white !text-black': !mapTypeArray.includes(item.code) },
									)}
									name={item.code}
									variant='contained'
									onClick={handleChange}
								>
									{item.label[language]}
								</Button>
							)
						}
					})}

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
