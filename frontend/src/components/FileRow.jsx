import { MoreVertical, Download, Star, Trash2, FileText, Image as ImageIcon, FileSpreadsheet, RotateCcw, Eye } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';

const FileRow = ({ file, onDownload, onView, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIcon = (fileType) => {
    const iconSize = 18;
    const iconStroke = 2.5;
    
    switch (fileType) {
      case 'image':
        return <ImageIcon size={iconSize} strokeWidth={iconStroke} />;
      case 'csv':
        return <FileSpreadsheet size={iconSize} strokeWidth={iconStroke} />;
      case 'pdf':
        return <FileText size={iconSize} strokeWidth={iconStroke} />;
      default:
        return <FileText size={iconSize} strokeWidth={iconStroke} />;
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

  return (
    <tr className="border-b border-[#F5F5F5] hover:bg-[#FAFAFA] group transition-all duration-300">
      <td className="py-5 px-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-500">
            {getFileIcon(file.fileType)}
          </div>
          <span className="text-sm font-bold text-black truncate max-w-xs tracking-tight" title={file.originalName}>
            {file.originalName}
          </span>
        </div>
      </td>
      <td className="py-5 px-6">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.fileType}</span>
      </td>
      <td className="py-5 px-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
            {file.uploader.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-[11px] font-bold text-gray-500 tracking-tight">{file.uploader.name.split(' ')[0]}</span>
        </div>
      </td>
      <td className="py-5 px-6 text-[11px] font-bold text-gray-300 uppercase tracking-tighter">{formatDate(file.createdAt)}</td>
      <td className="py-5 px-6 text-[11px] font-bold text-gray-400 tracking-tight">{formatFileSize(file.size)}</td>
      <td className="py-5 px-6 text-right">
        <Dropdown align="end">
          <Dropdown.Toggle
            variant="link"
            className="p-1.5 text-gray-200 hover:text-black transition-colors rounded-full hover:bg-gray-100"
            id={`file-menu-${file._id}`}
          >
            <MoreVertical size={16} strokeWidth={2.5} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="shadow-2xl border border-[#F0F0F0] py-2 rounded-[18px] min-w-[180px] mt-2 animate-in fade-in slide-in-from-top-1 duration-300 overflow-hidden">
            <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Actions</div>
            {!isTrash && (
              <>
                <Dropdown.Item onClick={() => onView(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-colors">
                  <Eye size={14} strokeWidth={2.5} className="text-gray-400" />
                  View
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onDownload(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-colors">
                  <Download size={14} strokeWidth={2.5} className="text-gray-400" />
                  Download
                </Dropdown.Item>
                <Dropdown.Item onClick={() => onToggleFavorite(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-colors">
                  <Star size={14} strokeWidth={2.5} className={isFavorited ? 'text-black fill-current' : 'text-gray-400'} />
                  {isFavorited ? 'Unfavorite' : 'Favorite'}
                </Dropdown.Item>
              </>
            )}
            {isTrash && canDelete && (
              <Dropdown.Item onClick={() => onRestore(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-colors">
                <RotateCcw size={14} strokeWidth={2.5} className="text-gray-400" />
                Restore
              </Dropdown.Item>
            )}
            {canDelete && (
              <>
                <div className="h-px bg-[#F5F5F5] my-2" />
                <Dropdown.Item onClick={() => onDelete(file)} className="py-2.5 px-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-[10px] mx-1 flex items-center gap-3 transition-colors">
                  <Trash2 size={14} strokeWidth={2.5} />
                  {isTrash ? 'Permanently Delete' : 'Move to Trash'}
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
