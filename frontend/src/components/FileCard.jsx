import { MoreVertical, Download, Star, Trash2, FileText, Image as ImageIcon, FileSpreadsheet } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const FileCard = ({ file, onDownload, onDelete }) => {
  const { user } = useAuth();
  const canDelete = user?.role === 'admin' || file.uploader._id === user?._id;

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
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          {getFileIcon(file.fileType)}
        </div>
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="text-decoration-none p-0 border-0 bg-transparent text-gray-600"
            id={`file-menu-${file._id}`}
          >
            <MoreVertical size={18} />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <Dropdown.Item onClick={() => onDownload(file)}>
              <Download size={16} className="me-2" />
              Download
            </Dropdown.Item>
            <Dropdown.Item>
              <Star size={16} className="me-2" />
              Favorite
            </Dropdown.Item>
            {canDelete && (
              <>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => onDelete(file)} className="text-danger">
                  <Trash2 size={16} className="me-2" />
                  Delete
                </Dropdown.Item>
              </>
            )}
          </Dropdown.Menu>
        </Dropdown>
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-2 truncate" title={file.originalName}>
        {file.originalName}
      </h3>

      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs font-medium">
          {file.uploader.name.charAt(0).toUpperCase()}
        </div>
        <span>{file.uploader.name}</span>
      </div>

      <div className="mt-2 text-xs text-gray-400">
        {formatDate(file.createdAt)}
      </div>
    </div>
  );
};

export default FileCard;
