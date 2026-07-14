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

export default function GraficoEvolucao({ data, title }: GraficoProps) {
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;
  const mesFormatter = (value: string) => {
    const [year, month] = value.split('-');
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return months[parseInt(month) - 1];
  };
  const mesLabelFormatter = (label: any) => {
    const [year, month] = String(label).split('-');
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[parseInt(month) - 1]} ${year}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {/* Gráfico de Barras - Investimento */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Investimento Mensal</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickFormatter={mesFormatter}
            />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              labelFormatter={mesLabelFormatter}
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
              tick={{ fontSize: 12 }}
              tickFormatter={mesFormatter}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`${value} conversões`, 'Conversões']}
              labelFormatter={mesLabelFormatter}
            />
            <Line 
              type="monotone" 
              dataKey="conversions" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Card de resumo - Investimento vs Conversões */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.map((item) => {
          const cpa = item.conversions > 0 
            ? (item.investment / item.conversions).toFixed(2) 
            : '—';
          return (
            <div key={item.month} className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="font-medium text-gray-700">{mesLabelFormatter(item.month)}</p>
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
    </div>
  );
}
