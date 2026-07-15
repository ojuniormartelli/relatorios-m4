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
    fields: 'account_name,campaign_name,campaign_id,spend,impressions,clicks,ctr,cpc,cpm,actions{action_type,value},date_start',
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

  // Buscar status das campanhas
  const statusCampanhas = await buscarStatusCampanhas({ accessToken, adAccountId: accountId });
  
  return processarResultadosMeta(todosResultados, statusCampanhas);
}

/**
 * Busca o status (effective_status) de todas as campanhas da conta.
 */
async function buscarStatusCampanhas({ accessToken, adAccountId }) {
  const url = `${BASE_URL}/${adAccountId}/campaigns`;
  const params = new URLSearchParams({
    access_token: accessToken,
    fields: 'id,name,effective_status',
    limit: '500',
  });

  let nextUrl = `${url}?${params.toString()}`;
  const statusMap = {};

  while (nextUrl) {
    const response = await fetch(nextUrl);
    if (!response.ok) {
      console.log(`  ⚠️ Não foi possível buscar status das campanhas`);
      return {};
    }
    const data = await response.json();
    for (const c of data.data || []) {
      statusMap[c.id] = c.effective_status || 'UNKNOWN';
    }
    nextUrl = data.paging?.next || null;
  }

  console.log(`  📋 Status de ${Object.keys(statusMap).length} campanhas obtidos`);
  return statusMap;
}

/**
 * Extrai total de leads/conversões do campo 'actions'.
 * O Meta Ads retorna actions como array de {action_type, value, ...}.
 * Tipos de conversão: lead, complete_registration, subscribe, purchase, etc.
 */
function extrairConversoesDeActions(actions) {
  if (!actions || !Array.isArray(actions)) return 0;

  // Tipos de ação que representam leads. Como lead, onsite_web_lead e
  // offsite_conversion.fb_pixel_lead representam o MESMO lead em escopos
  // diferentes, usamos MAX entre eles para evitar duplicação.
  const tiposLead = ['lead', 'onsite_web_lead', 'offsite_conversion.fb_pixel_lead'];
  const tiposOutros = ['complete_registration', 'subscribe', 'purchase'];

  let maxLead = 0;
  let maxOutros = 0;

  for (const action of actions) {
    const tipo = action.action_type || '';
    const valor = parseInt(action.value || 0);

    if (tiposLead.includes(tipo)) {
      maxLead = Math.max(maxLead, valor);
    } else if (tiposOutros.includes(tipo)) {
      maxOutros = Math.max(maxOutros, valor);
    }
  }

  // Só soma outros tipos (complete_registration, etc.) se diferente dos leads
  return maxLead + maxOutros;
}

function processarResultadosMeta(resultados, statusCampanhas = {}) {
  const porMes = {};
  const campanhas = {};

  for (const row of resultados) {
    const mes = (row.date_start || '').substring(0, 7);
    if (!mes) continue;

    const gasto = parseFloat(row.spend || 0);
    const conversoes = extrairConversoesDeActions(row.actions);
    const nomeCampanha = row.campaign_name || 'Sem nome';

    if (!porMes[mes]) {
      porMes[mes] = { investment: 0, conversions: 0 };
    }
    porMes[mes].investment += gasto;
    porMes[mes].conversions += conversoes;

    const campanhaId = row.campaign_id || nomeCampanha.toLowerCase().replace(/\s+/g, '-');
    if (!campanhas[campanhaId]) {
      campanhas[campanhaId] = {
        id: campanhaId,
        name: nomeCampanha,
        platform: 'meta',
        status: statusCampanhas[campanhaId] || 'UNKNOWN',
        months: {},
      };
    }
    if (!campanhas[campanhaId].months[mes]) {
      campanhas[campanhaId].months[mes] = { month: mes, investment: 0, conversions: 0 };
    }
    campanhas[campanhaId].months[mes].investment += gasto;
    campanhas[campanhaId].months[mes].conversions += conversoes;
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
