/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')

const nextConfig = {
	reactStrictMode: true,

	i18n,

	env: {
		WEB_HOSTNAME: process.env.WEB_HOSTNAME,

		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,

		NEXT_PUBLIC_API_HOSTNAME_MIS: process.env.NEXT_PUBLIC_API_HOSTNAME_MIS,
		NEXT_PUBLIC_API_KEY_MIS: process.env.NEXT_PUBLIC_API_KEY_MIS,

		NEXT_PUBLIC_API_HOSTNAME_GIS: process.env.NEXT_PUBLIC_API_HOSTNAME_GIS,
		NEXT_PUBLIC_API_KEY_GIS: process.env.NEXT_PUBLIC_API_KEY_GIS,

		NEXT_PUBLIC_API_HOSTNAME_TILE: process.env.NEXT_PUBLIC_API_HOSTNAME_TILE,
		NEXT_PUBLIC_API_KEY_TILE: process.env.NEXT_PUBLIC_API_KEY_TILE,

		GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
		GOOGLE_MAPS_API_MAP_ID: process.env.GOOGLE_MAPS_API_MAP_ID,
	},

	async redirects() {
		return [
			{
				source: '/',
				destination: '/overview',
				permanent: true,
			},
		]
	},
}

module.exports = nextConfig
