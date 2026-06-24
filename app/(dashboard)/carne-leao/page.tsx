'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CarneLeao } from '@/types'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

function calcImposto(total: number) {
  if (total <= 2259.20) return 0
  if (total <= 2826.65) return total * 0.075 - 169.44
  if (total <= 3751.05) return total * 0.15 - 381.44
  if (total <= 4664.68) return total * 0.225 - 662.77
  return total * 0.275 - 896.00
}

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

export default function CarneLeaoPage() {
  const [data, setData] = useState<CarneLeao[]>([])
  const [loading, setLoading] = useState(true)
  const [ano, setAno] = useState(new Date().getFullYear())
  const supabase = createClient()

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Busca carnê-leão do banco
    const { data: cl } = await supabase.from('carne_leao').select('*').eq('professional_id', user.id).eq('ano', ano).order('mes')

    // Para meses sem registro, calcula das sessões
    const months: CarneLeao[] = []
    for (let m = 1; m <= 12; m++) {
      const existing = cl?.find(c => c.mes === m)
      if (existing) { months.push(existing); continue }

      const { data: sessoes } = await supabase.from('sessions').select('valor').eq('professional_id', user.id)
        .eq('status', 'realizada').eq('pago', true)
        .gte('data_hora', `${ano}-${String(m).padStart(2,'0')}-01`)
        .lt('data_hora', `${ano}-${String(m === 12 ? 1 : m+1).padStart(2,'0')}-01${m === 12 ? '' : ''}`)

      const total = (sessoes || []).reduce((a, s) => a + Number(s.valor), 0)
      months.push({ id: '', professional_id: user.id, mes: m, ano, total_recebido: total, imposto_devido: Math.max(0, calcImposto(total)), pago: false, data_pagamento: null, observacoes: '', created_at: '' } as CarneLeao)
    }
    setData(months)
    setLoading(false)
  }

  useEffect(() => { load() }, [ano])

  async function togglePago(mes: number, pago: boolean) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('carne_leao').upsert({
      professional_id: user.id, mes, ano,
      pago: !pago,
      data_pagamento: !pago ? new Date().toISOString().split('T')[0] : null
    }, { onConflict: 'professional_id,mes,ano' })
    load()
  }

  const totalAnual = data.reduce((a, d) => a + Number(d.total_recebido), 0)
  const impostoAnual = data.reduce((a, d) => a + Number(d.imposto_devido), 0)
  const mesMes = new Date().getMonth() + 1
  const mesAtual = data.find(d => d.mes === mesMes)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carnê-Leão</h1>
          <p className="text-gray-500 text-sm">Controle do imposto mensal (autônomo)</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAno(a => a-1)} className="btn-secondary px-3 py-2 text-sm">‹</button>
          <span className="font-bold text-gray-700 px-2">{ano}</span>
          <button onClick={() => setAno(a => a+1)} className="btn-secondary px-3 py-2 text-sm">›</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Total recebido {ano}</p>
          <p className="text-2xl font-bold text-green-700">{fmt(totalAnual)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Imposto estimado {ano}</p>
          <p className="text-2xl font-bold text-orange-600">{fmt(impostoAnual)}</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Mês atual – {MONTHS[mesMes-1]}</p>
          <p className="text-2xl font-bold text-violet-700">{fmt(mesAtual?.imposto_devido || 0)}</p>
          <p className="text-xs text-gray-400 mt-0.5">a recolher até dia 20</p>
        </div>
      </div>

      {/* Tabela IR */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 text-sm">Tabela progressiva IRPF 2026 (mensal)</h3>
        <table className="w-full text-xs">
          <thead><tr className="border-b"><th className="text-left py-1.5 text-gray-500">Faixa de renda</th><th className="text-right py-1.5 text-gray-500">Alíquota</th></tr></thead>
          <tbody className="text-gray-600">
            <tr><td className="py-1">Até R$ 2.259,20</td><td className="text-right text-green-600 font-medium">Isento</td></tr>
            <tr><td className="py-1">R$ 2.259,21 a R$ 2.826,65</td><td className="text-right">7,5%</td></tr>
            <tr><td className="py-1">R$ 2.826,66 a R$ 3.751,05</td><td className="text-right">15%</td></tr>
            <tr><td className="py-1">R$ 3.751,06 a R$ 4.664,68</td><td className="text-right">22,5%</td></tr>
            <tr><td className="py-1">Acima de R$ 4.664,68</td><td className="text-right text-red-600 font-medium">27,5%</td></tr>
          </tbody>
        </table>
      </div>

      {/* Meses */}
      {loading ? <p className="text-sm text-gray-400">Calculando...</p> : (
        <div className="card p-0 overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b bg-gray-50">
              <th className="text-left text-xs font-medium text-gray-500 px-4 py-3">MÊS</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">RECEBIDO</th>
              <th className="text-right text-xs font-medium text-gray-500 px-4 py-3">IMPOSTO</th>
              <th className="text-center text-xs font-medium text-gray-500 px-4 py-3">STATUS</th>
              <th className="px-4 py-3"></th>
            </tr></thead>
            <tbody>
              {data.map(d => {
                const isCurrent = d.mes === mesMes && d.ano === ano
                const isPast = d.mes < mesMes || d.ano < ano
                return (
                  <tr key={d.mes} className={`border-b border-gray-50 ${isCurrent ? 'bg-violet-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {MONTHS[d.mes-1]} {isCurrent && <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full ml-2">atual</span>}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">{fmt(d.total_recebido)}</td>
                    <td className={`px-4 py-3 text-right text-sm font-bold ${d.imposto_devido > 0 ? 'text-orange-600' : 'text-green-600'}`}>{fmt(d.imposto_devido)}</td>
                    <td className="px-4 py-3 text-center">
                      {d.total_recebido === 0 ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : d.pago ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">✓ Pago</span>
                      ) : isPast ? (
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Pendente</span>
                      ) : (
                        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">A pagar</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {d.total_recebido > 0 && d.imposto_devido > 0 && (
                        <button onClick={() => togglePago(d.mes, d.pago)} className="text-xs text-violet-700 hover:underline">
                          {d.pago ? 'Desmarcar' : 'Marcar como pago'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3">⚠️ Os valores são estimativas. Consulte seu contador para declaração oficial.</p>
    </div>
  )
}
