'use client';

import { useState, useMemo } from 'react';
import { format, subDays, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import ResumoGeral from './ResumoGeral';
import GraficoEvolucao from './GraficoEvolucao';
import TabelaCampanhas from './TabelaCampanhas';
import Filtros, { TipoPeriodo } from './Filtros';
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

// ============================================================
// CALCULAR INTERVALO DE DATAS POR TIPO DE PERÍODO
// ============================================================
function calcularIntervalo(periodo: TipoPeriodo, dataInicio?: string, dataFim?: string): { inicio: Date; fim: Date } {
  const hoje = new Date();

  switch (periodo) {
    case 'mes_passado': {
      const inicioMesAtual = startOfMonth(hoje);
      const fimMesPassado = new Date(inicioMesAtual.getTime() - 1);
      const inicioMesPassado = startOfMonth(fimMesPassado);
      return { inicio: inicioMesPassado, fim: fimMesPassado };
    }
    case '7dias':
      return { inicio: subDays(hoje, 7), fim: hoje };
    case '15dias':
      return { inicio: subDays(hoje, 15), fim: hoje };
    case '30dias':
      return { inicio: subDays(hoje, 30), fim: hoje };
    case 'personalizado': {
      if (dataInicio && dataFim) {
        return { inicio: parseISO(dataInicio), fim: parseISO(dataFim) };
      }
      if (dataInicio) {
        return { inicio: parseISO(dataInicio), fim: hoje };
      }
      return { inicio: subDays(hoje, 30), fim: hoje };
    }
    default:
      return { inicio: subDays(hoje, 30), fim: hoje };
  }
}

// ============================================================
// VERIFICAR SE UM MÊSE ESTÁ DENTRO DO INTERVALO
// ============================================================
function mesNoIntervalo(mes: string, inicio: Date, fim: Date): boolean {
  // mes está no formato "YYYY-MM"
  const [year, month] = mes.split('-').map(Number);
  const inicioMes = new Date(year, month - 1, 1);
  const fimMes = new Date(year, month, 0, 23, 59, 59);
  return inicioMes <= fim && fimMes >= inicio;
}

// ============================================================
// CALCULAR PROPORÇÃO DO MÊS DENTRO DO INTERVALO
// ============================================================
function proporcaoMesNoIntervalo(mes: string, inicio: Date, fim: Date): number {
  const [year, month] = mes.split('-').map(Number);
  const inicioMes = new Date(year, month - 1, 1);
  const fimMes = new Date(year, month, 0, 23, 59, 59);

  // Se o mês está totalmente dentro do intervalo, proporção = 1
  if (inicioMes >= inicio && fimMes <= fim) return 1;

  // Se o mês está totalmente fora do intervalo, proporção = 0
  if (fimMes < inicio || inicioMes > fim) return 0;

  // Caso contrário, calcular a proporção de dias do mês que estão no intervalo
  const inicioEfetivo = inicioMes > inicio ? inicioMes : inicio;
  const fimEfetivo = fimMes < fim ? fimMes : fim;
  const diasNoIntervalo = Math.floor((fimEfetivo.getTime() - inicioEfetivo.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const diasNoMes = Math.floor((fimMes.getTime() - inicioMes.getTime()) / (1000 * 60 * 60 * 24)) + 1;

  return Math.min(1, diasNoIntervalo / diasNoMes);
}

// ============================================================
// CALCULAR TOTAIS POR PLATAFORMA E INTERVALO
// ============================================================
function calcTotals(
  monthlyData: ClientData['monthlyData'],
  platform: string,
  inicio: Date,
  fim: Date
) {
  return monthlyData.reduce(
    (acc, month) => {
      const prop = proporcaoMesNoIntervalo(month.month, inicio, fim);
      if (prop === 0) return acc;

      if (platform === 'all' || platform === 'google') {
        acc.investment += month.googleAds.investment * prop;
        acc.conversions += month.googleAds.conversions * prop;
      }
      if (platform === 'all' || platform === 'meta') {
        acc.investment += month.metaAds.investment * prop;
        acc.conversions += month.metaAds.conversions * prop;
      }
      return acc;
    },
    { investment: 0, conversions: 0 }
  );
}

function calcDerived(totals: { investment: number; conversions: number }) {
  return {
    investment: totals.investment,
    conversions: Math.round(totals.conversions),
    costPerConversion: totals.conversions > 0 ? totals.investment / totals.conversions : 0,
  };
}

function calcVariacao(atual: number, anterior: number): number {
  if (anterior === 0) return 0;
  return ((atual - anterior) / anterior) * 100;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================
export default function Dashboard({ data }: DashboardProps) {
  const hoje = new Date();

  const [periodoSelecionado, setPeriodoSelecionado] = useState<TipoPeriodo>('30dias');
  const [dataInicio, setDataInicio] = useState<string>('');
  const [dataFim, setDataFim] = useState<string>('');
  const [plataformaSelecionada, setPlataformaSelecionada] = useState<'all' | 'google' | 'meta'>('all');

  // Calcular intervalo de datas
  const intervalo = useMemo(() => {
    return calcularIntervalo(periodoSelecionado, dataInicio, dataFim);
  }, [periodoSelecionado, dataInicio, dataFim]);

  // Calcular intervalo anterior (para comparação)
  const intervaloAnterior = useMemo(() => {
    const duracaoMs = intervalo.fim.getTime() - intervalo.inicio.getTime();
    const fimAnterior = new Date(intervalo.inicio.getTime() - 1);
    const inicioAnterior = new Date(fimAnterior.getTime() - duracaoMs);
    return { inicio: inicioAnterior, fim: fimAnterior };
  }, [intervalo]);

  // Filtrar e calcular dados do período atual
  const dadosFiltrados = useMemo(() => {
    const totals = calcTotals(data.monthlyData, plataformaSelecionada, intervalo.inicio, intervalo.fim);
    return calcDerived(totals);
  }, [data.monthlyData, plataformaSelecionada, intervalo]);

  // Calcular comparativo com período anterior
  const comparativo = useMemo(() => {
    const totalsAnterior = calcTotals(data.monthlyData, plataformaSelecionada, intervaloAnterior.inicio, intervaloAnterior.fim);
    const anterior = calcDerived(totalsAnterior);

    return {
      investimento: calcVariacao(dadosFiltrados.investment, anterior.investment),
      conversoes: calcVariacao(dadosFiltrados.conversions, anterior.conversions),
      custoPorConversao: calcVariacao(dadosFiltrados.costPerConversion, anterior.costPerConversion),
    };
  }, [data.monthlyData, plataformaSelecionada, intervaloAnterior, dadosFiltrados]);

  // Preparar dados para o gráfico (agrupar por mês dentro do intervalo)
  const chartData = useMemo(() => {
    return data.monthlyData
      .filter((m) => mesNoIntervalo(m.month, intervalo.inicio, intervalo.fim))
      .map((month) => {
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
  }, [data.monthlyData, plataformaSelecionada, intervalo]);

  // Filtrar campanhas por plataforma
  const campanhasFiltradas = useMemo(() => {
    if (plataformaSelecionada === 'all') return data.campaigns;
    return data.campaigns.filter((c) => c.platform === plataformaSelecionada);
  }, [data.campaigns, plataformaSelecionada]);

  // Formatar label do período
  const periodoLabel = useMemo(() => {
    const fmt = (d: Date) => format(d, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    return `${fmt(intervalo.inicio)} a ${fmt(intervalo.fim)}`;
  }, [intervalo]);

  // Label da plataforma para WhatsApp
  const plataformaLabel = useMemo(() => {
    const labels: Record<string, string> = {
      all: 'Google Ads + Meta Ads',
      google: 'Google Ads',
      meta: 'Meta Ads',
    };
    return labels[plataformaSelecionada];
  }, [plataformaSelecionada]);

  // Meses disponíveis para a tabela (filtrar por intervalo)
  const mesesNoIntervalo = useMemo(() => {
    return data.monthlyData
      .filter((m) => mesNoIntervalo(m.month, intervalo.inicio, intervalo.fim))
      .map((m) => m.month)
      .sort();
  }, [data.monthlyData, intervalo]);

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
                {format(hoje, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Filtros
          periodoSelecionado={periodoSelecionado}
          onPeriodoChange={setPeriodoSelecionado}
          dataInicio={dataInicio}
          dataFim={dataFim}
          onDataInicioChange={setDataInicio}
          onDataFimChange={setDataFim}
          plataformaSelecionada={plataformaSelecionada}
          onPlataformaChange={setPlataformaSelecionada}
        />

        {/* Comparison info banner */}
        {comparativo && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-800">
            🔍 <strong>Comparando</strong> este período com o período anterior.
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
          selectedMonths={mesesNoIntervalo}
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
