/** @type {import('tailwindcss').Config} */

module.exports = {
	content: [
		'./app/**/*.{js,ts,jsx,tsx,mdx}',
		'./pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./components/**/*.{js,ts,jsx,tsx,mdx}',

		// Or if using `src` directory:
		'./src/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		screens: {
			sm: '640px',
			// => @media (min-width: 640px) { ... }

			md: '768px',
			// => @media (min-width: 768px) { ... }

			lg: '1024px',
			// => @media (min-width: 1024px) { ... }

			xl: '1450px',
			// => @media (min-width: 1280px) { ... }

			'2xl': '1536px',
			// => @media (min-width: 1536px) { ... }
		},
		fontSize: {
			'2xs': ['var(--font-size-2xs)', 'var(--line-height-2xs)'],
			xs: ['var(--font-size-xs)', 'var(--line-height-xs)'],
			sm: ['var(--font-size-sm)', 'var(--line-height-sm)'],
			base: ['var(--font-size-base)', 'var(--line-height-base)'],
			md: ['var(--font-size-md)', 'var(--line-height-md)'],
			lg: ['var(--font-size-lg)', 'var(--line-height-lg)'],
			xl: ['var(--font-size-xl)', 'var(--line-height-xl)'],
			'2xl': ['var(--font-size-2xl)', 'var(--line-height-2xl)'],
			'3xl': ['var(--font-size-3xl)', 'var(--line-height-3xl)'],
		},
		extend: {
			colors: {
				foreground: {
					DEFAULT: 'var(--foreground-color)',
				},
				background: {
					DEFAULT: 'var(--background-color)',
				},
				primary: {
					DEFAULT: 'var(--primary-color-1)',
					light: 'var(--primary-color-2)',
				},
				secondary: {
					DEFAULT: 'var(--secondary-color-1)',
				},
				success: {
					DEFAULT: 'var(--success-color-1)',
				},
				error: {
					DEFAULT: 'var(--error-color-1)',
				},
				link: {
					DEFAULT: 'var(--link-color-1)',
				},
				green: {
					light: 'var(--light-green-color)',
					light2: 'var(--light-green-color2)',
				},
				gray: {
					DEFAULT: 'var(--light-gray-color)',
					300: 'var(--light-gray-300)',
				},
				black: {
					light: 'var(--light-black-color)',
					DEFAULT: '#000000',
				},
			},
			spacing: {
				'responsive-bar-gap': 'clamp(8px, (100vw - 1024px) * (56 / 416) + 8px, 64px)',
				'responsive-menu-gap': 'clamp(4px, (100vw - 1024px) * (36 / 416) + 4px, 40px)',
			},
		},
	},
	plugins: [],
}
