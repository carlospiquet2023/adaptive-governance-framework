import { User } from '../core/user';

export class UserRepoMemory {
  private users: User[] = [
    {
      id: '1',
      username: 'admin',
      passwordHash: '$2b$12$...', // hash de 'admin'
      role: 'admin',
      permissions: ['manage:all'],
    },
    // ... outros usuários
  ];

  async findByUsername(username: string) {
    return this.users.find(u => u.username === username);
  }
}
