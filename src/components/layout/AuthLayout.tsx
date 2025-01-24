import { PropsWithChildren } from 'react'

interface AuthLayoutProps extends PropsWithChildren {}

export default function AuthLayout({ children }: AuthLayoutProps) {
	return (
		<div className='flex h-full w-full flex-col'>
			<div className='flex flex-1 flex-col overflow-auto bg-[url("/images/login-bg.png")] bg-cover bg-center'>
				{children}
			</div>
		</div>
	)
}
