import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, Settings, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/router';

export default function Header() {
  const { user, userData, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // Calculate user stats (mock data for now - would come from database)
  const userStats = {
    goals: 0,
    assists: 0,
  };

  return (
    <header className="bg-primary px-6 py-4">
      <div className="flex items-center justify-between">
        {/* User Profile */}
        <div className="flex items-center space-x-3">
          {/* Profile Picture */}
          <div 
            className="relative cursor-pointer"
            onClick={() => setShowMenu(!showMenu)}
          >
            {userData?.photoURL ? (
              <Image
                src={userData.photoURL}
                alt={userData.name}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">
                  {userData?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute top-full left-0 mt-2 w-56 bg-primary-lighter rounded-lg shadow-lg border border-gray-600 z-50">
                <div className="p-3 border-b border-gray-600">
                  <div className="text-white font-medium truncate">{userData?.name}</div>
                  <div className="text-gray-400 text-sm truncate">{userData?.email}</div>
                </div>
                
                <button 
                  className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                  onClick={() => {
                    setShowMenu(false);
                    router.push('/profile');
                  }}
                >
                  <Settings size={16} />
                  <span>Configurações</span>
                </button>
                
                <button 
                  className="w-full text-left px-3 py-2 text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>

          {/* User Info */}
          <div>
            <h1 className="text-white font-semibold text-lg">{userData?.name}</h1>
            <p className="text-gray-400 text-sm">
              {userData?.positionQuadra && userData?.positionCampo 
                ? `${userData.positionQuadra}/${userData.positionCampo}`
                : userData?.positionQuadra || userData?.positionCampo || 'Posição não definida'
              }
            </p>
          </div>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="text-gray-400 hover:text-secondary transition-colors relative">
            <Bell size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full"></div>
          </button>

          {/* Settings */}
          <button 
            onClick={() => router.push('/profile')}
            className="text-gray-400 hover:text-secondary transition-colors"
          >
            <Settings size={24} />
          </button>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </header>
  );
}