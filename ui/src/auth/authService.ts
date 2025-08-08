/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import api from '../services/api';

export async function loginUser(
  username: string,
  password: string,
): Promise<string> {
  const response = await api.post('/auth/login', { username, password });
  return response.data.token;
}
