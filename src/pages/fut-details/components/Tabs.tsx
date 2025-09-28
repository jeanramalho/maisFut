import React from 'react';
import { TabType } from '@/hooks/fut-details/types';

interface TabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
  votingOpen: boolean;
  futStarted: boolean;
  confirmedMembers: string[];
  userUid?: string;
  teams: Record<string, string[]>;
}

export default function Tabs({ activeTab, setActiveTab, isAdmin, votingOpen, futStarted, confirmedMembers, userUid, teams }: TabsProps) {
  const getTabs = () => {
    if (isAdmin) {
      const adminTabs = ['fut', 'info', 'members', 'ranking', 'avisos', 'configuracoes'] as TabType[];
      if (futStarted) {
        // Insert times and data tabs right after fut tab
        adminTabs.splice(1, 0, 'times', 'data');
      }
      return adminTabs;
    } else {
      const playerTabs = ['fut', 'info', 'members', 'ranking'] as TabType[];
      
      // Show times tab if teams exist and fut is started
      if (futStarted && teams && Object.keys(teams).length > 0) {
        playerTabs.splice(1, 0, 'times');
      }
      
      // Only show voting tab if user is confirmed and voting is open
      if (votingOpen && userUid && confirmedMembers.includes(userUid)) {
        // Insert voting tab right after fut tab
        playerTabs.splice(1, 0, 'voting');
      }
      return playerTabs;
    }
  };
  
  const tabs = getTabs();

  return (
    <div className="bg-primary-lighter border-b border-gray-700">
      <div className="px-6">
        <div className="flex items-center">
          <div className="flex space-x-1 overflow-x-auto flex-1 min-w-0 tabs-scrollbar py-2">
                     {tabs.map(tab => {
                       const getTabName = (tab: TabType) => {
                         switch (tab) {
                           case 'fut': return 'Fut';
                           case 'times': return 'Times';
                           case 'data': return 'Dados';
                           case 'info': return 'Info';
                           case 'members': return 'Membros';
                           case 'ranking': return 'Ranking';
                           case 'configuracoes': return 'Configurações';
                           case 'avisos': return 'Avisos';
                           case 'voting': return 'Votação';
                         }
                       };
                       
                       return (
                         <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                             activeTab === tab
                               ? 'bg-primary text-secondary'
                               : 'text-gray-400 hover:text-white'
                           }`}
                         >
                           {getTabName(tab)}
                         </button>
                       );
                     })}
          </div>
        </div>
      </div>
    </div>
  );
}