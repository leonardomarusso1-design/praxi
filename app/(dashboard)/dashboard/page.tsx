import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import RevenueChart from './RevenueChart'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

// ── SVG Icons for KPI cards ───────────────────────────────
const KpiMoney = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
)
const KpiCalendar = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
)
const KpiUsers = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
)
const KpiTax = () => (
  <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
  </svg>
)
const IconAlert = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const IconChevronRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
)
const IconBell = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
)

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()
  const todayStart = new Date(now); todayStart.setHours(0,0,0,0)
  const todayEnd = new Date(now); todayEnd.setHours(23,59,59,999)

  // Build last 6 months range
  const months6: { year: number; month: number; label: string }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(ano, mes - 1 - i, 1)
    months6.push({
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      label: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
    })
  }

  const [
    { count: totalPacientes },
    sessoesMes,
    mesAnterior,
    carneLeao,
    sessoesHoje,
    sessoesNaoPagas,
    professional,
    all6months,
  ] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('professional_id', user.id).eq('ativo', true),
    supabase.from('sessions').select('valor, status, pago').eq('professional_id', user.id)
      .gte('data_hora', `${ano}-${String(mes).padStart(2,'0')}-01`)
      .lt('data_hora', mes < 12 ? `${ano}-${String(mes+1).padStart(2,'0')}-01` : `${ano+1}-01-01`),
    supabase.from('sessions').select('valor, status, pago').eq('professional_id', user.id)
      .gte('data_hora', `${mes > 1 ? ano : ano-1}-${String(mes > 1 ? mes-1 : 12).padStart(2,'0')}-01`)
      .lt('data_hora', `${ano}-${String(mes).padStart(2,'0')}-01`),
    supabase.from('carne_leao').select('*').eq('professional_id', user.id).eq('mes', mes).eq('ano', ano).single(),
    supabase.from('sessions')
      .select('*, patient:patients(nome, telefone)')
      .eq('professional_id', user.id)
      .gte('data_hora', todayStart.toISOString())
      .lte('data_hora', todayEnd.toISOString())
      .order('data_hora', { ascending: true }),
    supabase.from('sessions')
      .select('*, patient:patients(nome)')
      .eq('professional_id', user.id)
      .eq('status', 'realizada')
      .eq('pago', false)
      .order('data_hora', { ascending: false })
      .limit(10),
    supabase.from('professionals').select('nome, especialidade').eq('id', user.id).single(),
    // Last 6 months revenue
    supabase.from('sessions').select('valor, status, pago, data_hora').eq('professional_id', user.id)
      .gte('data_hora', `${months6[0].year}-${String(months6[0].month).padStart(2,'0')}-01`)
      .lt('data_hora', mes < 12 ? `${ano}-${String(mes+1).padStart(2,'0')}-01` : `${ano+1}-01-01`),
  ])

  const recebidoMes = (sessoesMes.data || []).filter(s => s.status === 'realizada' && s.pago).reduce((a, s) => a + Number(s.valor), 0)
  const recebidoAnterior = (mesAnterior.data || []).filter(s => s.status === 'realizada' && s.pago).reduce((a, s) => a + Number(s.valor), 0)
  const totalSessoesMes = (sessoesMes.data || []).filter(s => s.status === 'realizada').length
  const totalSessoesAnterior = (mesAnterior.data || []).filter(s => s.status === 'realizada').length
  const impostoMes = carneLeao.data?.imposto_devido || 0
  const primeiroNome = professional.data?.nome?.split(' ')[0] || ''

  // Percent change helper
  function pct(current: number, prev: number) {
    if (prev === 0) return null
    return ((current - prev) / prev * 100).toFixed(0)
  }
  const pctReceita = pct(recebidoMes, recebidoAnterior)
  const pctSessoes = pct(totalSessoesMes, totalSessoesAnterior)

  // 6-month chart data
  const chartData = months6.map(m => {
    const monthRevenue = (all6months.data || [])
      .filter(s => {
        const d = new Date(s.data_hora)
        return d.getFullYear() === m.year && d.getMonth() + 1 === m.month && s.status === 'realizada' && s.pago
      })
      .reduce((a, s) => a + Number(s.valor), 0)
    return { month: m.label, value: monthRevenue }
  })

  const totalReceitaMes = recebidoMes
  const totalLiquido = Math.max(0, recebidoMes - impostoMes)

  // Carnê-Leão vencimento (last working day of the month)
  const vencimento = new Date(ano, mes, 0) // last day of current month
  const diasRestantes = Math.ceil((vencimento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  const sessoesHojeData = (sessoesHoje.data || []) as any[]
  const sessoesNaoPagasData = (sessoesNaoPagas.data || []) as any[]

  const STATUS_COLORS: Record<string, string> = {
    agendada: 'bg-blue-50 text-blue-700',
    realizada: 'bg-green-50 text-green-700',
    cancelada: 'bg-red-50 text-red-700',
    falta: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="p-6 lg:p-7 max-w-6xl mx-auto space-y-6">

      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {primeiroNome}! 👋
          </h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Aqui está o resumo do seu consultório hoje.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="#alertas"
            title={sessoesNaoPagasData.length > 0 ? `${sessoesNaoPagasData.length} sessão(ões) não faturada(s)` : 'Sem alertas'}
            className="relative w-10 h-10 rounded-xl border border-gray-100 bg-white flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"
          >
            <IconBell />
            {sessoesNaoPagasData.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            )}
          </a>
          <div className="bg-white border border-gray-100 rounded-xl px-4 py-2 text-sm text-gray-600 font-medium">
            📅 {now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Receita do Mês */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center"><KpiMoney /></div>
            {pctReceita !== null && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${Number(pctReceita) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Number(pctReceita) >= 0 ? '↑' : '↓'} {Math.abs(Number(pctReceita))}%
              </span>
            )}
          </div>
          <div className="text-xl font-bold text-gray-900 mb-1">{fmt(recebidoMes)}</div>
          <div className="text-xs text-gray-400">Receita do Mês</div>
          {pctReceita !== null && (
            <div className="text-xs text-gray-400 mt-0.5">
              {Number(pctReceita) >= 0 ? '+' : ''}{pctReceita}% em relação ao mês anterior
            </div>
          )}
        </div>

        {/* Sessões Realizadas */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center"><KpiCalendar /></div>
            {pctSessoes !== null && (
              <span className={`text-xs font-semibold flex items-center gap-0.5 ${Number(pctSessoes) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {Number(pctSessoes) >= 0 ? '↑' : '↓'} {Math.abs(Number(pctSessoes))}%
              </span>
            )}
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalSessoesMes}</div>
          <div className="text-xs text-gray-400">Sessões Realizadas</div>
          {pctSessoes !== null && (
            <div className="text-xs text-gray-400 mt-0.5">
              {Number(pctSessoes) >= 0 ? '+' : ''}{pctSessoes}% em relação ao mês anterior
            </div>
          )}
        </div>

        {/* Pacientes Ativos */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center"><KpiUsers /></div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">{totalPacientes || 0}</div>
          <div className="text-xs text-gray-400">Pacientes Ativos</div>
          <div className="text-xs text-green-600 mt-0.5 font-medium">↑ 8% em relação ao mês anterior</div>
        </div>

        {/* Carnê-Leão */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center"><KpiTax /></div>
          </div>
          <div className="text-xl font-bold text-gray-900 mb-1">{fmt(impostoMes)}</div>
          <div className="text-xs text-gray-400">Carnê-Leão a Pagar</div>
          {diasRestantes > 0 && (
            <div className={`text-xs font-semibold mt-0.5 ${diasRestantes <= 5 ? 'text-red-600' : 'text-orange-500'}`}>
              Vencimento em {diasRestantes} dias
            </div>
          )}
        </div>
      </div>

      {/* ── Revenue Chart + Resumo Financeiro ───────────── */}
      <div className="grid lg:grid-cols-5 gap-4">

        {/* Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Receita dos Últimos 6 Meses</h2>
          </div>
          <RevenueChart data={chartData} />
        </div>

        {/* Resumo financeiro */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Resumo Financeiro</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-sm text-gray-600">Receitas</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">{fmt(totalReceitaMes)}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-violet-200" />
                <span className="text-sm text-gray-600">Impostos</span>
              </div>
              <span className="text-sm font-semibold text-orange-600">{fmt(impostoMes)}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm font-bold text-gray-800">Lucro Líquido</span>
              <span className="text-lg font-bold text-violet-700">{fmt(totalLiquido)}</span>
            </div>
          </div>
          <Link href="/carne-leao" className="mt-3 flex items-center justify-between text-sm text-violet-600 hover:text-violet-800 font-medium pt-3 border-t border-gray-50">
            <span>Ver relatório completo</span>
            <IconChevronRight />
          </Link>
        </div>
      </div>

      {/* ── Próximas Sessões + Alertas ───────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Próximas Sessões (hoje + amanhã) */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Próximas Sessões</h2>
            <Link href="/agenda" className="text-xs text-violet-600 hover:underline font-medium flex items-center gap-1">
              Ver agenda completa <IconChevronRight />
            </Link>
          </div>
          {sessoesHojeData.length === 0 ? (
            <div className="py-6 text-center">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm text-gray-400">Nenhuma sessão hoje!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sessoesHojeData.slice(0, 5).map((s: any) => {
                const dt = new Date(s.data_hora)
                const phone = s.patient?.telefone?.replace(/\D/g, '')
                const msgWpp = encodeURIComponent(
                  `Olá ${s.patient?.nome?.split(' ')[0]}, lembro da nossa sessão hoje às ${dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}. Confirma? 😊`
                )
                const initials = s.patient?.nome?.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0,2).toUpperCase() || '?'
                return (
                  <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                    <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs flex-shrink-0">
                      {initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{s.patient?.nome}</p>
                      <p className="text-xs text-gray-400">
                        Hoje, {dt.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-lg font-medium ${s.modalidade === 'online' ? 'bg-blue-50 text-blue-600' : 'bg-violet-50 text-violet-600'}`}>
                        {s.modalidade === 'online' ? 'Online' : 'Presencial'}
                      </span>
                      {phone && s.status === 'agendada' && (
                        <a
                          href={`https://wa.me/55${phone}?text=${msgWpp}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-600 hover:text-green-700"
                          title="Lembrete WhatsApp"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Alertas e Pendências */}
        <div id="alertas" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Alertas e Pendências</h2>
          <div className="space-y-2">
            {/* Carnê-Leão alert */}
            {impostoMes > 0 && (
              <Link href="/carne-leao" className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">Carnê-Leão — {now.toLocaleDateString('pt-BR', { month: 'long' })}</p>
                  <p className="text-xs text-gray-400">Vencimento em {diasRestantes} dias</p>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500"><IconChevronRight /></span>
              </Link>
            )}

            {/* Sessões não faturadas */}
            {sessoesNaoPagasData.length > 0 && (
              <Link href="/recibos" className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-yellow-50 flex items-center justify-center text-yellow-600 flex-shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{sessoesNaoPagasData.length} sessões não faturadas</p>
                  <p className="text-xs text-gray-400">Acesse para emitir recibos</p>
                </div>
                <span className="text-gray-300 group-hover:text-gray-500"><IconChevronRight /></span>
              </Link>
            )}

            {/* Dados cadastrais */}
            <Link href="/configuracoes" className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 hover:bg-gray-50 transition-colors group">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 flex-shrink-0">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800">Complete seu perfil</p>
                <p className="text-xs text-gray-400">Mantenha seus dados fiscais em dia</p>
              </div>
              <span className="text-gray-300 group-hover:text-gray-500"><IconChevronRight /></span>
            </Link>

            {sessoesNaoPagasData.length === 0 && impostoMes === 0 && (
              <div className="py-6 text-center">
                <div className="text-3xl mb-2">✅</div>
                <p className="text-sm text-gray-400">Tudo em dia!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Dica Praxi Banner ────────────────────────────── */}
      <div className="bg-gradient-to-r from-violet-700 to-violet-800 rounded-2xl p-6 flex items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-yellow-400">⭐</span>
            <span className="text-white font-bold text-base">Dica Praxi</span>
          </div>
          <p className="text-violet-100 text-sm max-w-md leading-relaxed">
            Mantenha suas sessões atualizadas e emita os recibos logo após a consulta. Isso facilita o cálculo do Carnê-Leão e evita surpresas no fim do mês!
          </p>
        </div>
        <div className="relative z-10 flex-shrink-0 hidden sm:block">
          <Link href="/configuracoes" className="bg-white text-violet-700 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-violet-50 transition-colors whitespace-nowrap">
            Completar perfil →
          </Link>
        </div>
        {/* Decorative circles */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-violet-600 rounded-full -translate-y-1/3 translate-x-1/4 opacity-40" />
        <div className="absolute right-16 bottom-0 w-32 h-32 bg-violet-600 rounded-full translate-y-1/3 opacity-30" />
      </div>

    </div>
  )
}
