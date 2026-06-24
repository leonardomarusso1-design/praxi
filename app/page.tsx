'use client'
import Link from 'next/link'
import { useState } from 'react'

const LINK_MENSAL = 'https://pay.cakto.com.br/v3tb44f_941204'
const LINK_ANUAL = 'https://pay.cakto.com.br/36vd9co'

const FAQ_ITEMS = [
  { q: 'Preciso de contrato ou fidelidade?', a: 'Não. Cancele quando quiser, sem taxas escondidas e sem letras miúdas. Liberdade total.' },
  { q: 'O Praxi funciona para psicólogos que atendem por plano de saúde?', a: 'Sim. Você pode registrar sessões de plano e particulares separadamente, controlando o que entra de cada fonte.' },
  { q: 'Como funciona o Carnê-Leão automático?', a: 'Cada sessão registrada como realizada alimenta o cálculo automático do mês. O sistema aplica a tabela progressiva do IR 2026 e mostra o imposto estimado — pronto para você lançar no SICALC.' },
  { q: 'Posso gerar recibos profissionais pelo sistema?', a: 'Sim. Em poucos cliques você gera um recibo com seus dados, CRP, CPF e os dados do paciente. Pode baixar em PDF e enviar pelo WhatsApp.' },
  { q: 'Os meus dados e os dos pacientes são seguros?', a: 'Sim. Usamos Supabase com criptografia de dados em repouso e em trânsito, o mesmo nível de infraestrutura de grandes bancos. Cada profissional acessa apenas seus próprios dados.' },
  { q: 'Funciona no celular?', a: 'Sim. O Praxi é responsivo e funciona em qualquer dispositivo — computador, tablet ou celular.' },
  { q: 'Posso testar antes de pagar?', a: 'Sim! O plano gratuito permite até 5 pacientes e 10 recibos por mês, para sempre. Sem precisar de cartão de crédito.' },
]

const TESTIMONIALS = [
  {
    quote: 'Gastava quase 2 horas por semana organizando planilhas e calculando impostos. Com o Praxi, faço tudo em 15 minutos. Sobrou tempo para o que realmente importa.',
    name: 'Dra. Mariana Costa',
    crp: 'CRP 06/123456 · São Paulo',
    initials: 'MC',
  },
  {
    quote: 'Finalmente um sistema feito especificamente para psicólogos autônomos. O carnê-leão automático me salvou na última declaração de IR. Não passo mais sufoco em maio.',
    name: 'Dr. Rafael Souza',
    crp: 'CRP 08/098765 · Curitiba',
    initials: 'RS',
  },
  {
    quote: 'Meus pacientes adoram receber o recibo pelo WhatsApp logo após a sessão. Transmite profissionalismo e evita aquela situação chata de cobrar depois.',
    name: 'Dra. Beatriz Lima',
    crp: 'CRP 05/067890 · Rio de Janeiro',
    initials: 'BL',
  },
]

// ── Mini App Mockup – Agenda ──────────────────────────────
function AgendaMockup() {
  return (
    <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      {/* Browser chrome */}
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="flex-1 bg-white rounded-full ml-2 px-3 py-1 text-xs text-gray-400 border border-gray-200">praxi.com.br/agenda</span>
      </div>
      <div className="flex" style={{ height: 360 }}>
        {/* Sidebar */}
        <div className="bg-violet-900 w-14 flex flex-col items-center py-4 gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
          {[
            { icon: '📅', active: true },
            { icon: '👥', active: false },
            { icon: '🧾', active: false },
            { icon: '📊', active: false },
            { icon: '⚙️', active: false },
          ].map((item, i) => (
            <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-base cursor-pointer transition-all ${item.active ? 'bg-violet-600' : 'opacity-50'}`}>
              {item.icon}
            </div>
          ))}
        </div>
        {/* Main */}
        <div className="flex-1 bg-gray-50 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-bold text-gray-900">Agenda</div>
              <div className="text-xs text-gray-400">Junho 2026</div>
            </div>
            <div className="bg-violet-700 text-white text-xs px-3 py-1 rounded-lg font-medium">+ Sessão</div>
          </div>
          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-3">
            {['D','S','T','Q','Q','S','S'].map((d, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-400 mb-1">{d}</div>
                <div className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mx-auto ${i === 2 ? 'bg-violet-700 text-white' : 'text-gray-600'}`}>
                  {i + 22}
                </div>
              </div>
            ))}
          </div>
          {/* Sessions */}
          <div className="space-y-1.5">
            {[
              { name: 'Ana Lima', time: '09:00', status: 'realizada', c: 'bg-green-50 text-green-700 border-green-200' },
              { name: 'Carlos M.', time: '10:00', status: 'agendada', c: 'bg-blue-50 text-blue-700 border-blue-200' },
              { name: 'Maria S.', time: '14:00', status: 'realizada', c: 'bg-green-50 text-green-700 border-green-200' },
              { name: 'João P.', time: '15:00', status: 'falta', c: 'bg-orange-50 text-orange-700 border-orange-200' },
              { name: 'Paula R.', time: '16:00', status: 'agendada', c: 'bg-blue-50 text-blue-700 border-blue-200' },
            ].map((s, i) => (
              <div key={i} className={`flex items-center justify-between text-xs px-2.5 py-2 rounded-lg border ${s.c}`}>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-current opacity-20 flex items-center justify-center" />
                  <span className="font-medium">{s.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="opacity-70">{s.time}</span>
                  <span className="opacity-60 text-xs">• {s.status}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Legend */}
          <div className="flex items-center gap-3 mt-3 pt-2 border-t border-gray-200">
            {[
              { c: 'bg-blue-200', l: 'Agendada' },
              { c: 'bg-green-200', l: 'Realizada' },
              { c: 'bg-orange-200', l: 'Falta' },
              { c: 'bg-red-200', l: 'Cancelada' },
            ].map(x => (
              <div key={x.l} className="flex items-center gap-1">
                <span className={`w-2.5 h-2.5 rounded-full ${x.c}`} />
                <span className="text-xs text-gray-400">{x.l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mini App Mockup – Recibo ──────────────────────────────
function ReciboMockup() {
  return (
    <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200 bg-white">
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="flex-1 bg-white rounded-full ml-2 px-3 py-1 text-xs text-gray-400 border border-gray-200">praxi.com.br/recibos</span>
      </div>
      <div className="flex" style={{ height: 360 }}>
        <div className="bg-violet-900 w-14 flex flex-col items-center py-4 gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
          {['📅','👥','🧾','📊','⚙️'].map((icon, i) => (
            <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${i === 2 ? 'bg-violet-600' : 'opacity-40'}`}>{icon}</div>
          ))}
        </div>
        <div className="flex-1 bg-gray-50 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-bold text-gray-900">Recibos</div>
            <div className="bg-violet-700 text-white text-xs px-3 py-1 rounded-lg font-medium">+ Emitir recibo</div>
          </div>
          {/* Recibo preview */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-xs font-bold text-violet-700 mb-0.5">PRAXI</div>
                <div className="text-xs text-gray-500 font-medium">RECIBO Nº 20260042</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-400">24/06/2026</div>
                <div className="text-lg font-bold text-gray-900">R$ 200,00</div>
              </div>
            </div>
            <div className="border-t border-gray-100 pt-3 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Profissional</span>
                <span className="text-gray-800 font-medium">Dra. Ana Silva, CRP 06/12345</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Paciente</span>
                <span className="text-gray-800 font-medium">Carlos Mendes</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Serviço</span>
                <span className="text-gray-800 font-medium">Sessão de Psicologia</span>
              </div>
            </div>
            <div className="mt-3 flex gap-2">
              <div className="flex-1 bg-violet-50 text-violet-700 text-xs py-1.5 rounded-lg text-center font-medium cursor-pointer">⬇ Baixar PDF</div>
              <div className="flex-1 bg-green-50 text-green-700 text-xs py-1.5 rounded-lg text-center font-medium cursor-pointer">📱 WhatsApp</div>
            </div>
          </div>
          {/* Table row */}
          <div className="mt-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
            {[
              { n: '20260041', p: 'Maria Souza', v: 'R$ 180,00', d: '20/06/2026' },
              { n: '20260040', p: 'Ana Lima', v: 'R$ 200,00', d: '17/06/2026' },
            ].map(r => (
              <div key={r.n} className="flex items-center justify-between px-3 py-2 border-b border-gray-50 text-xs">
                <span className="font-mono text-gray-400">{r.n}</span>
                <span className="font-medium text-gray-700">{r.p}</span>
                <span className="text-gray-400">{r.d}</span>
                <span className="font-bold text-green-700">{r.v}</span>
                <span className="text-violet-600 cursor-pointer">⬇</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Mini App Mockup – Carnê-Leão ──────────────────────────
function CarneMockup() {
  return (
    <div className="rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
      <div className="bg-gray-100 px-4 py-2.5 flex items-center gap-2 border-b border-gray-200">
        <span className="w-3 h-3 rounded-full bg-red-400" />
        <span className="w-3 h-3 rounded-full bg-yellow-400" />
        <span className="w-3 h-3 rounded-full bg-green-400" />
        <span className="flex-1 bg-white rounded-full ml-2 px-3 py-1 text-xs text-gray-400 border border-gray-200">praxi.com.br/carne-leao</span>
      </div>
      <div className="flex" style={{ height: 360 }}>
        <div className="bg-violet-900 w-14 flex flex-col items-center py-4 gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">P</div>
          {['📅','👥','🧾','📊','⚙️'].map((icon, i) => (
            <div key={i} className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${i === 3 ? 'bg-violet-600' : 'opacity-40'}`}>{icon}</div>
          ))}
        </div>
        <div className="flex-1 bg-gray-50 p-4">
          <div className="text-sm font-bold text-gray-900 mb-1">Carnê-Leão</div>
          <div className="text-xs text-gray-400 mb-4">Junho 2026 · Tabela IR 2026</div>
          {/* KPI cards */}
          <div className="grid grid-cols-2 gap-2 mb-3">
            {[
              { label: 'Total Recebido', value: 'R$ 4.200,00', color: 'text-gray-900' },
              { label: 'Alíquota', value: '15%', color: 'text-orange-600' },
              { label: 'Deduções', value: 'R$ 320,00', color: 'text-blue-600' },
              { label: 'Imposto Devido', value: 'R$ 546,00', color: 'text-red-600 font-bold' },
            ].map(k => (
              <div key={k.label} className="bg-white rounded-xl border border-gray-100 p-2.5 shadow-sm">
                <div className="text-xs text-gray-400 mb-1">{k.label}</div>
                <div className={`text-sm font-semibold ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div className="bg-white rounded-xl border border-gray-100 p-3 shadow-sm">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Faixa de tributação</span>
              <span className="font-medium text-orange-600">15% sobre excedente</span>
            </div>
            <div className="bg-gray-100 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-400 via-yellow-400 to-orange-500 h-2 rounded-full" style={{ width: '62%' }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Isento até R$2.259</span>
              <span>27,5% acima de R$4.664</span>
            </div>
          </div>
          <div className="mt-2 bg-violet-50 border border-violet-100 rounded-xl p-2.5 text-xs text-violet-700">
            💡 Prazo de recolhimento: até o último dia útil de julho/2026
          </div>
        </div>
      </div>
    </div>
  )
}

// ── FAQ Item ──────────────────────────────────────────────
function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="font-medium text-gray-900 text-sm md:text-base">{q}</span>
        <span className={`text-violet-600 text-xl font-light flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-45' : ''}`}>+</span>
      </button>
      {open && (
        <p className="text-sm text-gray-500 pb-5 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

// ── MAIN LANDING PAGE ────────────────────────────────────
export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>

      {/* ── NAV ────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo.png" alt="Praxi" className="h-9 w-auto" onError={(e: any) => { e.currentTarget.style.display='none'; e.currentTarget.nextSibling.style.display='flex'; }} />
            <span className="text-2xl font-bold text-violet-700 tracking-tight hidden items-center">Praxi</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#funcionalidades" className="hover:text-gray-900 transition-colors">Funcionalidades</a>
            <a href="#automacoes" className="hover:text-gray-900 transition-colors">Automações</a>
            <a href="#planos" className="hover:text-gray-900 transition-colors">Planos</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">Dúvidas</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2 hidden sm:block">Entrar</Link>
            <Link href="/cadastro" className="btn-primary text-sm px-5 py-2">Começar grátis</Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 lg:pt-24 lg:pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-semibold px-4 py-2 rounded-full mb-6 border border-violet-100">
              ✨ Feito para psicólogos autônomos brasileiros
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-6">
              O software que cuida da{' '}
              <span className="text-violet-700">sua gestão</span>{' '}
              enquanto você cuida dos seus{' '}
              <span className="text-violet-700">pacientes</span>
            </h1>
            <p className="text-lg text-gray-500 mb-8 leading-relaxed">
              Agenda inteligente, recibos em PDF, Carnê-Leão automático e controle financeiro. Tudo em um lugar, sem planilha, sem dor de cabeça.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Link href="/cadastro" className="btn-primary text-base px-8 py-3.5 text-center font-semibold">
                Criar conta grátis
              </Link>
              <a href="#funcionalidades" className="btn-secondary text-base px-8 py-3.5 text-center font-medium">
                Ver como funciona
              </a>
            </div>
            <p className="text-sm text-gray-400">Sem cartão de crédito · Grátis para começar</p>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <img
                src="/images/hero-mockup.jpg"
                alt="Dashboard do Praxi no tablet"
                className="w-full rounded-2xl shadow-2xl"
                onError={(e: any) => { e.currentTarget.style.display = 'none'; (e.currentTarget.nextSibling as HTMLElement).style.display = 'block'; }}
              />
              <div style={{ display: 'none' }}>
                <AgendaMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ──────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Psicólogos usando' },
            { value: '12 mil+', label: 'Sessões organizadas' },
            { value: '8 mil+', label: 'Recibos emitidos' },
            { value: '100%', label: 'Sem fidelidade' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-violet-700 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEMA ───────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Quantas horas você perde por semana com burocracia?
        </h2>
        <p className="text-gray-500 text-lg mb-12 max-w-2xl mx-auto">
          Planilhas desatualizadas, recibos feitos no Word, carnê-leão calculado na mão em cima do prazo. Existe um jeito melhor.
        </p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { emoji: '📋', before: 'Planilha de pacientes desorganizada', after: 'Ficha completa com histórico de sessões' },
            { emoji: '🧾', before: 'Recibo feito no Word e enviado por e-mail', after: 'Recibo gerado em 1 clique, enviado pelo WhatsApp' },
            { emoji: '😰', before: 'Carnê-Leão calculado na correria em maio', after: 'Imposto calculado automaticamente todo mês' },
          ].map(item => (
            <div key={item.before} className="bg-white rounded-2xl border border-gray-100 p-6 text-left shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{item.emoji}</div>
              <div className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-2">Antes</div>
              <div className="text-sm text-gray-500 mb-4 line-through">{item.before}</div>
              <div className="text-xs text-green-600 font-semibold uppercase tracking-wide mb-2">Com o Praxi</div>
              <div className="text-sm text-gray-900 font-medium">{item.after}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────── */}
      <section id="funcionalidades" className="bg-gray-50 py-20">

        {/* Feature 1 - Agenda */}
        <div className="max-w-6xl mx-auto px-6 mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-blue-100">
                📅 Agenda
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Agenda visual com controle total das sessões
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Visualize toda a sua semana de um jeito claro. Marque, remarque e cancele sessões em segundos. Cada cor tem um significado — você nunca perde o controle.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  '🔵 Azul: sessão agendada',
                  '🟢 Verde: sessão realizada',
                  '🟠 Laranja: paciente deu falta',
                  '🔴 Vermelho: sessão cancelada',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="btn-primary inline-block">
                Experimentar grátis →
              </Link>
            </div>
            <div>
              <img src="/images/hero-mockup.jpg" alt="Dashboard Praxi com agenda" className="w-full rounded-2xl shadow-xl"
                onError={(e: any) => { e.currentTarget.style.display='none'; (e.currentTarget.nextSibling as HTMLElement).style.display='block'; }} />
              <div style={{display:'none'}}><AgendaMockup /></div>
            </div>
          </div>
        </div>

        {/* Feature 2 - Recibos */}
        <div className="max-w-6xl mx-auto px-6 mb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <img src="/images/recibo-feature.jpg" alt="Recibo profissional Praxi" className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                onError={(e: any) => { e.currentTarget.style.display='none'; (e.currentTarget.nextSibling as HTMLElement).style.display='block'; }} />
              <div style={{display:'none'}}><ReciboMockup /></div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-green-100">
                🧾 Recibos
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Recibo profissional gerado em 1 clique
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Gere recibos com seus dados, CRP, CPF e os dados do paciente. Baixe em PDF e envie direto pelo WhatsApp. Sem Word, sem planilha, sem perder tempo.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Numeração automática e sequencial',
                  'Dados do profissional preenchidos automaticamente',
                  'Associe o recibo diretamente à sessão',
                  'Histórico de todos os recibos emitidos',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-violet-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="btn-primary inline-block">
                Experimentar grátis →
              </Link>
            </div>
          </div>
        </div>

        {/* Feature 3 - Carnê-Leão */}
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4 border border-orange-100">
                📊 Carnê-Leão
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Carnê-Leão calculado automaticamente todo mês
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                O sistema aplica a tabela progressiva do IR 2026 e calcula o imposto estimado automaticamente com base nas suas sessões realizadas. Sem surpresas em maio.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  'Tabela IR 2026 atualizada (isento até R$ 2.259,20)',
                  'Cálculo automático mês a mês',
                  'Controle de deduções permitidas',
                  'Prazo de recolhimento sempre visível',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <span className="text-violet-600 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="btn-primary inline-block">
                Experimentar grátis →
              </Link>
            </div>
            <div>
              <img src="/images/carne-feature.jpg" alt="Carnê-Leão automático Praxi" className="w-full max-w-md mx-auto rounded-2xl shadow-xl"
                onError={(e: any) => { e.currentTarget.style.display='none'; (e.currentTarget.nextSibling as HTMLElement).style.display='block'; }} />
              <div style={{display:'none'}}><CarneMockup /></div>
            </div>
          </div>
        </div>
      </section>

      {/* ── AUTOMAÇÕES ─────────────────────────────────── */}
      <section id="automacoes" className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Automações que salvam o seu tempo</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Processos que você fazia na mão, agora acontecem automaticamente</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '📱',
              title: 'Lembrete de sessão via WhatsApp',
              desc: 'Com 1 clique, gere a mensagem pronta de lembrete para o paciente. Reduz faltas sem esforço.',
            },
            {
              icon: '🧾',
              title: 'Recibo gerado após a sessão',
              desc: 'Ao marcar uma sessão como realizada, o sistema oferece para gerar o recibo automaticamente.',
            },
            {
              icon: '📊',
              title: 'Carnê-Leão calculado todo mês',
              desc: 'Cada sessão realizada alimenta o cálculo do IR automaticamente. Você apenas recolhe.',
            },
            {
              icon: '⚠️',
              title: 'Alertas de sessões não pagas',
              desc: 'O dashboard mostra quais sessões realizadas ainda não foram pagas. Nunca esqueça um recebimento.',
            },
            {
              icon: '📈',
              title: 'Relatório mensal automático',
              desc: 'Veja no dashboard quantas sessões fez, quanto recebeu e quanto de imposto vai pagar neste mês.',
            },
            {
              icon: '🔒',
              title: 'Dados seguros e privados',
              desc: 'Cada profissional acessa apenas seus dados. Criptografia de ponta, como em bancos digitais.',
            },
          ].map(a => (
            <div key={a.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-3">{a.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2 text-sm">{a.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PILARES ────────────────────────────────────── */}
      <section className="bg-violet-700 py-16">
        <div className="max-w-5xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center text-white">
          {[
            { icon: '🔓', title: 'Sem fidelidade', desc: 'Cancele quando quiser. Sem contrato, sem taxa de saída.' },
            { icon: '💳', title: 'Sem cartão para testar', desc: 'Crie sua conta e comece a usar agora. Peço o cartão só se você quiser o Pro.' },
            { icon: '♾️', title: 'Ilimitado de verdade', desc: 'No plano Pro, pacientes, sessões e recibos são ilimitados.' },
          ].map(p => (
            <div key={p.title}>
              <div className="text-4xl mb-3">{p.icon}</div>
              <h3 className="font-bold text-lg mb-2">{p.title}</h3>
              <p className="text-violet-200 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIALS ───────────────────────────────── */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">O que psicólogos dizem sobre o Praxi</h2>
          <p className="text-gray-500">Resultados reais de quem usa no dia a dia</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
              <div className="flex mb-3">
                {[1,2,3,4,5].map(i => <span key={i} className="text-yellow-400 text-sm">★</span>)}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.quote}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                  {t.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.crp}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────── */}
      <section id="planos" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Preço simples, sem surpresa</h2>
            <p className="text-gray-500">Comece grátis, assine Pro quando quiser crescer</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Free */}
            <div className="bg-white rounded-2xl border border-gray-200 p-8">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">GRÁTIS</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">R$0</div>
              <div className="text-sm text-gray-400 mb-6">para sempre</div>
              <ul className="space-y-3 mb-8">
                {[
                  'Até 5 pacientes',
                  'Agenda completa',
                  '10 recibos por mês',
                  'Carnê-Leão básico',
                  'Dashboard de resumo',
                ].map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="text-green-500 font-bold">✓</span>{i}
                  </li>
                ))}
              </ul>
              <Link href="/cadastro" className="btn-secondary w-full text-center block py-3 font-medium">
                Criar conta grátis
              </Link>
            </div>
            {/* Pro */}
            <div className="bg-white rounded-2xl border-2 border-violet-600 p-8 relative shadow-lg">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-violet-700 text-white text-xs font-bold px-5 py-1.5 rounded-full">
                ⭐ MAIS POPULAR
              </div>
              <div className="text-xs font-bold text-violet-600 uppercase tracking-wide mb-2">PRO</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">
                R$39<span className="text-lg font-normal text-gray-400">/mês</span>
              </div>
              <div className="text-sm text-violet-600 font-medium mb-6">
                ou R$29,90/mês no anual (economize 25%)
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Pacientes ilimitados',
                  'Recibos ilimitados em PDF',
                  'Carnê-Leão automático completo',
                  'Alertas de sessões não pagas',
                  'Relatório para o contador',
                  'WhatsApp de lembrete integrado',
                  'Suporte prioritário',
                ].map(i => (
                  <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-violet-600 font-bold">✓</span>{i}
                  </li>
                ))}
              </ul>
              <div className="space-y-2">
                <a href={LINK_MENSAL} className="btn-primary w-full text-center block py-3 font-semibold">
                  Assinar por R$39/mês
                </a>
                <a href={LINK_ANUAL} className="block text-center text-sm text-violet-600 hover:text-violet-800 py-2 font-medium">
                  Assinar anual e economizar 25% →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────── */}
      <section id="faq" className="py-20 max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Perguntas frequentes</h2>
          <p className="text-gray-500">Tudo que você precisa saber antes de começar</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 px-6 shadow-sm">
          {FAQ_ITEMS.map((item, i) => (
            <FaqItem
              key={i}
              q={item.q}
              a={item.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────── */}
      <section className="pb-20 px-6">
        <div className="max-w-3xl mx-auto bg-violet-700 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Comece agora mesmo, é grátis</h2>
          <p className="text-violet-200 mb-8 leading-relaxed max-w-xl mx-auto">
            Junte-se a centenas de psicólogos que já param de perder tempo com burocracia e focam no que importa.
          </p>
          <Link href="/cadastro" className="inline-block bg-white text-violet-700 font-bold px-10 py-4 rounded-xl text-base hover:bg-violet-50 transition-colors">
            Criar minha conta grátis →
          </Link>
          <p className="text-violet-300 text-sm mt-4">Sem cartão de crédito · Cancele quando quiser</p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────── */}
      <footer className="border-t border-gray-100 py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <Link href="/" className="inline-block mb-3">
              <img src="/images/logo.png" alt="Praxi" className="h-8 w-auto" />
            </Link>
              <p className="text-sm text-gray-500 leading-relaxed max-w-xs">
                O software de gestão feito para psicólogos autônomos brasileiros. Agenda, recibos e Carnê-Leão em um só lugar.
              </p>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-4">Produto</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#funcionalidades" className="hover:text-gray-900">Funcionalidades</a></li>
                <li><a href="#planos" className="hover:text-gray-900">Planos e preços</a></li>
                <li><a href="#automacoes" className="hover:text-gray-900">Automações</a></li>
                <li><Link href="/cadastro" className="hover:text-gray-900">Criar conta grátis</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-4">Suporte</div>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#faq" className="hover:text-gray-900">Perguntas frequentes</a></li>
                <li><Link href="/login" className="hover:text-gray-900">Acessar sistema</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-400">© 2026 Praxi · Feito com ❤️ para psicólogos brasileiros</p>
            <p className="text-xs text-gray-400">LGPD · Seus dados são seus</p>
          </div>
        </div>
      </footer>

    </div>
  )
}
