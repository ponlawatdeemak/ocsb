import axios, { AxiosError, AxiosRequestConfig } from 'axios'
import { APIConfigType, APIService, AppAPI } from './interface'
import service from '@/api'
import { defaultText } from '@/utils/text'
import { getSession } from 'next-auth/react'

const APIConfigs: { [key: string]: APIConfigType } = {
	[APIService.WebAPI]: {
		baseURL: process.env.NEXT_PUBLIC_API_HOSTNAME_MIS ?? '',
		apiKey: process.env.NEXT_PUBLIC_API_KEY_MIS ?? '',
	},
	[APIService.DataAPI]: {
		baseURL: process.env.NEXT_PUBLIC_API_HOSTNAME_GIS ?? '',
		apiKey: process.env.NEXT_PUBLIC_API_KEY_GIS ?? '',
	},
	[APIService.TilesAPI]: {
		baseURL: process.env.NEXT_PUBLIC_API_HOSTNAME_TILE ?? '',
		apiKey: process.env.NEXT_PUBLIC_API_KEY_TILE ?? '',
	},
}

let _apiAccessToken: string | null = null
export const getApiAccessToken = () => _apiAccessToken

let apiRefreshToken: string | null = null
let _apiAccessType: 'Guest' | 'Login' = 'Guest'
export const getApiAccessType = () => _apiAccessType

let apiUserId: string | null = null

export const axiosInstance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_HOSTNAME_MIS,
	headers: {
		'x-api-key': process.env.NEXT_PUBLIC_API_KEY_MIS ?? '',
	},
})

export const api: AppAPI = {
	...axiosInstance,
	get: async (url: string, service: APIService = APIService.WebAPI, config?: AxiosRequestConfig<any> | undefined) =>
		(await axiosInstance.get(url, getConfig(service, config)))?.data,
	post: async (
		url: string,
		data: any,
		service: APIService = APIService.WebAPI,
		config?: AxiosRequestConfig<any> | undefined,
	) => await axiosInstance.post(url, data, getConfig(service, config)),
	put: async (
		url: string,
		data: any,
		service: APIService = APIService.WebAPI,
		config?: AxiosRequestConfig<any> | undefined,
	) => await axiosInstance.put(url, data, getConfig(service, config)),
	delete: async (
		url: string,
		service: APIService = APIService.WebAPI,
		config?: AxiosRequestConfig<any> | undefined,
	) => await axiosInstance.delete(url, getConfig(service, config)),
	patch: async (
		url: string,
		data: any,
		service: APIService = APIService.WebAPI,
		config?: AxiosRequestConfig<any> | undefined,
	) => await axiosInstance.patch(url, data, getConfig(service, config)),
}

const getConfig = (service: APIService, config: AxiosRequestConfig<any> | undefined) => ({
	...config,
	baseURL: APIConfigs[service].baseURL,
	headers: {
		'x-api-key': APIConfigs[service].apiKey,
	},
})

export const refreshAccessToken = async (refreshToken?: string) => {
	const token = apiRefreshToken || refreshToken
	if (!token) {
		throw new Error()
	}
	const res = await service.auth.refreshToken({ refreshToken: token })
	if (!res) {
		throw new Error()
	}
	const newAccessToken = res?.data?.accessToken === '' ? undefined : res?.data?.accessToken
	const newRefreshToken = res?.data?.refreshToken === '' ? undefined : res?.data?.refreshToken
	updateAccessToken({ accessToken: newAccessToken, refreshToken: newRefreshToken, accessType: 'Login' })
	return { accessToken: newAccessToken, refreshToken: newRefreshToken }
}

axiosInstance.interceptors.request.use(
	async (config) => {
		const session = await getSession()
		if (session && session.user) {
			config.headers['Authorization'] = `Bearer ${session.user.accessToken}`
		}
		return config
	},
	(error) => {
		return Promise.reject(error)
	},
)

axiosInstance.interceptors.response.use(
	(response) => {
		return response
	},
	async function (error) {
		const errorData = error.response.data?.error || error.response.data

		if (error instanceof AxiosError && error.config && error.response?.status === 401) {
			try {
				const originalRequest = error.config as any
				if (!originalRequest?._retry) {
					originalRequest._retry = true
					let newAccessToken = ''
					if (_apiAccessType === 'Guest') {
						updateAccessToken({ accessToken: '', accessType: 'Guest' })
					} else {
						const { accessToken } = await refreshAccessToken()
						newAccessToken = defaultText(accessToken)
					}
					return axiosInstance({
						...originalRequest,
						headers: {
							...originalRequest.headers,
							authorization: `Bearer ${newAccessToken}`,
						},
					}).catch((err) => {
						console.error('err: ', err)
						// TODO: modal logout
					})
				}
			} catch (err) {
				return Promise.reject({
					title: errorData.title || errorData.message,
					status: errorData.status || errorData.success,
					detail: errorData.detail,
				})
			}
		}

		return Promise.reject({
			// title: errorData.title || errorData.message,
			// status: errorData.status || errorData.success,
			// detail: errorData.detail,
			// countImported: errorData?.countImported,
			// data: errorData?.data,
			...errorData,
		})
	},
)

export function updateAccessToken({
	accessToken,
	refreshToken,
	userId,
	accessType,
}: {
	accessToken?: string
	refreshToken?: string
	userId?: string
	accessType: 'Guest' | 'Login'
}) {
	if (accessToken) {
		axiosInstance.defaults.headers.common.authorization = 'Bearer ' + accessToken
		_apiAccessToken = accessToken
		if (refreshToken) apiRefreshToken = refreshToken
		if (userId) apiUserId = userId
		_apiAccessType = accessType
	} else {
		axiosInstance.defaults.headers.common.authorization = null
		_apiAccessToken = null
		apiUserId = null
		apiRefreshToken = null
	}
}
