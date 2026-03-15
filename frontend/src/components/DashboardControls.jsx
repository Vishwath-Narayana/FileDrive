import { Search, Upload, Grid3x3, List, Filter } from 'lucide-react';
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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-900">Your Files</h1>
        {canUpload && (
          <button onClick={onUpload} className="btn-primary flex items-center gap-2">
            <Upload size={18} />
            Upload File
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 border border-gray-300 rounded-md p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <Grid3x3 size={18} />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
          >
            <List size={18} />
          </button>
        </div>

        <Dropdown>
          <Dropdown.Toggle variant="outline-secondary" id="type-filter" className="d-flex align-items-center gap-2">
            <Filter size={18} />
            Type: {typeFilter === 'all' ? 'All' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => setTypeFilter('all')}>All</Dropdown.Item>
            <Dropdown.Item onClick={() => setTypeFilter('image')}>Image</Dropdown.Item>
            <Dropdown.Item onClick={() => setTypeFilter('csv')}>CSV</Dropdown.Item>
            <Dropdown.Item onClick={() => setTypeFilter('pdf')}>PDF</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
};

export default DashboardControls;
