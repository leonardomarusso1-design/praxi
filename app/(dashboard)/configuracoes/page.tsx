'use client'
import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Prof = {
  id?: string
  nome?: string
  crp?: string
  cpf?: string
  email?: string
  telefone?: string
  especialidade?: string
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  avatar_url?: string
  bio?: string
}

export default function Configuracoes() {
  const [form, setForm] = useState<Prof>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data } = await supabase.from('professionals').select('*').eq('id', user.id).single()
      if (data) setForm(data as Prof)
      setLoading(false)
    }
    load()
  }, [])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const avatar_url = data.publicUrl + '?t=' + Date.now()
      setForm(f => ({ ...f, avatar_url }))
      await supabase.from('professionals').update({ avatar_url }).eq('id', userId)
    }
    setUploading(false)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setSaving(true)
    await supabase.from('professionals').update({ ...form, updated_at: new Date().toISOString() }).eq('id', userId)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const field = (key: keyof Prof, label: string, type = 'text', placeholder = '') => (
    <div>
      <label className="label">{label}</label>
      <input className="input" type={type} placeholder={placeholder}
        value={(form[key] as string) || ''}
        onChange={e => setForm({ ...form, [key]: e.target.value })} />
    </div>
  )

  const initials = form.nome
    ? form.nome.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : '?'

  if (loading) return <div className="p-8 text-gray-400">Carregando...</div>

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Configurações</h1>
      <p className="text-gray-500 text-sm mb-8">Suas informações aparecem nos recibos emitidos</p>

      <form onSubmit={save} className="space-y-6">

        {/* Foto de perfil */}
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Foto de perfil</h2>
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-2xl overflow-hidden border-2 border-violet-100">
                {form.avatar_url ? (
                  <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  initials
                )}
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="btn-secondary text-sm"
                disabled={uploading}
              >
                {uploading ? 'Enviando...' : 'Alterar foto'}
              </button>
              <p className="text-xs text-gray-400 mt-1.5">JPG ou PNG, até 2 MB</p>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
          </div>
        </div>

        {/* Apresentação */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900">Apresentação</h2>
          <div>
            <label className="label">Bio / Apresentação</label>
            <textarea
              className="input"
              rows={3}
              placeholder="Ex: Psicóloga clínica com 8 anos de experiência, especializada em ansiedade e desenvolvimento pessoal..."
              value={form.bio || ''}
              onChange={e => setForm({ ...form, bio: e.target.value })}
            />
            <p className="text-xs text-gray-400 mt-1">Aparecerá no seu perfil público futuramente</p>
          </div>
        </div>

        {/* Dados pessoais */}
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
              <option>Psicologia Organizacional</option>
              <option>Psicologia Escolar</option>
            </select>
          </div>
        </div>

        {/* Endereço */}
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
