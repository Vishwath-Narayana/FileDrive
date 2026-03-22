import { Search, Upload, Grid3x3, List, Filter, ChevronDown, Plus } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const DashboardControls = ({ 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode, 
  typeFilter, 
  setTypeFilter,
  onUpload,
  userRole
}) => {
  const canUpload = userRole === 'admin' || userRole === 'editor';

  return (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex items-center gap-4">
        <div className="flex-1 relative group">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} />
          <input
            type="text"
            placeholder="Search documents, images..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-14 py-3.5 shadow-sm"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1.5 bg-white border border-[#F0F0F0] rounded-[16px] shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-[12px] transition-all duration-300 ${viewMode === 'grid' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:text-black'}`}
          >
            <Grid3x3 size={20} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2.5 rounded-[12px] transition-all duration-300 ${viewMode === 'table' ? 'bg-black text-white shadow-lg shadow-black/10' : 'text-gray-400 hover:text-black'}`}
          >
            <List size={20} strokeWidth={viewMode === 'table' ? 2.5 : 2} />
          </button>
        </div>

        <Dropdown>
          <Dropdown.Toggle 
            variant="light" 
            id="type-filter" 
            className="flex items-center gap-3 bg-white border border-[#F0F0F0] text-black px-6 py-3.5 rounded-[16px] text-sm font-bold hover:bg-[#FAFAFA] transition-all shadow-sm"
          >
            <Filter size={18} className="text-gray-400" />
            <span className="tracking-tight">{typeFilter === 'all' ? 'All Types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}</span>
            <ChevronDown size={14} className="text-gray-300 ml-1" strokeWidth={2.5} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-2xl border border-[#F0F0F0] py-2 rounded-[20px] min-w-[200px] mt-3 animate-in fade-in slide-in-from-top-2 duration-300 overflow-hidden">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Filter by Type</div>
            {['all', 'image', 'csv', 'pdf'].map((type) => (
              <Dropdown.Item 
                key={type}
                onClick={() => setTypeFilter(type)} 
                className={`py-2.5 px-4 text-sm font-semibold transition-all mx-1 rounded-[10px] ${
                  typeFilter === type ? 'bg-[#F5F5F5] text-black' : 'text-gray-500 hover:bg-[#FAFAFA] hover:text-black'
                }`}
              >
                {type === 'all' ? 'All Files' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {canUpload && (
          <button onClick={onUpload} className="btn-primary py-3.5 px-7">
            <Plus size={20} strokeWidth={3} />
            Upload
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardControls;
