/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import { apiClient } from '../services/api';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro no login');
    }
  },

  async logout(): Promise<void> {
    // Implementar logout se necessário
    return Promise.resolve();
  }
};

export default authService;
