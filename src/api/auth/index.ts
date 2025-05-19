import { api } from '@/api/core'
import { ResponseDto } from '@/api/interface'
import { LoginGuestDtoOut } from './dto-out.dto'

const auth = {
	loginGuest: async (): Promise<ResponseDto<LoginGuestDtoOut>> => await api.post('/auth/login/guest', {}),
}

export default auth
