'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Circle } from 'lucide-react';

interface CampaignMonth {
  month: string;
  investment: number;
  conversions: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: string;
  status?: string;
  months: CampaignMonth[];
}

interface TabelaProps {
  campaigns: Campaign[];
  selectedMonths?: string[];
  mostrarApenasComInvestimento: boolean;
  onToggleFiltroInvestimento: (value: boolean) => void;
}

function isAtiva(status?: string): boolean {
  if (!status) return false;
  return ['ENABLED', 'ACTIVE'].includes(status.toUpperCase());
}

function statusLabel(status?: string): { label: string; color: string } {
  if (!status) return { label: '—', color: 'text-gray-400' };
  const s = status.toUpperCase();
  if (['ENABLED', 'ACTIVE'].includes(s)) return { label: 'Ativa', color: 'text-green-600' };
  if (s === 'PAUSED') return { label: 'Pausada', color: 'text-yellow-600' };
  if (s === 'REMOVED') return { label: 'Removida', color: 'text-red-600' };
  return { label: status, color: 'text-gray-500' };
}

export default function TabelaCampanhas({
  campaigns,
  selectedMonths,
  mostrarApenasComInvestimento,
  onToggleFiltroInvestimento,
}: TabelaProps) {
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const getCampaignTotals = (campaign: Campaign) => {
    const monthsToShow = selectedMonths
      ? campaign.months.filter(m => selectedMonths.includes(m.month))
      : campaign.months;

    return monthsToShow.reduce(
      (acc, month) => ({
        investment: acc.investment + month.investment,
        conversions: acc.conversions + month.conversions,
      }),
      { investment: 0, conversions: 0 }
    );
  };

  const getCostPerConversion = (investment: number, conversions: number) => {
    if (conversions === 0) return 0;
    return investment / conversions;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h3 className="text-lg font-semibold text-gray-800">Performance por Campanha</h3>
        <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={mostrarApenasComInvestimento}
            onChange={(e) => onToggleFiltroInvestimento(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Mostrar apenas campanhas com investimento
        </label>
      </div>

      {campaigns.length === 0 ? (
        <p className="text-gray-500 text-sm">Nenhuma campanha encontrada para o período selecionado.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Campanha</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Plataforma</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Investimento</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Conversões</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">CPA</th>
                <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600"></th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => {
                const totals = getCampaignTotals(campaign);
                const costPerConversion = getCostPerConversion(totals.investment, totals.conversions);
                const isExpanded = expandedCampaign === campaign.id;
                const st = statusLabel(campaign.status);
                const ativa = isAtiva(campaign.status);

                return (
                  <React.Fragment key={campaign.id}>
                    <tr
                      className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!ativa ? 'opacity-60' : ''}`}
                      onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Circle
                            className={`w-2.5 h-2.5 flex-shrink-0 ${ativa ? 'text-green-500 fill-green-500' : 'text-gray-300 fill-gray-300'}`}
                          />
                          <span className="font-medium text-gray-800">{campaign.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          campaign.platform === 'google'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {campaign.platform === 'google' ? 'Google Ads' : 'Meta Ads'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-sm font-medium ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        R$ {totals.investment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-semibold text-gray-800">
                          {totals.conversions}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right text-gray-700">
                        <span className={costPerConversion > 0 ? 'font-medium' : ''}>
                          {costPerConversion > 0
                            ? `R$ ${costPerConversion.toFixed(2)}`
                            : totals.investment > 0 && totals.conversions === 0
                              ? 'Sem conversões'
                              : '—'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400 inline" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 inline" />
                        )}
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr key={`${campaign.id}-details`}>
                        <td colSpan={7} className="py-4 px-4 bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                            {campaign.months
                              .sort((a, b) => a.month.localeCompare(b.month))
                              .map((monthData) => {
                                const cpa = monthData.conversions > 0
                                  ? monthData.investment / monthData.conversions
                                  : 0;
                                return (
                                  <div key={monthData.month} className="bg-white rounded-lg p-3 shadow-sm border border-gray-100">
                                    <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                                      {new Date(monthData.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <span className="text-gray-400">Inv:</span> R$ {monthData.investment.toFixed(2)}
                                    </p>
                                    <p className="text-sm text-gray-700">
                                      <span className="text-gray-400">Conv:</span> {monthData.conversions}
                                    </p>
                                    {cpa > 0 && (
                                      <p className="text-sm text-purple-700 font-medium">
                                        CPA: R$ {cpa.toFixed(2)}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
