/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  ownerId: string;
  planId: string;
  status: 'active' | 'suspended' | 'cancelled';
  createdAt: string;
  settings: {
    timezone: string;
    branding?: object;
  };
  usage?: {
    decisionsCount: number;
    policiesCount: number;
    modelsCount: number;
  };
  subscription?: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
  };
}

interface AdminStats {
  totalTenants: number;
  activeTenants: number;
  suspendedTenants: number;
  totalRevenue: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
}

export default function AdminDashboard() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Carregar tenants
      const tenantsResponse = await apiClient.get('/api/admin/tenants');
      setTenants(tenantsResponse.data);

      // Calcular estatísticas
      const totalTenants = tenantsResponse.data.length;
      const activeTenants = tenantsResponse.data.filter((t: Tenant) => t.status === 'active').length;
      const suspendedTenants = tenantsResponse.data.filter((t: Tenant) => t.status === 'suspended').length;
      
      setStats({
        totalTenants,
        activeTenants,
        suspendedTenants,
        totalRevenue: 50000, // Mock - integrar com billing real
        monthlyRecurringRevenue: 15000,
        churnRate: 2.5
      });
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const suspendTenant = async (tenantId: string) => {
    try {
      await apiClient.put(`/api/admin/tenants/${tenantId}/suspend`);
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao suspender tenant:', error);
      alert('Erro ao suspender tenant');
    }
  };

  const reactivateTenant = async (tenantId: string) => {
    try {
      await apiClient.put(`/api/admin/tenants/${tenantId}/reactivate`);
      await loadDashboardData();
    } catch (error) {
      console.error('Erro ao reativar tenant:', error);
      alert('Erro ao reativar tenant');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPlanBadge = (planId: string) => {
    switch (planId) {
      case 'free': return 'bg-gray-100 text-gray-800';
      case 'pro': return 'bg-blue-100 text-blue-800';
      case 'enterprise': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard administrativo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard Administrativo</h1>
                <p className="text-sm text-gray-500">Adaptive Governance Framework - Super Admin</p>
              </div>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Criar Tenant
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">{stats?.totalTenants || 0}</div>
            <div className="text-sm text-gray-500">Total Tenants</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">{stats?.activeTenants || 0}</div>
            <div className="text-sm text-gray-500">Ativos</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-yellow-600">{stats?.suspendedTenants || 0}</div>
            <div className="text-sm text-gray-500">Suspensos</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-purple-600">R$ {stats?.totalRevenue?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-500">Receita Total</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-indigo-600">R$ {stats?.monthlyRecurringRevenue?.toLocaleString() || 0}</div>
            <div className="text-sm text-gray-500">MRR</div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">{stats?.churnRate || 0}%</div>
            <div className="text-sm text-gray-500">Churn Rate</div>
          </div>
        </div>

        {/* Tenants Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Gerenciamento de Tenants</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plano</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Uso</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Criado em</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{tenant.name}</div>
                        <div className="text-sm text-gray-500">{tenant.subdomain}.yourdomain.com</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadge(tenant.planId)}`}>
                        {tenant.planId.toUpperCase()}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tenant.usage ? (
                        <div>
                          <div>{tenant.usage.decisionsCount} decisões</div>
                          <div>{tenant.usage.policiesCount} políticas</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">Sem dados</span>
                      )}
                    </td>
                    
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(tenant.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedTenant(tenant)}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Detalhes
                        </button>
                        
                        {tenant.status === 'active' ? (
                          <button
                            onClick={() => suspendTenant(tenant.id)}
                            className="text-yellow-600 hover:text-yellow-900 text-sm"
                          >
                            Suspender
                          </button>
                        ) : (
                          <button
                            onClick={() => reactivateTenant(tenant.id)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Reativar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de detalhes do tenant */}
      {selectedTenant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Detalhes do Tenant: {selectedTenant.name}</h3>
              <button
                onClick={() => setSelectedTenant(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>ID:</strong> {selectedTenant.id}
              </div>
              <div>
                <strong>Subdomínio:</strong> {selectedTenant.subdomain}
              </div>
              <div>
                <strong>Owner ID:</strong> {selectedTenant.ownerId}
              </div>
              <div>
                <strong>Plano:</strong> {selectedTenant.planId}
              </div>
              <div>
                <strong>Status:</strong> {selectedTenant.status}
              </div>
              <div>
                <strong>Timezone:</strong> {selectedTenant.settings.timezone}
              </div>
            </div>
            
            {selectedTenant.subscription && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h4 className="font-medium mb-2">Informações de Assinatura</h4>
                <div className="text-sm space-y-1">
                  <div><strong>Status:</strong> {selectedTenant.subscription.status}</div>
                  <div><strong>Próxima cobrança:</strong> {new Date(selectedTenant.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}</div>
                  <div><strong>Cancelamento programado:</strong> {selectedTenant.subscription.cancelAtPeriodEnd ? 'Sim' : 'Não'}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
