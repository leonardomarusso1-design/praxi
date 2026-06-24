'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Cadastro() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    if (password.length < 6) { setError('A senha deve ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { nome } }
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-violet-700">Praxi</Link>
          <p className="text-gray-500 mt-2">Crie sua conta — é grátis</p>
        </div>
        <div className="card shadow-sm">
          <form onSubmit={handleCadastro} className="space-y-4">
            <div>
              <label className="label">Seu nome completo</label>
              <input className="input" type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Dra. Ana Silva" required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label className="label">Senha</label>
              <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 disabled:opacity-60">
              {loading ? 'Criando conta...' : 'Criar conta grátis'}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-4">
            Ao criar uma conta, você concorda com nossos Termos de Uso.
          </p>
          <p className="text-center text-sm text-gray-500 mt-3">
            Já tem conta?{' '}
            <Link href="/login" className="text-violet-700 font-medium hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
