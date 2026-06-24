'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Professional } from '@/types'

export default function Configuracoes() {
  const [form, setForm] = useState<Partial<Professional>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('professionals').select('*').eq('id', user.id).single()
      if (data) setForm(data)
      setLoading(false)
    }
    load()
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('professionals').update({ ...form, updated_at: new Date().toISOString() }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const field = (key: keyof Professional, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} placeholder={placeholder}
        value={(form[key] as string) || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </div>
  )

  if (loading) return <div className="p-8 text-gray-400">Carregando...</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h1>
      <p className="text-gray-500 text-sm mb-8">Suas informações aparecem nos recibos emitidos</p>

      <form onSubmit={save} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Dados pessoais</h2>
          {field('nome', 'Nome completo *', 'text', 'Dra. Ana Silva')}
          <div className="grid grid-cols-2 gap-3">
            {field('crp', 'CRP', 'text', '06/123456')}
            {field('cpf', 'CPF', 'text', '000.000.000-00')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('email', 'Email profissional', 'email')}
            {field('telefone', 'Telefone / WhatsApp')}
          </div>
          <div>
            <label className="label">Especialidade</label>
            <select className="input" value={form.especialidade || 'Psicologia'} onChange={e => setForm({ ...form, especialidade: e.target.value })}>
              <option>Psicologia</option>
              <option>Psicologia Clínica</option>
              <option>Psicoterapia</option>
              <option>Neuropsicologia</option>
              <option>Psicanálise</option>
            </select>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Endereço (para recibos)</h2>
          {field('endereco', 'Rua / Av. e número', 'text', 'Rua das Flores, 123')}
          <div className="grid grid-cols-3 gap-3">
            {field('cidade', 'Cidade')}
            {field('estado', 'Estado', 'text', 'SP')}
            {field('cep', 'CEP', 'text', '00000-000')}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-60">
            {saving ? 'Salvando...' : 'Salvar alterações'}
          </button>
          {saved && <span className="text-sm text-green-600 font-medium">✓ Salvo com sucesso!</span>}
        </div>
      </form>
    </div>
  )
}
