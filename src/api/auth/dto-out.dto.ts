import UserAccountResponse from '@/models/UserAccountResponse'
import UserTokens from '@/models/UserTokens'

export interface LoginGuestDtoOut extends UserAccountResponse {
	tokens?: UserTokens
}
