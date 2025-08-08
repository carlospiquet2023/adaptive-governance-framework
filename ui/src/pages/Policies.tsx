/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Box, Typography, Paper } from '@mui/material';
import { Bar } from 'react-chartjs-2';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export default function Policies() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/policies')
      .then((res) => setData(res.data))
      .catch(() => setError('Erro ao buscar políticas.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;

  // Exemplo de dados para gráfico
  const chartData = {
    labels: data.map((p: any) => p.name || p.policyName || 'Política'),
    datasets: [
      {
        label: 'Valor',
        data: data.map((p: any) => p.value || 0),
        backgroundColor: '#1976d2',
      },
    ],
  };

  return (
    <Box>
      <Typography variant="h4" mb={2}>
        Políticas
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <Bar data={chartData} />
      </Paper>
      {/* Aqui pode ser adicionado CRUD visual de políticas */}
    </Box>
  );
}
