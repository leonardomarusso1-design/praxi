'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Patient } from '@/types'
import Link from 'next/link'

export default function Pacientes() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cpf: '', plano_saude: '', valor_sessao: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('patients').select('*').eq('professional_id', user.id).eq('ativo', true).order('nome')
    setPatients(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('patients').insert({ ...form, valor_sessao: Number(form.valor_sessao) || 0, professional_id: user.id })
    setForm({ nome: '', email: '', telefone: '', cpf: '', plano_saude: '', valor_sessao: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  async function deactivate(id: string) {
    if (!confirm('Arquivar este paciente?')) return
    await supabase.from('patients').update({ ativo: false }).eq('id', id)
    load()
  }

  const filtered = patients.filter(p => p.nome.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500 text-sm">{patients.length} paciente{patients.length !== 1 ? 's' : ''} ativo{patients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ Novo paciente</button>
      </div>

      <div className="mb-4">
        <input className="input max-w-sm" placeholder="🔍 Buscar paciente..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-gray-900">Novo paciente</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
            </div>
            <form onSubmit={save} className="space-y-3">
              <div><label className="label">Nome completo *</label><input className="input" value={form.nome} onChange={e => setForm({...form, nome: e.target.value})} required /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">Email</label><input className="input" type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} /></div>
                <div><label className="label">Telefone</label><input className="input" value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="label">CPF</label><input className="input" value={form.cpf} onChange={e => setForm({...form, cpf: e.target.value})} /></div>
                <div><label className="label">Valor da sessão (R$)</label><input className="input" type="number" step="0.01" value={form.valor_sessao} onChange={e => setForm({...form, valor_sessao: e.target.value})} /></div>
              </div>
              <div><label className="label">Plano de saúde</label><input className="input" value={form.plano_saude} onChange={e => setForm({...form, plano_saude: e.target.value})} placeholder="Particular, Unimed, etc." /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">Cancelar</button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-60">{saving ? 'Salvando...' : 'Salvar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIST */}
      {loading ? <p className="text-gray-400 text-sm">Carregando...</p> : (
        <div className="card p-0 overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              <div className="text-4xl mb-3">👥</div>
              <p>Nenhum paciente ainda.</p>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4 text-sm">Adicionar primeiro paciente</button>
            </div>
          ) : (
            <table className="w-full">
              <thead><tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">NOME</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">CONTATO</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">PLANO</th>
                <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">SESSÃO</th>
                <th className="px-4 py-3"></th>
              </tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-sm">{p.nome[0]}</div>
                        <span className="font-medium text-sm text-gray-900">{p.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.telefone || p.email || '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{p.plano_saude || 'Particular'}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {p.valor_sessao > 0 ? `R$ ${Number(p.valor_sessao).toFixed(2).replace('.',',')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deactivate(p.id)} className="text-xs text-gray-400 hover:text-red-500">Arquivar</button>
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
