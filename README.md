# Relatórios M4 Marketing Digital

Sistema de relatórios interativos para clientes da M4 Marketing Digital.

## 🚀 Como funciona

1. **Dados**: Cada cliente tem um arquivo JSON em `src/data/`
2. **Dashboard**: Relatório interativo com filtros, gráficos e tabelas
3. **Deploy**: Automático via GitHub + Vercel

## 📦 Estrutura do Projeto

```
relatorios-m4/
├── src/
│   ├── app/
│   │   ├── [slug]/          # Dashboard do cliente (ex: /car13)
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx         # Página inicial
│   ├── components/
│   │   ├── Dashboard.tsx    # Componente principal
│   │   ├── ResumoGeral.tsx  # Cards de resumo
│   │   ├── GraficoEvolucao.tsx  # Gráficos
│   │   ├── TabelaCampanhas.tsx  # Tabela de campanhas
│   │   └── Filtros.tsx      # Filtros de período/plataforma
│   └── data/
│       └── car13.json       # Dados do cliente Car 13
├── package.json
└── vercel.json
```

## 🛠️ Setup

### 1. Instalar dependências
```bash
npm install
```

### 2. Rodar localmente
```bash
npm run dev
```

Acesse: `http://localhost:3000/car13`

### 3. Deploy na Vercel

1. Crie um repositório no GitHub
2. Envie o código:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/SEU-USER/relatorios-m4.git
git push -u origin main
```

3. Acesse [vercel.com](https://vercel.com)
4. Importe o repositório do GitHub
5. Deploy automático!

## 📊 Adicionando um Novo Cliente

1. Crie um arquivo JSON em `src/data/` (copie `car13.json` como exemplo)
2. Atualize o objeto `clientsData` em `src/app/[slug]/page.tsx`
3. Adicione o link na página inicial `src/app/page.tsx`
4. Faça push para o GitHub - deploy automático!

## 🔄 Atualizando Dados

### Opção 1: Manual
Edite o arquivo JSON do cliente e faça push para o GitHub.

### Opção 2: Automática (futuro)
Configure um script para puxar dados das APIs do Google/Meta Ads e atualizar os JSONs automaticamente.

## 📱 Acesso do Cliente

Cada cliente acessa pelo link:
```
https://seu-app.vercel.app/car13
```

O slug (ex: `car13`) é o identificador único de cada cliente.

## 🎨 Personalização

### Cores
Edite as cores no arquivo JSON do cliente:
```json
{
  "client": {
    "primaryColor": "#1E40AF",
    "secondaryColor": "#3B82F6"
  }
}
```

### Logo
Coloque a logo em `public/logos/` e atualize o JSON.

## 📋 Estrutura dos Dados

Veja o arquivo `src/data/car13.json` para entender a estrutura completa.

### Campos principais:
- **client**: Informações do cliente (nome, slug, cores)
- **monthlyData**: Dados mensais (investimento, conversões, receita)
- **campaigns**: Dados por campanha

## 🔐 Segurança

Cada cliente tem um slug único e difícil de adivinhar. Para mais segurança, você pode:
- Usar UUIDs como slugs
- Adicionar autenticação (futuro)
- Restringir acesso por IP

## 📈 Próximos Passos

- [ ] Integração com APIs do Google Ads
- [ ] Integração com APIs do Meta Ads
- [ ] Atualização automática via cron job
- [ ] Dashboard administrativo para a M4
- [ ] Autenticação de clientes
- [ ] Exportar relatório em PDF

## 🤝 Suporte

Dúvidas? Fale com a equipe M4 Marketing Digital.
