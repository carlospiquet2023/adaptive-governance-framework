export interface User {
    id: string;
    username: string;
    passwordHash: string;
    role: 'admin' | 'user';
    permissions: string[];
}
