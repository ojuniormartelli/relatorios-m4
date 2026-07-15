/**
 * Gerador de Refresh Token do Google Ads
 * 
 * Como usar:
 *   1. Crie um .env com GOOGLE_ADS_CLIENT_ID e GOOGLE_ADS_CLIENT_SECRET
 *   2. node scripts/gerar-refresh-token.js
 * 
 * Isso vai:
 *   1. Abrir o navegador para você autorizar
 *   2. Você faz login na sua conta Google
 *   3. O script captura o código e gera o refresh token
 */

// ============================================================
// Carregar credenciais do ambiente
// ============================================================
const CLIENT_ID = process.env.GOOGLE_ADS_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_ADS_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:3000";
const SCOPES = "https://www.googleapis.com/auth/adwords";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("\n❌ Defina GOOGLE_ADS_CLIENT_ID e GOOGLE_ADS_CLIENT_SECRET no .env\n");
  process.exit(1);
}

// ============================================================
// PASSO 1: GERAR URL DE AUTORIZAÇÃO
// ============================================================

function gerarUrlAutorizacao() {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", REDIRECT_URI);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("access_type", "offline");    // ← ESSENCIAL: garante refresh token
  url.searchParams.set("prompt", "consent");          // ← ESSENCIAL: força re-autorização
  return url.toString();
}

// ============================================================
// PASSO 2: INICIAR SERVIDOR LOCAL E CAPTURAR CÓDIGO
// ============================================================

async function iniciarServidor() {
  const http = require("http");
  const { exec } = require("child_process");

  return new Promise((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, `http://localhost:3000`);

      if (url.pathname === "/") {
        const code = url.searchParams.get("code");
        const error = url.searchParams.get("error");

        if (error) {
          res.writeHead(400, { "Content-Type": "text/html" });
          res.end(`
            <h1 style="color:red">❌ Autorização negada!</h1>
            <p>Erro: ${error}</p>
            <p>Tente novamente executando o script.</p>
          `);
          reject(new Error(`Autorização negada: ${error}`));
          return;
        }

        if (code) {
          res.writeHead(200, { "Content-Type": "text/html" });
          res.end(`
            <html>
              <body style="text-align:center;font-family:sans-serif;margin-top:80px">
                <h1 style="color:green">✅ Código recebido!</h1>
                <p style="font-size:18px">Gerando refresh token... Volte para o terminal!</p>
                <p style="color:gray">Você pode fechar esta aba.</p>
                <script>window.close()</script>
              </body>
            </html>
          `);
          server.close();
          resolve(code);
          return;
        }

        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(`
          <html>
            <body style="text-align:center;font-family:sans-serif;margin-top:80px">
              <h1>⏳ Aguardando autorização...</h1>
              <p style="font-size:16px">Complete o login no Google.</p>
            </body>
          </html>
        `);
      }
    });

    server.listen(3000, () => {
      console.log("  ✅ Servidor local rodando em http://localhost:3000");
      const authUrl = gerarUrlAutorizacao();
      console.log(`  🔗 Abrindo navegador...`);
      
      exec(`open "${authUrl}"`, (err) => {
        if (err) {
          console.log(`  📋 Se não abrir automaticamente, copie esta URL:\n`);
          console.log(`  ${authUrl}\n`);
        }
      });
      
      console.log("\n  📋 Se o navegador não abrir, copie e cole esta URL manualmente:\n");
      console.log(`  ${authUrl}\n`);
    });
  });
}

// ============================================================
// PASSO 3: TROCAR CÓDIGO POR REFRESH TOKEN
// ============================================================

async function trocarCodigoPorRefreshToken(code) {
  console.log("\n  🔄 Trocando código por refresh token...\n");

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error("  ❌ Erro:", data.error_description || data.error);
    return null;
  }

  return data;
}

// ============================================================
// MAIN
// ============================================================

async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("  🔑 GERADOR DE REFRESH TOKEN - GOOGLE ADS");
  console.log("=".repeat(60) + "\n");
  console.log("  Vou abrir o navegador para você fazer login no Google.");
  console.log("  Após autorizar, o refresh token será gerado automaticamente!\n");
  console.log("  ⚠️ Importante: Use a conta Google que tem acesso ao Google Ads\n");

  try {
    console.log("  🚀 Iniciando servidor local na porta 8080...\n");
    const authorizationCode = await iniciarServidor();

    console.log("\n  ✅ Código de autorização recebido!");
    console.log(`  📝 Código: ${authorizationCode.substring(0, 50)}...\n`);

    const tokens = await trocarCodigoPorRefreshToken(authorizationCode);

    if (tokens) {
      console.log("=".repeat(60));
      console.log("  ✅ REFRESH TOKEN GERADO COM SUCESSO!\n");
      console.log("  📋 Copie o token abaixo:\n");
      console.log("  " + "─".repeat(50));
      console.log(`  ${tokens.refresh_token}`);
      console.log("  " + "─".repeat(50));
      console.log(`\n  🔑 Access Token (válido por 1h):`);
      console.log(`  ${tokens.access_token.substring(0, 50)}...`);
      console.log(`\n  ⏳ Expira em: ${tokens.expires_in} segundos`);
      console.log("\n" + "=".repeat(60));
      console.log("\n  📌 Para configurar no GitHub:");
      console.log(`  gh secret set GOOGLE_ADS_REFRESH_TOKEN --repo ojuniormartelli/relatorios-m4 --body "${tokens.refresh_token}"\n`);
      console.log("  📌 Ou acesse: https://github.com/ojuniormartelli/relatorios-m4/settings/secrets/actions\n");
    }
  } catch (err) {
    console.error(`\n  ❌ Erro: ${err.message}`);
    console.log("\n  💡 Dica: Tente novamente. Se persistir, gere manualmente:");
    console.log(`  1. Acesse: ${gerarUrlAutorizacao()}`);
    console.log("  2. Autorize o acesso");
    console.log("  3. Copie o código '?code=...' da URL de retorno");
    console.log("  4. Use o curl para trocar pelo refresh token:\n");
    console.log("  curl -X POST https://oauth2.googleapis.com/token \\");
    console.log('    -d "code=SEU_CODIGO" \\');
    console.log(`    -d "client_id=SUA_CLIENT_ID" \\`);
    console.log(`    -d "client_secret=SUA_CLIENT_SECRET" \\`);
    console.log(`    -d "redirect_uri=${REDIRECT_URI}" \\`);
    console.log(`    -d "grant_type=authorization_code"`);
    console.log();
  }
}

main();
