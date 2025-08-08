/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppRoutes from './AppRoutes';
import Navigation from './components/Navigation';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main>
            <AppRoutes />
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
