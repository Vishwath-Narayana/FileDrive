import { useState, useEffect, useRef, useCallback } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardControls from '../components/DashboardControls';
import FileCard from '../components/FileCard';
import FileRow from '../components/FileRow';
import ManageOrgModal from '../components/ManageOrgModal';
import CreateOrgModal from '../components/CreateOrgModal';
import api from '../services/api';
import socket from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { X, File, Plus, Upload, CloudUpload, Sparkles } from 'lucide-react';

/* ── Skeleton shimmer for loading states ─────────────────────── */
const SkeletonCard = () => (
  <div className="bg-white border border-[#F2F2F2] rounded-[16px] p-7 animate-pulse">
    <div className="flex items-start justify-between mb-8">
      <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
      <div className="w-6 h-6 bg-gray-50 rounded-full" />
    </div>
    <div className="space-y-2 mb-8">
      <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
      <div className="h-3 bg-gray-50 rounded-lg w-1/2" />
    </div>
    <div className="pt-6 border-t border-[#FAFAFA] flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-full bg-gray-100" />
        <div className="h-3 bg-gray-50 rounded w-16" />
      </div>
      <div className="h-3 bg-gray-50 rounded w-12" />
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-gray-100 rounded-xl" /><div className="h-3.5 bg-gray-100 rounded w-32" /></div></td>
    <td className="py-4 px-6"><div className="h-3 bg-gray-50 rounded w-12" /></td>
    <td className="py-4 px-6"><div className="h-3 bg-gray-50 rounded w-20" /></td>
    <td className="py-4 px-6"><div className="h-3 bg-gray-50 rounded w-16" /></td>
    <td className="py-4 px-6"><div className="h-3 bg-gray-50 rounded w-12" /></td>
    <td className="py-4 px-6" />
  </tr>
);

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManageOrgModal, setShowManageOrgModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const { user, currentOrganization } = useAuth();
  
  const userRole = currentOrganization?.members?.find(
    m => m.user && (m.user._id?.toString() || m.user?.toString() || m.user) === user?._id?.toString()
  )?.role || 'viewer';

  useEffect(() => {
    if (!currentOrganization) return;
    fetchFiles();
  }, [currentOrganization, activeTab]);

  // 🔴 Real-time: join org room and handle file events
  useEffect(() => {
    if (!currentOrganization) return;
    const orgId = currentOrganization._id;

    socket.emit('join-org', orgId);

    const handleFileNew = (file) => {
      setFiles((prev) => {
        if (prev.some((f) => f._id === file._id)) return prev;
        return [file, ...prev];
      });
      // Show toast for files uploaded by other users
      if (file.uploader?._id !== user?._id) {
        toast.success(`${file.uploader?.name || 'Someone'} uploaded "${file.originalName}"`, {
          icon: '📄',
          style: { borderRadius: '12px', padding: '12px 16px' }
        });
      }
    };

    const handleFileTrashed = ({ fileId }) => {
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    };

    const handleFileDeleted = ({ fileId }) => {
      setFiles((prev) => prev.filter((f) => f._id !== fileId));
    };

    const handleFileRestored = (file) => {
      setFiles((prev) => prev.filter((f) => f._id !== file._id));
    };

    const handleFavoriteUpdated = (updatedFile) => {
      setFiles((prev) =>
        prev.map((f) => (f._id === updatedFile._id ? updatedFile : f))
      );
    };

    socket.on('file:new', handleFileNew);
    socket.on('file:trashed', handleFileTrashed);
    socket.on('file:deleted', handleFileDeleted);
    socket.on('file:restored', handleFileRestored);
    socket.on('file:favoriteUpdated', handleFavoriteUpdated);

    return () => {
      socket.emit('leave-org', orgId);
      socket.off('file:new', handleFileNew);
      socket.off('file:trashed', handleFileTrashed);
      socket.off('file:deleted', handleFileDeleted);
      socket.off('file:restored', handleFileRestored);
      socket.off('file:favoriteUpdated', handleFavoriteUpdated);
    };
  }, [currentOrganization, user?._id]);

  useEffect(() => {
    applyFilters();
  }, [files, searchQuery, typeFilter]);

  const fetchFiles = async () => {
    if (!currentOrganization) return;
    
    try {
      setLoading(true);
      let url = `/files?organizationId=${currentOrganization._id}`;
      
      if (activeTab === 'favorites') {
        url += '&filter=favorites';
      } else if (activeTab === 'trash') {
        url += '&filter=trash';
      }
      
      const response = await api.get(url);
      setFiles(response.data);
    } catch (error) {
      toast.error('Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...files];

    if (searchQuery) {
      filtered = filtered.filter(file =>
        file.originalName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(file => file.fileType === typeFilter);
    }

    setFilteredFiles(filtered);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  /* ── Drag & Drop handlers ─────────────────────── */
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer?.files?.[0];
    if (droppedFile) {
      setUploadFile(droppedFile);
    }
  }, []);

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }

    if (!currentOrganization) {
      toast.error('Please select an organization');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('organizationId', currentOrganization._id);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percent);
        }
      });

      setFiles([response.data, ...files]);
      toast.success('File uploaded successfully', {
        icon: '✅',
        style: { borderRadius: '12px' }
      });
      setShowUploadModal(false);
      setUploadFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      const response = await api.get(`/files/download/${file._id}`);
      const { downloadUrl } = response.data;

      toast.success('Download started');
      window.open(downloadUrl, '_blank');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const handleDelete = async (file) => {
    const isInTrash = activeTab === 'trash';
    const confirmMessage = isInTrash 
      ? `Permanently delete "${file.originalName}"? This cannot be undone.`
      : `Move "${file.originalName}" to trash?`;
    
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      await api.delete(`/files/${file._id}`);
      setFiles(files.filter(f => f._id !== file._id));
      toast.success(isInTrash ? 'File permanently deleted' : 'File moved to trash');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleToggleFavorite = async (file) => {
    try {
      await api.post(`/files/${file._id}/favorite`);
      await fetchFiles();
      toast.success(file.favoritedBy?.includes(user._id) ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update favorite');
    }
  };

  const handleRestore = async (file) => {
    try {
      await api.post(`/files/${file._id}/restore`);
      setFiles(files.filter(f => f._id !== file._id));
      toast.success('File restored successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Restore failed');
    }
  };

  // Recently uploaded (last 24h) for the highlight section
  const recentFiles = files.filter(f => {
    const uploadedAt = new Date(f.createdAt);
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return uploadedAt > dayAgo;
  });

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          onOpenAdminModal={() => setShowManageOrgModal(true)} 
          onOpenCreateOrgModal={() => setShowCreateOrgModal(true)}
        />
        
        <main className="flex-1 overflow-y-auto p-12 ml-64">
          <div className="max-w-[1400px] mx-auto">
            <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">
                {activeTab === 'all' ? `Welcome back, ${user?.name?.split(' ')[0]}` : 
                 activeTab === 'favorites' ? 'Your Favorites' : 'Trash'}
              </h1>
              <p className="text-sm text-gray-400 font-medium">
                {activeTab === 'all' ? 'Manage and organize your team\'s digital assets with ease.' : 
                 activeTab === 'favorites' ? 'Quickly access the files you care about most.' : 'Items here will be permanently deleted after 30 days.'}
              </p>
            </div>

            {/* Recently Uploaded Highlight */}
            {activeTab === 'all' && !loading && recentFiles.length > 0 && recentFiles.length < files.length && (
              <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={14} className="text-amber-400" />
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recently uploaded</span>
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-bold">{recentFiles.length}</span>
                </div>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {recentFiles.slice(0, 5).map(file => (
                    <button
                      key={file._id}
                      onClick={() => handleDownload(file)}
                      className="flex-shrink-0 flex items-center gap-3 bg-white border border-[#F0F0F0] rounded-2xl px-4 py-3 hover:border-black hover:shadow-md transition-all duration-200 group"
                    >
                      <div className="w-8 h-8 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-black group-hover:text-white transition-all duration-200">
                        <File size={14} strokeWidth={2.5} />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-bold text-black truncate max-w-[120px]">{file.originalName}</p>
                        <p className="text-[10px] text-gray-400">{file.uploader?.name?.split(' ')[0]}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <DashboardControls
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              viewMode={viewMode}
              setViewMode={setViewMode}
              typeFilter={typeFilter}
              setTypeFilter={setTypeFilter}
              onUpload={handleUploadClick}
              userRole={userRole}
            />

            <div className="mt-8">
              {loading ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                  </div>
                ) : (
                  <div className="bg-white border border-[#F0F0F0] rounded-[24px] overflow-hidden shadow-sm">
                    <table className="w-full">
                      <thead className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                        <tr>
                          <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                          <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                          <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                          <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</th>
                          <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Size</th>
                          <th className="py-4 px-6" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F5F5F5]">
                        {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                      </tbody>
                    </table>
                  </div>
                )
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[32px] border border-[#F0F0F0] border-dashed">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                    {activeTab === 'trash' ? (
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    ) : (
                      <File size={36} className="text-gray-200" strokeWidth={1.5} />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">
                    {searchQuery || typeFilter !== 'all' ? 'No matches found' : 
                     activeTab === 'trash' ? 'Trash is empty' : 'Empty workspace'}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-[280px] mx-auto leading-relaxed mb-6">
                    {searchQuery || typeFilter !== 'all' 
                      ? 'Try adjusting your search or filters to find what you\'re looking for.' 
                      : activeTab === 'trash' 
                        ? 'Deleted files will appear here for 30 days before being permanently removed.' 
                        : 'Start by uploading your first file to this organization.'}
                  </p>
                  {activeTab === 'all' && !searchQuery && typeFilter === 'all' && (userRole === 'admin' || userRole === 'editor') && (
                    <button onClick={handleUploadClick} className="btn-primary mx-auto">
                      <Plus size={16} strokeWidth={3} />
                      Upload your first file
                    </button>
                  )}
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredFiles.map((file, index) => (
                    <div key={file._id} className="animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: `${Math.min(index * 50, 400)}ms` }}>
                      <FileCard
                        file={file}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                        onToggleFavorite={handleToggleFavorite}
                        onRestore={handleRestore}
                        userRole={userRole}
                        userId={user?._id}
                        isTrash={activeTab === 'trash'}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white border border-[#F0F0F0] rounded-[24px] overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-[#FAFAFA] border-b border-[#F0F0F0]">
                      <tr>
                        <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Name</th>
                        <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Type</th>
                        <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">User</th>
                        <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Uploaded</th>
                        <th className="py-4 px-6 text-left text-[11px] font-bold text-gray-400 uppercase tracking-wider">Size</th>
                        <th className="py-4 px-6"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F5F5F5]">
                      {filteredFiles.map((file) => (
                        <FileRow
                          key={file._id}
                          file={file}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                          onToggleFavorite={handleToggleFavorite}
                          onRestore={handleRestore}
                          userRole={userRole}
                          userId={user?._id}
                          isTrash={activeTab === 'trash'}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* ── Upload Modal with Drag & Drop + Progress ─────────── */}
      <Modal show={showUploadModal} onHide={() => { if (!uploading) { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }}} centered className="premium-modal">
        <div className="bg-white rounded-[32px] p-10 shadow-2xl border border-[#F0F0F0] max-w-lg mx-auto w-full relative">
          <button 
            onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }}}
            className="absolute right-8 top-8 text-gray-300 hover:text-black transition-colors duration-200 hover:rotate-90"
            disabled={uploading}
          >
            <X size={20} />
          </button>

          <div className="mb-10">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <CloudUpload size={28} className="text-white" strokeWidth={2} />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Upload File</h2>
            <p className="text-sm text-gray-400 font-medium">Select a file to add to <span className="text-black font-bold">{currentOrganization?.name}</span></p>
          </div>

          <div className="space-y-6">
            <div 
              ref={dropZoneRef}
              onClick={() => !uploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`group cursor-pointer border-2 border-dashed rounded-[24px] p-12 text-center transition-all duration-300 ${
                isDragging 
                  ? 'border-black bg-gray-50 scale-[1.02]' 
                  : uploadFile 
                    ? 'border-green-300 bg-green-50/30' 
                    : 'border-[#EDEDED] hover:border-black hover:bg-gray-50'
              } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 transition-all duration-300 ${
                uploadFile ? 'bg-green-100 text-green-600' : 'bg-gray-50 group-hover:bg-white text-gray-300 group-hover:text-black'
              }`}>
                {uploadFile ? (
                  <File size={28} />
                ) : isDragging ? (
                  <Upload size={28} className="animate-bounce" />
                ) : (
                  <Upload size={28} />
                )}
              </div>
              <p className="text-sm font-bold text-black mb-1">
                {uploadFile ? uploadFile.name : isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
              </p>
              <p className="text-xs text-gray-400">
                {uploadFile ? `${(uploadFile.size / 1024).toFixed(1)} KB` : 'PDF, Image, Video, CSV, or any document'}
              </p>
            </div>

            {/* Upload Progress */}
            {uploading && (
              <div className="animate-in fade-in duration-300">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">Uploading...</span>
                  <span className="text-[11px] font-bold text-black">{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-black rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }}
                className="flex-1 btn-secondary py-3.5 justify-center text-sm"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="flex-[3] btn-primary py-3.5 justify-center text-sm"
                disabled={uploading || !uploadFile}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </span>
                ) : 'Start Upload'}
              </button>
            </div>
          </div>
        </div>
      </Modal>

      <ManageOrgModal show={showManageOrgModal} onHide={() => setShowManageOrgModal(false)} />
      <CreateOrgModal show={showCreateOrgModal} onHide={() => setShowCreateOrgModal(false)} />
    </div>
  );
};

export default Dashboard;
