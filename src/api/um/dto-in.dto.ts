import { SortType } from '@/enum'
import { TablePagination } from '../interface'

export interface GetUmDtoIn {
	userId: string
}

export interface PostUploadFilesDtoIn {
	file: File
}

export interface PutProfileDtoIn {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: string
	responsibleProvinceCode: string
	responsibleDistrictCode: string
}

export interface GetSearchUMDtoIn extends TablePagination {
	keyword: string
	firstName: string
	respLang: string
}

export interface PatchStatusDtoIn {
	id: string
	flagStatus: string
}

export interface DeleteProfileDtoIn {
	id: string
}

export interface PutProfileUMDtoIn {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: string | File
	orgCode: string
	role: string
	responsibleProvinceCode: string
	responsibleDistrictCode: string
	flagStatus?: string
}
export interface PostProfileUMDtoIn {
	username: string
	firstName: string
	lastName: string
	email: string
	image: string | File
	orgCode: string
	role: string
	responsibleProvinceCode: string
	responsibleDistrictCode: string
	flagStatus?: string
}

export interface PostImportCSVUMDtoIn {
	data: FormData
}

export interface PostImportXLSXUMDtoIn extends PostImportCSVUMDtoIn {}
