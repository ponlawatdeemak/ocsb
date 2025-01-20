import React from 'react'

interface OverviewMainProps {
	className?: string
}

export const OverviewMain: React.FC<OverviewMainProps> = ({ className = '' }) => {
	return <div className='flex h-full w-full flex-1 flex-col p-8'>OverviewMain</div>
}
