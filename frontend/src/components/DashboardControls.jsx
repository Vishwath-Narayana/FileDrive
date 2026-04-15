import { Search, Grid3x3, List, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/* Chevron SVG for native select */
const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239CA3AF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

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
    <>
      <style>{`
        .controls-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0;
          width: 100%;
        }
        .controls-search {
          flex: 1;
          min-width: 0;
        }
        @media (max-width: 767px) {
          .controls-row {
            flex-wrap: wrap;
          }
          .controls-search {
            max-width: 100%;
            width: 100%;
            flex: none;
            order: 0;
          }
          .controls-secondary {
            display: flex;
            align-items: center;
            gap: 8px;
            width: 100%;
            order: 1;
          }
          .controls-type-filter {
            flex: 1;
          }
        }
      `}</style>

      <div className="controls-row">
        {/* Search */}
        <div className="controls-search" style={{ position: 'relative' }}>
          <Search
            size={14}
            style={{
              position: 'absolute', left: '10px', top: '50%',
              transform: 'translateY(-50%)', color: '#9CA3AF',
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
              padding: '0 12px 0 32px',
              background: '#FFFFFF',
              border: '1px solid #E8E8E6',
              borderRadius: '6px',
              fontFamily: 'inherit', fontSize: '13px',
              color: '#1A1A1A',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 150ms ease',
            }}
            onFocus={e => e.target.style.borderColor = '#1A1A1A'}
            onBlur={e => e.target.style.borderColor = '#E8E8E6'}
          />
        </div>

        {/* Secondary controls (view toggle + filter + upload) */}
        <div className="controls-secondary" style={{ display: 'contents' }}>
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              border: '1px solid #E8E8E6',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#FFFFFF',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', borderRight: '1px solid #E8E8E6', cursor: 'pointer',
                background: viewMode === 'grid' ? '#F0F0EE' : 'transparent',
                color: viewMode === 'grid' ? '#1A1A1A' : '#9CA3AF',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <Grid3x3 size={14} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="List view"
              style={{
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                background: viewMode === 'table' ? '#F0F0EE' : 'transparent',
                color: viewMode === 'table' ? '#1A1A1A' : '#9CA3AF',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <List size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Type filter — native select */}
          <div className="controls-type-filter" style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                height: '32px',
                border: '1px solid #E8E8E6',
                borderRadius: '6px',
                background: `#FFFFFF ${CHEVRON_SVG} no-repeat right 8px center`,
                backgroundSize: '12px',
                padding: '0 28px 0 10px',
                fontSize: '13px',
                color: '#6B6B6B',
                fontFamily: 'inherit',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '100px',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => e.target.style.borderColor = '#1A1A1A'}
              onBlur={e => e.target.style.borderColor = '#E8E8E6'}
            >
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
            </select>
          </div>

          {/* Upload button */}
          {canUpload ? (
            <button
              onClick={onUpload}
              style={{
                height: '32px', padding: '0 14px',
                background: '#1A1A1A', color: '#FFFFFF',
                border: 'none', borderRadius: '6px',
                fontSize: '13px', fontWeight: 500,
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'opacity 150ms ease',
                whiteSpace: 'nowrap',
                marginLeft: 0,
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <Plus size={14} strokeWidth={2.5} />
              Upload
            </button>
          ) : isViewer ? (
            <div title="Viewers cannot upload files" style={{ cursor: 'not-allowed', flexShrink: 0, marginLeft: 0 }}>
              <button
                disabled
                style={{
                  height: '32px', padding: '0 14px',
                  background: '#E8E8E6', color: '#9CA3AF',
                  border: 'none', borderRadius: '6px',
                  fontSize: '13px', fontWeight: 500,
                  cursor: 'not-allowed', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center', gap: '6px',
                  whiteSpace: 'nowrap',
                }}
              >
                <Plus size={14} strokeWidth={2.5} />
                Upload
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
};

export default DashboardControls;
