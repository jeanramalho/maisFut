import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Settings } from 'lucide-react';
import { Fut } from '../types';

interface HeaderProps {
  fut: Fut | null;
  isAdmin: boolean;
  onOpenSettings: () => void;
}

export default function Header({ fut, isAdmin, onOpenSettings }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="bg-primary-lighter border-b border-gray-700">
      <div className="px-6 py-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-white text-xl font-semibold">Detalhes do Fut</h1>
          {isAdmin && (
            <button
              onClick={onOpenSettings}
              className="ml-auto text-gray-400 hover:text-secondary transition-colors"
            >
              <Settings size={24} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
