/*
 * Copyright (c) 2025 Carlos Antonio de Oliveira Piquet & Dougla de Pinho Reck dos Santos
 * Este arquivo faz parte de um sistema proprietário.
 * É ESTRITAMENTE PROIBIDO o uso, cópia ou distribuição sem permissão.
 * Violações estão sujeitas às penalidades da lei brasileira.
 * Para licenciamento: carlospiquet.projetos@gmail.com
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

interface TenantInfo {
  id: string;
  name: string;
  subdomain: string;
  planId: string;
  status: string;
  settings: {
    timezone: string;
    branding?: {
      logo?: string;
      primaryColor?: string;
      secondaryColor?: string;
    };
  };
  usage: {
    decisionsCount: number;
    policiesCount: number;
    modelsCount: number;
    pluginsCount: number;
  };
  limits: {
    maxDecisions: number;
    maxPolicies: number;
    maxModels: number;
    maxPlugins: number;
  };
  subscription?: {
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    planType: string;
  };
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

export default function TenantDashboard() {
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'settings'>('overview');

  useEffect(() => {
    loadTenantData();
    loadInvoices();
  }, []);

  const loadTenantData = async () => {
    try {
      const response = await apiClient.get('/api/saas/tenant');
      setTenant(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados do tenant:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      // Mock data - integrar com Stripe real
      setInvoices([
        {
          id: 'inv_001',
          date: '2025-01-01',
          amount: 29.00,
          status: 'paid',
          downloadUrl: '#'
        },
        {
          id: 'inv_002',
          date: '2025-02-01',
          amount: 29.00,
          status: 'pending'
        }
      ]);
    } catch (error) {
      console.error('Erro ao carregar faturas:', error);
    }
  };

  const updateTenantSettings = async (settings: Partial<TenantInfo['settings']>) => {
    try {
      await apiClient.put('/api/saas/tenant', { settings });
      await loadTenantData();
      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      alert('Erro ao atualizar configurações');
    }
  };

  const upgradePlan = async (planType: string) => {
    try {
      const response = await apiClient.post('/api/saas/billing/checkout', {
        planType,
        successUrl: `${window.location.origin}/success`,
        cancelUrl: `${window.location.origin}/cancel`
      });
      
      // Redirecionar para Stripe Checkout
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Erro ao iniciar upgrade:', error);
      alert('Erro ao iniciar processo de upgrade');
    }
  };

  const cancelSubscription = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso até o final do período atual.')) {
      return;
    }

    try {
      await apiClient.post('/api/saas/subscription/cancel', { immediately: false });
      await loadTenantData();
      alert('Assinatura cancelada com sucesso. Você manterá o acesso até o final do período atual.');
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      alert('Erro ao cancelar assinatura');
    }
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Ilimitado
    return Math.min((used / limit) * 100, 100);
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'text-gray-600';
      case 'pro': return 'text-blue-600';
      case 'enterprise': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro ao carregar dados do tenant</p>
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
                <h1 className="text-2xl font-bold text-gray-900">{tenant.name}</h1>
                <p className="text-sm text-gray-500">
                  <span className={`font-medium ${getPlanColor(tenant.planId)}`}>
                    Plano {tenant.planId.toUpperCase()}
                  </span> • {tenant.subdomain}.yourdomain.com
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                  Suporte
                </button>
                <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                  Upgrade
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', name: 'Visão Geral' },
              { id: 'billing', name: 'Faturamento' },
              { id: 'settings', name: 'Configurações' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Usage Stats */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Uso do Plano</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Decisões</span>
                    <span className="font-medium">
                      {tenant.usage.decisionsCount} / {tenant.limits.maxDecisions === -1 ? '∞' : tenant.limits.maxDecisions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.usage.decisionsCount, tenant.limits.maxDecisions))}`}
                      style={{ width: `${getUsagePercentage(tenant.usage.decisionsCount, tenant.limits.maxDecisions)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Políticas</span>
                    <span className="font-medium">
                      {tenant.usage.policiesCount} / {tenant.limits.maxPolicies === -1 ? '∞' : tenant.limits.maxPolicies}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.usage.policiesCount, tenant.limits.maxPolicies))}`}
                      style={{ width: `${getUsagePercentage(tenant.usage.policiesCount, tenant.limits.maxPolicies)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Modelos ML</span>
                    <span className="font-medium">
                      {tenant.usage.modelsCount} / {tenant.limits.maxModels === -1 ? '∞' : tenant.limits.maxModels}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.usage.modelsCount, tenant.limits.maxModels))}`}
                      style={{ width: `${getUsagePercentage(tenant.usage.modelsCount, tenant.limits.maxModels)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Plugins</span>
                    <span className="font-medium">
                      {tenant.usage.pluginsCount} / {tenant.limits.maxPlugins === -1 ? '∞' : tenant.limits.maxPlugins}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${getUsageColor(getUsagePercentage(tenant.usage.pluginsCount, tenant.limits.maxPlugins))}`}
                      style={{ width: `${getUsagePercentage(tenant.usage.pluginsCount, tenant.limits.maxPlugins)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Upgrade */}
            {tenant.planId === 'free' && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-medium mb-2">Upgrade para Pro</h3>
                <p className="text-blue-100 mb-4">
                  Desbloqueie funcionalidades avançadas, maior capacidade e suporte prioritário.
                </p>
                <button
                  onClick={() => upgradePlan('pro')}
                  className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-gray-100"
                >
                  Fazer Upgrade - R$ 29/mês
                </button>
              </div>
            )}

            {/* Subscription Status */}
            {tenant.subscription && (
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Status da Assinatura</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${
                      tenant.subscription.status === 'active' ? 'text-green-600' : 
                      tenant.subscription.status === 'cancelled' ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {tenant.subscription.status}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Próxima cobrança:</span>
                    <span className="font-medium">
                      {new Date(tenant.subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  
                  {tenant.subscription.cancelAtPeriodEnd && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cancelamento:</span>
                      <span className="font-medium text-red-600">Programado para fim do período</span>
                    </div>
                  )}
                </div>
                
                {!tenant.subscription.cancelAtPeriodEnd && (
                  <button
                    onClick={cancelSubscription}
                    className="mt-4 text-red-600 hover:text-red-800 text-sm"
                  >
                    Cancelar assinatura
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-8">
            {/* Current Plan */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Plano Atual</h2>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold ${getPlanColor(tenant.planId)}`}>
                    {tenant.planId.toUpperCase()}
                  </h3>
                  <p className="text-gray-600">
                    {tenant.planId === 'free' ? 'Gratuito' : 
                     tenant.planId === 'pro' ? 'R$ 29/mês' : 'R$ 199/mês'}
                  </p>
                </div>
                
                <div className="space-x-2">
                  {tenant.planId === 'free' && (
                    <>
                      <button
                        onClick={() => upgradePlan('pro')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Upgrade Pro
                      </button>
                      <button
                        onClick={() => upgradePlan('enterprise')}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                      >
                        Upgrade Enterprise
                      </button>
                    </>
                  )}
                  
                  {tenant.planId === 'pro' && (
                    <button
                      onClick={() => upgradePlan('enterprise')}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                    >
                      Upgrade Enterprise
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Invoices */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Histórico de Faturas</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {new Date(invoice.date).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          R$ {invoice.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {invoice.downloadUrl && (
                            <a
                              href={invoice.downloadUrl}
                              className="text-blue-600 hover:text-blue-900 text-sm"
                            >
                              Download
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-8">
            {/* Basic Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Configurações Básicas</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Organização
                  </label>
                  <input
                    type="text"
                    value={tenant.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">Entre em contato com o suporte para alterar</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subdomínio
                  </label>
                  <input
                    type="text"
                    value={tenant.subdomain}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  />
                  <p className="text-sm text-gray-500 mt-1">Sua URL: {tenant.subdomain}.yourdomain.com</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Timezone
                  </label>
                  <select
                    value={tenant.settings.timezone}
                    onChange={(e) => updateTenantSettings({ timezone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="America/Sao_Paulo">América/São Paulo</option>
                    <option value="America/New_York">América/Nova York</option>
                    <option value="Europe/London">Europa/Londres</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Branding Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Personalização</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={tenant.settings.branding?.primaryColor || '#3B82F6'}
                    onChange={(e) => updateTenantSettings({ 
                      branding: { 
                        ...tenant.settings.branding,
                        primaryColor: e.target.value 
                      }
                    })}
                    className="w-20 h-10 rounded border border-gray-300"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cor Secundária
                  </label>
                  <input
                    type="color"
                    value={tenant.settings.branding?.secondaryColor || '#6B7280'}
                    onChange={(e) => updateTenantSettings({ 
                      branding: { 
                        ...tenant.settings.branding,
                        secondaryColor: e.target.value 
                      }
                    })}
                    className="w-20 h-10 rounded border border-gray-300"
                  />
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white shadow rounded-lg p-6 border border-red-200">
              <h2 className="text-lg font-medium text-red-900 mb-4">Zona de Perigo</h2>
              
              <div className="space-y-4">
                <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                  Exportar todos os dados
                </button>
                
                <button className="block text-red-600 hover:text-red-800 text-sm font-medium">
                  Solicitar exclusão da conta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
