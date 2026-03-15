import { MoreVertical, Download, Star, Trash2, FileText, Image as ImageIcon, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const FileCard = ({ file, onDownload, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <ImageIcon size={40} className="text-blue-500" />;
      case 'csv':
        return <FileSpreadsheet size={40} className="text-green-500" />;
      case 'pdf':
        return <FileText size={40} className="text-red-500" />;
      default:
        return <FileText size={40} className="text-gray-500" />;
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {getFileIcon(file.fileType)}
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="p-0 text-gray-400 hover:text-gray-600"
              id={`dropdown-${file._id}`}
            >
              <MoreVertical size={20} />
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
        </div>

        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-900 truncate">{file.originalName}</h3>
          <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-600">
          <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center font-medium">
            {file.uploader.name.charAt(0).toUpperCase()}
          </div>
          <span>{file.uploader.name}</span>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          {formatDate(file.createdAt)}
        </div>
      </div>
    </div>
  );
};

export default FileCard;
