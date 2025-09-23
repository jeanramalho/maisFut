interface FutTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isAdmin: boolean;
  futStarted?: boolean;
}

export function FutTabs({ activeTab, setActiveTab, isAdmin, futStarted }: FutTabsProps) {
  const tabs = [];

  if (isAdmin) {
    tabs.push({ id: 'fut', label: 'Fut' });
    
    if (futStarted) {
      tabs.push(
        { id: 'times', label: 'Times' },
        { id: 'data', label: 'Dados' }
      );
    }
  }

  tabs.push(
    { id: 'info', label: 'Info' },
    { id: 'members', label: 'Membros' }
  );

  if (isAdmin) {
    tabs.push(
      { id: 'announcements', label: 'Avisos' },
      { id: 'ranking', label: 'Ranking' },
      { id: 'settings', label: 'Configurações' }
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
