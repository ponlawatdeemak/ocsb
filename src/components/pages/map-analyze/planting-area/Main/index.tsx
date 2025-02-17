import React from 'react'

interface PlantingAreaMainProps {
	className?: string
}

export const PlantingAreaMain: React.FC<PlantingAreaMainProps> = ({ className = '' }) => {
	return (
		<div>
			<div className='flex flex-col text-center'>
				<div className='text-[200px]'>🏗️</div>
				<div className='text-[50px]'>🎋🎋🎋</div>
				<div>Under Development!</div>
			</div>
		</div>
	)
}
