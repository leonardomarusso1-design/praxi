'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const nav = [
  { href: '/dashboard', icon: '⚡', label: 'Dashboard' },
  { href: '/pacientes', icon: '👥', label: 'Pacientes' },
  { href: '/agenda', icon: '📅', label: 'Agenda' },
  { href: '/recibos', icon: '🧾', label: 'Recibos' },
  { href: '/carne-leao', icon: '📊', label: 'Carnê-Leão' },
  { href: '/configuracoes', icon: '⚙️', label: 'Configurações' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function logout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="w-56 min-h-screen bg-white border-r border-gray-100 flex flex-col">
      <div className="px-6 py-5 border-b border-gray-100">
        <span className="text-xl font-bold text-violet-700">Praxi</span>
        <p className="text-xs text-gray-400 mt-0.5">Gestão para psicólogos</p>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${active ? 'bg-violet-50 text-violet-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <button onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:bg-gray-50">
          <span>🚪</span> Sair
        </button>
      </div>
    </aside>
  )
}
