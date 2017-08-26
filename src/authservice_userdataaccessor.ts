export interface UserInfo
{
    uuid: string;
    
    username: string;
    password: string;

    firstName: string;
    lastName: string;
}

interface UserError {
    errorMessage: string;
}

export type UserDataResponse = Partial<{
    sessionId: string;
    userInfo: UserInfo;
    lastError: UserError;
}>; 


export interface AuthResponse {
    errorCode: AuthErrorCode;
    errorMessage: string;
    userUuid: string;
}

export enum AuthErrorCode {
    SYSTEM_ERROR = -2,
    INVALID_CREDENTIALS = -1,
    OK = 0
}

export interface AuthIdentity {
    username: string;
    password: string;
    uuid?: string
}

export default abstract class UserDataAccessor {
    abstract addUser(identity: AuthIdentity): Promise<AuthResponse>;
    abstract loginUser(username: string, password: string): Promise<AuthResponse>;
}