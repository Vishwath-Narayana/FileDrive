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
import { X, File, Plus, Upload, CloudUpload } from 'lucide-react';

/* ── Skeleton shimmer ───────────────────────────── */
const SkeletonCard = () => (
  <div
    style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border)',
      borderRadius: '12px',
      padding: '16px',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
      <div className="skeleton-shimmer" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
    </div>
    <div style={{ marginTop: '12px' }}>
      <div className="skeleton-shimmer" style={{ height: '13px', borderRadius: '4px', width: '70%' }} />
      <div className="skeleton-shimmer" style={{ height: '11px', borderRadius: '4px', width: '45%', marginTop: '6px' }} />
    </div>
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
        <div className="skeleton-shimmer" style={{ height: '11px', width: '48px', borderRadius: '4px' }} />
      </div>
      <div className="skeleton-shimmer" style={{ height: '11px', width: '36px', borderRadius: '4px' }} />
    </div>
  </div>
);

const SkeletonRow = () => (
  <tr>
    <td style={{ padding: '0 16px', height: '44px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="skeleton-shimmer" style={{ width: '16px', height: '16px', borderRadius: '3px', flexShrink: 0 }} />
        <div className="skeleton-shimmer" style={{ height: '13px', width: '140px', borderRadius: '4px' }} />
      </div>
    </td>
    <td style={{ padding: '0 16px' }}><div className="skeleton-shimmer" style={{ height: '20px', width: '44px', borderRadius: '4px' }} /></td>
    <td style={{ padding: '0 16px' }}><div className="skeleton-shimmer" style={{ height: '13px', width: '40px', borderRadius: '4px' }} /></td>
    <td style={{ padding: '0 16px' }}><div className="skeleton-shimmer" style={{ height: '13px', width: '60px', borderRadius: '4px' }} /></td>
    <td style={{ padding: '0 16px' }}><div className="skeleton-shimmer" style={{ height: '13px', width: '44px', borderRadius: '4px' }} /></td>
    <td style={{ padding: '0 16px' }} />
  </tr>
);

const tabTitles = {
  all: 'All Files',
  favorites: 'Favorites',
  trash: 'Trash',
};

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
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

  // Real-time: join org room and handle file events
  useEffect(() => {
    if (!currentOrganization) return;
    const orgId = currentOrganization._id;

    socket.emit('join-org', orgId);

    const handleFileNew = (file) => {
      setFiles((prev) => {
        if (prev.some((f) => f._id === file._id)) return prev;
        return [file, ...prev];
      });
      if (file.uploader?._id !== user?._id) {
        toast.success(`${file.uploader?.name || 'Someone'} uploaded "${file.originalName}"`, {
          icon: '📄',
          style: { borderRadius: '8px', padding: '10px 14px', fontSize: '13px' }
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
      toast.success('File uploaded successfully');
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
  
  const handleView = async (file) => {
    try {
      if (file.fileType === 'pdf' || file.fileType === 'image') {
        setSelectedFile(file);
        setPreviewUrl('');
        setShowPreviewModal(true);
        
        const response = await api.get(`/files/view/${file._id}`);
        setPreviewUrl(response.data.viewUrl);
      } else {
        window.open(file.path, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      toast.error('Failed to open preview');
      setShowPreviewModal(false);
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

  const emptyStateConfig = {
    all: {
      icon: <File size={24} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />,
      title: searchQuery || typeFilter !== 'all' ? 'No matches found' : 'No files yet',
      subtitle: searchQuery || typeFilter !== 'all'
        ? 'Try adjusting your search or filters.'
        : 'Upload your first file to get started.',
      showUpload: !searchQuery && typeFilter === 'all' && (userRole === 'admin' || userRole === 'editor'),
    },
    favorites: {
      icon: <File size={24} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.5} />,
      title: 'No favorites yet',
      subtitle: 'Star files to access them quickly here.',
      showUpload: false,
    },
    trash: {
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-tertiary)' }}>
          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
      title: 'Trash is empty',
      subtitle: 'Deleted files appear here for 30 days.',
      showUpload: false,
    },
  };

  const emptyConfig = emptyStateConfig[activeTab] || emptyStateConfig.all;

  return (
    <>
    <style>{`
      .dashboard-main-offset { margin-left: 200px; }
      .dashboard-header { padding: 28px 28px 0 28px; }
      .dashboard-controls-wrap { padding: 16px 28px 0 28px; }
      .dashboard-content { padding: 0; }
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 12px;
        padding: 16px 28px 28px 28px;
      }
      .dashboard-empty-wrap { margin: 16px 28px; }
      .dashboard-table-wrap { margin: 16px 28px; }
      @media (max-width: 1023px) and (min-width: 768px) {
        .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 767px) {
        .dashboard-main-offset { margin-left: 0 !important; }
        .dashboard-header { padding: 20px 16px 0 16px; }
        .dashboard-controls-wrap { padding: 12px 16px 0 16px; }
        .dashboard-grid {
          grid-template-columns: 1fr;
          padding: 12px 16px 24px 16px;
        }
        .dashboard-empty-wrap { margin: 12px 16px; }
        .dashboard-table-wrap { margin: 12px 16px; }
      }
    `}</style>
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-base)' }}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      />
      
      <div className="dashboard-main-offset" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <Topbar 
          onOpenAdminModal={() => setShowManageOrgModal(true)} 
          onOpenCreateOrgModal={() => setShowCreateOrgModal(true)}
          socket={socket}
          setDrawerOpen={setDrawerOpen}
        />
        
        <main style={{ flex: 1, overflowY: 'auto', background: 'var(--bg-base)' }}>
          {/* Page header */}
          <div className="dashboard-header">
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1A', margin: 0 }}>
              {tabTitles[activeTab]}
            </h1>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '3px 0 0' }}>
              {currentOrganization?.name}
              {activeTab === 'all' && ` · ${files.length} ${files.length === 1 ? 'file' : 'files'}`}
            </p>
          </div>

          {/* Controls */}
          <div className="dashboard-controls-wrap">
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
          </div>

          {/* File list / grid / empty / skeleton */}
          <div className="dashboard-content">
            {loading ? (
              viewMode === 'grid' ? (
                <div className="dashboard-grid" style={{ display: 'grid' }}>
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              ) : (
                <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-strong)', background: 'var(--bg-base)' }}>
                        {['Name', 'Type', 'Size', 'Uploaded by', 'Date', ''].map((h, i) => (
                          <th key={i} style={{ padding: '0 16px', height: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[...Array(6)].map((_, i) => <SkeletonRow key={i} />)}
                    </tbody>
                  </table>
                </div>
              )
            ) : filteredFiles.length === 0 ? (
              /* Empty state */
              <div className="dashboard-empty-wrap">
              <div style={{
                minHeight: '360px', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-surface)', border: '1px solid var(--border)',
                borderRadius: '12px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {emptyConfig.icon}
                </div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)', margin: '12px 0 0' }}>
                  {emptyConfig.title}
                </p>
                <p style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-secondary)', margin: '4px 0 0', maxWidth: '240px', textAlign: 'center' }}>
                  {emptyConfig.subtitle}
                </p>
                {emptyConfig.showUpload && (
                  <button onClick={handleUploadClick} className="btn-primary" style={{ marginTop: '16px', gap: '4px' }}>
                    <Plus size={14} strokeWidth={2.5} />
                    Upload file
                  </button>
                )}
              </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="dashboard-grid" style={{ display: 'grid' }}>
                {filteredFiles.map((file) => (
                  <FileCard
                    key={file._id}
                    file={file}
                    onDownload={handleDownload}
                    onView={handleView}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onRestore={handleRestore}
                    userRole={userRole}
                    userId={user?._id}
                    isTrash={activeTab === 'trash'}
                  />
                ))}
              </div>
            ) : (
              <div className="dashboard-table-wrap">
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-strong)', background: 'var(--bg-base)' }}>
                      <th style={{ padding: '0 16px', height: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Name</th>
                      <th style={{ padding: '0 16px', height: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Type</th>
                      <th style={{ padding: '0 16px', height: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Size</th>
                      <th style={{ padding: '0 16px', height: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Uploaded by</th>
                      <th style={{ padding: '0 16px', height: '36px', textAlign: 'left', fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>Date</th>
                      <th style={{ padding: '0 16px', height: '36px' }} />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFiles.map((file) => (
                      <FileRow
                        key={file._id}
                        file={file}
                        onDownload={handleDownload}
                        onView={handleView}
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
              </div>
            )}
          </div>
        </main>
      </div>
    </div>

    {/* ── Upload Modal ─────────────────────────── */}
      <Modal
        show={showUploadModal}
        onHide={() => { if (!uploading) { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }}}
        centered
        className="premium-modal"
      >
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          width: '480px', maxWidth: '90vw',
          position: 'relative',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Upload file</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                Adding to <strong style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{currentOrganization?.name}</strong>
              </p>
            </div>
            <button
              onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }}}
              disabled={uploading}
              style={{
                width: '28px', height: '28px', borderRadius: '6px',
                border: 'none', background: 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-tertiary)', cursor: 'pointer',
                transition: 'background 150ms ease',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <X size={14} />
            </button>
          </div>

          {/* Drop zone */}
          <div
            ref={dropZoneRef}
            onClick={() => !uploading && fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px dashed ${isDragging ? 'var(--text-primary)' : uploadFile ? '#22C55E' : 'var(--border)'}`,
              borderRadius: '10px',
              padding: '32px 24px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: isDragging ? 'var(--bg-hover)' : uploadFile ? '#F0FDF4' : 'transparent',
              transition: 'all 150ms ease',
              opacity: uploading ? 0.6 : 1,
            }}
          >
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: uploadFile ? '#DCF5E7' : 'var(--bg-hover)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              {uploadFile
                ? <File size={22} style={{ color: '#22C55E' }} />
                : <Upload size={22} style={{ color: 'var(--text-tertiary)' }} className={isDragging ? 'animate-bounce' : ''} />
              }
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
              {uploadFile ? uploadFile.name : isDragging ? 'Drop file here' : 'Drag & drop or click to browse'}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: '4px 0 0' }}>
              {uploadFile
                ? `${(uploadFile.size / 1024).toFixed(1)} KB`
                : 'PDF, image, video, CSV, or any document'}
            </p>
          </div>

          {/* Upload progress */}
          {uploading && (
            <div style={{ marginTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Uploading...</span>
                <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)' }}>{uploadProgress}%</span>
              </div>
              <div style={{ height: '4px', background: 'var(--bg-hover)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', background: 'var(--brand)', borderRadius: '2px',
                  width: `${uploadProgress}%`, transition: 'width 300ms ease',
                }} />
              </div>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              onClick={() => { setShowUploadModal(false); setUploadFile(null); setUploadProgress(0); }}
              className="btn-secondary"
              disabled={uploading}
              style={{ flex: 1, justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              onClick={handleUploadSubmit}
              className="btn-primary"
              disabled={uploading || !uploadFile}
              style={{ flex: 3, justifyContent: 'center' }}
            >
              {uploading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.4)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Uploading...
                </span>
              ) : 'Upload'}
            </button>
          </div>
        </div>
      </Modal>

      <ManageOrgModal show={showManageOrgModal} onHide={() => setShowManageOrgModal(false)} />
      <CreateOrgModal show={showCreateOrgModal} onHide={() => setShowCreateOrgModal(false)} />

      {/* ── Preview Modal ─────────────────────────── */}
      <Modal
        show={showPreviewModal}
        onHide={() => { setShowPreviewModal(false); setSelectedFile(null); }}
        centered
        size="lg"
        className="premium-modal preview-modal"
      >
        <div style={{
          background: 'var(--bg-surface)',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          display: 'flex', flexDirection: 'column', maxHeight: '90vh',
          border: '1px solid var(--border)',
        }}>
          {/* Preview header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'var(--bg-surface)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'var(--bg-hover)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <File size={15} style={{ color: 'var(--text-secondary)' }} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedFile?.originalName}
                </p>
                <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', margin: '1px 0 0', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {selectedFile?.fileType} · {selectedFile && (selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => handleDownload(selectedFile)}
                title="Download"
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <CloudUpload size={15} />
              </button>
              <button
                onClick={() => { setShowPreviewModal(false); setSelectedFile(null); }}
                style={{
                  width: '28px', height: '28px', borderRadius: '6px',
                  border: 'none', background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  transition: 'background 150ms ease',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Preview body */}
          <div style={{
            flex: 1, overflow: 'auto', background: 'var(--bg-base)',
            padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '400px',
          }}>
            {!previewUrl ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '28px', height: '28px', border: '2.5px solid var(--border-strong)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', margin: 0 }}>Loading preview...</p>
              </div>
            ) : selectedFile?.fileType === 'image' ? (
              <img
                src={previewUrl}
                alt={selectedFile.originalName}
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '10px', objectFit: 'contain' }}
              />
            ) : selectedFile?.fileType === 'pdf' ? (
              <iframe
                src={`${previewUrl}#toolbar=0`}
                style={{ width: '100%', height: '65vh', borderRadius: '8px', border: '1px solid var(--border)', background: 'white' }}
                title="PDF Preview"
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: 'var(--bg-hover)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                }}>
                  <File size={24} style={{ color: 'var(--text-tertiary)' }} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>Preview not available for this file type</p>
                <button onClick={() => window.open(selectedFile.path, '_blank')} className="btn-primary" style={{ margin: '0 auto' }}>
                  Open in new tab
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default Dashboard;
