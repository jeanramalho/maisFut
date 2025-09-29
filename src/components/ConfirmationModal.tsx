import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (email: string, password: string) => Promise<boolean>;
  title: string;
  message: string;
  confirmText: string;
  confirmButtonColor: string;
  confirmButtonHoverColor: string;
  icon?: React.ReactNode;
}

export default function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmButtonColor,
  confirmButtonHoverColor,
  icon
}: ConfirmationModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const success = await onConfirm(email.trim(), password);
      if (success) {
        onClose();
        setEmail('');
        setPassword('');
      }
    } catch (error) {
      setError('Erro ao processar solicitação');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setEmail('');
      setPassword('');
      setError('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-primary-lighter rounded-lg w-full max-w-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            {icon || <AlertTriangle size={18} className="text-red-500" />}
            <h3 className="text-white text-base font-semibold">{title}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-white transition-colors text-lg disabled:opacity-50"
          >
            ✕
          </button>
        </div>

        <div className="p-4">
          <p className="text-gray-300 text-sm mb-4">{message}</p>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
                placeholder="Digite seu email"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-secondary disabled:opacity-50"
                placeholder="Digite sua senha"
                required
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`flex-1 px-3 py-2 ${confirmButtonColor} text-white rounded-lg text-sm font-medium ${confirmButtonHoverColor} transition-colors disabled:opacity-50`}
              >
                {loading ? 'Processando...' : confirmText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
