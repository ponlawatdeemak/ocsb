import React from 'react'

interface CultivationAreaMainProps {
	className?: string
}

export const CultivationAreaMain: React.FC<CultivationAreaMainProps> = ({ className = '' }) => {
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
