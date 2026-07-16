/**
 * Integração com Google Ads API (CommonJS)
 * Usa: GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, 
 *       GOOGLE_ADS_REFRESH_TOKEN, GOOGLE_ADS_DEVELOPER_TOKEN,
 *       GOOGLE_ADS_CUSTOMER_ID
 */

const GOOGLE_ADS_API_VERSION = 'v22';

async function renovarAccessToken({ clientId, clientSecret, refreshToken }) {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao renovar token Google: ${response.status}`);
  }

  const data = await response.json();
  return data.access_token;
}

async function buscarCampanhasGoogle({ accessToken, developerToken, customerId, loginCustomerId }) {
  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.cost_micros,
      metrics.conversions,
      metrics.conversions_value,
      segments.date
    FROM campaign
    WHERE segments.date >= '2026-01-01' AND segments.date <= '2026-07-31'
  `;

  const response = await fetch(
    `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}/customers/${customerId}/googleAds:search`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'developer-token': developerToken,
        'Content-Type': 'application/json',
        ...(loginCustomerId ? { 'login-customer-id': loginCustomerId } : {}),
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erro Google Ads API: ${response.status} - ${text.substring(0, 200)}`);
  }

  const data = await response.json();
  return processarResultadosGoogle(data.results || []);
}

function processarResultadosGoogle(resultados) {
  const porMes = {};
  const porDia = {};
  const campanhas = {};

  for (const row of resultados) {
    const c = row.campaign;
    const m = row.metrics;
    const s = row.segments;
    if (!c || !m || !s) continue;

    const data = s.date; // YYYY-MM-DD
    const mes = data.substring(0, 7);
    const custo = Number(m.costMicros || 0) / 1000000;
    const conversoes = Number(m.conversions || 0);
    const campanhaId = String(c.id);
    const campanhaNome = c.name || 'Sem nome';

    // Agregado por mês
    if (!porMes[mes]) {
      porMes[mes] = { investment: 0, conversions: 0 };
    }
    porMes[mes].investment += custo;
    porMes[mes].conversions += conversoes;

    // Agregado por dia
    if (!porDia[data]) {
      porDia[data] = { investment: 0, conversions: 0 };
    }
    porDia[data].investment += custo;
    porDia[data].conversions += conversoes;

    // Por campanha
    if (!campanhas[campanhaId]) {
      campanhas[campanhaId] = {
        id: `google-${campanhaId}`,
        name: campanhaNome,
        platform: 'google',
        status: c.status || 'UNKNOWN',
        months: {},
      };
    }
    if (!campanhas[campanhaId].months[mes]) {
      campanhas[campanhaId].months[mes] = { month: mes, investment: 0, conversions: 0 };
    }
    campanhas[campanhaId].months[mes].investment += custo;
    campanhas[campanhaId].months[mes].conversions += conversoes;
  }

  const monthlyData = Object.entries(porMes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      ...data,
      costPerConversion: data.conversions > 0 ? data.investment / data.conversions : 0,
    }));

  const dailyData = Object.entries(porDia)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      date,
      ...data,
    }));

  const campaigns = Object.values(campanhas).map((c) => ({
    ...c,
    months: Object.values(c.months).sort((a, b) => a.month.localeCompare(b.month)),
  }));

  return { monthlyData, dailyData, campaigns };
}

async function buscarDadosGoogleAds(config) {
  console.log('  🔑 Renovando token de acesso...');
  const accessToken = await renovarAccessToken(config);
  console.log('  📊 Buscando dados das campanhas...');
  const dados = await buscarCampanhasGoogle({
    accessToken,
    developerToken: config.developerToken,
    customerId: config.customerId,
    loginCustomerId: config.loginCustomerId,
  });
  console.log(`  ✅ ${dados.monthlyData.length} meses, ${dados.campaigns.length} campanhas encontrados`);
  return dados;
}

module.exports = { buscarDadosGoogleAds };
