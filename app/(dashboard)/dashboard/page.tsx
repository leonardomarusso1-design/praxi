import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

function fmt(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default async function Dashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const now = new Date()
  const mes = now.getMonth() + 1
  const ano = now.getFullYear()

  const [{ count: totalPacientes }, sessoesMes, carneLeao, proximasSessoes] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }).eq('professional_id', user.id).eq('ativo', true),
    supabase.from('sessions').select('valor, status, pago').eq('professional_id', user.id)
      .gte('data_hora', `${ano}-${String(mes).padStart(2,'0')}-01`)
      .lt('data_hora', `${ano}-${String(mes+1).padStart(2,'0')}-01`),
    supabase.from('carne_leao').select('*').eq('professional_id', user.id).eq('mes', mes).eq('ano', ano).single(),
    supabase.from('sessions').select('*, patient:patients(nome)').eq('professional_id', user.id)
      .eq('status', 'agendada').gte('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true }).limit(5)
  ])

  const recebidoMes = (sessoesMes.data || []).filter(s => s.status === 'realizada' && s.pago).reduce((a, s) => a + Number(s.valor), 0)
  const totalSessoes = (sessoesMes.data || []).length
  const impostoMes = carneLeao.data?.imposto_devido || 0

  const statusColors: Record<string, string> = {
    agendada: 'bg-blue-50 text-blue-700',
    realizada: 'bg-green-50 text-green-700',
    cancelada: 'bg-red-50 text-red-700',
    falta: 'bg-orange-50 text-orange-700',
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Bom dia 👋</h1>
      <p className="text-gray-500 mb-8">Aqui está o resumo do seu mês</p>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Recebido no mês', value: fmt(recebidoMes), icon: '💰', color: 'text-green-600' },
          { label: 'Sessões este mês', value: String(totalSessoes), icon: '📅', color: 'text-violet-600' },
          { label: 'Pacientes ativos', value: String(totalPacientes || 0), icon: '👥', color: 'text-blue-600' },
          { label: 'Carnê-Leão estimado', value: fmt(impostoMes), icon: '📊', color: 'text-orange-600' },
        ].map(kpi => (
          <div key={kpi.label} className="card">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{kpi.icon}</span>
              <span className="text-sm text-gray-500">{kpi.label}</span>
            </div>
            <div className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Próximas sessões */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Próximas sessões</h2>
        {(proximasSessoes.data || []).length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">Nenhuma sessão agendada</p>
        ) : (
          <div className="space-y-3">
            {(proximasSessoes.data || []).map((s: any) => {
              const dt = new Date(s.data_hora)
              return (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                      {s.patient?.nome?.[0] || '?'}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-900">{s.patient?.nome}</p>
                      <p className="text-xs text-gray-400">
                        {dt.toLocaleDateString('pt-BR')} às {dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} · {s.modalidade}
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[s.status]}`}>{s.status}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
