import { ExpandMore } from '@mui/icons-material'
import {
	Box,
	Checkbox,
	FormControl,
	FormLabel,
	ListItemText,
	MenuItem,
	Select,
	SelectChangeEvent,
	Typography,
} from '@mui/material'
import classNames from 'classnames'
import React from 'react'

export interface MultipleSelectedType {
	id: string
	name: string
}

interface MultipleSelectCheckmarksProps {
	className?: string
	label?: string
	options: MultipleSelectedType[]
	multipleSelected: string[] | null
	onChange: (event: SelectChangeEvent<string[]>) => void
	fixedRenderValue?: string
	disabled?: boolean
}

const MultipleSelectCheckmarks: React.FC<MultipleSelectCheckmarksProps> = ({
	className = '',
	label,
	options,
	multipleSelected,
	onChange,
	fixedRenderValue = '',
	disabled = false,
}) => {
	return (
		<FormControl className={classNames('[&_.Mui-focused]:border-secondary', className)}>
			{label && <FormLabel className='mb-1.5 !text-xs !text-white'>{label}</FormLabel>}
			<Select
				className='h-[38px] !rounded-[5px] border-[1.5px] border-solid border-gray bg-white p-0 [&_fieldset]:border-none [&_svg]:right-3 [&_svg]:top-[calc(50%-12px)] [&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-black'
				multiple
				displayEmpty
				value={multipleSelected ?? []}
				onChange={onChange}
				renderValue={() => <Box className='flex-1 truncate !text-sm text-[#8E8E8E]'>{fixedRenderValue}</Box>}
				IconComponent={ExpandMore}
				SelectDisplayProps={{
					className:
						'box-border !h-[38px] !flex items-center !pl-4 !pr-12 !py-0 text-sm text-black sm:text-base',
				}}
				MenuProps={{
					slotProps: {
						paper: {
							className:
								'mt-1 border-[0.5px] border-solid border-gray p-1 bg-white !rounded-[5px] shadow-[0_3.43px_2.75px_0_rgba(0,0,0,0.02),0_8.69px_6.95px_0_rgba(0,0,0,0.03)]',
						},
					},
					MenuListProps: {
						className:
							'p-0 focus:[&_>li]:!bg-transparent hover:[&_>li]:bg-transparent hover:[&_.Mui-selected]:bg-transparent [&_.Mui-selected]:bg-transparent',
					},
				}}
				disabled={disabled}
			>
				{options.map((option) => (
					<MenuItem key={option.id} value={option.id}>
						<Checkbox checked={multipleSelected ? multipleSelected.indexOf(option.id) > -1 : false} />
						<ListItemText primary={<Typography className='text-sm'>{option.name}</Typography>} />
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}

export default MultipleSelectCheckmarks
