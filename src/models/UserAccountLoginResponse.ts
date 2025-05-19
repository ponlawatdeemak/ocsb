import UserAccountResponse from "./UserAccountResponse";
import UserTokens from "./UserTokens";

export default interface UserAccountLoginResponse extends UserAccountResponse {
    tokens?: UserTokens;
}
