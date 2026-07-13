'use client';

import { Calendar, Filter } from 'lucide-react';

interface FiltrosProps {
  meses: string[];
  mesSelecionado: string;
  onMesChange: (mes: string) => void;
  plataformaSelecionada: 'all' | 'google' | 'meta';
  onPlataformaChange: (plataforma: 'all' | 'google' | 'meta') => void;
}

export default function Filtros({
  meses,
  mesSelecionado,
  onMesChange,
  plataformaSelecionada,
  onPlataformaChange,
}: FiltrosProps) {
  const formatMonth = (month: string) => {
    const [year, m] = month.split('-');
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return `${months[parseInt(m) - 1]} ${year}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex flex-wrap items-center gap-4">
        {/* Filtro de Período */}
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-600">Período:</label>
          <select
            value={mesSelecionado}
            onChange={(e) => onMesChange(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Todos os meses</option>
            {meses.map((mes) => (
              <option key={mes} value={mes}>
                {formatMonth(mes)}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Plataforma */}
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-600">Plataforma:</label>
          <div className="flex gap-2">
            <button
              onClick={() => onPlataformaChange('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                plataformaSelecionada === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onPlataformaChange('google')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                plataformaSelecionada === 'google'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Google Ads
            </button>
            <button
              onClick={() => onPlataformaChange('meta')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                plataformaSelecionada === 'meta'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
