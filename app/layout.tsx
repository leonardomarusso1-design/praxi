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
      <head>
        <script type="text/javascript" dangerouslySetInnerHTML={{ __html: `
          (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "xdpwubey17");
        `}} />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
