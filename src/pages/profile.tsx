import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, deleteUser } from 'firebase/auth';
import { ref as databaseRef, update as databaseUpdate, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { auth, database, storage } from '@/lib/firebase';
import { compressImage, validateImageSize } from '@/lib/imageCompression';
import { ArrowLeft, Camera, Save, Trash2, User, Phone, Mail } from 'lucide-react';
import Image from 'next/image';
import ConfirmationModal from '@/components/ConfirmationModal';

export default function ProfileSettings() {
  const { user, userData, logout } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    positionQuadra: '',
    positionCampo: '',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Load user data when component mounts or userData changes
  useEffect(() => {
    if (userData) {
      setFormData({
        name: userData.name || '',
        phone: userData.phone || '',
        positionQuadra: userData.positionQuadra || '',
        positionCampo: userData.positionCampo || '',
      });
      setImagePreview(userData.photoURL || null);
    }
  }, [userData]);

  const positionsQuadra = [
    { value: 'Goleiro', label: 'Goleiro' },
    { value: 'Fixo', label: 'Fixo' },
    { value: 'Ala', label: 'Ala' },
    { value: 'Pivô', label: 'Pivô' },
  ];

  const positionsCampo = [
    { value: 'Goleiro', label: 'Goleiro' },
    { value: 'Zagueiro', label: 'Zagueiro' },
    { value: 'Lateral', label: 'Lateral' },
    { value: 'Volante', label: 'Volante' },
    { value: 'Meio-campo', label: 'Meio-campo' },
    { value: 'Atacante', label: 'Atacante' },
  ];

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        
        // Check if image needs compression
        if (!validateImageSize(file, 5)) {
          const compressedFile = await compressImage(file, 5);
          setSelectedImage(compressedFile);
          const reader = new FileReader();
          reader.onload = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(compressedFile);
        } else {
          setSelectedImage(file);
          const reader = new FileReader();
          reader.onload = () => setImagePreview(reader.result as string);
          reader.readAsDataURL(file);
        }
      } catch (error) {
        setError('Erro ao processar a imagem. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let photoURL = userData?.photoURL || '';

      // Upload new image if selected
      if (selectedImage) {
        // Delete old image if exists
        if (userData?.photoURL) {
          try {
            const oldImageRef = storageRef(storage, userData.photoURL);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log('Old image not found or already deleted');
          }
        }

        // Upload new image
        const imageRef = storageRef(storage, `users/${user.uid}/profile.jpg`);
        await uploadBytes(imageRef, selectedImage);
        photoURL = await getDownloadURL(imageRef);
      }

      // Update user data in database
      const userRef = databaseRef(database, `users/${user.uid}`);
      await databaseUpdate(userRef, {
        name: formData.name,
        phone: formData.phone,
        positionQuadra: formData.positionQuadra,
        positionCampo: formData.positionCampo,
        photoURL: photoURL,
        updatedAt: Date.now(),
      });

      setSuccess('Perfil atualizado com sucesso!');
      setSelectedImage(null);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (email: string, password: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Verificar login do usuário
      const { signInWithEmailAndPassword } = await import('firebase/auth');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      // Delete user's photo from storage
      if (userData?.photoURL) {
        try {
          const imageRef = storageRef(storage, userData.photoURL);
          await deleteObject(imageRef);
        } catch (error) {
          console.log('Image not found or already deleted');
        }
      }

      // Delete user data from database
      const userRef = databaseRef(database, `users/${user.uid}`);
      await remove(userRef);

      // Delete user from Firebase Auth
      await deleteUser(currentUser);

      // Logout and redirect
      await logout();
      
      // Force redirect to login page
      window.location.href = '/login';
      
      return true;
    } catch (error: any) {
      console.error('Error deleting account:', error);
      return false;
    }
  };

  if (!user) {
    if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      <div className="bg-primary-lighter border-b border-gray-700">
        <div className="px-6 py-4">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-white text-xl font-semibold">Configurações do Perfil</h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              {imagePreview ? (
                <div className="w-30 h-30 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={imagePreview}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-30 h-30 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={48} className="text-primary" />
                </div>
              )}
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-secondary text-primary p-2 rounded-full hover:bg-secondary-darker transition-colors"
              >
                <Camera size={16} />
              </button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
            
            <p className="text-gray-400 text-sm text-center">
              Clique no ícone da câmera para alterar sua foto
            </p>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold flex items-center space-x-2">
              <User size={20} />
              <span>Informações Pessoais</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="Seu nome completo"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  <Phone size={16} className="inline mr-1" />
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  <Mail size={16} className="inline mr-1" />
                  Email
                </label>
                <input
                  type="email"
                  value={userData?.email || ''}
                  disabled
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-400 cursor-not-allowed"
                />
                <p className="text-gray-500 text-xs mt-1">
                  O email não pode ser alterado
                </p>
              </div>
            </div>
          </div>

          {/* Positions */}
          <div className="space-y-4">
            <h2 className="text-white text-lg font-semibold">
              Posições em Quadra
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Quadra
                </label>
                <select
                  value={formData.positionQuadra}
                  onChange={(e) => setFormData({ ...formData, positionQuadra: e.target.value })}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">Selecionar posição</option>
                  {positionsQuadra.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Campo
                </label>
                <select
                  value={formData.positionCampo}
                  onChange={(e) => setFormData({ ...formData, positionCampo: e.target.value })}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
                >
                  <option value="">Selecionar posição</option>
                  {positionsCampo.map(pos => (
                    <option key={pos.value} value={pos.value}>
                      {pos.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-900 bg-opacity-50 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 bg-opacity-50 border border-green-700 text-green-300 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-secondary text-primary py-3 rounded-lg font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Save size={20} />
              <span>{loading ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>

            <div className="pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                <Trash2 size={20} />
                <span>Excluir Conta</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Delete Account Modal */}
      {showDeleteConfirm && (
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          title="Excluir Conta"
          message="Esta ação irá excluir permanentemente sua conta e todos os seus dados. Esta ação não pode ser desfeita."
          confirmText="Excluir Conta"
          confirmButtonColor="bg-red-600"
          confirmButtonHoverColor="hover:bg-red-700"
        />
      )}
    </div>
  );
}
