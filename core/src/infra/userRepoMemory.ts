/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

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
