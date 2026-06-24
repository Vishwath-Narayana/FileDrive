import { FileText, Image as ImageIcon, FileSpreadsheet, Video, MoreHorizontal, Download, Star, Trash2, RotateCcw, Eye, Presentation, FileAudio, Archive } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import Avatar from './Avatar';

const FileCard = ({ file, onDownload, onView, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIconConfig = (fileType) => {
    switch (fileType) {
      case 'image':
        return { icon: ImageIcon, bg: 'rgba(139, 92, 246, 0.12)', color: '#A78BFA', label: 'IMG' };
      case 'pdf':
        return { icon: FileText, bg: 'var(--accent-red-soft)', color: 'var(--accent-red)', label: 'PDF' };
      case 'document':
        return { icon: FileText, bg: 'var(--accent-indigo-soft)', color: 'var(--accent-indigo)', label: 'DOC' };
      case 'csv':
      case 'spreadsheet':
        return { icon: FileSpreadsheet, bg: 'var(--accent-green-soft)', color: 'var(--accent-green)', label: 'SHEET' };
      case 'presentation':
        return { icon: Presentation, bg: 'var(--accent-amber-soft)', color: 'var(--accent-amber)', label: 'SLIDE' };
      case 'video':
        return { icon: Video, bg: 'var(--accent-blue-soft)', color: 'var(--accent-blue)', label: 'VIDEO' };
      case 'audio':
        return { icon: FileAudio, bg: 'rgba(6, 182, 212, 0.12)', color: '#06B6D4', label: 'AUDIO' };
      case 'archive':
        return { icon: Archive, bg: 'var(--accent-orange-soft)', color: 'var(--accent-orange)', label: 'ZIP' };
      default:
        return { icon: FileText, bg: 'var(--bg-hover)', color: 'var(--text-tertiary)', label: 'FILE' };
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
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}D AGO`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase();
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const { icon: FileIcon, bg: iconBg, color: iconColor, label: extLabel } = getFileIconConfig(file.fileType);
  const uploaderInitial = file.uploader.name.charAt(0).toUpperCase();
  const uploaderFirstName = file.uploader.name.split(' ')[0];

  return (
    <div
      className="card-premium flex flex-col"
      style={{
        padding: '0',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 200ms ease',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--border-strong)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.4)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top edge glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
      }} />

      {/* Header section */}
      <div style={{ padding: '16px 16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* File type icon */}
          <div
            style={{
              width: '40px', height: '40px',
              borderRadius: '10px',
              background: iconBg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FileIcon size={19} style={{ color: iconColor }} strokeWidth={1.75} />
          </div>

          {/* Type label */}
          <span style={{
            fontSize: '9px', fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            letterSpacing: '0.08em',
            color: iconColor,
            background: iconBg,
            padding: '3px 6px',
            borderRadius: '4px',
          }}>
            {extLabel}
          </span>
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
                width: '28px', height: '28px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 150ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
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
                <Dropdown.Item
                  onClick={() => onView(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Eye size={13} style={{ color: 'var(--text-tertiary)' }} />
                  View
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => onDownload(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Download size={13} style={{ color: 'var(--text-tertiary)' }} />
                  Download
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => onToggleFavorite(file)}
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Star size={13} style={{ color: isFavorited ? 'var(--accent-amber)' : 'var(--text-tertiary)', fill: isFavorited ? 'var(--accent-amber)' : 'none' }} />
                  {isFavorited ? 'Unfavorite' : 'Favorite'}
                </Dropdown.Item>
              </>
            )}
            {isTrash && canDelete && (
              <Dropdown.Item
                onClick={() => onRestore(file)}
                style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
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
                  style={{ padding: '7px 12px', fontSize: '13px', margin: '1px 4px', borderRadius: '6px', color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '8px' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-red-soft)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <Trash2 size={13} />
                  {isTrash ? 'Delete forever' : 'Move to trash'}
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {/* Filename + metadata */}
      <div style={{ padding: '0 16px 14px' }}>
        <div
          title={file.originalName}
          style={{
            fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)',
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            letterSpacing: '-0.005em',
          }}
        >
          {file.originalName}
        </div>
        <div style={{
          marginTop: '6px',
          fontSize: '11px',
          fontFamily: 'var(--font-mono)',
          color: 'var(--text-quaternary)',
          letterSpacing: '0.02em',
        }}>
          {formatFileSize(file.size)}
        </div>
      </div>

      {/* Bottom row — uploader + status */}
      <div
        style={{
          padding: '10px 16px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: 'rgba(255,255,255,0.01)',
        }}
      >
        {/* Uploader */}
        <div className="flex items-center" style={{ gap: '6px' }}>
          <Avatar
            initials={uploaderInitial}
            size={18}
            fontSize={8}
            fontWeight={600}
            background="var(--bg-hover)"
            color="var(--text-tertiary)"
          />
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)' }}>
            {uploaderFirstName}
          </span>
        </div>

        {/* Date */}
        <span style={{
          fontSize: '9px', fontWeight: 600,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.06em',
          color: 'var(--text-quaternary)',
        }}>
          {formatDate(file.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default FileCard;
