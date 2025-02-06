import { SortType } from '@/enum'
import { AxiosRequestConfig, AxiosResponse } from 'axios'

export enum APIService {
	WebAPI,
	DataAPI,
	TilesAPI,
}

export interface APIConfigType {
	baseURL: string
	apiKey: string
}

export interface AppAPI {
	get: (
		url: string,
		service?: APIService,
		config?: AxiosRequestConfig<any> | undefined,
	) => Promise<AxiosResponse<any, any>>
	post: (
		url: string,
		data: any,
		service?: APIService,
		config?: AxiosRequestConfig<any> | undefined,
	) => Promise<AxiosResponse<any, any>>
	put: (
		url: string,
		data: any,
		service?: APIService,
		config?: AxiosRequestConfig<any> | undefined,
	) => Promise<AxiosResponse<any, any>>
	delete: (
		url: string,
		service?: APIService,
		config?: AxiosRequestConfig<any> | undefined,
	) => Promise<AxiosResponse<any, any>>
	patch: (
		url: string,
		data: any,
		service?: APIService,
		config?: AxiosRequestConfig<any> | undefined,
	) => Promise<AxiosResponse<any, any>>
}

export type ErrorResponse = {
	type?: string
	title: string
	status: number
	detail: string
}

export type ResponseDto<T = any> = {
	data?: T
	message?: string
	tokens?: Tokens
	errorStatus?: number
	error?: ErrorResponse
	total?: number
}

export interface Tokens {
	idToken: string
	accessToken: string
	refreshToken: string
	expiresIn: number
}

export interface ResponseLanguage {
	th: string
	en: string
}

export interface TablePagination {
	sortField: string
	sortOrder: SortType
	limit: number
	offset: number
}
