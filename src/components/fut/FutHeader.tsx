import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';

interface Fut {
  id: string;
  name: string;
  description?: string;
  type: 'mensal' | 'avulso';
  time?: string;
  location?: string;
  maxVagas: number;
  adminId: string;
  admins?: Record<string, boolean>;
  members: Record<string, boolean>;
  photoURL?: string;
  createdAt: number;
  recurrence?: {
    kind: 'weekly' | 'monthly';
    day: number;
  };
  privacy: 'public' | 'invite';
}

interface FutHeaderProps {
  fut: Fut;
}

export function FutHeader({ fut }: FutHeaderProps) {
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
          <h1 className="text-white text-xl font-semibold">{fut.name}</h1>
        </div>
      </div>
    </div>
  );
}
