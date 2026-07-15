'use client';

import { Calendar, Filter } from 'lucide-react';

export type TipoPeriodo =
  | 'mes_atual'
  | 'mes_passado'
  | '7dias'
  | '15dias'
  | '30dias'
  | 'personalizado';

interface FiltrosProps {
  periodoSelecionado: TipoPeriodo;
  onPeriodoChange: (periodo: TipoPeriodo) => void;
  dataInicio?: string;
  dataFim?: string;
  onDataInicioChange: (data: string) => void;
  onDataFimChange: (data: string) => void;
  plataformaSelecionada: 'all' | 'google' | 'meta';
  onPlataformaChange: (plataforma: 'all' | 'google' | 'meta') => void;
}

const OPCOES_PERIODO: { value: TipoPeriodo; label: string }[] = [
  { value: 'mes_atual', label: 'Mês atual' },
  { value: 'mes_passado', label: 'Mês passado' },
  { value: '7dias', label: 'Últimos 7 dias' },
  { value: '15dias', label: 'Últimos 15 dias' },
  { value: '30dias', label: 'Últimos 30 dias' },
  { value: 'personalizado', label: 'Período personalizado' },
];

export default function Filtros({
  periodoSelecionado,
  onPeriodoChange,
  dataInicio,
  dataFim,
  onDataInicioChange,
  onDataFimChange,
  plataformaSelecionada,
  onPlataformaChange,
}: FiltrosProps) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filtro de Período */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={periodoSelecionado}
            onChange={(e) => onPeriodoChange(e.target.value as TipoPeriodo)}
            className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {OPCOES_PERIODO.map((op) => (
              <option key={op.value} value={op.value}>
                {op.label}
              </option>
            ))}
          </select>
        </div>

        {/* Datas personalizadas */}
        {periodoSelecionado === 'personalizado' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <label className="text-sm text-gray-600">De:</label>
              <input
                type="date"
                value={dataInicio || ''}
                onChange={(e) => onDataInicioChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-1">
              <label className="text-sm text-gray-600">Até:</label>
              <input
                type="date"
                value={dataFim || ''}
                onChange={(e) => onDataFimChange(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Filtro de Plataforma */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">Plataforma:</label>
          <div className="flex gap-2">
            <button
              onClick={() => onPlataformaChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                plataformaSelecionada === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onPlataformaChange('google')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                plataformaSelecionada === 'google'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Google Ads
            </button>
            <button
              onClick={() => onPlataformaChange('meta')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                plataformaSelecionada === 'meta'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Meta Ads
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
