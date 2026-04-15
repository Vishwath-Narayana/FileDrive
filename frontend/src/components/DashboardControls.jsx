import { Search, Grid3x3, List, ChevronDown, Plus } from 'lucide-react';
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
  const isViewer = userRole === 'viewer';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '36px' }}>
      {/* Search */}
      <div style={{ flex: 1, maxWidth: '320px', position: 'relative' }}>
        <Search
          size={13}
          style={{
            position: 'absolute', left: '10px', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-tertiary)',
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Search files..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%', height: '32px',
            padding: '0 12px 0 30px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '13px',
            color: 'var(--text-primary)',
            outline: 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            boxSizing: 'border-box',
          }}
          onFocus={e => { e.target.style.borderColor = 'var(--text-primary)'; e.target.style.boxShadow = '0 0 0 2px rgba(26,26,26,0.08)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
        />
      </div>

      {/* View toggle — grid / list */}
      <div
        style={{
          display: 'flex',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          overflow: 'hidden',
          background: 'var(--bg-surface)',
        }}
      >
        <button
          onClick={() => setViewMode('grid')}
          title="Grid view"
          style={{
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
            background: viewMode === 'grid' ? '#EFEFED' : 'transparent',
            color: viewMode === 'grid' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            transition: 'background 150ms ease, color 150ms ease',
          }}
        >
          <Grid3x3 size={15} strokeWidth={1.75} />
        </button>
        <button
          onClick={() => setViewMode('table')}
          title="List view"
          style={{
            width: '32px', height: '32px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer',
            background: viewMode === 'table' ? '#EFEFED' : 'transparent',
            color: viewMode === 'table' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            transition: 'background 150ms ease, color 150ms ease',
          }}
        >
          <List size={15} strokeWidth={1.75} />
        </button>
      </div>

      {/* Type filter */}
      <Dropdown>
        <Dropdown.Toggle
          variant="link"
          id="type-filter"
          className="text-decoration-none p-0 border-0 bg-transparent"
        >
          <div
            className="flex items-center gap-1.5"
            style={{
              height: '32px', padding: '0 10px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: '6px', cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '13px', fontWeight: 400, color: 'var(--text-primary)' }}>
              {typeFilter === 'all' ? 'All types' : typeFilter.charAt(0).toUpperCase() + typeFilter.slice(1)}
            </span>
            <ChevronDown size={13} style={{ color: 'var(--text-tertiary)' }} strokeWidth={2} />
          </div>
        </Dropdown.Toggle>

        <Dropdown.Menu
          className="shadow-lg py-1 mt-1"
          style={{
            border: '1px solid var(--border)',
            borderRadius: '8px',
            minWidth: '150px',
            background: 'var(--bg-surface)',
          }}
        >
          {['all', 'image', 'csv', 'pdf'].map((type) => (
            <Dropdown.Item
              key={type}
              onClick={() => setTypeFilter(type)}
              style={{
                padding: '7px 12px', fontSize: '13px',
                margin: '1px 4px', borderRadius: '5px',
                background: typeFilter === type ? 'var(--bg-hover)' : 'transparent',
                color: typeFilter === type ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: typeFilter === type ? 500 : 400,
              }}
            >
              {type === 'all' ? 'All files' : type.charAt(0).toUpperCase() + type.slice(1) + 's'}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      {/* Upload button */}
      {canUpload ? (
        <button onClick={onUpload} className="btn-primary" style={{ gap: '4px' }}>
          <Plus size={14} strokeWidth={2.5} />
          Upload
        </button>
      ) : isViewer ? (
        <div title="Viewers cannot upload files" style={{ cursor: 'not-allowed' }}>
          <button disabled className="btn-primary" style={{ gap: '4px', pointerEvents: 'none' }}>
            <Plus size={14} strokeWidth={2.5} />
            Upload
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default DashboardControls;
