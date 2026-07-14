'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import clientesData from '@/data/clientes.json';
import car13Data from '@/data/car13.json';

const dadosClientes: Record<string, any> = {
  car13: car13Data,
};

export default function AdminDashboard() {
  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { agency, clients } = clientesData;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{agency.name}</h1>
              <p className="text-blue-200 text-sm mt-1">Painel de Controle - Relatórios</p>
            </div>
            <a
              href={agency.site}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-200 hover:text-white underline"
            >
              {agency.site}
            </a>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Agency Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Total de Clientes</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{clients.length}</p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Clientes Ativos</p>
            <p className="text-3xl font-bold text-green-600 mt-1">
              {clients.filter(c => c.active).length}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Investimento Total (mês)</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              R$ {clients.reduce((acc, c) => acc + (c.monthlyInvestment || 0), 0).toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
            <p className="text-sm text-gray-500">Plataformas</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">Google + Meta</p>
          </div>
        </div>

        {/* Clients List */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Clientes</h2>
        <div className="grid gap-4">
          {clients.map((client) => {
            const data = dadosClientes[client.slug];
            const lastMonth = data?.monthlyData?.[data.monthlyData.length - 1];
            
            return (
              <div key={client.slug} className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Client Info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-gray-900">{client.company}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {client.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Desde {client.since} • Última atualização: {client.lastUpdate}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {client.platforms.map((p) => (
                        <span key={p} className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          p === 'google' ? 'bg-blue-100 text-blue-700' : 'bg-indigo-100 text-indigo-700'
                        }`}>
                          {p === 'google' ? 'Google Ads' : 'Meta Ads'}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Last Month Stats */}
                  {lastMonth && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500">Investimento</p>
                        <p className="font-semibold text-gray-800">
                          R$ {lastMonth.total.investment.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">Retorno</p>
                        <p className="font-semibold text-green-600">
                          R$ {lastMonth.total.revenue.toLocaleString('pt-BR')}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500">ROI</p>
                        <p className={`font-semibold ${
                          lastMonth.total.roi > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {lastMonth.total.roi.toFixed(0)}%
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/${client.slug}`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      Ver relatório →
                    </Link>
                    <button
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                      onClick={() => {
                        const url = origin + '/' + client.slug;
                        const texto = encodeURIComponent(
                          `📊 *Relatório ${client.company}*\n\nAcesse o dashboard completo:\n${url}`
                        );
                        window.open(`https://wa.me/?text=${texto}`, '_blank');
                      }}
                    >
                      📲 Compartilhar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ações Rápidas</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left">
              <p className="font-medium text-gray-700">+ Adicionar Cliente</p>
              <p className="text-sm text-gray-500 mt-1">Criar relatório para novo cliente</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left">
              <p className="font-medium text-gray-700">📥 Importar Dados</p>
              <p className="text-sm text-gray-500 mt-1">Importar CSV do Google/Meta Ads</p>
            </button>
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
              <p className="font-medium text-gray-700">📊 Exportar Relatório</p>
              <p className="text-sm text-gray-500 mt-1">Gerar PDF para todos os clientes</p>
            </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p>M4 Marketing Digital • Dashboard interno</p>
          <p className="mt-1">Acesso restrito à equipe M4</p>
        </footer>
      </div>
    </div>
  );
}
