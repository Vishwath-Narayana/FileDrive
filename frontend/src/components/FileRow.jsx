import { FileText, Image as ImageIcon, FileSpreadsheet, Video, MoreHorizontal, Download, Star, Trash2, RotateCcw, Eye } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const FileRow = ({ file, onDownload, onView, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIconConfig = (fileType) => {
    switch (fileType) {
      case 'image':
        return { icon: ImageIcon, color: '#8B5CF6' };
      case 'csv':
        return { icon: FileSpreadsheet, color: '#22C55E' };
      case 'pdf':
        return { icon: FileText, color: '#EF4444' };
      case 'video':
        return { icon: Video, color: '#3B82F6' };
      default:
        return { icon: FileText, color: '#6B6B6B' };
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

  const { icon: FileIcon, color: iconColor } = getFileIconConfig(file.fileType);
  const ext = file.fileType
    ? file.fileType.charAt(0).toUpperCase() + file.fileType.slice(1)
    : 'File';
  const uploaderInitial = file.uploader.name.charAt(0).toUpperCase();

  return (
    <tr
      className="group"
      style={{
        borderBottom: '1px solid var(--border)',
        transition: 'background 100ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Name + icon */}
      <td style={{ padding: '0 16px', height: '44px' }}>
        <div className="flex items-center gap-3">
          <FileIcon size={16} style={{ color: iconColor, flexShrink: 0 }} strokeWidth={1.75} />
          <span
            title={file.originalName}
            style={{
              fontSize: '13px', fontWeight: 400, color: 'var(--text-primary)',
              maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {file.originalName}
          </span>
        </div>
      </td>

      {/* Type badge */}
      <td style={{ padding: '0 16px', height: '44px' }}>
        <span
          style={{
            fontSize: '11px', fontWeight: 500,
            padding: '2px 7px', borderRadius: '4px',
            background: 'var(--bg-hover)', color: 'var(--text-secondary)',
            display: 'inline-block',
          }}
        >
          {ext}
        </span>
      </td>

      {/* Size */}
      <td style={{ padding: '0 16px', height: '44px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
          {formatFileSize(file.size)}
        </span>
      </td>

      {/* Uploader */}
      <td style={{ padding: '0 16px', height: '44px' }}>
        <div className="flex items-center gap-2">
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
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {file.uploader.name.split(' ')[0]}
          </span>
        </div>
      </td>

      {/* Date */}
      <td style={{ padding: '0 16px', height: '44px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
          {formatDate(file.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '0 16px', height: '44px', textAlign: 'right' }}>
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id={`file-menu-${file._id}`}
          >
            <div
              style={{
                width: '28px', height: '28px', borderRadius: '4px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 150ms ease',
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
      </td>
    </tr>
  );
};

export default FileRow;
