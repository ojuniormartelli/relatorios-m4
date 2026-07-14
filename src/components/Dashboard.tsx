'use client';

import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ResumoGeral from './ResumoGeral';
import GraficoEvolucao from './GraficoEvolucao';
import TabelaCampanhas from './TabelaCampanhas';
import Filtros from './Filtros';
import ResumoWhatsApp from './ResumoWhatsApp';

interface PlatformData {
  investment: number;
  conversions: number;
  costPerConversion: number;
}

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
    googleAds: PlatformData;
    metaAds: PlatformData;
    total: {
      investment: number;
      conversions: number;
    };
  }>;
  campaigns: Array<{
    id: string;
    name: string;
    platform: string;
    months: Array<{
      month: string;
      investment: number;
      conversions: number;
    }>;
  }>;
}

interface DashboardProps {
  data: ClientData;
}

function calcTotals(monthlyData: ClientData['monthlyData'], platform: string) {
  return monthlyData.reduce(
    (acc, month) => {
      if (platform === 'all' || platform === 'google') {
        acc.investment += month.googleAds.investment;
        acc.conversions += month.googleAds.conversions;
      }
      if (platform === 'all' || platform === 'meta') {
        acc.investment += month.metaAds.investment;
        acc.conversions += month.metaAds.conversions;
      }
      return acc;
    },
    { investment: 0, conversions: 0 }
  );
}

function calcDerived(totals: { investment: number; conversions: number }) {
  return {
    investment: totals.investment,
    conversions: totals.conversions,
    costPerConversion: totals.conversions > 0 ? totals.investment / totals.conversions : 0,
  };
}

function calcVariacao(atual: number, anterior: number): number {
  if (anterior === 0) return 0;
  return ((atual - anterior) / anterior) * 100;
}

export default function Dashboard({ data }: DashboardProps) {
  // Default to current month
  const mesAtual = useMemo(() => {
    const hoje = new Date();
    return format(hoje, 'yyyy-MM');
  }, []);

  const [mesSelecionado, setMesSelecionado] = useState<string>(mesAtual);
  const [plataformaSelecionada, setPlataformaSelecionada] = useState<'all' | 'google' | 'meta'>('all');

  // Get available months (sorted ascending)
  const meses = useMemo(() => {
    return data.monthlyData.map((m) => m.month).sort();
  }, [data.monthlyData]);

  // Get previous month for comparison
  const mesAnterior = useMemo(() => {
    if (mesSelecionado === 'all') return undefined;
    const idx = meses.indexOf(mesSelecionado);
    if (idx > 0) return meses[idx - 1];
    return undefined;
  }, [meses, mesSelecionado]);

  // Filter and calculate current period data
  const dadosFiltrados = useMemo(() => {
    let monthlyData = data.monthlyData;
    if (mesSelecionado !== 'all') {
      monthlyData = monthlyData.filter((m) => m.month === mesSelecionado);
    }
    const totals = calcTotals(monthlyData, plataformaSelecionada);
    return calcDerived(totals);
  }, [data.monthlyData, mesSelecionado, plataformaSelecionada]);

  // Calculate comparison with previous period
  const comparativo = useMemo(() => {
    if (!mesAnterior) return undefined;

    const monthlyDataAnterior = data.monthlyData.filter((m) => m.month === mesAnterior);
    const totalsAnterior = calcTotals(monthlyDataAnterior, plataformaSelecionada);
    const anterior = calcDerived(totalsAnterior);

    const monthlyDataAtual = data.monthlyData.filter((m) => m.month === mesSelecionado);
    const totalsAtual = calcTotals(monthlyDataAtual, plataformaSelecionada);
    const atual = calcDerived(totalsAtual);

    return {
      investimento: calcVariacao(atual.investment, anterior.investment),
      conversoes: calcVariacao(atual.conversions, anterior.conversions),
      custoPorConversao: calcVariacao(atual.costPerConversion, anterior.costPerConversion),
    };
  }, [data.monthlyData, mesSelecionado, mesAnterior, plataformaSelecionada]);

  // Prepare chart data
  const chartData = useMemo(() => {
    let monthlyData = data.monthlyData;
    if (mesSelecionado !== 'all') {
      monthlyData = monthlyData.filter((m) => m.month === mesSelecionado);
    }

    return monthlyData.map((month) => {
      let investment = 0;
      let conversions = 0;

      if (plataformaSelecionada === 'all' || plataformaSelecionada === 'google') {
        investment += month.googleAds.investment;
        conversions += month.googleAds.conversions;
      }
      if (plataformaSelecionada === 'all' || plataformaSelecionada === 'meta') {
        investment += month.metaAds.investment;
        conversions += month.metaAds.conversions;
      }

      return { month: month.month, investment, conversions };
    });
  }, [data.monthlyData, mesSelecionado, plataformaSelecionada]);

  // Filter campaigns by platform
  const campanhasFiltradas = useMemo(() => {
    if (plataformaSelecionada === 'all') return data.campaigns;
    return data.campaigns.filter((c) => c.platform === plataformaSelecionada);
  }, [data.campaigns, plataformaSelecionada]);

  // Format period label
  const periodoLabel = useMemo(() => {
    const mesesNome = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const mesesAbrev = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    if (mesSelecionado === 'all') {
      const [firstYear, firstMonth] = meses[0].split('-');
      const [lastYear, lastMonth] = meses[meses.length - 1].split('-');
      return `${mesesAbrev[parseInt(firstMonth) - 1]}/${firstYear} a ${mesesAbrev[parseInt(lastMonth) - 1]}/${lastYear}`;
    }
    const [year, month] = mesSelecionado.split('-');
    return `${mesesNome[parseInt(month) - 1]} de ${year}`;
  }, [mesSelecionado, meses]);

  // Platform label for WhatsApp
  const plataformaLabel = useMemo(() => {
    const labels: Record<string, string> = {
      all: 'Google Ads + Meta Ads',
      google: 'Google Ads',
      meta: 'Meta Ads',
    };
    return labels[plataformaSelecionada];
  }, [plataformaSelecionada]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
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
          meses={[...meses].reverse()}
          mesSelecionado={mesSelecionado}
          onMesChange={setMesSelecionado}
          plataformaSelecionada={plataformaSelecionada}
          onPlataformaChange={setPlataformaSelecionada}
        />

        {/* Comparison info banner */}
        {comparativo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
            🔍 <strong>Comparando</strong> este período com o mês anterior. 
            As setas indicam se cada indicador melhorou ou piorou.
          </div>
        )}

        {/* Summary Cards */}
        <ResumoGeral
          investimento={dadosFiltrados.investment}
          totalConversoes={dadosFiltrados.conversions}
          custoPorConversao={dadosFiltrados.costPerConversion}
          periodo={periodoLabel}
          comparativo={comparativo}
        />

        {/* WhatsApp Summary */}
        <ResumoWhatsApp
          companyName={data.client.name}
          investimento={dadosFiltrados.investment}
          totalConversoes={dadosFiltrados.conversions}
          custoPorConversao={dadosFiltrados.costPerConversion}
          periodo={periodoLabel}
          plataforma={plataformaLabel}
        />

        {/* Evolution Chart */}
        <GraficoEvolucao
          data={chartData}
          title="Evolução de Investimento e Conversões"
        />

        {/* Campaigns Table */}
        <TabelaCampanhas
          campaigns={campanhasFiltradas}
          selectedMonth={mesSelecionado === 'all' ? undefined : mesSelecionado}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-gray-500 border-t pt-6">
          <p className="font-medium text-gray-700">M4 Marketing Digital</p>
          <p className="mt-1">Relatório gerado automaticamente • Dados atualizados diariamente</p>
          <p className="mt-1 text-xs">{data.client.company}</p>
        </footer>
      </main>
    </div>
  );
}
