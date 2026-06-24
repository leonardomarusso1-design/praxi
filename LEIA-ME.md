# Praxi – Gestão para Psicólogos

## 🚀 PASSO A PASSO PARA SUBIR

### 1. Banco de dados (Supabase)
1. Acesse https://supabase.com e entre na conta nova
2. Clique no projeto `praxi` → vá em **SQL Editor**
3. Cole todo o conteúdo de `supabase/schema.sql` e clique **Run**
4. Pronto — tabelas, RLS e trigger criados

### 2. Rodar localmente
```bash
cd praxi
npm install
npm run dev
```
Acesse: http://localhost:3000

### 3. Deploy no Vercel (gratuito)
1. Acesse https://vercel.com e conecte seu GitHub
2. Importe a pasta `praxi`
3. Em **Environment Variables** adicione:
   - `NEXT_PUBLIC_SUPABASE_URL` = https://kchmilbsyozkccrhsuef.supabase.co
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (a chave do seu projeto)
4. Deploy → seu app estará em praxi.vercel.app (ou domínio próprio)

---

## 📋 O QUE TEM NO APP

| Página | O que faz |
|--------|-----------|
| `/` | Landing page com pricing |
| `/cadastro` | Criar conta |
| `/login` | Entrar |
| `/dashboard` | Resumo do mês: recebido, sessões, pacientes, imposto |
| `/pacientes` | Cadastrar e gerenciar pacientes |
| `/agenda` | Calendário semanal de sessões |
| `/recibos` | Emitir e baixar recibos |
| `/carne-leao` | Controle mensal do imposto (tabela progressiva 2026) |
| `/configuracoes` | Dados do profissional (vão nos recibos) |

---

## 💳 INTEGRAR PAGAMENTO (Cakto)
1. Crie os planos no painel da Cakto (Free e Pro R$39/mês)
2. Adicione o link de checkout no botão "Assinar agora" da landing page
3. Use o webhook da Cakto para liberar acesso Pro no banco

---

## 🌐 DOMÍNIO
Sugestão: compre `praxi.com.br` no Registro.br (~R$40/ano)
Configure no Vercel em Settings → Domains
