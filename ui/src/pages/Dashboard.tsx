/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React, { useEffect, useState } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
} from 'chart.js';
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

export default function Dashboard() {
  const [status, setStatus] = useState<string>('Carregando...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get('/')
      .then(() => setStatus('Core online e integrado!'))
      .catch(() => setError('Não foi possível conectar ao core.'));
  }, []);

  const barData = {
    labels: ['Política A', 'Política B', 'Política C', 'Política D', 'Política E'],
    datasets: [
      {
        label: 'Aplicações de Políticas',
        data: [12, 19, 3, 5, 2],
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const lineData = {
    labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
    datasets: [
      {
        label: 'Tendência de Conformidade',
        data: [65, 59, 80, 81, 56, 55],
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h2>Dashboard de Análise</h2>
      {error ? <p style={{ color: 'red' }}>{error}</p> : <p>{status}</p>}
      <p>Bem-vindo ao painel do Adaptive Governance Framework.</p>

      <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: '2rem' }}>
        <div style={{ width: '45%' }}>
          <h3>Aplicações de Políticas</h3>
          <Bar data={barData} />
        </div>
        <div style={{ width: '45%' }}>
          <h3>Tendência de Conformidade</h3>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
