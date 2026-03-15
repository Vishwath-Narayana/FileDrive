import { MoreVertical, Download, Star, Trash2, FileText, Image as ImageIcon, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const FileRow = ({ file, onDownload, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon size={20} className="text-blue-500" />;
      case 'csv':
        return <FileSpreadsheet size={20} className="text-green-500" />;
      case 'pdf':
        return <FileText size={20} className="text-red-500" />;
      default:
        return <FileText size={20} className="text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {getFileIcon(file.fileType)}
          <span className="text-sm font-medium text-gray-900 truncate max-w-xs" title={file.originalName}>
            {file.originalName}
          </span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600 capitalize">{file.fileType}</td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
            {file.uploader.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-600">{file.uploader.name}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-sm text-gray-600">{formatDate(file.createdAt)}</td>
      <td className="py-3 px-4 text-sm text-gray-600">{formatFileSize(file.size)}</td>
      <td className="py-3 px-4 text-right">
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent text-gray-600"
            id={`file-menu-${file._id}`}
          >
            <MoreVertical size={18} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            {!isTrash && (
              <>
                <Dropdown.Item onClick={() => onDownload(file)}>
                  <Download size={16} className="me-2" />
                  Download
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onToggleFavorite(file)}>
                  <Star size={16} className="me-2" fill={isFavorited ? 'currentColor' : 'none'} />
                  {isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}
                </Dropdown.Item>
              </>
            )}
            {isTrash && canDelete && (
              <Dropdown.Item onClick={() => onRestore(file)}>
                <RotateCcw size={16} className="me-2" />
                Restore
              </Dropdown.Item>
            )}
            {canDelete && (
              <>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => onDelete(file)} className="text-danger">
                  <Trash2 size={16} className="me-2" />
                  {isTrash ? 'Delete Permanently' : 'Move to Trash'}
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
