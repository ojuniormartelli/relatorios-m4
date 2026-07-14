/**
 * Script de Atualização Automática de Dados
 * 
 * Como usar:
 * 1. Exporte os dados do Google Ads e Meta Ads como CSV
 * 2. Coloque os arquivos em /import/<cliente>/
 * 3. Execute: node scripts/atualizar-dados.js
 * 
 * Ou configure uma planilha do Google Sheets:
 * 1. Crie uma planilha com as abas: "Mensal", "Campanhas"
 * 2. Defina a env GOOGLE_SHEETS_ID
 * 3. Execute: node scripts/atualizar-dados.js
 * 
 * Estrutura esperada do CSV:
 * Mês, Plataforma, Campanha, Investimento, Conversões, Receita
 * 2024-01, google, Serviços, 1200, 22, 5500
 * 2024-01, meta, Promoção, 900, 16, 4000
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const IMPORT_DIR = path.join(__dirname, '..', 'import');

// ============================================================
// 1. GERAR DADOS A PARTIR DE CSV
// ============================================================

function lerCSV(caminho) {
  if (!fs.existsSync(caminho)) return null;
  
  const conteudo = fs.readFileSync(caminho, 'utf-8');
  const linhas = conteudo.split('\n').filter(l => l.trim());
  
  if (linhas.length < 2) return null;
  
  const cabecalho = linhas[0].split(',').map(h => h.trim().toLowerCase());
  const dados = linhas.slice(1).map(linha => {
    const valores = linha.split(',').map(v => v.trim());
    const obj = {};
    cabecalho.forEach((chave, i) => {
      obj[chave] = isNaN(valores[i]) ? valores[i] : Number(valores[i]);
    });
    return obj;
  });
  
  return dados;
}

function csvParaJson(dadosCsv, nomeCliente) {
  if (!dadosCsv || dadosCsv.length === 0) return null;

  // Extrair meses únicos ordenados
  const meses = [...new Set(dadosCsv.map(d => d.mes))].sort();
  
  // Agrupar por mês e plataforma
  const monthlyData = meses.map(mes => {
    const dadosMes = dadosCsv.filter(d => d.mes === mes);
    
    const google = dadosMes
      .filter(d => d.plataforma === 'google')
      .reduce((acc, d) => ({
        investment: acc.investment + (d.investimento || 0),
        conversions: acc.conversions + (d.conversoes || 0),
        revenue: acc.revenue + (d.receita || 0),
      }), { investment: 0, conversions: 0, revenue: 0 });

    const meta = dadosMes
      .filter(d => d.plataforma === 'meta')
      .reduce((acc, d) => ({
        investment: acc.investment + (d.investimento || 0),
        conversions: acc.conversions + (d.conversoes || 0),
        revenue: acc.revenue + (d.receita || 0),
      }), { investment: 0, conversions: 0, revenue: 0 });

    const googleTotal = google.investment > 0 ? {
      ...google,
      costPerConversion: google.conversions > 0 ? google.investment / google.conversions : 0,
    } : { investment: 0, conversions: 0, revenue: 0, costPerConversion: 0 };

    const metaTotal = meta.investment > 0 ? {
      ...meta,
      costPerConversion: meta.conversions > 0 ? meta.investment / meta.conversions : 0,
    } : { investment: 0, conversions: 0, revenue: 0, costPerConversion: 0 };

    const totalInvestment = google.investment + meta.investment;
    const totalRevenue = google.revenue + meta.revenue;
    const totalConversions = google.conversions + meta.conversions;

    return {
      month: mes,
      googleAds: googleTotal,
      metaAds: metaTotal,
      total: {
        investment: totalInvestment,
        conversions: totalConversions,
        revenue: totalRevenue,
        roi: totalInvestment > 0 ? ((totalRevenue - totalInvestment) / totalInvestment) * 100 : 0,
      },
    };
  });

  // Agrupar campanhas
  const campanhas = [...new Set(dadosCsv.map(d => d.campanha))].map(nomeCampanha => {
    const dadosCampanha = dadosCsv.filter(d => d.campanha === nomeCampanha);
    const plataforma = dadosCampanha[0].plataforma;

    return {
      id: nomeCampanha.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      name: nomeCampanha,
      platform: plataforma,
      months: meses.map(mes => {
        const dado = dadosCampanha.find(d => d.mes === mes);
        return dado ? {
          month: mes,
          investment: dado.investimento || 0,
          conversions: dado.conversoes || 0,
          revenue: dado.receita || 0,
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
// 2. GERAR DADOS A PARTIR DE GOOGLE SHEETS (placeholder)
// ============================================================

async function lerGoogleSheets(spreadsheetId) {
  // Implementação futura:
  // const API_KEY = process.env.GOOGLE_SHEETS_API_KEY;
  // const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Mensal!A:F`;
  // const response = await fetch(url + `?key=${API_KEY}`);
  // const data = await response.json();
  // return data.values;
  
  console.log('📊 Google Sheets: Implementação pendente');
  console.log('   Para usar, configure GOOGLE_SHEETS_API_KEY e GOOGLE_SHEETS_ID');
  return null;
}

// ============================================================
// 3. VALIDAR E SALVAR JSON
// ============================================================

function validarDados(dados) {
  if (!dados || !dados.monthlyData || !dados.campaigns) {
    console.error('❌ Dados inválidos: missing monthlyData or campaigns');
    return false;
  }
  
  if (dados.monthlyData.length === 0) {
    console.error('❌ Dados inválidos: nenhum mês encontrado');
    return false;
  }

  // Validar estrutura de cada mês
  for (const mes of dados.monthlyData) {
    if (!mes.month || typeof mes.total?.investment !== 'number') {
      console.error(`❌ Dados inválidos no mês ${mes.month}`);
      return false;
    }
  }

  return true;
}

function salvarDados(dados, nomeCliente) {
  const caminho = path.join(DATA_DIR, `${nomeCliente.toLowerCase()}.json`);
  
  if (!validarDados(dados)) {
    console.error(`❌ Pulando salvamento de ${nomeCliente} - dados inválidos`);
    return false;
  }

  fs.writeFileSync(caminho, JSON.stringify(dados, null, 2), 'utf-8');
  console.log(`✅ Dados salvos: ${caminho}`);
  return true;
}

// ============================================================
// 4. EXECUÇÃO PRINCIPAL
// ============================================================

async function main() {
  console.log('🔄 Iniciando atualização de dados...\n');

  // Opção 1: Importar de CSV
  if (fs.existsSync(IMPORT_DIR)) {
    const pastas = fs.readdirSync(IMPORT_DIR);
    
    for (const pasta of pastas) {
      const pastaPath = path.join(IMPORT_DIR, pasta);
      if (!fs.statSync(pastaPath).isDirectory()) continue;

      console.log(`📁 Processando cliente: ${pasta}`);
      
      const csvPath = path.join(pastaPath, 'dados.csv');
      const dadosCsv = lerCSV(csvPath);
      
      if (dadosCsv) {
        const json = csvParaJson(dadosCsv, pasta);
        if (json) {
          salvarDados(json, pasta);
        }
      } else {
        console.log(`   ⚠️ Nenhum CSV encontrado em ${csvPath}`);
      }
    }
  }

  // Opção 2: Importar de Google Sheets
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  if (sheetId) {
    console.log('\n📊 Buscando dados do Google Sheets...');
    const dadosSheet = await lerGoogleSheets(sheetId);
    if (dadosSheet) {
      console.log(`   ${dadosSheet.length} linhas encontradas`);
      // Processar dados...
    }
  }

  // Opção 3: Atualizar dados de exemplo (para desenvolvimento)
  if (process.env.UPDATE_SAMPLE) {
    console.log('\n📝 Atualizando dados de exemplo...');
    // Implementar lógica de atualização
  }

  console.log('\n✅ Atualização concluída!');
  console.log(`📁 Dados salvos em: ${DATA_DIR}`);
}

main().catch(console.error);
