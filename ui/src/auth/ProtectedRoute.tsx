/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface ProtectedRouteProps {
  children: JSX.Element;
  requiredRole?: string;
}

export default function ProtectedRoute({
  children,
  requiredRole
}: ProtectedRouteProps) {
  const { token, user } = useAuth();
  
  if (!token) return <Navigate to="/login" replace />;

  // Verificar role se especificado
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Acesso Negado</h1>
          <p className="text-gray-600">Você não tem permissão para acessar esta página.</p>
          <p className="text-sm text-gray-500 mt-2">
            Role necessária: {requiredRole} | Sua role: {user?.role || 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  return children;
}
