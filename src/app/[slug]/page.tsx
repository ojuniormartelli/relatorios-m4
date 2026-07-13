import { notFound } from 'next/navigation';
import Dashboard from '@/components/Dashboard';
import car13Data from '@/data/car13.json';

// This would normally come from a database
const clientsData: Record<string, typeof car13Data> = {
  car13: car13Data,
};

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return Object.keys(clientsData).map((slug) => ({ slug }));
}

export default async function ClientDashboard({ params }: PageProps) {
  const { slug } = await params;
  const clientData = clientsData[slug];

  if (!clientData) {
    notFound();
  }

  return <Dashboard data={clientData} />;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const clientData = clientsData[slug];

  if (!clientData) {
    return { title: 'Cliente não encontrado' };
  }

  return {
    title: `${clientData.client.company} - Relatório de Performance`,
    description: `Relatório de performance de marketing digital para ${clientData.client.company}`,
  };
}
