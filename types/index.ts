export interface Professional {
  id: string
  nome: string
  crp: string
  cpf: string
  email: string
  telefone: string
  endereco: string
  cidade: string
  estado: string
  cep: string
  especialidade: string
  created_at: string
}

export interface Patient {
  id: string
  professional_id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  data_nascimento: string | null
  plano_saude: string
  valor_sessao: number
  ativo: boolean
  observacoes: string
  created_at: string
}

export interface Session {
  id: string
  professional_id: string
  patient_id: string
  data_hora: string
  duracao_minutos: number
  valor: number
  status: 'agendada' | 'realizada' | 'cancelada' | 'falta'
  modalidade: 'presencial' | 'online'
  pago: boolean
  observacoes: string
  created_at: string
  patient?: Patient
}

export interface Receipt {
  id: string
  professional_id: string
  session_id: string | null
  patient_id: string
  numero: string
  data_emissao: string
  valor: number
  descricao: string
  created_at: string
  patient?: Patient
}

export interface CarneLeao {
  id: string
  professional_id: string
  mes: number
  ano: number
  total_recebido: number
  imposto_devido: number
  pago: boolean
  data_pagamento: string | null
  observacoes: string
}
