/**
 * Script de Atualização Automática de Dados
 * 
 * Modo automático (GitHub Actions):
 *   node scripts/atualizar-dados.js
 *   (Usa as variáveis de ambiente das APIs)
 * 
 * Modo manual (CSV):
 *   node scripts/atualizar-dados.js --csv
 * 
 * Modo simulação (teste):
 *   node scripts/atualizar-dados.js --simular
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const IMPORT_DIR = path.join(__dirname, '..', 'import');
const CLIENTES_PATH = path.join(DATA_DIR, 'clientes.json');

// ============================================================
// 1. BUSCAR DADOS DAS APIS
// ============================================================

async function buscarDeTodasAPIs(cliente) {
  const dadosCombinados = {
    monthlyData: [],
    campaigns: [],
  };

  console.log(`\n📡 Buscando dados para: ${cliente.company}`);

  // Google Ads
  if (process.env.GOOGLE_ADS_CLIENT_ID && process.env.GOOGLE_ADS_CUSTOMER_ID) {
    try {
      console.log('\n📊 Google Ads:');
      const { buscarDadosGoogleAds } = require('./google-ads.js');
      const googleData = await buscarDadosGoogleAds({
        clientId: process.env.GOOGLE_ADS_CLIENT_ID,
        clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
        developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
        customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
      });
      
      for (const d of googleData) {
        const existente = dadosCombinados.monthlyData.find(m => m.month === d.month);
        if (existente) {
          existente.googleAds = { ...d };
          existente.total.investment += d.investment;
          existente.total.revenue += d.revenue;
          existente.total.conversions += d.conversions;
        } else {
          dadosCombinados.monthlyData.push({
            month: d.month,
            googleAds: { ...d },
            metaAds: { investment: 0, conversions: 0, revenue: 0, costPerConversion: 0 },
            total: {
              investment: d.investment,
              conversions: d.conversions,
              revenue: d.revenue,
              roi: 0,
            },
          });
        }
      }
    } catch (err) {
      console.error(`  ⚠️ Google Ads: ${err.message}`);
    }
  } else {
    console.log('  ⏭️ Google Ads não configurado (pule GOOGLE_ADS_* envs)');
  }

  // Meta Ads
  if (process.env.META_ADS_TOKEN && process.env.META_ADS_ACCOUNT_ID) {
    try {
      console.log('\n📱 Meta Ads:');
      const { buscarDadosMetaAds } = require('./meta-ads.js');
      const metaData = await buscarDadosMetaAds({
        accessToken: process.env.META_ADS_TOKEN,
        adAccountId: process.env.META_ADS_ACCOUNT_ID,
      });
      
      for (const d of metaData.monthlyData) {
        const existente = dadosCombinados.monthlyData.find(m => m.month === d.month);
        if (existente) {
          existente.metaAds = { ...d };
          existente.total.investment += d.investment;
          existente.total.revenue += d.revenue;
          existente.total.conversions += d.conversions;
        } else {
          dadosCombinados.monthlyData.push({
            month: d.month,
            googleAds: { investment: 0, conversions: 0, revenue: 0, costPerConversion: 0 },
            metaAds: { ...d },
            total: {
              investment: d.investment,
              conversions: d.conversions,
              revenue: d.revenue,
              roi: 0,
            },
          });
        }
      }

      // Adicionar campanhas do Meta
      dadosCombinados.campaigns = dadosCombinados.campaigns.concat(metaData.campaigns);
    } catch (err) {
      console.error(`  ⚠️ Meta Ads: ${err.message}`);
    }
  } else {
    console.log('  ⏭️ Meta Ads não configurado (pule META_ADS_* envs)');
  }

  // Calcular ROI para cada mês
  for (const mes of dadosCombinados.monthlyData) {
    mes.total.roi = mes.total.investment > 0
      ? ((mes.total.revenue - mes.total.investment) / mes.total.investment) * 100
      : 0;
  }

  // Ordenar por mês
  dadosCombinados.monthlyData.sort((a, b) => a.month.localeCompare(b.month));

  return dadosCombinados;
}

// ============================================================
// 2. GERAR DADOS A PARTIR DE CSV
// ============================================================

function lerCSV(caminho) {
  if (!fs.existsSync(caminho)) return null;
  
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  const linhas = conteudo.split('\n').filter(l => l.trim());
  if (linhas.length < 2) return null;
  
  const cabecalho = linhas[0].split(',').map(h => h.trim().toLowerCase());
  return linhas.slice(1).map(linha => {
    const valores = linha.split(',').map(v => v.trim());
    const obj = {};
    cabecalho.forEach((chave, i) => {
      obj[chave] = isNaN(valores[i]) ? valores[i] : Number(valores[i]);
    });
    return obj;
  });
}

function csvParaJson(dadosCsv, nomeCliente) {
  if (!dadosCsv || dadosCsv.length === 0) return null;

  const meses = [...new Set(dadosCsv.map(d => d.mes))].sort();
  
  const monthlyData = meses.map(mes => {
    const dadosMes = dadosCsv.filter(d => d.mes === mes);
    
    const calcPlataforma = (plat) => {
      const d = dadosMes.filter(x => x.plataforma === plat)
        .reduce((acc, x) => ({
          investment: acc.investment + (x.investimento || 0),
          conversions: acc.conversions + (x.conversoes || 0),
          revenue: acc.revenue + (x.receita || 0),
        }), { investment: 0, conversions: 0, revenue: 0 });
      return {
        ...d,
        costPerConversion: d.conversions > 0 ? d.investment / d.conversions : 0,
      };
    };

    const google = calcPlataforma('google');
    const meta = calcPlataforma('meta');
    const inv = google.investment + meta.investment;
    const rev = google.revenue + meta.revenue;
    const conv = google.conversions + meta.conversions;

    return {
      month: mes,
      googleAds: google,
      metaAds: meta,
      total: {
        investment: inv,
        conversions: conv,
        revenue: rev,
        roi: inv > 0 ? ((rev - inv) / inv) * 100 : 0,
      },
    };
  });

  const campanhas = [...new Set(dadosCsv.map(d => d.campanha))].map(nome => {
    const dados = dadosCsv.filter(d => d.campanha === nome);
    return {
      id: nome.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: nome,
      platform: dados[0].plataforma,
      months: meses.map(mes => {
        const d = dados.find(x => x.mes === mes);
        return d ? {
          month: mes,
          investment: d.investimento || 0,
          conversions: d.conversoes || 0,
          revenue: d.receita || 0,
        } : { month: mes, investment: 0, conversions: 0, revenue: 0 };
      }),
    };
  });

  return {
    client: {
      slug: nomeCliente.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: nomeCliente,
      company: nomeCliente,
      logo: `/logos/${nomeCliente.toLowerCase()}.png`,
      primaryColor: '#1E40AF',
      secondaryColor: '#3B82F6',
    },
    monthlyData,
    campaigns: campanhas,
  };
}

// ============================================================
// 3. VALIDAR E SALVAR
// ============================================================

function validarDados(dados) {
  if (!dados?.monthlyData?.length) return false;
  for (const mes of dados.monthlyData) {
    if (!mes.month || typeof mes.total?.investment !== 'number') return false;
  }
  return true;
}

function salvarDados(dados, nomeCliente) {
  const caminho = path.join(DATA_DIR, `${nomeCliente.toLowerCase()}.json`);
  
  if (!validarDados(dados)) {
    console.error(`❌ Dados inválidos para ${nomeCliente}`);
    return false;
  }

  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
  console.log(`✅ ${caminho}`);
  return true;
}

// ============================================================
// 4. GERAR DADOS SIMULADOS
// ============================================================

function gerarDadosSimulados() {
  const hoje = new Date();
  const meses = [];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }

  return {
    monthlyData: meses.map(mes => ({
      month: mes,
      googleAds: {
        investment: 2000 + Math.random() * 1500,
        conversions: 30 + Math.random() * 40,
        revenue: 8000 + Math.random() * 8000,
        costPerConversion: 0,
      },
      metaAds: {
        investment: 1500 + Math.random() * 1000,
        conversions: 20 + Math.random() * 30,
        revenue: 5000 + Math.random() * 6000,
        costPerConversion: 0,
      },
      total: { investment: 0, conversions: 0, revenue: 0, roi: 0 },
    })),
    campaigns: [
      {
        id: 'campanha-1',
        name: 'Campanha Principal',
        platform: 'google',
        months: meses.map(mes => ({
          month: mes,
          investment: 1000 + Math.random() * 800,
          conversions: 15 + Math.random() * 20,
          revenue: 4000 + Math.random() * 4000,
        })),
      },
      {
        id: 'campanha-2',
        name: 'Campanha Secundária',
        platform: 'meta',
        months: meses.map(mes => ({
          month: mes,
          investment: 800 + Math.random() * 600,
          conversions: 10 + Math.random() * 15,
          revenue: 3000 + Math.random() * 3000,
        })),
      },
    ],
  };
}

// ============================================================
// 5. EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  console.log('🔄 M4 - Atualização de Dados\n');
  console.log('=' .repeat(50));
  console.log(`📅 ${new Date().toLocaleDateString('pt-BR')}`);
  console.log(`⏰ ${new Date().toLocaleTimeString('pt-BR')}`);
  console.log('=' .repeat(50));

  const isSimular = process.argv.includes('--simular');
  const isCsv = process.argv.includes('--csv');

  // Carregar lista de clientes
  const clientes = JSON.parse(fs.readFileSync(CLIENTES_PATH, 'utf-8'));
  
  for (const cliente of clientes.clients) {
    if (!cliente.active) {
      console.log(`\n⏭️ ${cliente.company} - Inativo, pulando`);
      continue;
    }

    let dados;

    if (isSimular) {
      console.log(`\n🎲 ${cliente.company} - Gerando dados simulados...`);
      dados = gerarDadosSimulados();
      dados.client = {
        slug: cliente.slug,
        name: cliente.name,
        company: cliente.company,
        logo: `/logos/${cliente.slug}.png`,
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
      };
    } else if (isCsv) {
      const csvPath = path.join(IMPORT_DIR, cliente.slug, 'dados.csv');
      console.log(`\n📁 ${cliente.company} - Lendo CSV: ${csvPath}`);
      const csvDados = lerCSV(csvPath);
      if (csvDados) {
        dados = csvParaJson(csvDados, cliente.name);
      } else {
        console.log(`  ⚠️ CSV não encontrado`);
        continue;
      }
    } else {
      // Modo automático - busca das APIs
      dados = await buscarDeTodasAPIs(cliente);
      dados.client = {
        slug: cliente.slug,
        name: cliente.name,
        company: cliente.company,
        logo: `/logos/${cliente.slug}.png`,
        primaryColor: '#1E40AF',
        secondaryColor: '#3B82F6',
      };
    }

    salvarDados(dados, cliente.slug);
  }

  console.log('\n' + '=' .repeat(50));
  console.log('✅ Atualização concluída!');
  console.log('📁 Dados salvos em: src/data/');
  
  if (process.env.GITHUB_ACTIONS) {
    console.log('🤖 Rodando no GitHub Actions');
  }
}

main().catch(err => {
  console.error('\n❌ Erro fatal:', err.message);
  process.exit(1);
});
