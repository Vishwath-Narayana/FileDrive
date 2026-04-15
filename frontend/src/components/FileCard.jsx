import { FileText, Image as ImageIcon, FileSpreadsheet, Video, MoreHorizontal, Download, Star, Trash2, RotateCcw, Eye } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';

const FileCard = ({ file, onDownload, onView, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIconConfig = (fileType) => {
    switch (fileType) {
      case 'image':
        return { icon: ImageIcon, bg: '#F5F3FF', color: '#8B5CF6' };
      case 'csv':
        return { icon: FileSpreadsheet, bg: '#F0FDF4', color: '#22C55E' };
      case 'pdf':
        return { icon: FileText, bg: '#FEF2F2', color: '#EF4444' };
      case 'video':
        return { icon: Video, bg: '#EFF6FF', color: '#3B82F6' };
      default:
        return { icon: FileText, bg: '#F7F7F5', color: '#6B6B6B' };
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const { icon: FileIcon, bg: iconBg, color: iconColor } = getFileIconConfig(file.fileType);
  const ext = file.fileType?.toUpperCase() ?? 'FILE';
  const uploaderInitial = file.uploader.name.charAt(0).toUpperCase();
  const uploaderFirstName = file.uploader.name.split(' ')[0];

  return (
    <div
      className="card-premium flex flex-col"
      style={{ padding: '16px', cursor: 'pointer', transition: 'all 150ms ease' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D0D0CE'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      {/* Top row */}
      <div className="flex items-start justify-between">
        {/* File type icon */}
        <div
          style={{
            width: '40px', height: '40px',
            borderRadius: '8px',
            background: iconBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <FileIcon size={20} style={{ color: iconColor }} strokeWidth={1.75} />
        </div>

        {/* Three-dot menu */}
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id={`dropdown-${file._id}`}
          >
            <div
              className="file-menu-btn"
              style={{
                width: '28px', height: '28px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MoreHorizontal size={14} style={{ color: 'var(--text-tertiary)' }} />
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="shadow-lg py-1"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '8px',
              minWidth: '160px',
              background: 'var(--bg-surface)',
            }}
          >
            {!isTrash && (
              <>
                <Dropdown.Item
                  onClick={() => onView(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Eye size={13} style={{ color: 'var(--text-tertiary)' }} />
                  View
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => onDownload(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Download size={13} style={{ color: 'var(--text-tertiary)' }} />
                  Download
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => onToggleFavorite(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Star size={13} style={{ color: isFavorited ? '#F59E0B' : 'var(--text-tertiary)', fill: isFavorited ? '#F59E0B' : 'none' }} />
                  {isFavorited ? 'Unfavorite' : 'Favorite'}
                </Dropdown.Item>
              </>
            )}
            {isTrash && canDelete && (
              <Dropdown.Item
                onClick={() => onRestore(file)}
                style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '5px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                <RotateCcw size={13} style={{ color: 'var(--text-tertiary)' }} />
                Restore
              </Dropdown.Item>
            )}
            {canDelete && (
              <>
                <div style={{ height: '1px', background: 'var(--border)', margin: '3px 0' }} />
                <Dropdown.Item
                  onClick={() => onDelete(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '5px', color: '#EF4444', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Trash2 size={13} />
                  {isTrash ? 'Delete forever' : 'Move to trash'}
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Middle — filename + meta */}
      <div style={{ marginTop: '12px' }}>
        <div
          title={file.originalName}
          style={{
            fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}
        >
          {file.originalName}
        </div>
        <div style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text-tertiary)' }}>
          {ext} · {formatFileSize(file.size)}
        </div>
      </div>

      {/* Bottom row — uploader + date */}
      <div
        style={{
          marginTop: '10px', paddingTop: '10px',
          borderTop: '1px solid #F0F0EE',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}
      >
        {/* Uploader */}
        <div className="flex items-center" style={{ gap: '6px' }}>
          <div
            style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: '#E8E8E6', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 500, flexShrink: 0,
            }}
          >
            {uploaderInitial}
          </div>
          <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-secondary)' }}>
            {uploaderFirstName}
          </span>
        </div>

        {/* Date */}
        <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-tertiary)' }}>
          {formatDate(file.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default FileCard;
