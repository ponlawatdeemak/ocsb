import { PropsWithChildren } from 'react'
import AppBar from '../menu/AppBar'

interface MainLayoutProps extends PropsWithChildren {}

export default function MainLayout({ children }: MainLayoutProps) {
	return (
		<div className='flex h-full w-full flex-col'>
			<AppBar />
			<div className='flex flex-1 flex-col overflow-auto'>{children}</div>
		</div>
	)
}
