import React from 'react'

interface GlossaryMainProps {
	className?: string
}

export const GlossaryMain: React.FC<GlossaryMainProps> = ({ className = '' }) => {
	return (
		<div>
			<div className='flex flex-col text-center'>
				<div className='text-[200px]'>🏗️</div>
				<div className='text-[50px]'>📖📖📖</div>
				<div>Under Development!</div>
			</div>
		</div>
	)
}
