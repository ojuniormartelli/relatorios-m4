'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

interface MonthlyData {
  month: string;
  investment: number;
  conversions: number;
}

interface GraficoProps {
  data: MonthlyData[];
  title: string;
}

// Verifica se o valor está no formato de dia (dd/MM) ou mês (YYYY-MM)
function isFormatoDia(value: string): boolean {
  return value.includes('/');
}

function isFormatoMes(value: string): boolean {
  return value.includes('-') && value.length >= 7;
}

export default function GraficoEvolucao({ data, title }: GraficoProps) {
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;
  
  // Formatter do eixo X — funciona para dia (dd/MM) e mês (YYYY-MM)
  const tickFormatter = (value: string) => {
    if (!value) return '';
    if (isFormatoDia(value)) {
      // formato dd/MM — já está legível
      return value;
    }
    if (isFormatoMes(value)) {
      const [year, month] = value.split('-');
      const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      const m = parseInt(month);
      return months[m - 1] || value;
    }
    return value;
  };

  // Formatter do label do tooltip
  const labelFormatter = (label: any) => {
    const value = String(label);
    if (!value) return '';
    if (isFormatoDia(value)) {
      return value;
    }
    if (isFormatoMes(value)) {
      const [year, month] = value.split('-');
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const m = parseInt(month);
      return `${months[m - 1]} ${year}`;
    }
    return value;
  };

  // Formatter do label dos cards de resumo
  const cardLabel = (value: string) => {
    if (!value) return '';
    if (isFormatoDia(value)) {
      return `Dia ${value}`;
    }
    if (isFormatoMes(value)) {
      const [year, month] = value.split('-');
      const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
      const m = parseInt(month);
      return `${months[m - 1]} ${year}`;
    }
    return value;
  };

  // Se houver muitos pontos (gráfico diário), não mostrar os cards de resumo
  const mostrarCards = data.length <= 8;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {/* Gráfico de Barras - Investimento */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Investimento</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              tickFormatter={tickFormatter}
              interval={data.length > 20 ? Math.floor(data.length / 15) : 0}
            />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              labelFormatter={labelFormatter}
            />
            <Legend />
            <Bar 
              dataKey="investment" 
              name="Investimento" 
              fill="#3B82F6" 
              radius={[4, 4, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de Linha - Conversões */}
      <div>
        <h4 className="text-sm font-medium text-gray-600 mb-3">Evolução de Conversões</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }}
              tickFormatter={tickFormatter}
              interval={data.length > 20 ? Math.floor(data.length / 15) : 0}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`${value} conversões`, 'Conversões']}
              labelFormatter={labelFormatter}
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Card de resumo - apenas quando poucos pontos (mensal) */}
      {mostrarCards && (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.map((item) => {
            const cpa = item.conversions > 0 
              ? (item.investment / item.conversions).toFixed(2) 
              : '—';
            return (
              <div key={item.month} className="bg-gray-50 rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-700">{cardLabel(item.month)}</p>
                <div className="flex justify-between mt-1 text-gray-600">
                  <span>Investimento:</span>
                  <span className="font-medium">R$ {item.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Conversões:</span>
                  <span className="font-medium">{item.conversions}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>CPA:</span>
                  <span className="font-medium">{cpa !== '—' ? `R$ ${cpa}` : cpa}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
