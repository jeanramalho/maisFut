import React from 'react';
import { TabType } from '@/hooks/fut-details/types';

interface TabsProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdmin: boolean;
}

export default function Tabs({ activeTab, setActiveTab, isAdmin }: TabsProps) {
  const tabs = isAdmin 
    ? ['fut', 'members', 'occurrences', 'settings', 'times', 'data', 'ranking', 'info', 'announcements'] as TabType[]
    : ['fut', 'info', 'members', 'occurrences', 'ranking'] as TabType[];

  return (
    <div className="bg-primary-lighter border-b border-gray-700">
      <div className="px-6">
        <div className="flex items-center">
          <div className="flex space-x-1 overflow-x-auto flex-1 min-w-0 tabs-scrollbar py-2">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-primary text-secondary'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}