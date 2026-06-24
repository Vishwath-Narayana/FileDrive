import { FileText, Image as ImageIcon, FileSpreadsheet, Video, MoreHorizontal, Download, Star, Trash2, RotateCcw, Eye, Presentation, FileAudio, Archive } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

const FileRow = ({ file, onDownload, onView, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIconConfig = (fileType) => {
    switch (fileType) {
      case 'image':
        return { icon: ImageIcon, color: '#A78BFA', label: 'IMG' };
      case 'pdf':
        return { icon: FileText, color: 'var(--accent-red)', label: 'PDF' };
      case 'document':
        return { icon: FileText, color: 'var(--accent-indigo)', label: 'DOC' };
      case 'csv':
      case 'spreadsheet':
        return { icon: FileSpreadsheet, color: 'var(--accent-green)', label: 'SHEET' };
      case 'presentation':
        return { icon: Presentation, color: 'var(--accent-amber)', label: 'SLIDE' };
      case 'video':
        return { icon: Video, color: 'var(--accent-blue)', label: 'VIDEO' };
      case 'audio':
        return { icon: FileAudio, color: '#06B6D4', label: 'AUDIO' };
      case 'archive':
        return { icon: Archive, color: 'var(--accent-orange)', label: 'ZIP' };
      default:
        return { icon: FileText, color: 'var(--text-tertiary)', label: 'FILE' };
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'JUST NOW';
    if (mins < 60) return `${mins}M AGO`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}H AGO`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const { icon: FileIcon, color: iconColor, label: extLabel } = getFileIconConfig(file.fileType);
  const uploaderInitial = file.uploader.name.charAt(0).toUpperCase();

  return (
    <tr
      className="group"
      style={{
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background 120ms ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Name + icon */}
      <td style={{ padding: '0 16px', height: '48px' }}>
        <div className="flex items-center gap-3">
          <div style={{
            width: '28px', height: '28px', borderRadius: '7px', flexShrink: 0,
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <FileIcon size={14} style={{ color: iconColor }} strokeWidth={1.75} />
          </div>
          <span
            title={file.originalName}
            style={{
              fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
              maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}
          >
            {file.originalName}
          </span>
        </div>
      </td>

      {/* Type badge */}
      <td style={{ padding: '0 16px', height: '48px' }}>
        <span
          style={{
            fontSize: '9px', fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.06em',
            padding: '3px 6px', borderRadius: '4px',
            background: 'var(--bg-card)', color: iconColor,
            border: '1px solid var(--border-subtle)',
            display: 'inline-block',
          }}
        >
          {extLabel}
        </span>
      </td>

      {/* Size */}
      <td style={{ padding: '0 16px', height: '48px' }}>
        <span style={{
          fontSize: '12px', color: 'var(--text-tertiary)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.02em',
        }}>
          {formatFileSize(file.size)}
        </span>
      </td>

      {/* Uploader */}
      <td style={{ padding: '0 16px', height: '48px' }}>
        <div className="flex items-center gap-2">
          <Avatar initials={uploaderInitial} size={20} fontSize={9} fontWeight={600} background="var(--bg-card)" color="var(--text-tertiary)" />
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {file.uploader.name.split(' ')[0]}
          </span>
        </div>
      </td>

      {/* Date */}
      <td style={{ padding: '0 16px', height: '48px' }}>
        <span style={{
          fontSize: '10px', color: 'var(--text-quaternary)',
          fontFamily: 'var(--font-mono)', letterSpacing: '0.05em', fontWeight: 600,
        }}>
          {formatDate(file.createdAt)}
        </span>
      </td>

      {/* Actions */}
      <td style={{ padding: '0 16px', height: '48px', textAlign: 'right' }}>
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent"
            id={`file-menu-${file._id}`}
          >
            <div
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', transition: 'background 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-active)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <MoreHorizontal size={14} style={{ color: 'var(--text-quaternary)' }} />
            </div>
          </Dropdown.Toggle>

          <Dropdown.Menu
            className="shadow-lg py-1"
            style={{
              border: '1px solid var(--border)',
              borderRadius: '10px',
              minWidth: '160px',
              background: 'var(--bg-surface)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
            }}
          >
            {!isTrash && (
              <>
                <Dropdown.Item onClick={() => onView(file)} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Eye size={13} style={{ color: 'var(--text-tertiary)' }} /> View
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onDownload(file)} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Download size={13} style={{ color: 'var(--text-tertiary)' }} /> Download
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onToggleFavorite(file)} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Star size={13} style={{ color: isFavorited ? 'var(--accent-amber)' : 'var(--text-tertiary)', fill: isFavorited ? 'var(--accent-amber)' : 'none' }} />
                  {isFavorited ? 'Unfavorite' : 'Favorite'}
                </Dropdown.Item>
              </>
            )}
            {isTrash && canDelete && (
              <Dropdown.Item onClick={() => onRestore(file)} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <RotateCcw size={13} style={{ color: 'var(--text-tertiary)' }} /> Restore
              </Dropdown.Item>
            )}
            {canDelete && (
              <>
                <div style={{ height: '1px', background: 'var(--border)', margin: '3px 0' }} />
                <Dropdown.Item onClick={() => onDelete(file)} style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-red-soft)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <Trash2 size={13} /> {isTrash ? 'Delete forever' : 'Move to trash'}
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
