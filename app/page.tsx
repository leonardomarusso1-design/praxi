import Link from 'next/link'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <span className="text-2xl font-bold text-violet-700">Praxi</span>
        <div className="flex gap-3">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 px-4 py-2">Entrar</Link>
          <Link href="/cadastro" className="btn-primary text-sm">Começar grátis</Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          ✨ Para psicólogos que odeiam papelada
        </div>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Agenda, recibos e<br />
          <span className="text-violet-700">Carnê-Leão automático.</span><br />
          Tudo em um lugar.
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Pare de perder horas com planilhas e recibos manuais. O Praxi organiza sua vida financeira e fiscal enquanto você foca no que importa: seus pacientes.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/cadastro" className="btn-primary text-base px-8 py-3">Criar conta grátis</Link>
          <a href="#funcionalidades" className="btn-secondary text-base px-8 py-3">Ver como funciona</a>
        </div>
        <p className="text-sm text-gray-400 mt-4">Sem cartão de crédito • 14 dias grátis</p>
      </section>

      {/* FUNCIONALIDADES */}
      <section id="funcionalidades" className="bg-gray-50 py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Tudo que você precisa</h2>
          <p className="text-center text-gray-500 mb-14">Desenvolvido especificamente para psicólogos autônomos</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '📅', title: 'Agenda inteligente', desc: 'Marque, confirme e cancele sessões. Visualize sua semana de forma clara.' },
              { icon: '👥', title: 'Gestão de pacientes', desc: 'Histórico completo, dados de contato e controle de plano de saúde.' },
              { icon: '🧾', title: 'Recibos em PDF', desc: 'Gere recibos profissionais em segundos. Envie direto pro paciente.' },
              { icon: '📊', title: 'Carnê-Leão automático', desc: 'Seu imposto calculado automaticamente todo mês. Sem surpresas.' },
            ].map(f => (
              <div key={f.title} className="card text-center">
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-20 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-3">Preço simples, sem surpresa</h2>
        <p className="text-center text-gray-500 mb-14">Cancele quando quiser</p>
        <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
          <div className="card border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-2">GRÁTIS</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">R$0</div>
            <div className="text-sm text-gray-400 mb-6">para sempre</div>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {['Até 5 pacientes','Agenda completa','10 recibos/mês','Dashboard básico'].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-green-500">✓</span>{i}</li>
              ))}
            </ul>
            <Link href="/cadastro" className="btn-secondary w-full text-center block">Começar grátis</Link>
          </div>
          <div className="card border-violet-300 bg-violet-50 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-violet-700 text-white text-xs font-bold px-4 py-1 rounded-full">MAIS POPULAR</div>
            <div className="text-sm font-medium text-violet-700 mb-2">PRO</div>
            <div className="text-4xl font-bold text-gray-900 mb-1">R$39<span className="text-lg font-normal text-gray-500">/mês</span></div>
            <div className="text-sm text-gray-400 mb-6">ou R$29/mês no plano anual</div>
            <ul className="space-y-3 text-sm text-gray-600 mb-8">
              {['Pacientes ilimitados','Recibos ilimitados','Carnê-Leão automático','Relatório para IRPF','Suporte prioritário'].map(i => (
                <li key={i} className="flex items-center gap-2"><span className="text-violet-600">✓</span>{i}</li>
              ))}
            </ul>
            <Link href="/cadastro" className="btn-primary w-full text-center block">Assinar agora</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-gray-100 py-8 text-center text-sm text-gray-400">
        <span className="font-bold text-violet-700 mr-4">Praxi</span>
        © 2026 · Feito para psicólogos brasileiros
      </footer>
    </div>
  )
}
