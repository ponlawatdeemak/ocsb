export interface AlertInfoType {
	open: boolean
	severity: 'success' | 'error'
	message: string
}

export interface FormValues {
	id: string
	username: string
	firstName: string
	lastName: string
	email: string
	image: File | string
	orgCode: string
	role: string
	responsibleProvinceCode: string
	responsibleDistrictCode: string
}
