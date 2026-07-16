import { notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import clientesData from '@/data/clientes.json';
import car13Data from '@/data/car13.json';
import gasAurelioData from '@/data/gas-aurelio.json';
import upComunicacaoData from '@/data/up-comunicacao.json';
import juniorTerraplanagemData from '@/data/junior-terraplanagem.json';
import janaMartelliData from '@/data/jana-martelli.json';

// Registro: dataKey → dados importados
const todosDados: Record<string, any> = {
  car13: car13Data,
  'gas-aurelio': gasAurelioData,
  'up-comunicacao': upComunicacaoData,
  'junior-terraplanagem': juniorTerraplanagemData,
  'jana-martelli': janaMartelliData,
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  // Gera páginas para TODOS os IDs aleatórios dos clientes ativos
  return clientesData.clients
    .filter((c) => c.active)
    .map((client) => ({ slug: client.id }));
}

export default async function ClientDashboard({ params }: PageProps) {
  const { slug } = await params;

  // Busca o cliente pelo ID aleatório (URL)
  const cliente = clientesData.clients.find((c) => c.id === slug);
  if (!cliente) {
    notFound();
  }

  // Carrega os dados correspondentes
  const clientData = todosDados[cliente.dataKey];
  if (!clientData) {
    notFound();
  }

  return <Dashboard data={clientData} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const cliente = clientesData.clients.find((c) => c.id === slug);

  if (!cliente) {
    return { title: 'Cliente não encontrado' };
  }

  return {
    title: `${cliente.company} - Relatório de Performance`,
    description: `Relatório de performance de marketing digital para ${cliente.company}`,
  };
}
