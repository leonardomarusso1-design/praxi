'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session, Patient } from '@/types'

const DAYS = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']
const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']
const STATUS_COLORS: Record<string, string> = {
  agendada: 'bg-blue-100 text-blue-700 border-blue-200',
  realizada: 'bg-green-100 text-green-700 border-green-200',
  cancelada: 'bg-red-100 text-red-700 border-red-200',
  falta: 'bg-orange-100 text-orange-700 border-orange-200',
}

export default function Agenda() {
  const [sessions, setSessions] = useState<Session[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [week, setWeek] = useState(0) // 0 = current week
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ patient_id: '', data_hora: '', duracao_minutos: '50', valor: '', modalidade: 'presencial', observacoes: '' })
  const supabase = createClient()

  const today = new Date()
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - today.getDay() + week * 7)
  const weekDays = Array.from({length: 7}, (_, i) => { const d = new Date(startOfWeek); d.setDate(startOfWeek.getDate() + i); return d })

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const start = weekDays[0].toISOString()
    const end = new Date(weekDays[6].getTime() + 86400000).toISOString()
    const [s, p] = await Promise.all([
      supabase.from('sessions').select('*, patient:patients(nome, valor_sessao)').eq('professional_id', user.id).gte('data_hora', start).lte('data_hora', end).order('data_hora'),
      supabase.from('patients').select('id, nome, valor_sessao').eq('professional_id', user.id).eq('ativo', true).order('nome')
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
      professional_id: user.id
    })
    setForm({ patient_id: '', data_hora: '', duracao_minutos: '50', valor: '', modalidade: 'presencial', observacoes: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('sessions').update({ status, pago: status === 'realizada' }).eq('id', id)
    load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="text-gray-500 text-sm">{MONTHS[startOfWeek.getMonth()]} {startOfWeek.getFullYear()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <button onClick={() => setWeek(w => w-1)} className="btn-secondary px-3 py-2 text-sm">‹</button>
            <button onClick={() => setWeek(0)} className="btn-secondary px-3 py-2 text-sm">Hoje</button>
            <button onClick={() => setWeek(w => w+1)} className="btn-secondary px-3 py-2 text-sm">›</button>
          </div>
          <button onClick={() => setShowForm(true)} className="btn-primary">+ Sessão</button>
        </div>
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Nova sessão</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Paciente *</label>
                <select className="input" value={form.patient_id} onChange={e => { const p = patients.find(x => x.id === e.target.value); setForm({...form, patient_id: e.target.value, valor: p?.valor_sessao?.toString() || ''}) }} required>
                  <option value="">Selecione...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div><label className="label">Data e hora *</label><input className="input" type="datetime-local" value={form.data_hora} onChange={e => setForm({...form, data_hora: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Duração (min)</label><input className="input" type="number" value={form.duracao_minutos} onChange={e => setForm({...form, duracao_minutos: e.target.value})} /></div>
                <div><label className="label">Valor (R$)</label><input className="input" type="number" step="0.01" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} /></div>
              </div>
              <div>
                <label className="label">Modalidade</label>
                <select className="input" value={form.modalidade} onChange={e => setForm({...form, modalidade: e.target.value})}>
                  <option value="presencial">Presencial</option>
                  <option value="online">Online</option>
                </select>
              </div>
              <div><label className="label">Observações</label><textarea className="input" rows={2} value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Salvando...' : 'Agendar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* WEEK GRID */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day, i) => {
          const isToday = day.toDateString() === today.toDateString()
          const daySessions = sessions.filter(s => new Date(s.data_hora).toDateString() === day.toDateString())
          return (
            <div key={i} className={`min-h-32 rounded-xl border p-2 ${isToday ? 'border-violet-300 bg-violet-50' : 'border-gray-100 bg-white'}`}>
              <div className={`text-center mb-2 ${isToday ? 'text-violet-700' : 'text-gray-500'}`}>
                <div className="text-xs font-medium">{DAYS[day.getDay()]}</div>
                <div className={`text-lg font-bold ${isToday ? 'w-8 h-8 bg-violet-700 text-white rounded-full flex items-center justify-center mx-auto text-sm' : ''}`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="space-y-1">
                {daySessions.map(s => (
                  <div key={s.id} className={`text-xs p-1.5 rounded border cursor-pointer ${STATUS_COLORS[s.status]}`}
                    onClick={() => {
                      const next = s.status === 'agendada' ? 'realizada' : s.status === 'realizada' ? 'cancelada' : 'agendada'
                      updateStatus(s.id, next)
                    }}>
                    <div className="font-medium truncate">{(s as any).patient?.nome}</div>
                    <div className="opacity-75">{new Date(s.data_hora).toLocaleTimeString('pt-BR', {hour:'2-digit',minute:'2-digit'})}</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">Clique na sessão para alterar status: agendada → realizada → cancelada</p>
    </div>
  )
}
