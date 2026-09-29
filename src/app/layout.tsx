import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL('https://farmacia-sph.vercel.app'),
  title: 'Vademécum Nacional de Bolivia & Consultor Médico con IA | SnowPoint Healthcare',
  description: 'Consulta oficial de más de 5,400 medicamentos registrados ante AGEMED en Bolivia. Triaje médico inteligente en 3 niveles, comparador de ahorro de genéricos bioequivalentes y red hospitalaria de La Paz y El Alto.',
  keywords: [
    'Vademécum Bolivia',
    'Medicamentos Bolivia',
    'AGEMED',
    'Farmacia Bolivia',
    'Farmacorp',
    'SnowPoint Healthcare',
    'Triaje Médico IA',
    'Genéricos Bolivia',
    'Hospitales La Paz',
    'Hospitales El Alto'
  ],
  authors: [{ name: 'SnowPoint Healthcare Bolivia' }],
  openGraph: {
    title: 'Vademécum Nacional de Bolivia & Consultor Médico IA',
    description: 'Catálogo farmacéutico oficial, comparativa de ahorro genérico y triaje clínico inteligente.',
    url: 'https://farmacia-sph.vercel.app',
    siteName: 'SnowPoint Healthcare Bolivia',
    images: [
      {
        url: '/assets/hero-banner.jpg',
        width: 1200,
        height: 630,
        alt: 'SnowPoint Healthcare Vademécum Bolivia',
      },
    ],
    locale: 'es_BO',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="scroll-smooth">
      <head>
        <link rel="icon" href="/assets/logo.jpg" />
      </head>
      <body className="min-h-screen flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}
