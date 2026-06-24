import { Search, Grid3x3, List, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const CHEVRON_SVG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2380808A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;

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
              position: 'absolute', left: '12px', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-quaternary)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', height: '34px',
              padding: '0 12px 0 34px',
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              fontFamily: 'var(--font-sans)', fontSize: '13px',
              color: 'var(--text-primary)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 150ms ease, box-shadow 150ms ease',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--accent-indigo)';
              e.target.style.boxShadow = '0 0 0 3px var(--accent-indigo-soft)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Secondary controls */}
        <div className="controls-secondary" style={{ display: 'contents' }}>
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
              background: 'var(--bg-card)',
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              title="Grid view"
              style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', borderRight: '1px solid var(--border)', cursor: 'pointer',
                background: viewMode === 'grid' ? 'var(--accent-indigo-soft)' : 'transparent',
                color: viewMode === 'grid' ? 'var(--accent-indigo)' : 'var(--text-quaternary)',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <Grid3x3 size={14} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              title="List view"
              style={{
                width: '34px', height: '34px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', cursor: 'pointer',
                background: viewMode === 'table' ? 'var(--accent-indigo-soft)' : 'transparent',
                color: viewMode === 'table' ? 'var(--accent-indigo)' : 'var(--text-quaternary)',
                transition: 'background 150ms ease, color 150ms ease',
              }}
            >
              <List size={14} strokeWidth={1.75} />
            </button>
          </div>

          {/* Type filter */}
          <div className="controls-type-filter" style={{ position: 'relative', flexShrink: 0 }}>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{
                height: '34px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                background: `var(--bg-card) ${CHEVRON_SVG} no-repeat right 10px center`,
                backgroundSize: '12px',
                padding: '0 30px 0 12px',
                fontSize: '12px',
                fontWeight: 500,
                fontFamily: 'var(--font-mono)',
                color: 'var(--text-secondary)',
                appearance: 'none',
                cursor: 'pointer',
                outline: 'none',
                minWidth: '140px',
                transition: 'border-color 150ms ease',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--accent-indigo)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            >
              <option value="all">All types</option>
              <option value="image">Images</option>
              <option value="pdf">PDFs</option>
              <option value="document">Documents</option>
              <option value="spreadsheet">Spreadsheets</option>
              <option value="presentation">Presentations</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="archive">Archives</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Upload button */}
          {canUpload ? (
            <button
              onClick={onUpload}
              style={{
                height: '34px', padding: '0 16px',
                background: 'var(--accent-indigo)', color: '#FFFFFF',
                border: 'none', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600,
                cursor: 'pointer', flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'var(--accent-indigo-hover)';
                e.currentTarget.style.boxShadow = 'var(--accent-indigo-glow)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'var(--accent-indigo)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <Plus size={14} strokeWidth={2.5} />
              Upload
            </button>
          ) : isViewer ? (
            <div title="Viewers cannot upload files" style={{ cursor: 'not-allowed', flexShrink: 0 }}>
              <button
                disabled
                style={{
                  height: '34px', padding: '0 16px',
                  background: 'var(--bg-card)', color: 'var(--text-quaternary)',
                  border: '1px solid var(--border)', borderRadius: '8px',
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
