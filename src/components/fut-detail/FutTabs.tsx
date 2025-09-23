import React from 'react';
import { ActiveTab } from './types';

interface FutTabsProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  futStarted: boolean;
  memberCount: number;
}

export default function FutTabs({
  activeTab,
  setActiveTab,
  isAdmin,
  futStarted,
  memberCount
}: FutTabsProps) {
  const tabs = [];

  if (isAdmin) {
    tabs.push({ id: 'fut' as ActiveTab, label: 'Fut' });
    
    if (futStarted) {
      tabs.push(
        { id: 'times' as ActiveTab, label: 'Times' },
        { id: 'data' as ActiveTab, label: 'Dados' }
      );
    }
  }

  tabs.push(
    { id: 'info' as ActiveTab, label: 'Info' },
    { id: 'members' as ActiveTab, label: 'Membros' }
  );

  if (isAdmin) {
    tabs.push(
      { id: 'announcements' as ActiveTab, label: 'Avisos' },
      { id: 'ranking' as ActiveTab, label: 'Ranking' },
      { id: 'settings' as ActiveTab, label: 'Configurações' }
    );
  }

  return (
    <div className="border-b border-gray-700">
      <div className="flex space-x-1 overflow-x-auto tabs-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-primary text-secondary'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
