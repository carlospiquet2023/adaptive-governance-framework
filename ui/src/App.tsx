/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React from 'react';
import { Link } from 'react-router-dom';
import AppRoutes from './AppRoutes';

export default function App() {
  return (
    <div
      style={{
        fontFamily: 'sans-serif',
        minHeight: '100vh',
        background: '#f6f8fa',
      }}
    >
      <header style={{ background: '#222', color: '#fff', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>Adaptive Governance Framework</h1>
        <nav>
          <Link to="/" style={{ color: '#fff', textDecoration: 'none', marginRight: '1rem' }}>Dashboard</Link>
          <Link to="/policies" style={{ color: '#fff', textDecoration: 'none', marginRight: '1rem' }}>Políticas</Link>
          <Link to="/marketplace" style={{ color: '#fff', textDecoration: 'none' }}>Marketplace</Link>
        </nav>
      </header>
      <main style={{ padding: 32 }}>
        <AppRoutes />
      </main>
    </div>
  );
}
