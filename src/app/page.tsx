import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Logo/Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">M4 Marketing Digital</h1>
          <p className="text-xl text-blue-200">Relatórios de Performance</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Acessar Relatório</h2>
            <p className="text-gray-500 mt-2">Selecione o cliente para visualizar o dashboard</p>
          </div>

          {/* Clients */}
          <div className="space-y-4">
            <Link
              href="/car13"
              className="block group"
            >
              <div className="flex items-center justify-between p-5 rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
                    C
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                      Car 13 - Auto Center
                    </h3>
                    <p className="text-sm text-gray-500">
                      Google Ads • Meta Ads • Última atualização: Junho/2024
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-blue-600">
                  <span className="text-sm font-medium">Abrir</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Quick Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-white">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Relatório Interativo</h3>
            <p className="text-sm text-blue-200">Gráficos, filtros e comparativos de performance</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-white">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold mb-1">Compartilhe via WhatsApp</h3>
            <p className="text-sm text-blue-200">Resumo automático para envio direto ao cliente</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-5 text-white">
            <div className="text-2xl mb-2">🔄</div>
            <h3 className="font-semibold mb-1">Atualização Automática</h3>
            <p className="text-sm text-blue-200">Dados atualizados diariamente às 00:00</p>
          </div>
        </div>

        {/* Admin Link */}
        <div className="text-center">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-blue-200 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Painel Administrativo
          </Link>
        </div>

        <footer className="mt-12 text-center text-sm text-blue-300">
          <p>M4 Marketing Digital © 2024 • relatorios@m4mkt.com.br</p>
        </footer>
      </div>
    </div>
  );
}
