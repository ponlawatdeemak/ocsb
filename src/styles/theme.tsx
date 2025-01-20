import { createTheme, responsiveFontSizes } from '@mui/material/styles'

declare module '@mui/material/styles' {
	interface TypographyVariants {
		header80: React.CSSProperties
		header65: React.CSSProperties
		header60: React.CSSProperties
		header46: React.CSSProperties
		header40: React.CSSProperties
		header37: React.CSSProperties
		header32: React.CSSProperties
		header29: React.CSSProperties
		header26: React.CSSProperties
		header20: React.CSSProperties
		header18: React.CSSProperties
		header16: React.CSSProperties
		body16: React.CSSProperties
		body15: React.CSSProperties
		body14: React.CSSProperties
		body12: React.CSSProperties
		body10: React.CSSProperties
	}

	// allow configuration using `createTheme`
	interface TypographyVariantsOptions {
		header80?: React.CSSProperties
		header65?: React.CSSProperties
		header60?: React.CSSProperties
		header46?: React.CSSProperties
		header40?: React.CSSProperties
		header37?: React.CSSProperties
		header32?: React.CSSProperties
		header29?: React.CSSProperties
		header26?: React.CSSProperties
		header20?: React.CSSProperties
		header18?: React.CSSProperties
		header16?: React.CSSProperties
		body16?: React.CSSProperties
		body15?: React.CSSProperties
		body14?: React.CSSProperties
		body12?: React.CSSProperties
		body10?: React.CSSProperties
	}
}

// Update the Typography"s variant prop options
declare module '@mui/material/Typography' {
	interface TypographyPropsVariantOverrides {
		header80: true
		header65: true
		header60: true
		header46: true
		header40: true
		header37: true
		header32: true
		header29: true
		header26: true
		header20: true
		header18: true
		header16: true
		body16: true
		body15: true
		body14: true
		body12: true
		body10: true
	}
}

// Create a theme instance.
let _theme = createTheme({
	palette: {
		primary: {
			main: '#003491',
			contrastText: '#000000',
		},
		secondary: {
			main: '#0083ff',
			contrastText: '#000000',
		},
		success: {
			main: '#228b22',
		},
		error: {
			main: '#ff0000',
			contrastText: '#000000',
		},
		background: {
			default: '#F5F5F6',
		},
	},
	typography: {
		fontFamily: ['Prompt', 'Montserrat'].join(','),
		header80: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 900,
			fontSize: 80,
		},
		header65: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 900,
			fontSize: 65,
		},
		header60: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 900,
			fontSize: 60,
		},
		header46: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 900,
			fontSize: 46,
		},
		header40: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 700,
			fontSize: 40,
			lineHeight: '44px',
		},
		header37: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 700,
			fontSize: 37,
			lineHeight: '44px',
		},
		header32: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 600,
			fontSize: 32,
			lineHeight: '44px',
		},
		header29: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 700,
			fontSize: 29,
			lineHeight: '138%',
		},
		header26: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 900,
			fontSize: 26,
		},
		header20: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'bold',
			fontSize: 20,
		},
		header18: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'bold',
			fontSize: 18,
		},
		header16: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'bold',
			fontSize: 16,
		},
		body16: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontSize: 16,
		},
		body15: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontSize: 15,
		},
		body14: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontSize: 14,
		},
		body12: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontSize: 12,
		},
		body10: {
			fontFamily: ['Prompt', 'Montserrat'].join(','),
			fontStyle: 'normal',
			fontWeight: 'normal',
			fontSize: 10,
		},
	},
})

_theme = responsiveFontSizes(_theme)

export default function getTheme() {
	return _theme
}
