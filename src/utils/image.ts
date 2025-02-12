import { IMG_PATH } from '../../webapp.config'

export const getUserImage = (userId: string) => {
	return `${IMG_PATH}/${userId}`
}
