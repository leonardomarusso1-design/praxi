'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CarneLeao } from '@/types'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

// Tabela IRPF 2026
const FAIXAS = [
  { limite: 2259.20, aliquota: 0,     deducao: 0,      label: 'Isento', color: 'bg-green-500' },
  { limite: 2826.65, aliquota: 0.075, deducao: 169.44, label: '7,5%',   color: 'bg-yellow-400' },
  { limite: 3751.05, aliquota: 0.15,  deducao: 381.44, label: '15%',    color: 'bg-orange-400' },
  { limite: 4664.68, aliquota: 0.225, deducao: 662.77, label: '22,5%',  color: 'bg-orange-500' },
  { limite: Infinity,aliquota: 0.275, deducao: 896.00, label: '27,5%',  color: 'bg-red-500' },
]

function calcImposto(total: number) {
  if (total <= 2259.20) return 0
  if (total <= 2826.65) return total * 0.075 - 169.44
  if (total <= 3751.05) return total * 0.15 - 381.44
  if (total <= 4664.68) return total * 0.225 - 662.77
  return total * 0.275 - 896.00
}

function getFaixa(total: number) {
  return FAIXAS.find(f => total <= f.limite) || FAIXAS[FAIXAS.length - 1]
}

function getAliquotaEfetiva(total: number, imposto: number) {
  if (total === 0) return 0
  return (imposto / total) * 100
}

function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }
function fmtPct(v: number) { return v.toFixed(2).replace('.', ',') + '%' }

function getBarProgress(total: number) {
  const MAX = 6000
  return Math.min((total / MAX) * 100, 100)
}

export default function CarneLeaoPage() {
  const [data, setData] = useState<CarneLeao[]>([])
  const [loading, setLoading] = useState(true)
  const [ano, setAno] = useState(new Date().getFullYear())
  const [selectedMes, setSelectedMes] = useState(new Date().getMonth() + 1)
  const supabase = createClient()

  async function load() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: cl } = await supabase.from('carne_leao').select('*').eq('professional_id', user.id).eq('ano', ano).order('mes')

    const months: CarneLeao[] = []
    for (let m = 1; m <= 12; m++) {
      const existing = cl?.find(c => c.mes === m)
      if (existing) { months.push(existing); continue }

      const startDate = `${ano}-${String(m).padStart(2,'0')}-01`
      const endMonth = m === 12 ? 1 : m + 1
      const endYear = m === 12 ? ano + 1 : ano
      const endDate = `${endYear}-${String(endMonth).padStart(2,'0')}-01`

      const { data: sessoes } = await supabase.from('sessions').select('valor')
        .eq('professional_id', user.id).eq('status', 'realizada').eq('pago', true)
        .gte('data_hora', startDate).lt('data_hora', endDate)

      const total = (sessoes || []).reduce((a, s) => a + Number(s.valor), 0)
      months.push({
        id: '', professional_id: user.id, mes: m, ano,
        total_recebido: total,
        imposto_devido: Math.max(0, calcImposto(total)),
        pago: false, data_pagamento: null, observacoes: '', created_at: ''
      } as CarneLeao)
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
  const mesMesAtual = new Date().getMonth() + 1

  const mesSelecionado = data.find(d => d.mes === selectedMes)
  const totalMes = mesSelecionado?.total_recebido || 0
  const impostoMes = mesSelecionado?.imposto_devido || 0
  const faixaMes = getFaixa(totalMes)
  const aliquotaEfetiva = getAliquotaEfetiva(totalMes, impostoMes)
  const barProgress = getBarProgress(totalMes)

  const vencimento = new Date(ano, selectedMes, 0) // último dia do mês
  const vencimentoStr = vencimento.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })
  const diasRestantes = Math.ceil((vencimento.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carnê-Leão</h1>
          <p className="text-gray-500 text-sm">Controle do IRPF mensal — autônomo · {ano}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAno(a => a-1)} className="btn-secondary px-3 py-2 text-sm">‹</button>
          <span className="font-bold text-gray-700 w-12 text-center">{ano}</span>
          <button onClick={() => setAno(a => a+1)} className="btn-secondary px-3 py-2 text-sm">›</button>
        </div>
      </div>

      {/* Seletor de mês */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1">
        {MONTHS.map((m, i) => {
          const mes = i + 1
          const d = data.find(x => x.mes === mes)
          const temDados = d && d.total_recebido > 0
          const isCurrent = mes === mesMesAtual && ano === new Date().getFullYear()
          const isSelected = mes === selectedMes
          return (
            <button
              key={mes}
              onClick={() => setSelectedMes(mes)}
              className={`relative flex-shrink-0 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-violet-600 text-white shadow-sm'
                  : isCurrent
                  ? 'bg-violet-50 text-violet-700 border border-violet-200'
                  : 'bg-white text-gray-500 border border-gray-100 hover:bg-gray-50'
              }`}
            >
              {m.slice(0,3)}
              {temDados && !isSelected && (
                <span className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${d.pago ? 'bg-green-400' : 'bg-orange-400'}`} />
              )}
            </button>
          )
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">

        {/* Painel do mês selecionado */}
        <div className="lg:col-span-2 space-y-4">

          {/* Título do mês */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-gray-900 text-lg">{MONTHS[selectedMes - 1]} {ano}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {mesSelecionado?.pago
                    ? '✅ Imposto recolhido'
                    : diasRestantes > 0 && totalMes > 0
                    ? `Prazo: ${vencimentoStr}`
                    : 'Sem receita registrada'}
                </p>
              </div>
              {mesSelecionado?.pago ? (
                <span className="bg-green-50 text-green-700 text-sm font-semibold px-3 py-1.5 rounded-xl border border-green-100">✓ Pago</span>
              ) : impostoMes > 0 ? (
                <span className={`text-sm font-semibold px-3 py-1.5 rounded-xl border ${diasRestantes <= 5 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-orange-50 text-orange-600 border-orange-100'}`}>
                  {diasRestantes > 0 ? `⏱ ${diasRestantes} dias` : 'Vencido'}
                </span>
              ) : null}
            </div>

            {/* KPIs do mês */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Total de rendimentos', value: fmt(totalMes), color: 'text-gray-900' },
                { label: 'Alíquota efetiva', value: fmtPct(aliquotaEfetiva), color: 'text-violet-700' },
                { label: 'Base de cálculo', value: fmt(totalMes), color: 'text-gray-700' },
                { label: 'Imposto a pagar', value: fmt(impostoMes), color: impostoMes > 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold' },
              ].map(k => (
                <div key={k.label} className="bg-gray-50 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-1">{k.label}</div>
                  <div className={`text-base font-semibold ${k.color}`}>{k.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Barra de faixa tributária */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Faixa tributária atual</h3>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                totalMes <= 2259.20 ? 'bg-green-50 text-green-700' :
                totalMes <= 2826.65 ? 'bg-yellow-50 text-yellow-700' :
                totalMes <= 3751.05 ? 'bg-orange-50 text-orange-700' :
                totalMes <= 4664.68 ? 'bg-orange-100 text-orange-800' :
                'bg-red-50 text-red-700'
              }`}>
                {faixaMes.label} {totalMes > 2259.20 ? `(sobre excedente)` : ''}
              </span>
            </div>

            {/* Barra visual */}
            <div className="relative mb-3">
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-500 transition-all duration-500"
                  style={{ width: `${barProgress}%` }}
                />
              </div>
              {/* Marker */}
              <div
                className="absolute top-0 w-4 h-4 bg-white border-2 border-violet-600 rounded-full -translate-y-0.5 shadow transition-all duration-500"
                style={{ left: `calc(${barProgress}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>Isento até R$ 2.259</span>
              <span>27,5% acima de R$ 4.664</span>
            </div>

            {impostoMes > 0 && (
              <div className="mt-4 bg-violet-50 rounded-xl p-3 text-xs text-violet-700">
                💡 Prazo de recolhimento: até o último dia útil de {MONTHS[selectedMes - 1].toLowerCase()}/{ano}
              </div>
            )}

            {totalMes > 0 && !mesSelecionado?.pago && impostoMes > 0 && (
              <button
                onClick={() => togglePago(selectedMes, mesSelecionado?.pago || false)}
                className="mt-3 w-full btn-primary py-3 text-sm font-semibold"
              >
                ✓ Marcar imposto de {MONTHS[selectedMes-1]} como pago
              </button>
            )}
            {mesSelecionado?.pago && (
              <button
                onClick={() => togglePago(selectedMes, mesSelecionado?.pago || false)}
                className="mt-3 w-full btn-secondary py-2.5 text-sm text-gray-500"
              >
                Desfazer pagamento
              </button>
            )}
          </div>
        </div>

        {/* Resumo anual */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Resumo {ano}</h3>
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Total recebido</div>
                <div className="text-xl font-bold text-green-600">{fmt(totalAnual)}</div>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <div className="text-xs text-gray-400 mb-1">Imposto total estimado</div>
                <div className="text-xl font-bold text-orange-600">{fmt(impostoAnual)}</div>
              </div>
              <div className="border-t border-gray-50 pt-3">
                <div className="text-xs text-gray-400 mb-1">Líquido estimado</div>
                <div className="text-xl font-bold text-violet-700">{fmt(Math.max(0, totalAnual - impostoAnual))}</div>
              </div>
            </div>
          </div>

          {/* Tabela IRPF simplificada */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Tabela IRPF 2026</h3>
            <div className="space-y-2">
              {[
                { faixa: 'Até R$ 2.259', ali: 'Isento', c: 'text-green-600' },
                { faixa: 'Até R$ 2.826', ali: '7,5%', c: 'text-yellow-600' },
                { faixa: 'Até R$ 3.751', ali: '15%', c: 'text-orange-500' },
                { faixa: 'Até R$ 4.664', ali: '22,5%', c: 'text-orange-600' },
                { faixa: 'Acima de R$ 4.664', ali: '27,5%', c: 'text-red-600' },
              ].map(r => (
                <div key={r.faixa} className="flex items-center justify-between text-xs py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-gray-500">{r.faixa}</span>
                  <span className={`font-bold ${r.c}`}>{r.ali}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabela mensal */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h3 className="font-semibold text-gray-900">Histórico mensal</h3>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Calculando...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 px-5 py-3 uppercase tracking-wide">Mês</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Recebido</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Alíquota</th>
                <th className="text-right text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Imposto</th>
                <th className="text-center text-xs font-semibold text-gray-500 px-4 py-3 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.map(d => {
                const isCurrent = d.mes === mesMesAtual && d.ano === ano
                const isSelected = d.mes === selectedMes
                const faixa = getFaixa(d.total_recebido)
                const isPast = d.mes < mesMesAtual
                return (
                  <tr
                    key={d.mes}
                    onClick={() => setSelectedMes(d.mes)}
                    className={`border-b border-gray-50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-violet-50' : isCurrent ? 'bg-orange-50/30' : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-5 py-3.5 text-sm font-medium text-gray-900">
                      {MONTHS[d.mes-1]}
                      {isCurrent && <span className="ml-2 text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">atual</span>}
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700 font-medium">{d.total_recebido > 0 ? fmt(d.total_recebido) : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3.5 text-right">
                      {d.total_recebido > 0 ? <span className="text-xs font-bold text-gray-500">{faixa.label}</span> : <span className="text-gray-300 text-xs">—</span>}
                    </td>
                    <td className={`px-4 py-3.5 text-right text-sm font-bold ${d.imposto_devido > 0 ? 'text-orange-600' : d.total_recebido > 0 ? 'text-green-600' : 'text-gray-300'}`}>
                      {d.total_recebido > 0 ? fmt(d.imposto_devido) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      {d.total_recebido === 0 ? (
                        <span className="text-xs text-gray-300">—</span>
                      ) : d.pago ? (
                        <span className="text-xs bg-green-50 text-green-700 border border-green-100 px-2 py-1 rounded-lg font-medium">✓ Pago</span>
                      ) : isPast && d.imposto_devido > 0 ? (
                        <span className="text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-1 rounded-lg font-medium">Pendente</span>
                      ) : (
                        <span className="text-xs bg-yellow-50 text-yellow-700 border border-yellow-100 px-2 py-1 rounded-lg font-medium">A pagar</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5" onClick={e => e.stopPropagation()}>
                      {d.total_recebido > 0 && d.imposto_devido > 0 && (
                        <button onClick={() => togglePago(d.mes, d.pago)} className="text-xs text-violet-600 hover:underline font-medium">
                          {d.pago ? 'Desfazer' : 'Marcar pago'}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
      <p className="text-xs text-gray-400 mt-3 text-center">⚠️ Os valores são estimativas. Consulte seu contador para a declaração anual oficial.</p>
    </div>
  )
}
