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
  revenue: number;
  conversions: number;
}

interface GraficoProps {
  data: MonthlyData[];
  title: string;
}

export default function GraficoEvolucao({ data, title }: GraficoProps) {
  const formatCurrency = (value: number) => `R$ ${(value / 1000).toFixed(1)}k`;

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      
      {/* Gráfico de Barras - Investimento vs Retorno */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-600 mb-3">Investimento vs Retorno</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
                return months[parseInt(month) - 1];
              }}
            />
            <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
              labelFormatter={(label) => {
                const [year, month] = String(label).split('-');
                const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
                return `${months[parseInt(month) - 1]} ${year}`;
              }}
            />
            <Legend />
            <Bar dataKey="investment" name="Investimento" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="revenue" name="Retorno" fill="#10B981" radius={[4, 4, 0, 0]} />
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
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];
                return months[parseInt(month) - 1];
              }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [`${value} conversões`, 'Conversões']}
              labelFormatter={(label) => {
                const [year, month] = String(label).split('-');
                const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'];
                return `${months[parseInt(month) - 1]} ${year}`;
              }}
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
    </div>
  );
}
