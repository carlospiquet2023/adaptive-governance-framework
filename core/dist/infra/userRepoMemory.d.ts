import { User } from '../core/user';
export declare class UserRepoMemory {
    private users;
    findByUsername(username: string): Promise<User | undefined>;
}
