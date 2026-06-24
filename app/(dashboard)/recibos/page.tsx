'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Receipt, Patient, Professional } from '@/types'

function generatePDF(receipt: Receipt, patient: Patient, professional: Professional) {
  const valor = Number(receipt.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const dataEmissao = new Date(receipt.data_emissao).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Recibo Nº ${receipt.numero}</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f5f5f5; color: #1a1a2e; }
  .page { max-width: 680px; margin: 40px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 40px rgba(0,0,0,0.12); }
  .header { background: linear-gradient(135deg, #6D28D9 0%, #7C3AED 100%); padding: 32px 40px; display: flex; align-items: center; justify-content: space-between; }
  .logo { display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 40px; height: 40px; background: rgba(255,255,255,0.2); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
  .logo-text { font-size: 24px; font-weight: 800; color: white; letter-spacing: -0.5px; }
  .header-right { text-align: right; }
  .header-right .title { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); text-transform: uppercase; letter-spacing: 1px; }
  .header-right .numero { font-size: 20px; font-weight: 700; color: white; margin-top: 2px; }
  .body { padding: 40px; }
  .valor-section { background: #F5F3FF; border-radius: 12px; padding: 24px; margin-bottom: 32px; display: flex; align-items: center; justify-content: space-between; }
  .valor-label { font-size: 13px; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; }
  .valor-amount { font-size: 36px; font-weight: 800; color: #6D28D9; margin-top: 4px; }
  .valor-data { text-align: right; }
  .valor-data .data-label { font-size: 12px; color: #6B7280; }
  .valor-data .data-value { font-size: 15px; font-weight: 600; color: #374151; margin-top: 2px; }
  .section { margin-bottom: 28px; }
  .section-title { font-size: 11px; font-weight: 700; color: #7C3AED; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #EDE9FE; }
  .section-row { display: flex; padding: 8px 0; border-bottom: 1px solid #F9FAFB; }
  .section-row:last-child { border-bottom: none; }
  .row-label { font-size: 13px; color: #9CA3AF; width: 130px; flex-shrink: 0; }
  .row-value { font-size: 13px; color: #111827; font-weight: 500; flex: 1; }
  .descricao-box { background: #F9FAFB; border-radius: 8px; padding: 14px 16px; font-size: 14px; color: #374151; line-height: 1.6; }
  .valor-total-row { display: flex; justify-content: space-between; align-items: center; background: #111827; border-radius: 10px; padding: 16px 20px; margin-top: 24px; }
  .valor-total-label { font-size: 14px; font-weight: 600; color: #E5E7EB; }
  .valor-total-value { font-size: 22px; font-weight: 800; color: white; }
  .assinatura { margin-top: 40px; padding-top: 24px; border-top: 1px dashed #E5E7EB; display: flex; justify-content: center; }
  .assinatura-box { text-align: center; }
  .assinatura-line { width: 240px; border-top: 1px solid #374151; margin: 0 auto 8px; }
  .assinatura-name { font-size: 13px; font-weight: 600; color: #374151; }
  .assinatura-crp { font-size: 12px; color: #9CA3AF; margin-top: 2px; }
  .footer { background: #F9FAFB; padding: 16px 40px; text-align: center; font-size: 11px; color: #9CA3AF; }
  @media print {
    body { background: white; }
    .page { box-shadow: none; margin: 0; border-radius: 0; }
    .print-btn { display: none !important; }
  }
</style>
</head>
<body>
<div class="page">
  <div class="header">
    <div class="logo">
      <div class="logo-icon">
        <svg width="24" height="24" viewBox="0 0 100 100" fill="none">
          <path d="M50 8C35 8 23 18 20 32C15 33 10 38 10 45C10 50 13 55 17 57C17 69 25 79 36 82L36 88C36 90 38 92 40 92L60 92C62 92 64 90 64 88L64 82C75 79 83 69 83 57C87 55 90 50 90 45C90 38 85 33 80 32C77 18 65 8 50 8Z" fill="white" opacity="0.9"/>
          <circle cx="38" cy="45" r="5" fill="#7C3AED"/>
          <circle cx="50" cy="38" r="5" fill="#7C3AED"/>
          <circle cx="62" cy="45" r="5" fill="#7C3AED"/>
          <line x1="38" y1="45" x2="50" y2="38" stroke="#7C3AED" stroke-width="2.5"/>
          <line x1="50" y1="38" x2="62" y2="45" stroke="#7C3AED" stroke-width="2.5"/>
        </svg>
      </div>
      <span class="logo-text">Praxi</span>
    </div>
    <div class="header-right">
      <div class="title">Recibo de Prestação de Serviços</div>
      <div class="numero">Nº ${receipt.numero}</div>
    </div>
  </div>

  <div class="body">
    <div class="valor-section">
      <div>
        <div class="valor-label">Valor Total</div>
        <div class="valor-amount">${valor}</div>
      </div>
      <div class="valor-data">
        <div class="data-label">Data de Emissão</div>
        <div class="data-value">${dataEmissao}</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Prestador de Serviços</div>
      <div class="section-row"><span class="row-label">Nome</span><span class="row-value">${professional.nome}</span></div>
      ${professional.especialidade ? `<div class="section-row"><span class="row-label">Especialidade</span><span class="row-value">${professional.especialidade}</span></div>` : ''}
      ${professional.crp ? `<div class="section-row"><span class="row-label">CRP</span><span class="row-value">${professional.crp}</span></div>` : ''}
      ${professional.cpf ? `<div class="section-row"><span class="row-label">CPF</span><span class="row-value">${professional.cpf}</span></div>` : ''}
      ${professional.endereco ? `<div class="section-row"><span class="row-label">Endereço</span><span class="row-value">${professional.endereco}${professional.cidade ? `, ${professional.cidade}/${professional.estado}` : ''}</span></div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">Tomador de Serviços</div>
      <div class="section-row"><span class="row-label">Nome</span><span class="row-value">${patient.nome}</span></div>
      ${patient.cpf ? `<div class="section-row"><span class="row-label">CPF</span><span class="row-value">${patient.cpf}</span></div>` : ''}
    </div>

    <div class="section">
      <div class="section-title">Descrição do Serviço</div>
      <div class="descricao-box">${receipt.descricao}</div>
    </div>

    <div class="valor-total-row">
      <span class="valor-total-label">Recebi(emos) de <strong>${patient.nome}</strong> a importância de</span>
      <span class="valor-total-value">${valor}</span>
    </div>

    <div class="assinatura">
      <div class="assinatura-box">
        <div class="assinatura-line"></div>
        <div class="assinatura-name">${professional.nome}</div>
        ${professional.crp ? `<div class="assinatura-crp">CRP ${professional.crp}</div>` : ''}
      </div>
    </div>
  </div>

  <div class="footer">
    Documento gerado pelo Praxi · praxi-eight.vercel.app · ${new Date().getFullYear()}
  </div>
</div>

<div style="text-align:center;margin:20px;display:flex;gap:12px;justify-content:center" class="print-btn">
  <button onclick="window.print()" style="background:#7C3AED;color:white;border:none;padding:12px 32px;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer;">
    ⬇ Salvar / Imprimir PDF
  </button>
  <button onclick="window.close()" style="background:#F3F4F6;color:#374151;border:none;padding:12px 32px;border-radius:10px;font-size:15px;cursor:pointer;">
    Fechar
  </button>
</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=780,height=900')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
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
                      <button onClick={() => download(r)} className="text-xs text-violet-700 hover:underline font-medium">📄 Abrir PDF</button>
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
