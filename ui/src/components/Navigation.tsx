/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function Navigation() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/', current: location.pathname === '/' },
    { name: 'Políticas', href: '/policies', current: location.pathname === '/policies' },
    { name: 'Marketplace', href: '/marketplace', current: location.pathname === '/marketplace' },
  ];

  // Adicionar links específicos baseados na role
  if (user?.role === 'admin') {
    navigation.push({
      name: 'Admin Panel',
      href: '/admin',
      current: location.pathname === '/admin'
    });
  }

  // Adicionar link do tenant para usuários não-admin
  if (user?.role !== 'admin') {
    navigation.push({
      name: 'Meu Plano',
      href: '/tenant',
      current: location.pathname === '/tenant'
    });
  }

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-gray-900">AGF</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    item.current
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user.email}
                </span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
                <button
                  onClick={logout}
                  className="text-gray-500 hover:text-gray-700 text-sm"
                >
                  Sair
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
