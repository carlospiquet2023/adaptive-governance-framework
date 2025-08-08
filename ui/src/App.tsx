import React from 'react';
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
      <header style={{ background: '#222', color: '#fff', padding: 16 }}>
        <h1 style={{ margin: 0 }}>Adaptive Governance Framework</h1>
      </header>
      <main style={{ padding: 32 }}>
        <AppRoutes />
      </main>
    </div>
  );
}
