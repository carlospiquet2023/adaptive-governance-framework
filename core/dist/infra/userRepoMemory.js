"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepoMemory = void 0;
class UserRepoMemory {
    users = [
        {
            id: '1',
            username: 'admin',
            passwordHash: '$2b$12$...', // hash de 'admin'
            role: 'admin',
            permissions: ['manage:all'],
        },
        // ... outros usuários
    ];
    async findByUsername(username) {
        return this.users.find(u => u.username === username);
    }
}
exports.UserRepoMemory = UserRepoMemory;
//# sourceMappingURL=userRepoMemory.js.map