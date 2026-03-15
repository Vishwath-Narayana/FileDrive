import { Files, Star, Trash2 } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'all', label: 'All Files', icon: Files },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="w-64 bg-gray-50 border-r border-gray-200 h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900">FileDrive</h2>
      </div>
      
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
