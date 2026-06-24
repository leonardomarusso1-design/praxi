import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Praxi – Gestão para Psicólogos',
  description: 'Agenda, recibos e controle do Carnê-Leão em um único lugar. O software feito para psicólogos autônomos brasileiros.',
  icons: {
    icon: '/images/brain.png',
    apple: '/images/brain.png',
  },
  openGraph: {
    title: 'Praxi – Gestão para Psicólogos',
    description: 'Agenda, recibos e Carnê-Leão automático para psicólogos autônomos.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
