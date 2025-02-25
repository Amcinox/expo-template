interface User {
    id: string;
    email: string;
    name?: string;
}
interface CognitoUserPayload {
    sub: string;
    email: string;
    name?: string;
}