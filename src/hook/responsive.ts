import { useMediaQuery, useTheme } from '@mui/material'

const useResponsive = () => {
	const theme = useTheme()
	const matches = useMediaQuery(theme.breakpoints.up(1024))
	const matchesMD = useMediaQuery(theme.breakpoints.up(768))
	const matchesXl = useMediaQuery(theme.breakpoints.up(1280))
	return { isDesktop: matches, isDesktopMD: matchesMD, isDesktopXl: matchesXl }
}

export default useResponsive
