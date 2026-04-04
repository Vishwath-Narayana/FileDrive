import { MoreVertical, Download, Star, Trash2, FileText, Image as ImageIcon, FileSpreadsheet, RotateCcw } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';

const FileCard = ({ file, onDownload, onDelete, onToggleFavorite, onRestore, userRole, userId, isTrash }) => {
  const canDelete = userRole === 'admin' || file.uploader._id === userId;
  const isFavorited = file.favoritedBy?.includes(userId);

  const getFileIcon = (fileType) => {
    const iconSize = 22;
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
    <div className="card-premium group relative flex flex-col h-full bg-white">
      <div className="p-7 flex-1 flex flex-col">
        <div className="flex items-start justify-between mb-8">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white group-hover:shadow-lg group-hover:shadow-black/10 transition-all duration-300">
            {getFileIcon(file.fileType)}
          </div>
          <Dropdown align="end">
            <Dropdown.Toggle
              variant="link"
              className="p-1.5 text-gray-300 hover:text-black transition-all duration-200 rounded-full hover:bg-gray-50 opacity-0 group-hover:opacity-100"
              id={`dropdown-${file._id}`}
            >
              <MoreVertical size={16} strokeWidth={2.5} />
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow-2xl border border-[#F0F0F0] py-2 rounded-[18px] min-w-[180px] mt-2 animate-in fade-in slide-in-from-top-1 duration-300 overflow-hidden">
              <div className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Actions</div>
              {!isTrash && (
                <>
                  <Dropdown.Item onClick={() => onDownload(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-all duration-200">
                    <Download size={14} strokeWidth={2.5} className="text-gray-400" />
                    Download
                  </Dropdown.Item>
                  <Dropdown.Item onClick={() => onToggleFavorite(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-all duration-200">
                    <Star size={14} strokeWidth={2.5} className={isFavorited ? 'text-amber-400 fill-current' : 'text-gray-400'} />
                    {isFavorited ? 'Unfavorite' : 'Favorite'}
                  </Dropdown.Item>
                </>
              )}
              {isTrash && canDelete && (
                <Dropdown.Item onClick={() => onRestore(file)} className="py-2.5 px-4 text-sm font-semibold hover:bg-[#FAFAFA] rounded-[10px] mx-1 flex items-center gap-3 transition-all duration-200">
                  <RotateCcw size={14} strokeWidth={2.5} className="text-gray-400" />
                  Restore
                </Dropdown.Item>
              )}
              {canDelete && (
                <>
                  <div className="h-px bg-[#F5F5F5] my-2" />
                  <Dropdown.Item onClick={() => onDelete(file)} className="py-2.5 px-4 text-sm font-bold text-red-500 hover:bg-red-50 rounded-[10px] mx-1 flex items-center gap-3 transition-all duration-200">
                    <Trash2 size={14} strokeWidth={2.5} />
                    {isTrash ? 'Delete Forever' : 'Move to Trash'}
                  </Dropdown.Item>
                </>
              )}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="space-y-1.5 mb-8">
          <h3 className="text-sm font-bold text-black truncate pr-2 tracking-tight group-hover:text-gray-900 transition-colors" title={file.originalName}>
            {file.originalName}
          </h3>
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {file.fileType} <span className="mx-1 opacity-20">•</span> {formatFileSize(file.size)}
          </p>
        </div>

        <div className="mt-auto pt-6 border-t border-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-[9px] font-bold shadow-sm">
              {file.uploader.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-bold text-gray-500 tracking-tight">{file.uploader.name.split(' ')[0]}</span>
          </div>
          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-tighter">{formatDate(file.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default FileCard;
