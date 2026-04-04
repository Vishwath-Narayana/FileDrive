import { File, Star, Trash2, Settings, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigate = useNavigate();
  const { currentOrganization } = useAuth();
  
  const menuItems = [
    { id: 'all', label: 'All Files', icon: File },
    { id: 'favorites', label: 'Favorites', icon: Star },
    { id: 'trash', label: 'Trash', icon: Trash2 },
  ];

  return (
    <div className="w-64 glass-effect flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-8">
        <div 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img src={logo} alt="FileDrive Logo" className="w-9 h-9 object-cover rounded-xl shadow-lg transform group-hover:scale-110 transition-transform duration-300" />
          <h1 className="text-xl font-bold tracking-tight text-black">FileDrive</h1>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-2">
        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-4">
          Navigation
        </div>
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full sidebar-item relative overflow-hidden ${
                  isActive
                    ? 'sidebar-item-active'
                    : 'sidebar-item-inactive'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black to-gray-800 rounded-[12px] animate-in fade-in duration-300" />
                )}
                <span className="relative flex items-center gap-3.5">
                  <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="tracking-tight">{item.label}</span>
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="p-4 mt-auto">
        <div className="bg-gradient-to-br from-[#F9F9F9] to-[#F5F5F5] rounded-[20px] p-4 border border-[#F0F0F0] mb-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Workspace</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-semibold text-black truncate">{currentOrganization?.name || 'Active Team'}</span>
          </div>
        </div>
        
        <button
          onClick={() => navigate('/settings')}
          className={`w-full sidebar-item ${
            activeTab === 'settings'
              ? 'sidebar-item-active'
              : 'sidebar-item-inactive'
          }`}
        >
          <Settings size={18} strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          <span className="tracking-tight">Settings</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
