import { useMediaQuery, useTheme } from '@mui/material'

const useResponsive = () => {
	const theme = useTheme()
	const matches = useMediaQuery(theme.breakpoints.up(1024))
	return { isDesktop: matches }
}

export default useResponsive
