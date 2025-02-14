/** @type {import('next').NextConfig} */
const { i18n } = require('./next-i18next.config')

const nextConfig = {
	reactStrictMode: true,
	i18n,
	env: {
		NEXTAUTH_URL: process.env.NEXTAUTH_URL,
		NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
		NEXT_PUBLIC_API_HOSTNAME_MIS: process.env.NEXT_PUBLIC_API_HOSTNAME_MIS,
		GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
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
