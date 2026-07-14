'use client';

import { TrendingUp, TrendingDown, PiggyBank, Target, DollarSign, MousePointerClick } from 'lucide-react';

interface VariacaoProps {
  valor: number;
  positivo?: boolean; // se maior é melhor (ex: conversões) ou menor é melhor (ex: CPA)
}

function VariacaoBadge({ valor, positivo = true }: VariacaoProps) {
  if (valor === 0) return null;
  
  const isPositive = positivo ? valor > 0 : valor < 0;

  return (
    <span className={`inline-flex items-center text-xs font-medium ml-2 ${
      isPositive ? 'text-green-600' : 'text-red-600'
    }`}>
      {isPositive ? (
        <TrendingUp className="w-3 h-3 mr-0.5" />
      ) : (
        <TrendingDown className="w-3 h-3 mr-0.5" />
      )}
      {Math.abs(valor).toFixed(1)}%
    </span>
  );
}

interface ResumoProps {
  investimento: number;
  totalConversoes: number;
  custoPorConversao: number;
  periodo: string;
  comparativo?: {
    investimento: number;
    conversoes: number;
    custoPorConversao: number;
  };
}

export default function ResumoGeral({ 
  investimento, 
  totalConversoes, 
  custoPorConversao,
  periodo,
  comparativo
}: ResumoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* Investimento Total */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-600">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Investimento Total</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              R$ {investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-blue-100 p-3 rounded-full">
            <PiggyBank className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <p className="text-xs text-gray-400">{periodo}</p>
          {comparativo && (
            <VariacaoBadge valor={comparativo.investimento} />
          )}
        </div>
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
            <MousePointerClick className="w-6 h-6 text-purple-600" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <p className="text-xs text-gray-400">Leads / Clientes gerados</p>
          {comparativo && (
            <VariacaoBadge valor={comparativo.conversoes} />
          )}
        </div>
      </div>

      {/* Custo por Conversão (CPA) */}
      <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 font-medium">Custo por Conversão (CPA)</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">
              R$ {custoPorConversao.toFixed(2)}
            </p>
          </div>
          <div className="bg-orange-100 p-3 rounded-full">
            <DollarSign className="w-6 h-6 text-orange-500" />
          </div>
        </div>
        <div className="flex items-center mt-2">
          <p className="text-xs text-gray-400">
            {custoPorConversao > 0 
              ? `Quanto custou cada lead`
              : totalConversoes === 0 
                ? 'Nenhuma conversão no período'
                : 'Calculando...'}
          </p>
          {comparativo && (
            <VariacaoBadge valor={comparativo.custoPorConversao} positivo={false} />
          )}
        </div>
      </div>
    </div>
  );
}
