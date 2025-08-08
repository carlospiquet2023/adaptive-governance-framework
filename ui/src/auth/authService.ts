import api from '../services/api';

export async function loginUser(
  username: string,
  password: string,
): Promise<string> {
  const response = await api.post('/auth/login', { username, password });
  return response.data.token;
}
