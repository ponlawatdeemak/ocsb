import UserAccount from "./UserAccount";

export default interface UserAccountResponse {
    data?: UserAccount;
    message: string;
}
