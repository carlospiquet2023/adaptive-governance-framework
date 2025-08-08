import React, { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { loginUser } from '../auth/authService';
import { Button, TextField, Box, Typography, Alert } from '@mui/material';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = await loginUser(username, password);
      login(token);
    } catch {
      setError('Usuário ou senha inválidos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      maxWidth={360}
      mx="auto"
      mt={8}
      p={4}
      bgcolor="#fff"
      borderRadius={2}
      boxShadow={2}
    >
      <Typography variant="h5" mb={2}>
        Login
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>
    </Box>
  );
}
