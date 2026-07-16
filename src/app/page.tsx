'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Check, Copy, ExternalLink, Share2, Users, TrendingUp, DollarSign, BarChart3, Shield, RefreshCw, LogOut } from 'lucide-react';
import clientesData from '@/data/clientes.json';

export default function AdminDashboard() {
  const [origin, setOrigin] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const { agency, clients } = clientesData;
  const activeClients = clients.filter(c => c.active);

  const copyToClipboard = async (url: string, id: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const shareWhatsApp = (company: string, url: string) => {
    const texto = encodeURIComponent(
      `📊 *Relatório ${company}*\n\nAcesse o dashboard completo com gráficos e dados de performance:\n${url}`
    );
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-blue-200" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight">{agency.name}</h1>
                <p className="text-blue-200 text-sm mt-0.5">Painel de Relatórios</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={agency.site}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {agency.site.replace('https://', '')}
              </a>
              <a
                href="/logout"
                className="flex items-center gap-1.5 text-sm text-blue-200 hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </a>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Clientes</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{activeClients.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2.5 rounded-lg">
                <Shield className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">URL Segura</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">ID único</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Plataformas</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">Google + Meta</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-lg">
                <RefreshCw className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Auto-Update</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">Diário</p>
              </div>
            </div>
          </div>
        </div>

        {/* Título da lista */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-gray-800">Relatórios dos Clientes</h2>
          <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border border-gray-200">
            {activeClients.length} {activeClients.length === 1 ? 'relatório' : 'relatórios'}
          </span>
        </div>

        {/* Lista de Clientes */}
        <div className="grid gap-4">
          {activeClients.map((client) => {
            const reportUrl = `${origin}/${client.id}`;
            const isCopied = copiedId === client.id;

            return (
              <div
                key={client.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all hover:border-blue-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Info do cliente */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg font-semibold text-gray-900">{client.company}</h3>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {client.active ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Desde {client.since} • {client.platforms.length} plataforma{client.platforms.length > 1 ? 's' : ''}
                    </p>
                    
                    {/* URL do relatório */}
                    <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2 border border-gray-200 max-w-md">
                      <code className="text-xs text-gray-600 font-mono truncate flex-1">
                        {reportUrl}
                      </code>
                      <button
                        onClick={() => copyToClipboard(reportUrl, client.id)}
                        className={`flex-shrink-0 p-1.5 rounded-md transition-all ${
                          isCopied
                            ? 'bg-green-100 text-green-600'
                            : 'bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                        title="Copiar link"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/${client.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir
                    </Link>
                    <button
                      onClick={() => shareWhatsApp(client.company, reportUrl)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <Share2 className="w-4 h-4" />
                      Compartilhar
                    </button>
                  </div>
                </div>

                {/* Plataformas */}
                <div className="mt-3 flex items-center gap-2">
                  {client.platforms.map((p) => (
                    <span
                      key={p}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium ${
                        p === 'google'
                          ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
                          : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
                      }`}
                    >
                      <DollarSign className="w-3 h-3" />
                      {p === 'google' ? 'Google Ads' : 'Meta Ads'}
                    </span>
                  ))}
                  <span className="text-xs text-gray-400 ml-1">
                    ID: <code className="font-mono text-gray-500">{client.id}</code>
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Rodapé */}
        <footer className="mt-10 text-center border-t border-gray-200 pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-400">
            <span>{agency.name}</span>
            <span className="hidden sm:inline">•</span>
            <span>Links com IDs únicos • Clientes não veem outros relatórios</span>
            <span className="hidden sm:inline">•</span>
            <span>Dados atualizados automaticamente</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
