export interface GetUMDtoIn {
	userId: string
}

export interface PostUMDtoIn {
	firstName: string
	lastName: string
	position: number
	region: number
	province: number
	phone: string
	email: string
	role: number
	regions: number[]
	isActive: boolean
}

export interface PutUMDtoIn extends GetUMDtoIn, PostUMDtoIn {}

export interface DeleteUMDtoIn extends GetUMDtoIn {}

export interface GetImageDtoIn extends GetUMDtoIn {}

export interface PostImageDtoIn extends GetUMDtoIn {
	file: File
}

export interface DeleteImageDtoIn extends GetUMDtoIn {}
