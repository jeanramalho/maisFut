import { useState, useRef } from 'react';
import { ref, push, set } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { database, storage } from '@/lib/firebase';
import { X, Upload, Calendar, Users, MapPin, Lock, Globe } from 'lucide-react';

interface CreateFutModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateFutModal({ onClose, onSuccess }: CreateFutModalProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'mensal' as 'mensal' | 'avulso',
    recurrenceKind: 'monthly' as 'weekly' | 'monthly',
    recurrenceDay: 1,
    location: '',
    maxVagas: 10,
    privacy: 'public' as 'public' | 'invite',
    time: '19:00',
  });
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      // Create fut in database
      const futsRef = ref(database, 'futs');
      const newFutRef = push(futsRef);
      const futId = newFutRef.key;

      let photoURL = '';

      // Upload image if selected
      if (selectedImage && futId) {
        const imageRef = storageRef(storage, `futs/${futId}/logo.jpg`);
        await uploadBytes(imageRef, selectedImage);
        photoURL = await getDownloadURL(imageRef);
      }

      // Prepare fut data
      const futData: any = {
        name: formData.name,
        description: formData.description,
        adminId: user.uid,
        type: formData.type,
        location: formData.location,
        maxVagas: formData.maxVagas,
        privacy: formData.privacy,
        time: formData.time,
        members: {
          [user.uid]: true, // Creator is automatically a member
        },
        photoURL,
        createdAt: Date.now(),
      };

      // Add recurrence for mensal futs
      if (formData.type === 'mensal') {
        futData.recurrence = {
          kind: formData.recurrenceKind,
          day: formData.recurrenceDay,
        };
      }

      // Save to database
      await set(newFutRef, futData);

      // Update user's futs list
      const userRef = ref(database, `users/${user.uid}/futs/${futId}`);
      await set(userRef, true);

      onSuccess();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDayOptions = () => {
    if (formData.recurrenceKind === 'weekly') {
      return [
        { value: 0, label: 'Domingo' },
        { value: 1, label: 'Segunda-feira' },
        { value: 2, label: 'Terça-feira' },
        { value: 3, label: 'Quarta-feira' },
        { value: 4, label: 'Quinta-feira' },
        { value: 5, label: 'Sexta-feira' },
        { value: 6, label: 'Sábado' },
      ];
    } else {
      // Monthly - days 1-31
      return Array.from({ length: 31 }, (_, i) => ({
        value: i + 1,
        label: `Dia ${i + 1}`,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-lighter rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-white text-xl font-semibold">Criar Fut</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Image Upload */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Foto do Fut (opcional)
            </label>
            <div className="flex items-center space-x-4">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-16 h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Upload size={24} className="text-gray-400" />
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-secondary text-primary px-4 py-2 rounded-lg text-sm font-medium hover:bg-secondary-darker transition-colors"
              >
                Escolher Foto
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Nome do Fut
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
              placeholder="Ex: Fut da Vila"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Descrição (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary resize-none"
              placeholder="Descreva seu fut..."
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Tipo
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'mensal' })}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.type === 'mensal'
                    ? 'bg-secondary text-primary'
                    : 'bg-primary border border-gray-600 text-gray-300'
                }`}
              >
                <Calendar size={16} className="inline mr-2" />
                Mensal
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'avulso' })}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.type === 'avulso'
                    ? 'bg-secondary text-primary'
                    : 'bg-primary border border-gray-600 text-gray-300'
                }`}
              >
                Avulso
              </button>
            </div>
          </div>

          {/* Recurrence - only for monthly futs */}
          {formData.type === 'mensal' && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">
                Recorrência
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, recurrenceKind: 'weekly' })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      formData.recurrenceKind === 'weekly'
                        ? 'bg-secondary text-primary'
                        : 'bg-primary border border-gray-600 text-gray-300'
                    }`}
                  >
                    Semanal
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, recurrenceKind: 'monthly' })}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                      formData.recurrenceKind === 'monthly'
                        ? 'bg-secondary text-primary'
                        : 'bg-primary border border-gray-600 text-gray-300'
                    }`}
                  >
                    Mensal
                  </button>
                </div>
                
                <select
                  value={formData.recurrenceDay}
                  onChange={(e) => setFormData({ ...formData, recurrenceDay: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
                >
                  {getDayOptions().map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Location */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Local
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-secondary"
              placeholder="Ex: Quadra do Clube"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Horário
            </label>
            <input
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Max Players */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Máximo de Jogadores
            </label>
            <input
              type="number"
              min="4"
              max="30"
              value={formData.maxVagas}
              onChange={(e) => setFormData({ ...formData, maxVagas: parseInt(e.target.value) })}
              className="w-full px-3 py-2 bg-primary border border-gray-600 rounded-lg text-white focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Privacy */}
          <div>
            <label className="block text-white text-sm font-medium mb-2">
              Privacidade
            </label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, privacy: 'public' })}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.privacy === 'public'
                    ? 'bg-secondary text-primary'
                    : 'bg-primary border border-gray-600 text-gray-300'
                }`}
              >
                <Globe size={16} className="inline mr-2" />
                Público
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, privacy: 'invite' })}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  formData.privacy === 'invite'
                    ? 'bg-secondary text-primary'
                    : 'bg-primary border border-gray-600 text-gray-300'
                }`}
              >
                <Lock size={16} className="inline mr-2" />
                Só Convite
              </button>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm">{error}</div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 bg-transparent border border-gray-600 text-gray-300 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="flex-1 py-3 bg-secondary text-primary rounded-lg font-medium hover:bg-secondary-darker transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Criando...' : 'Criar Fut'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}