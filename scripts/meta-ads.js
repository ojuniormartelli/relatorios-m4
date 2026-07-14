/**
 * Integração com Meta Ads API (Facebook Marketing API) (CommonJS)
 * Usa: META_ADS_TOKEN, META_ADS_ACCOUNT_ID
 */

const META_API_VERSION = 'v21.0';
const BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

async function buscarInsightsMeta({ accessToken, adAccountId }) {
  const accountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
  
  const dataFim = new Date();
  const dataInicio = new Date(dataFim);
  dataInicio.setMonth(dataInicio.getMonth() - 6);

  const since = dataInicio.toISOString().split('T')[0];
  const until = dataFim.toISOString().split('T')[0];

  console.log(`  📅 Período: ${since} a ${until}`);

  const url = `${BASE_URL}/${accountId}/insights`;
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: 'account_name,campaign_name,campaign_id,spend,impressions,clicks,ctr,cpc,cpm,conversions,conversion_values,date_start',
    time_range: JSON.stringify({ since, until }),
    time_increment: 1,
    level: 'campaign',
    limit: '500',
  });

  let todosResultados = [];
  let nextUrl = `${url}?${params.toString()}`;

  while (nextUrl) {
    console.log(`  📡 Buscando página de resultados...`);
    const response = await fetch(nextUrl);

    if (!response.ok) {
      const text = await response.text();
      if (response.status === 401 || response.status === 400) {
        throw new Error(`Token Meta inválido ou expirado. Gere um novo.`);
      }
      throw new Error(`Erro Meta Ads API: ${response.status}`);
    }

    const data = await response.json();
    todosResultados = todosResultados.concat(data.data || []);
    nextUrl = data.paging?.next || null;
  }

  console.log(`  ✅ ${todosResultados.length} registros encontrados`);
  return processarResultadosMeta(todosResultados);
}

function processarResultadosMeta(resultados) {
  const porMes = {};
  const campanhas = {};

  for (const row of resultados) {
    const mes = (row.date_start || '').substring(0, 7);
    if (!mes) continue;

    const gasto = parseFloat(row.spend || 0);
    const receita = parseFloat(row.conversion_values || 0);
    const conversoes = parseInt(row.conversions || 0);
    const nomeCampanha = row.campaign_name || 'Sem nome';

    if (!porMes[mes]) {
      porMes[mes] = { investment: 0, conversions: 0, revenue: 0 };
    }
    porMes[mes].investment += gasto;
    porMes[mes].conversions += conversoes;
    porMes[mes].revenue += receita;

    const campanhaId = row.campaign_id || nomeCampanha.toLowerCase().replace(/\s+/g, '-');
    if (!campanhas[campanhaId]) {
      campanhas[campanhaId] = {
        id: campanhaId,
        name: nomeCampanha,
        platform: 'meta',
        months: {},
      };
    }
    if (!campanhas[campanhaId].months[mes]) {
      campanhas[campanhaId].months[mes] = { month: mes, investment: 0, conversions: 0, revenue: 0 };
    }
    campanhas[campanhaId].months[mes].investment += gasto;
    campanhas[campanhaId].months[mes].conversions += conversoes;
    campanhas[campanhaId].months[mes].revenue += receita;
  }

  const monthlyData = Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
      costPerConversion: data.conversions > 0 ? data.investment / data.conversions : 0,
    }));

  const campaigns = Object.values(campanhas).map((c) => ({
    ...c,
    months: Object.values(c.months).sort((a, b) => a.month.localeCompare(b.month)),
  }));

  return { monthlyData, campaigns };
}

async function buscarDadosMetaAds(config) {
  console.log('  📊 Buscando dados do Meta Ads...');
  const dados = await buscarInsightsMeta(config);
  return dados;
}

module.exports = { buscarDadosMetaAds };
