import React, { useEffect, useState } from 'react';
import api from '../services/api';

export default function Dashboard() {
  const [status, setStatus] = useState<string>('Carregando...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/')
      .then(() => setStatus('Core online e integrado!'))
      .catch(() => setError('Não foi possível conectar ao core.'));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{status}</p>}
      <p>Bem-vindo ao painel do Adaptive Governance Framework.</p>
    </div>
  );
}
