import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">M4 Marketing Digital</h1>
          <p className="text-gray-500 mt-2">Relatórios de Performance</p>
        </div>
        
        <div className="space-y-4">
          <Link
            href="/car13"
            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Acessar Relatório - Car 13
          </Link>
        </div>

        <p className="text-xs text-gray-400 mt-8">
          Relatórios atualizados automaticamente
        </p>
      </div>
    </div>
  );
}
