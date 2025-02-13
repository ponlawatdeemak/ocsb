import React from 'react'

interface OverviewMainProps {
	className?: string
}

export const OverviewMain: React.FC<OverviewMainProps> = ({ className = '' }) => {
	return (
		<div className='flex h-full w-full flex-1 flex-col p-8'>
			<div className='flex flex-col text-center'>
				<div className='text-[200px]'>🏗️</div>
				<div className='text-[50px]'>🌲🌲🌲</div>
				<div>Under Development!</div>
			</div>
		</div>
	)
}
