import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, signup } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password, name, phone);
      }
      router.push('/');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center px-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center">
          <span className="text-primary text-3xl font-bold">+F</span>
        </div>
        <h1 className="text-secondary text-2xl font-bold text-center mt-4">+Fut</h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-primary-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
              />
              <input
                type="tel"
                placeholder="Telefone (opcional)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-primary-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
              />
            </>
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-primary-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
          />
          
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-4 py-3 bg-primary-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
          />

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-primary font-semibold py-3 rounded-lg hover:bg-secondary-darker transition-colors disabled:opacity-50"
          >
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-secondary text-sm hover:underline"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}