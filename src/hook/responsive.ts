import { useMediaQuery, useTheme } from '@mui/material'

const useResponsive = () => {
	const theme = useTheme()
	const matches = useMediaQuery(theme.breakpoints.up(1024))
	const matchesXl = useMediaQuery(theme.breakpoints.up(1280))
	return { isDesktop: matches, isDesktopXl: matchesXl }
}

export default useResponsive
