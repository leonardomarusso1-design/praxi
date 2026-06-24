import Link from 'next/link'

export default function VerificarEmail() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">📧</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Verifique seu e-mail</h1>
        <p className="text-gray-500 mb-2">Enviamos um link de confirmação para o seu e-mail.</p>
        <p className="text-gray-400 text-sm mb-8">Clique no link para ativar sua conta e começar a usar o Praxi.</p>

        <div className="card bg-violet-50 border-violet-100 mb-6 text-left">
          <p className="text-sm text-violet-800 font-medium mb-2">Não recebeu o e-mail?</p>
          <ul className="text-sm text-violet-600 space-y-1">
            <li>• Verifique a pasta de spam/lixo eletrônico</li>
            <li>• Aguarde alguns minutos</li>
            <li>• Certifique-se que o e-mail está correto</li>
          </ul>
        </div>

        <Link href="/cadastro" className="btn-secondary text-sm px-6 py-2 inline-block mr-3">
          Tentar novamente
        </Link>
        <Link href="/login" className="text-sm text-violet-700 hover:underline">
          Já tenho conta
        </Link>
      </div>
    </div>
  )
}
