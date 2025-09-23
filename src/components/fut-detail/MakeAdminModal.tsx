import React from 'react';
import { X, Crown, Shield } from 'lucide-react';

interface MakeAdminModalProps {
  showMakeAdminModal: boolean;
  selectedMemberForAdmin: any;
  isOriginalAdmin: boolean;
  onClose: () => void;
  onMakeAdmin: () => void;
  onRemoveAdmin: () => void;
}

export default function MakeAdminModal({
  showMakeAdminModal,
  selectedMemberForAdmin,
  isOriginalAdmin,
  onClose,
  onMakeAdmin,
  onRemoveAdmin
}: MakeAdminModalProps) {
  if (!showMakeAdminModal || !selectedMemberForAdmin) return null;

  const isOriginalAdminMember = isOriginalAdmin;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-primary-lighter rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-600">
          <h2 className="text-white text-xl font-semibold">Gerenciar Administrador</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
              <Crown size={32} className="text-primary" />
            </div>
            <h3 className="text-white text-lg font-semibold mb-2">
              {selectedMemberForAdmin.name}
            </h3>
            <p className="text-gray-400 text-sm">
              Gerenciar privilégios de administrador
            </p>
          </div>

          {isOriginalAdminMember ? (
            <div className="bg-yellow-900 border border-yellow-600 rounded-lg p-3">
              <div className="flex items-center space-x-2 mb-2">
                <Crown size={20} className="text-yellow-400" />
                <span className="text-yellow-400 font-medium">Administrador Original</span>
              </div>
              <p className="text-gray-300 text-sm">
                Este é o administrador original do fut. Os privilégios não podem ser removidos.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-900 border border-green-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield size={20} className="text-green-400" />
                  <span className="text-green-400 font-medium">Tornar Administrador</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Dar privilégios de administrador para este membro. Ele poderá gerenciar o fut.
                </p>
              </div>

              <div className="bg-red-900 border border-red-600 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <X size={20} className="text-red-400" />
                  <span className="text-red-400 font-medium">Remover Administrador</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Remover privilégios de administrador deste membro.
                </p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            
            {!isOriginalAdminMember && (
              <>
                <button
                  onClick={onMakeAdmin}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Tornar Admin
                </button>
                <button
                  onClick={onRemoveAdmin}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
                >
                  Remover Admin
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
