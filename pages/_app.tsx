import PageManager from '@/providers/PageManager'
import IdentityProvider from '@/providers/IdentityProvider'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { Session } from 'next-auth'
import { SessionProvider } from 'next-auth/react'
import { SSRConfig, appWithTranslation } from 'next-i18next'
import type { AppProps } from 'next/app'
import '../src/styles/globals.css'
import '../src/styles/override/react-datepicker.css'
import theme from '../src/styles/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function MyApp({ Component, pageProps }: AppProps<{ session: Session } & SSRConfig>) {
	const queryClient = new QueryClient({
		defaultOptions: {
			queries: {
				refetchOnWindowFocus: false,
				retry: false, // not retry when error
				refetchInterval: 60000 * 30, // refetch every 30 minutes
			},
		},
	})
	return (
		<SessionProvider session={pageProps.session}>
			<QueryClientProvider client={queryClient}>
				<ThemeProvider theme={theme()}>
					<CssBaseline />
					<PageManager>
						<IdentityProvider>
							<Component {...pageProps} />
						</IdentityProvider>
					</PageManager>
				</ThemeProvider>
			</QueryClientProvider>
		</SessionProvider>
	)
}

export default appWithTranslation(MyApp)
