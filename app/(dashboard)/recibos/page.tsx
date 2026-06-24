'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Receipt, Patient, Professional } from '@/types'

function generatePDF(receipt: Receipt, patient: Patient, professional: Professional) {
  const content = `
RECIBO DE PAGAMENTO
===========================================
Nº ${receipt.numero}
Data de emissão: ${new Date(receipt.data_emissao).toLocaleDateString('pt-BR')}

PROFISSIONAL:
${professional.nome}
${professional.especialidade}
${professional.crp ? `CRP: ${professional.crp}` : ''}
${professional.cpf ? `CPF: ${professional.cpf}` : ''}
${professional.endereco ? professional.endereco + ', ' + professional.cidade + '/' + professional.estado : ''}

PACIENTE:
${patient.nome}
${patient.cpf ? `CPF: ${patient.cpf}` : ''}

DESCRIÇÃO:
${receipt.descricao}

VALOR: R$ ${Number(receipt.valor).toFixed(2).replace('.', ',')}

${professional.nome}
___________________________________
Assinatura do Profissional
  `.trim()

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `recibo-${receipt.numero}-${patient.nome.replace(/\s+/g, '-')}.txt`
  a.click()
  URL.revokeObjectURL(url)
}

export default function Recibos() {
  const [receipts, setReceipts] = useState<Receipt[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [professional, setProfessional] = useState<Professional | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ patient_id: '', session_id: '', valor: '', descricao: 'Serviços de psicologia', data_emissao: new Date().toISOString().split('T')[0] })
  const supabase = createClient()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const [r, p, s, prof] = await Promise.all([
      supabase.from('receipts').select('*, patient:patients(nome, cpf)').eq('professional_id', user.id).order('created_at', { ascending: false }),
      supabase.from('patients').select('*').eq('professional_id', user.id).eq('ativo', true).order('nome'),
      supabase.from('sessions').select('id, data_hora, valor, patient_id, patient:patients(nome)').eq('professional_id', user.id).eq('status', 'realizada').order('data_hora', { ascending: false }).limit(50),
      supabase.from('professionals').select('*').eq('id', user.id).single()
    ])
    setReceipts(r.data as any || [])
    setPatients(p.data as any || [])
    setSessions(s.data as any || [])
    setProfessional(prof.data as any)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const count = receipts.length + 1
    const numero = `${new Date().getFullYear()}${String(count).padStart(4, '0')}`
    await supabase.from('receipts').insert({
      ...form,
      numero,
      valor: Number(form.valor),
      professional_id: user.id,
      session_id: form.session_id || null
    })
    setShowForm(false)
    setSaving(false)
    setForm({ patient_id: '', session_id: '', valor: '', descricao: 'Serviços de psicologia', data_emissao: new Date().toISOString().split('T')[0] })
    load()
  }

  function download(receipt: Receipt) {
    if (!professional) return
    const patient = (receipt as any).patient as Patient
    generatePDF(receipt, patient, professional)
  }

  const patientSessions = form.patient_id ? sessions.filter(s => s.patient_id === form.patient_id) : []

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recibos</h1>
          <p className="text-gray-500 text-sm">{receipts.length} recibo{receipts.length !== 1 ? 's' : ''} emitido{receipts.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Emitir recibo</button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Emitir recibo</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 text-xl">×</button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div>
                <label className="label">Paciente *</label>
                <select className="input" value={form.patient_id} onChange={e => setForm({...form, patient_id: e.target.value, session_id: '', valor: ''})} required>
                  <option value="">Selecione...</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              {form.patient_id && patientSessions.length > 0 && (
                <div>
                  <label className="label">Sessão (opcional)</label>
                  <select className="input" value={form.session_id} onChange={e => { const s = sessions.find(x => x.id === e.target.value); setForm({...form, session_id: e.target.value, valor: s?.valor?.toString() || ''}) }}>
                    <option value="">Recibo manual</option>
                    {patientSessions.map(s => <option key={s.id} value={s.id}>{new Date(s.data_hora).toLocaleDateString('pt-BR')} – R$ {Number(s.valor).toFixed(2).replace('.',',')}</option>)}
                  </select>
                </div>
              )}
              <div><label className="label">Data de emissão *</label><input className="input" type="date" value={form.data_emissao} onChange={e => setForm({...form, data_emissao: e.target.value})} required /></div>
              <div><label className="label">Valor (R$) *</label><input className="input" type="number" step="0.01" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} required /></div>
              <div><label className="label">Descrição</label><input className="input" value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Emitindo...' : 'Emitir'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <p className="text-sm text-gray-400">Carregando...</p> : (
        <div className="card p-0 overflow-hidden">
          {receipts.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <div className="text-4xl mb-3">🧾</div>
              <p>Nenhum recibo emitido ainda.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">Emitir primeiro recibo</button>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">Nº</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">PACIENTE</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">DATA</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">VALOR</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody>
                {receipts.map(r => (
                  <tr key={r.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-mono text-gray-500">{r.numero}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{(r as any).patient?.nome}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{new Date(r.data_emissao).toLocaleDateString('pt-BR')}</td>
                    <td className="px-4 py-3 text-sm font-bold text-green-700">R$ {Number(r.valor).toFixed(2).replace('.',',')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => download(r)} className="text-xs text-violet-700 hover:underline font-medium">⬇ Baixar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
