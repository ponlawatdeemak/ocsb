import { ExpandMore } from '@mui/icons-material'
import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'
import classNames from 'classnames'
import React from 'react'

interface FilterSelectProps {
	className?: string
	id: string
	required?: boolean
	fullWidth?: boolean
	value: any
	data: any[]
	placeholder?: string
	disabled?: boolean
	onChange: (event: SelectChangeEvent) => void
}

const FilterSelect: React.FC<FilterSelectProps> = ({
	className = '',
	id,
	required = false,
	fullWidth = true,
	placeholder,
	disabled = false,
	value,
	data,
	onChange,
}) => {
	return (
		<FormControl fullWidth={fullWidth} required={required} className={classNames('', className)}>
			<Select
				id={`${id}-select`}
				className='h-[38px] !rounded-[5px] bg-white p-0 [&_input]:h-[38px] [&_svg]:right-3 [&_svg]:top-[calc(50%-12px)] [&_svg]:h-6 [&_svg]:w-6 [&_svg]:text-black'
				IconComponent={ExpandMore}
				SelectDisplayProps={{
					className: '!box-border !h-[38px] !pl-3 !pr-16 !py-2 !text-sm !text-black',
				}}
				MenuProps={{
					slotProps: {
						paper: {
							className:
								'mt-1 border-[0.5px] border-solid border-gray p-1 bg-white !rounded-[5px] shadow-[0_3.43px_2.75px_0_rgba(0,0,0,0.02),0_8.69px_6.95px_0_rgba(0,0,0,0.03)]',
						},
					},
					MenuListProps: {
						className: 'p-0 [&_.Mui-selected]:!bg-green-light2',
					},
				}}
				value={value}
				onChange={onChange}
				displayEmpty
				disabled={disabled}
			>
				{placeholder && (
					<MenuItem className='px-3 py-2 text-sm text-black sm:text-base' value=''>
						{placeholder}
					</MenuItem>
				)}
				{data.map((item) => (
					<MenuItem key={item} className='px-3 py-2 text-sm text-black sm:text-base' value={item}>
						{item}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	)
}

export default FilterSelect
