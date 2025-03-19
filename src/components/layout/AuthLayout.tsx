import { Languages } from '@/enum'
import { ResponseLanguage } from '@interface/config/app.config'
import { ToggleButtonGroup, ToggleButton, Typography } from '@mui/material'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { PropsWithChildren, useEffect, useState } from 'react'

interface AuthLayoutProps extends PropsWithChildren {}

export default function AuthLayout({ children }: AuthLayoutProps) {
	const { i18n } = useTranslation('auth')
	const language = i18n.language as keyof ResponseLanguage
	const router = useRouter()

	const [selectedLanguage, setSelectedLanguage] = useState<Languages>(language as Languages)

	const handleSelectedLanguage = (_event: React.MouseEvent<HTMLElement>, newValue: any) => {
		if (newValue) {
			setSelectedLanguage((prev) => (prev === newValue ? prev : newValue))
			i18n.changeLanguage(newValue)
			router.replace(
				{
					pathname: router.pathname,
					query: router.query,
				},
				router.asPath,
				{ locale: newValue },
			)
		}
	}

	useEffect(() => {
		if (router.locale !== selectedLanguage) {
			i18n.changeLanguage(selectedLanguage)
			router.replace(
				{
					pathname: router.pathname,
					query: router.query,
				},
				router.asPath,
				{ locale: selectedLanguage },
			)
		}
	}, [i18n, language, router, selectedLanguage])

	return (
		<div className='flex h-full w-full flex-col'>
			<div className='flex flex-1 flex-col overflow-auto bg-[url("/images/login-bg.png")] bg-cover bg-center'>
				<div className='absolute right-[18px] top-[24px]'>
					<ToggleButtonGroup
						color='primary'
						value={selectedLanguage}
						exclusive
						onChange={handleSelectedLanguage}
						aria-label='language select'
						size='small'
						className='h-[28px] bg-white bg-opacity-50 max-lg:h-[24px] [&_.MuiButtonBase-root:not(.Mui-selected)]:text-white'
					>
						<ToggleButton
							className='w-[32px] !p-2 max-lg:w-[28px]'
							value={Languages.EN}
							aria-label='english'
						>
							<Typography className='max-lg:!text-sm'>EN</Typography>
						</ToggleButton>
						<ToggleButton
							className='!border-l-1 !border-l-solid !m-0 w-[32px] !border-l-white !p-2 max-lg:w-[28px]'
							value={Languages.TH}
							aria-label='thai'
						>
							<Typography className='max-lg:!text-sm'>TH</Typography>
						</ToggleButton>
					</ToggleButtonGroup>
				</div>
				{children}
			</div>
		</div>
	)
}
