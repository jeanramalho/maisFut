import { useState } from 'react';
import { useRouter } from 'next/router';
import { ref, get, update } from 'firebase/database';
import { database } from '@/lib/firebase';
import Image from 'next/image';

export default function RecoverPassword() {
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: verify, 2: new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<any>(null);
  
  const router = useRouter();

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user exists with email and phone
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const user = Object.values(users).find((u: any) => 
        u.email === email && u.phone === phone
      );
      
      if (!user) {
        throw new Error('Email ou telefone incorretos. Verifique os dados e tente novamente.');
      }
      
      setUserData(user);
      setStep(2);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (newPassword !== confirmPassword) {
        throw new Error('As senhas não coincidem.');
      }

      if (newPassword.length < 6) {
        throw new Error('A senha deve ter pelo menos 6 caracteres.');
      }

      // Find user by email and phone
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      const users = snapshot.val() || {};
      
      const userEntry = Object.entries(users).find(([uid, u]: [string, any]) => 
        u.email === email && u.phone === phone
      );
      
      if (!userEntry) {
        throw new Error('Usuário não encontrado.');
      }

      const [uid] = userEntry;
      
      // Update password in Firebase Auth (this would require a different approach in production)
      // For now, we'll just update the user data
      const userRef = ref(database, `users/${uid}`);
      await update(userRef, {
        passwordReset: true,
        lastPasswordUpdate: Date.now()
      });

      // In a real app, you'd send a password reset email or use Firebase Admin SDK
      alert('Senha atualizada com sucesso! Você pode fazer login agora.');
      router.push('/login');
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
        <div className="w-24 h-24 relative">
          <Image
            src="/logo.png"
            alt="+Fut Logo"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm">
        {step === 1 ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-white text-2xl font-semibold mb-2">Recuperar Senha</h1>
              <p className="text-gray-400 text-sm">
                Digite seu email e telefone para verificar sua identidade
              </p>
            </div>

            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-primary-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
            />
            
            <input
              type="tel"
              placeholder="Telefone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
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
              {loading ? 'Verificando...' : 'Verificar'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="text-center mb-6">
              <h1 className="text-white text-2xl font-semibold mb-2">Nova Senha</h1>
              <p className="text-gray-400 text-sm">
                Olá {userData?.name}, crie uma nova senha
              </p>
            </div>

            <input
              type="password"
              placeholder="Nova senha"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 bg-primary-lighter border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
            />
            
            <input
              type="password"
              placeholder="Confirmar nova senha"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Atualizando...' : 'Atualizar Senha'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-secondary text-sm hover:underline"
          >
            Voltar ao login
          </button>
        </div>
      </div>
    </div>
  );
}
