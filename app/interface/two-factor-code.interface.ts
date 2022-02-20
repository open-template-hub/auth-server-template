export interface TwoFactorCode {
    username: string;
    phoneNumber: string;
    code?: string;
    expiry?: string;
    languageCode?: string;
}