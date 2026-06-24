'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Session, Patient } from '@/types'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

const STATUS_CONFIG: Record<string, { bg: string; text: string; border: string; label: string; dot: string }> = {
  agendada:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'Agendada',  dot: 'bg-blue-400' },
  realizada: { bg: 'bg-green-50',  text: 'text-green-700',  border: 'border-green-200',  label: 'Realizada', dot: 'bg-green-400' },
  cancelada: { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200',    label: 'Cancelada', dot: 'bg-red-400' },
  falta:     { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'Falta',     dot: 'bg-orange-400' },
}

type SessionWithPatient = Session & { patient?: Patient & { telefone?: string } }

export default function Agenda() {
  const [sessions, setSessions] = useState<SessionWithPatient[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [week, setWeek] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [selectedSession, setSelectedSession] = useState<SessionWithPatient | null>(null)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    patient_id: '', data_hora: '', duracao_minutos: '50',
    valor: '', modalidade: 'presencial', observacoes: ''
  })
  const supabase = createClient()
  const router = useRouter()

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + week * 7)
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek)
    d.setDate(startOfWeek.getDate() + i)
    return d
  })

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const start = weekDays[0].toISOString()
    const end = new Date(weekDays[6].getTime() + 86400000).toISOString()
    const [s, p] = await Promise.all([
      supabase.from('sessions')
        .select('*, patient:patients(id, nome, valor_sessao, telefone, cpf)')
        .eq('professional_id', user.id)
        .gte('data_hora', start)
        .lte('data_hora', end)
        .order('data_hora'),
      supabase.from('patients')
        .select('id, nome, valor_sessao, telefone')
        .eq('professional_id', user.id)
        .eq('ativo', true)
        .order('nome')
    ])
    setSessions(s.data as any || [])
    setPatients(p.data as any || [])
  }

  useEffect(() => { load() }, [week])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const patient = patients.find(p => p.id === form.patient_id)
    await supabase.from('sessions').insert({
      ...form,
      duracao_minutos: Number(form.duracao_minutos),
      valor: Number(form.valor) || patient?.valor_sessao || 0,
      professional_id: user.id,
      status: 'agendada',
      pago: false,
    })
    setForm({ patient_id: '', data_hora: '', duracao_minutos: '50', valor: '', modalidade: 'presencial', observacoes: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    const pago = status === 'realizada'
    await supabase.from('sessions').update({ status, pago }).eq('id', id)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, status: status as any, pago } : s))
    if (selectedSession?.id === id) {
      setSelectedSession(prev => prev ? { ...prev, status: status as any, pago } : null)
    }
  }

  async function deleteSession(id: string) {
    if (!confirm('Deseja excluir esta sessão?')) return
    await supabase.from('sessions').delete().eq('id', id)
    setSelectedSession(null)
    load()
  }

  function getWhatsAppLink(session: SessionWithPatient) {
    const phone = session.patient?.telefone?.replace(/\D/g, '')
    if (!phone) return null
    const dt = new Date(session.data_hora)
    const msg = `Olá ${session.patient?.nome?.split(' ')[0]}, passando para lembrar da nossa sessão ${dt.toLocaleDateString('pt-BR', { weekday: 'long' })}, dia ${dt.toLocaleDateString('pt-BR')} às ${dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}. Confirma? 😊`
    return `https://wa.me/55${phone}?text=${encodeURIComponent(msg)}`
  }

  const totalSessions = sessions.length
  const byStatus = sessions.reduce((acc, s) => { acc[s.status] = (acc[s.status] || 0) + 1; return acc }, {} as Record<string,number>)

  return (
    <div className="p-6 lg:p-8">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {MONTHS[startOfWeek.getMonth()]} {startOfWeek.getFullYear()}
            {totalSessions > 0 && (
              <span className="ml-2 text-gray-400">· {totalSessions} sessão{totalSessions !== 1 ? 'ões' : ''} esta semana</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => setWeek(w => w-1)} className="btn-secondary px-3 py-2 text-sm">‹</button>
          <button onClick={() => setWeek(0)} className="btn-secondary px-3 py-2 text-sm">Hoje</button>
          <button onClick={() => setWeek(w => w+1)} className="btn-secondary px-3 py-2 text-sm">›</button>
          <button onClick={() => setShowForm(true)} className="btn-primary ml-1">+ Sessão</button>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex flex-wrap items-center gap-4 mb-4 bg-white rounded-xl border border-gray-100 px-4 py-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-1">Legenda</span>
        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
            <span className="text-xs text-gray-600">{cfg.label}</span>
            {byStatus[key] ? (
              <span className="text-xs text-gray-400">({byStatus[key]})</span>
            ) : null}
          </div>
        ))}
        <div className="ml-auto text-xs text-gray-400 hidden sm:block">
          Clique em uma sessão para ver detalhes e alterar status
        </div>
      </div>

      {/* MODAL Nova Sessão */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900 text-lg">Nova sessão</h2>
              <button onClick={() => setShowForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 text-xl">×</button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Paciente *</label>
                <select
                  className="input"
                  value={form.patient_id}
                  onChange={e => {
                    const p = patients.find(x => x.id === e.target.value)
                    setForm({ ...form, patient_id: e.target.value, valor: p?.valor_sessao?.toString() || '' })
                  }}
                  required
                >
                  <option value="">Selecione...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Data e hora *</label>
                <input className="input" type="datetime-local" value={form.data_hora} onChange={e => setForm({ ...form, data_hora: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Duração (min)</label>
                  <input className="input" type="number" value={form.duracao_minutos} onChange={e => setForm({ ...form, duracao_minutos: e.target.value })} />
                </div>
                <div>
                  <label className="label">Valor (R$)</label>
                  <input className="input" type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="label">Modalidade</label>
                <select className="input" value={form.modalidade} onChange={e => setForm({ ...form, modalidade: e.target.value })}>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div>
                <label className="label">Observações</label>
                <textarea className="input" rows={2} value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">
                  {saving ? 'Salvando...' : 'Agendar sessão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL Detalhe da Sessão */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="card w-full max-w-sm shadow-2xl">
            {/* Header do modal */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">
                  {selectedSession.patient?.nome?.[0] || '?'}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-sm">{selectedSession.patient?.nome}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(selectedSession.data_hora).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'short' })}
                    {' às '}
                    {new Date(selectedSession.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedSession(null)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400">×</button>
            </div>

            {/* Infos */}
            <div className="bg-gray-50 rounded-xl p-3 mb-4 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-400">Duração</span>
                <div className="font-medium text-gray-700 mt-0.5">{selectedSession.duracao_minutos} min</div>
              </div>
              <div>
                <span className="text-gray-400">Modalidade</span>
                <div className="font-medium text-gray-700 mt-0.5 capitalize">{selectedSession.modalidade}</div>
              </div>
              <div>
                <span className="text-gray-400">Valor</span>
                <div className="font-medium text-gray-700 mt-0.5">R$ {Number(selectedSession.valor).toFixed(2).replace('.',',')}</div>
              </div>
              <div>
                <span className="text-gray-400">Pagamento</span>
                <div className={`font-medium mt-0.5 ${selectedSession.pago ? 'text-green-600' : 'text-orange-600'}`}>
                  {selectedSession.pago ? '✓ Pago' : '⏳ Pendente'}
                </div>
              </div>
            </div>

            {/* Alterar status */}
            <div className="mb-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Alterar status</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                  <button
                    key={key}
                    onClick={() => updateStatus(selectedSession.id, key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      selectedSession.status === key
                        ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1 ring-current`
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                    {selectedSession.status === key && <span className="ml-auto">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              {getWhatsAppLink(selectedSession) && (
                <a
                  href={getWhatsAppLink(selectedSession)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors px-4 py-2.5 rounded-lg text-sm font-medium"
                >
                  📱 Enviar lembrete pelo WhatsApp
                </a>
              )}
              {selectedSession.status === 'realizada' && (
                <button
                  onClick={() => {
                    setSelectedSession(null)
                    router.push('/recibos')
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-violet-50 border border-violet-200 text-violet-700 hover:bg-violet-100 transition-colors px-4 py-2.5 rounded-lg text-sm font-medium"
                >
                  🧾 Emitir recibo desta sessão
                </button>
              )}
              <button
                onClick={() => deleteSession(selectedSession.id)}
                className="flex items-center justify-center gap-2 w-full bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 transition-colors px-4 py-2.5 rounded-lg text-sm font-medium"
              >
                🗑 Excluir sessão
              </button>
            </div>

            {selectedSession.observacoes && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 mb-1">Observações</p>
                <p className="text-xs text-gray-600">{selectedSession.observacoes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* GRID SEMANAL */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString()
          const daySessions = sessions
            .filter(s => new Date(s.data_hora).toDateString() === day.toDateString())
            .sort((a, b) => new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime())

          return (
            <div
              key={i}
              className={`min-h-36 rounded-xl border p-2 transition-colors ${
                isToday ? 'border-violet-300 bg-violet-50' : 'border-gray-100 bg-white'
              }`}
            >
              {/* Day header */}
              <div className={`text-center mb-2.5 ${isToday ? 'text-violet-700' : 'text-gray-500'}`}>
                <div className="text-xs font-medium tracking-wide">{DAYS[day.getDay()]}</div>
                <div className={`text-base font-bold mt-0.5 flex items-center justify-center mx-auto w-7 h-7 rounded-full ${
                  isToday ? 'bg-violet-700 text-white' : ''
                }`}>
                  {day.getDate()}
                </div>
              </div>

              {/* Sessions */}
              <div className="space-y-1">
                {daySessions.map(s => {
                  const cfg = STATUS_CONFIG[s.status]
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSession(s)}
                      className={`w-full text-left text-xs p-1.5 rounded-lg border transition-all hover:shadow-sm hover:scale-[1.02] active:scale-95 ${cfg.bg} ${cfg.text} ${cfg.border}`}
                    >
                      <div className="font-semibold truncate leading-tight">
                        {(s as any).patient?.nome?.split(' ')[0]}
                      </div>
                      <div className="opacity-70 mt-0.5 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {new Date(s.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </button>
                  )
                })}

                {/* Empty day placeholder */}
                {daySessions.length === 0 && (
                  <button
                    onClick={() => {
                      const dateStr = `${day.getFullYear()}-${String(day.getMonth()+1).padStart(2,'0')}-${String(day.getDate()).padStart(2,'0')}T09:00`
                      setForm(f => ({ ...f, data_hora: dateStr }))
                      setShowForm(true)
                    }}
                    className="w-full h-8 rounded-lg border-2 border-dashed border-gray-200 text-gray-300 hover:border-violet-300 hover:text-violet-400 transition-colors flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
