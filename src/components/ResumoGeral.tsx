'use client';

import { TrendingUp, TrendingDown, DollarSign, Target, BarChart3, PiggyBank } from 'lucide-react';

interface ResumoProps {
  investimento: number;
  retorno: number;
  roi: number;
  totalConversoes: number;
  custoPorConversao: number;
  periodo: string;
}

export default function ResumoGeral({ 
  investimento, 
  retorno, 
  roi, 
  totalConversoes, 
  custoPorConversao,
  periodo 
}: ResumoProps) {
  const lucro = retorno - investimento;
  const isPositivo = lucro > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
      {/* Investimento Total */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Investimento Total</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              R$ {investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <PiggyBank className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">{periodo}</p>
      </div>

      {/* Retorno / Receita */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Retorno (Receita)</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              R$ {retorno.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-green-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
        </div>
        <div className="flex items-center mt-3">
          {isPositivo ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm ${isPositivo ? 'text-green-600' : 'text-red-600'}`}>
            {isPositivo ? '+' : ''}R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} de lucro
          </span>
        </div>
      </div>

      {/* ROI */}
      <div className={`rounded-xl shadow-md p-6 border-l-4 ${isPositivo ? 'bg-gradient-to-r from-green-50 to-white border-green-600' : 'bg-gradient-to-r from-red-50 to-white border-red-600'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">ROI (Retorno sobre Investimento)</p>
            <p className={`text-3xl font-bold mt-1 ${isPositivo ? 'text-green-600' : 'text-red-600'}`}>
              {roi.toFixed(0)}%
            </p>
          </div>
          <div className={`p-3 rounded-full ${isPositivo ? 'bg-green-100' : 'bg-red-100'}`}>
            <BarChart3 className={`w-6 h-6 ${isPositivo ? 'text-green-600' : 'text-red-600'}`} />
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          Para cada R$ 1,00 investido, retornou R$ {(roi / 100 + 1).toFixed(2)}
        </p>
      </div>

      {/* Total de Conversões */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Total de Conversões</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              {totalConversoes.toLocaleString('pt-BR')}
            </p>
          </div>
          <div className="bg-purple-100 p-3 rounded-full">
            <Target className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Leads / Vendas geradas</p>
      </div>

      {/* Custo por Conversão */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Custo por Conversão</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              R$ {custoPorConversao.toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <Target className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Quanto custou cada resultado</p>
      </div>

      {/* Lucro Líquido */}
      <div className={`rounded-xl shadow-md p-6 border-l-4 ${isPositivo ? 'border-emerald-600 bg-gradient-to-br from-emerald-50 to-white' : 'border-red-600 bg-gradient-to-br from-red-50 to-white'}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Lucro Líquido</p>
            <p className={`text-2xl font-bold mt-1 ${isPositivo ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className={`p-3 rounded-full ${isPositivo ? 'bg-emerald-100' : 'bg-red-100'}`}>
            {isPositivo ? (
              <TrendingUp className="w-6 h-6 text-emerald-600" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-600" />
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Receita - Investimento</p>
      </div>
    </div>
  );
}
