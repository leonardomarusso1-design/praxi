-- =============================================
-- PRAXI - Schema do Banco de Dados
-- Cole no SQL Editor do Supabase e execute
-- =============================================

CREATE TABLE IF NOT EXISTS professionals (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nome TEXT NOT NULL DEFAULT '',
  crp TEXT DEFAULT '',
  cpf TEXT DEFAULT '',
  email TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  endereco TEXT DEFAULT '',
  cidade TEXT DEFAULT '',
  estado TEXT DEFAULT '',
  cep TEXT DEFAULT '',
  especialidade TEXT DEFAULT 'Psicologia',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  email TEXT DEFAULT '',
  telefone TEXT DEFAULT '',
  cpf TEXT DEFAULT '',
  data_nascimento DATE,
  plano_saude TEXT DEFAULT '',
  valor_sessao DECIMAL(10,2) DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER DEFAULT 50,
  valor DECIMAL(10,2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'agendada' CHECK (status IN ('agendada','realizada','cancelada','falta')),
  modalidade TEXT DEFAULT 'presencial' CHECK (modalidade IN ('presencial','online')),
  pago BOOLEAN DEFAULT false,
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS receipts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
  numero TEXT NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT DEFAULT 'Serviços de psicologia',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS carne_leao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE NOT NULL,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL,
  total_recebido DECIMAL(10,2) DEFAULT 0,
  imposto_devido DECIMAL(10,2) DEFAULT 0,
  pago BOOLEAN DEFAULT false,
  data_pagamento DATE,
  observacoes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(professional_id, mes, ano)
);

ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE carne_leao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "own_profile_select" ON professionals FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own_profile_update" ON professionals FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "own_profile_insert" ON professionals FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own_patients" ON patients FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "own_sessions" ON sessions FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "own_receipts" ON receipts FOR ALL USING (professional_id = auth.uid());
CREATE POLICY "own_carne_leao" ON carne_leao FOR ALL USING (professional_id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.professionals (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome',''), COALESCE(NEW.email,''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
