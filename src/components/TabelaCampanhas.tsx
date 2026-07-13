'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';

interface CampaignMonth {
  month: string;
  investment: number;
  conversions: number;
  revenue: number;
}

interface Campaign {
  id: string;
  name: string;
  platform: 'google' | 'meta';
  months: CampaignMonth[];
}

interface TabelaProps {
  campaigns: Campaign[];
  selectedMonth?: string;
}

export default function TabelaCampanhas({ campaigns, selectedMonth }: TabelaProps) {
  const [expandedCampaign, setExpandedCampaign] = useState<string | null>(null);

  const getCampaignTotals = (campaign: Campaign) => {
    const monthsToShow = selectedMonth 
      ? campaign.months.filter(m => m.month === selectedMonth)
      : campaign.months;

    return monthsToShow.reduce(
      (acc, month) => ({
        investment: acc.investment + month.investment,
        conversions: acc.conversions + month.conversions,
        revenue: acc.revenue + month.revenue,
      }),
      { investment: 0, conversions: 0, revenue: 0 }
    );
  };

  const getROI = (investment: number, revenue: number) => {
    if (investment === 0) return 0;
    return ((revenue - investment) / investment) * 100;
  };

  const getCostPerConversion = (investment: number, conversions: number) => {
    if (conversions === 0) return 0;
    return investment / conversions;
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance por Campanha</h3>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Campanha</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Plataforma</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Investimento</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Retorno</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">ROI</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Conversões</th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-600">Custo/Conversão</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-gray-600"></th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((campaign) => {
              const totals = getCampaignTotals(campaign);
              const roi = getROI(totals.investment, totals.revenue);
              const costPerConversion = getCostPerConversion(totals.investment, totals.conversions);
              const isExpanded = expandedCampaign === campaign.id;
              const isPositive = roi > 0;

              return (
                <>
                  <tr 
                    key={campaign.id}
                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedCampaign(isExpanded ? null : campaign.id)}
                  >
                    <td className="py-4 px-4">
                      <span className="font-medium text-gray-800">{campaign.name}</span>
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
                    <td className="py-4 px-4 text-right text-gray-700">
                      R$ {totals.investment.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-4 text-right font-medium text-gray-800">
                      R$ {totals.revenue.toLocaleString('pt-BR')}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <span className={`inline-flex items-center font-semibold ${
                        isPositive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isPositive ? (
                          <TrendingUp className="w-4 h-4 mr-1" />
                        ) : (
                          <TrendingDown className="w-4 h-4 mr-1" />
                        )}
                        {roi.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">
                      {totals.conversions}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700">
                      R$ {costPerConversion.toFixed(2)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${campaign.id}-details`}>
                      <td colSpan={8} className="py-4 px-4 bg-gray-50">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                          {campaign.months.map((monthData) => (
                            <div key={monthData.month} className="bg-white rounded-lg p-3 shadow-sm">
                              <p className="text-xs text-gray-500 mb-1">
                                {new Date(monthData.month + '-01').toLocaleDateString('pt-BR', { month: 'short' })}
                              </p>
                              <p className="text-sm font-medium text-gray-800">
                                R$ {monthData.revenue.toLocaleString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-500">
                                {monthData.conversions} conversões
                              </p>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
