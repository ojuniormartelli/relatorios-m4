'use client';

import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ResumoGeral from './ResumoGeral';
import GraficoEvolucao from './GraficoEvolucao';
import TabelaCampanhas from './TabelaCampanhas';
import Filtros from './Filtros';

interface ClientData {
  client: {
    slug: string;
    name: string;
    company: string;
    logo: string;
    primaryColor: string;
    secondaryColor: string;
  };
  monthlyData: Array<{
    month: string;
    googleAds: {
      investment: number;
      conversions: number;
      revenue: number;
      costPerConversion: number;
    };
    metaAds: {
      investment: number;
      conversions: number;
      revenue: number;
      costPerConversion: number;
    };
    total: {
      investment: number;
      conversions: number;
      revenue: number;
      roi: number;
    };
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    platform: 'google' | 'meta';
    months: Array<{
      month: string;
      investment: number;
      conversions: number;
      revenue: number;
    }>;
  }>;
}

interface DashboardProps {
  data: ClientData;
}

export default function Dashboard({ data }: DashboardProps) {
  const [mesSelecionado, setMesSelecionado] = useState<string>('all');
  const [plataformaSelecionada, setPlataformaSelecionada] = useState<'all' | 'google' | 'meta'>('all');

  // Get available months
  const meses = useMemo(() => {
    return data.monthlyData.map((m) => m.month).sort().reverse();
  }, [data.monthlyData]);

  // Filter data based on selections
  const dadosFiltrados = useMemo(() => {
    let monthlyData = data.monthlyData;

    // Filter by month
    if (mesSelecionado !== 'all') {
      monthlyData = monthlyData.filter((m) => m.month === mesSelecionado);
    }

    // Calculate totals based on platform filter
    const totals = monthlyData.reduce(
      (acc, month) => {
        if (plataformaSelecionada === 'all' || plataformaSelecionada === 'google') {
          acc.investment += month.googleAds.investment;
          acc.conversions += month.googleAds.conversions;
          acc.revenue += month.googleAds.revenue;
        }
        if (plataformaSelecionada === 'all' || plataformaSelecionada === 'meta') {
          acc.investment += month.metaAds.investment;
          acc.conversions += month.metaAds.conversions;
          acc.revenue += month.metaAds.revenue;
        }
        return acc;
      },
      { investment: 0, conversions: 0, revenue: 0 }
    );

    const roi = totals.investment > 0 
      ? ((totals.revenue - totals.investment) / totals.investment) * 100 
      : 0;
    
    const costPerConversion = totals.conversions > 0 
      ? totals.investment / totals.conversions 
      : 0;

    return {
      ...totals,
      roi,
      costPerConversion,
    };
  }, [data.monthlyData, mesSelecionado, plataformaSelecionada]);

  // Prepare chart data
  const chartData = useMemo(() => {
    let monthlyData = data.monthlyData;

    if (mesSelecionado !== 'all') {
      monthlyData = monthlyData.filter((m) => m.month === mesSelecionado);
    }

    return monthlyData.map((month) => {
      let investment = 0;
      let revenue = 0;
      let conversions = 0;

      if (plataformaSelecionada === 'all' || plataformaSelecionada === 'google') {
        investment += month.googleAds.investment;
        revenue += month.googleAds.revenue;
        conversions += month.googleAds.conversions;
      }
      if (plataformaSelecionada === 'all' || plataformaSelecionada === 'meta') {
        investment += month.metaAds.investment;
        revenue += month.metaAds.revenue;
        conversions += month.metaAds.conversions;
      }

      return { month: month.month, investment, revenue, conversions };
    });
  }, [data.monthlyData, mesSelecionado, plataformaSelecionada]);

  // Filter campaigns by platform
  const campanhasFiltradas = useMemo(() => {
    if (plataformaSelecionada === 'all') {
      return data.campaigns;
    }
    return data.campaigns.filter((c) => c.platform === plataformaSelecionada);
  }, [data.campaigns, plataformaSelecionada]);

  // Format period label
  const periodoLabel = useMemo(() => {
    if (mesSelecionado === 'all') {
      const firstMonth = meses[meses.length - 1];
      const lastMonth = meses[0];
      return `Período: ${format(new Date(firstMonth + '-01'), 'MMM/yyyy', { locale: ptBR })} a ${format(new Date(lastMonth + '-01'), 'MMM/yyyy', { locale: ptBR })}`;
    }
    return `Período: ${format(new Date(mesSelecionado + '-01'), 'MMMM yyyy', { locale: ptBR })}`;
  }, [mesSelecionado, meses]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{data.client.company}</h1>
              <p className="text-sm text-gray-500 mt-1">Relatório de Performance - Marketing Digital</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Última atualização</p>
              <p className="text-sm font-medium text-gray-900">
                {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Filtros
          meses={meses}
          mesSelecionado={mesSelecionado}
          onMesChange={setMesSelecionado}
          plataformaSelecionada={plataformaSelecionada}
          onPlataformaChange={setPlataformaSelecionada}
        />

        {/* Summary Cards */}
        <ResumoGeral
          investimento={dadosFiltrados.investment}
          retorno={dadosFiltrados.revenue}
          roi={dadosFiltrados.roi}
          totalConversoes={dadosFiltrados.conversions}
          custoPorConversao={dadosFiltrados.costPerConversion}
          periodo={periodoLabel}
        />

        {/* Evolution Chart */}
        <GraficoEvolucao
          data={chartData}
          title="Evolução Mensal - Investimento vs Retorno"
        />

        {/* Campaigns Table */}
        <TabelaCampanhas
          campaigns={campanhasFiltradas}
          selectedMonth={mesSelecionado === 'all' ? undefined : mesSelecionado}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500">
          <p>Relatório gerado automaticamente por M4 Marketing Digital</p>
          <p className="mt-1">Dados atualizados diariamente às 00:00</p>
        </footer>
      </main>
    </div>
  );
}
