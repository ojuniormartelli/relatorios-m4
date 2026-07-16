'use client';

import { Copy, Check } from 'lucide-react';
import { useState, useEffect } from 'react';

interface ResumoWhatsAppProps {
  companyName: string;
  investimento: number;
  totalConversoes: number;
  custoPorConversao: number;
  totalCliques: number;
  cpc: number;
  periodo: string;
  plataforma: string;
}

export default function ResumoWhatsApp({
  companyName,
  investimento,
  totalConversoes,
  custoPorConversao,
  totalCliques,
  cpc,
  periodo,
  plataforma,
}: ResumoWhatsAppProps) {
  const [copiado, setCopiado] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    setCurrentUrl(window.location.href);
  }, []);

  const textoResumo = 
`📊 *RELATÓRIO DE PERFORMANCE - ${companyName.toUpperCase()}*
━━━━━━━━━━━━━━━━━━━━━
📅 *Período:* ${periodo}
📱 *Plataforma:* ${plataforma}

💰 *Investimento:*
• Total investido: R$ ${investimento.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

👥 *Visitantes:*
• Cliques: ${totalCliques.toLocaleString('pt-BR')}
• Custo por clique (CPC): R$ ${cpc.toFixed(2)}

🎯 *Resultados:*
• Conversões: ${totalConversoes}
• Custo por conversão (CPA): R$ ${custoPorConversao.toFixed(2)}

━━━━━━━━━━━━━━━━━━━━━
📲 *Relatório completo:* ${currentUrl}
🔗 Clique no link acima para ver gráficos detalhados`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(textoResumo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = textoResumo;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const texto = encodeURIComponent(textoResumo);
    window.open(`https://wa.me/?text=${texto}`, '_blank');
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          📱 Compartilhar no WhatsApp
        </h3>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
          >
            {copiado ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copiado ? 'Copiado!' : 'Copiar resumo'}
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <span className="text-lg">📲</span>
            Enviar via WhatsApp
          </button>
        </div>
      </div>

      {/* Preview do texto */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700 whitespace-pre-line font-mono leading-relaxed border border-gray-200">
        {textoResumo}
      </div>

      <p className="text-xs text-gray-400 mt-3">
        O cliente receberá um resumo direto no WhatsApp + link para o dashboard completo com gráficos interativos.
      </p>
    </div>
  );
}
