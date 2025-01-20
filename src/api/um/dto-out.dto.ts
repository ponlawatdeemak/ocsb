import { ErrorResponse, ResponseDto, ResponseLanguage } from '../interface'

// export interface UmSearchDtoOut {
// 	id: string
// 	username: string
// 	firstName: string
// 	lastName: string
// 	email: string
// 	image: string
// 	orgCode: string
// 	role: string
// 	responsibleProvinceCode: string
// 	responsibleDistrictCode: string
// 	flagStatus: string
// 	createdAt: string
// 	updatedAt: string
// 	orgName: ResponseLanguage
// 	roleName: ResponseLanguage
// 	responsibleProvinceName: ResponseLanguage
// 	responsibleDistrictName: ResponseLanguage
// 	flagStatusName: ResponseLanguage
// }

export interface GetUmDtoOut {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: string
	orgCode: string
	role: string
	responsibleProvinceCode: any
	responsibleDistrictCode: any
	flagStatus: string
	createdAt: string
	updatedAt: string
}

export interface PostUploadFilesDtoOut {
	download_file_url: string
}

export interface GetProfileDtoOut {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: string
	orgCode: string
	role: string
	responsibleProvinceCode: any
	responsibleDistrictCode: any
	orgName: ResponseLanguage
	roleName: ResponseLanguage
	responsibleProvinceName: ResponseLanguage
	responsibleDistrictName: ResponseLanguage
	flagStatusName: ResponseLanguage
	flagStatus: string
}

export interface PutProfileDtoOut {
	id: string
}

export interface GetSearchUMDtoOut extends GetProfileDtoOut {
	flagStatus: string
}

export interface PatchStatusDtoOut {
	id: string
}

export interface DeleteProfileDtoOut {
	id: string
}

export interface PutProfileUMDtoOut extends PutProfileDtoOut {}

export interface PostProfileUMDtoOut {
	id: string
}

export interface GetTemplateCSVUMDtoOut {
	blob: Blob | MediaSource
}

export interface GetTemplateXLSXUMDtoOut extends GetTemplateCSVUMDtoOut {}

export interface PostImportCSVUMDtoOut {
	firstName: string
	lastName: string
	email: string
	role: string
	orgCode: string
	rowNo: number
	success: boolean
	result: string
}

export interface PostImportXLSXUMDtoOut extends PostImportCSVUMDtoOut {}

export interface PostImportErrorDtoOut {
	firstName: string
	lastName: string
	email: string
	orgCode: string
	result: string
	role: string
	rowNo: number
	success: boolean
}

export interface PostImportCSVErrorDtoOut extends PostImportErrorDtoOut {}

export interface PostImportXLSXErrorDtoOut extends PostImportErrorDtoOut {}
