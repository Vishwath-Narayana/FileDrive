import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
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
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, File, Plus, Upload, CloudUpload, HardDrive, Activity, Users, Share2, CheckCircle2, BarChart3, Clock, Zap, ArrowUpRight, TrendingUp, Folder, Trash2, MoreVertical } from 'lucide-react';

/* ── Formatting helpers ─────────────────────────── */
const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
};

const formatRelativeTime = (date) => {
  const diffMs = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/* ── Skeleton shimmer ───────────────────────────── */
const SkeletonCard = () => (
  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '8px' }} />
      <div className="skeleton-shimmer" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
    </div>
    <div style={{ marginTop: '12px' }}>
      <div className="skeleton-shimmer" style={{ height: '13px', borderRadius: '4px', width: '70%' }} />
      <div className="skeleton-shimmer" style={{ height: '11px', borderRadius: '4px', width: '45%', marginTop: '6px' }} />
    </div>
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between' }}>
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
  overview: 'Overview',
  all: 'Files',
  favorites: 'Favorites',
  trash: 'Trash',
};

/* ── Queue File Icon helper ─────────────────────── */
const getQueueFileIcon = (fileName) => {
  const ext = fileName.split('.').pop().toLowerCase();
  let bg = '#3b82f6'; // default blue
  let label = ext.toUpperCase();
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) {
    bg = '#a78bfa'; // purple
    label = 'IMG';
  } else if (ext === 'pdf') {
    bg = '#ef4444'; // red
    label = 'PDF';
  } else if (ext === 'fig') {
    bg = '#6366f1'; // indigo
    label = 'FIG';
  } else if (['csv', 'xls', 'xlsx'].includes(ext)) {
    bg = '#10b981'; // green
    label = 'CSV';
  } else if (['mp4', 'mov', 'avi', 'mkv'].includes(ext)) {
    bg = '#3b82f6'; // blue
    label = 'VID';
  } else if (['doc', 'docx'].includes(ext)) {
    bg = '#2563eb'; // blue
    label = 'DOCX';
  }
  return { bg, label };
};

const Dashboard = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showManageOrgModal, setShowManageOrgModal] = useState(false);
  const [showCreateOrgModal, setShowCreateOrgModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploadQueue, setUploadQueue] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);
  const cancelTokensRef = useRef({});
  const { user, currentOrganization } = useAuth();
  
  const userRole = currentOrganization?.members?.find(
    m => m.user && (m.user._id?.toString() || m.user?.toString() || m.user) === user?._id?.toString()
  )?.role || 'viewer';

  useEffect(() => {
    if (!currentOrganization) return;
    fetchFiles();
  }, [currentOrganization, activeTab]);

  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
      window.history.replaceState({}, '');
    }
  }, [location.state]);

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
          style: { borderRadius: '8px', padding: '10px 14px', fontSize: '13px', background: '#17171C', color: '#fff', border: '1px solid #2A2A31' }
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
      if (error.response?.status !== 403) {
        toast.error('Failed to fetch files');
      }
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
      filtered = filtered.filter(file => {
        if (typeFilter === 'spreadsheet') {
          return file.fileType === 'spreadsheet' || file.fileType === 'csv';
        }
        return file.fileType === typeFilter;
      });
    }

    setFilteredFiles(filtered);
  };

  const handleUploadClick = () => {
    setShowUploadModal(true);
  };

  const addFilesToQueue = (newFiles) => {
    const items = newFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'queued',
      loadedBytes: 0,
      totalBytes: file.size
    }));
    setUploadQueue(prev => [...prev, ...items]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      addFilesToQueue(selectedFiles);
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
    const droppedFiles = Array.from(e.dataTransfer?.files || []);
    if (droppedFiles.length > 0) {
      addFilesToQueue(droppedFiles);
    }
  }, []);

  const uploadFileFromQueue = async (item) => {
    if (!currentOrganization) {
      toast.error('Select an organization to upload files');
      return;
    }

    setUploading(true);
    
    // Initialize the queue item state for uploading
    setUploadQueue(prev => prev.map(q => {
      if (q.id === item.id) {
        return {
          ...q,
          status: 'uploading',
          progress: 0,
          targetProgress: 15, // start with a small target so it jumps into action
          uploadDone: false,
          loadedBytes: 0,
        };
      }
      return q;
    }));

    // Start a smooth animation interval (25ms = 40fps)
    const intervalId = setInterval(() => {
      setUploadQueue(prev => {
        return prev.map(q => {
          if (q.id === item.id && q.status === 'uploading') {
            let nextProgress = q.progress;
            let nextTarget = q.targetProgress;

            // If upload is finished, target is 100%
            if (q.uploadDone) {
              nextTarget = 100;
            } else {
              // Slowly creep target progress up to 90% to keep it alive
              if (nextTarget < 90) {
                nextTarget += 0.35; // creep up slowly
              }
            }

            // Animate progress towards targetProgress
            if (nextProgress < nextTarget) {
              // Step size: faster step if finished, standard step if uploading
              const step = q.uploadDone ? 4.5 : 1.5; 
              nextProgress = Math.min(nextProgress + step, nextTarget);
            }

            // Calculate mock loaded bytes based on animated progress
            const nextLoaded = Math.min(Math.round((nextProgress / 100) * q.totalBytes), q.totalBytes);

            // If we reached 100% and upload is done, trigger completion
            if (nextProgress >= 100 && q.uploadDone) {
              clearInterval(intervalId);
              // Slight delay before unlocking the uploading lock to make animations sequential and satisfying
              setTimeout(() => {
                setUploading(false);
              }, 80);
              return {
                ...q,
                progress: 100,
                loadedBytes: q.totalBytes,
                status: 'complete',
              };
            }

            return {
              ...q,
              progress: nextProgress,
              targetProgress: nextTarget,
              loadedBytes: nextLoaded,
            };
          }
          return q;
        });
      });
    }, 25);

    try {
      const CancelToken = axios.CancelToken;
      const source = CancelToken.source();
      cancelTokensRef.current[item.id] = source;

      const formData = new FormData();
      formData.append('file', item.file);
      formData.append('organizationId', currentOrganization._id);

      const response = await api.post('/files/upload', formData, {
        cancelToken: source.token,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const actualPercent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          // Set target progress to actual percent (up to 95% to leave room for backend processing)
          const targetPercent = Math.min(actualPercent, 95);

          setUploadQueue(prev => prev.map(q => {
            if (q.id === item.id && q.status === 'uploading') {
              return {
                ...q,
                targetProgress: Math.max(q.targetProgress, targetPercent),
                totalBytes: progressEvent.total
              };
            }
            return q;
          }));
        }
      });

      // Mark the upload as done, let the animation loop finish the rendering up to 100%
      setUploadQueue(prev => prev.map(q => {
        if (q.id === item.id && q.status === 'uploading') {
          return {
            ...q,
            uploadDone: true,
          };
        }
        return q;
      }));

      // Update main files list
      setFiles(prev => {
        if (prev.some(f => f._id === response.data._id)) return prev;
        return [response.data, ...prev];
      });

    } catch (error) {
      clearInterval(intervalId);
      setUploading(false);
      if (axios.isCancel(error)) {
        console.log('Upload cancelled:', item.name);
      } else {
        setUploadQueue(prev => prev.map(q => q.id === item.id ? { ...q, status: 'failed' } : q));
        toast.error(`Upload failed for ${item.name}`);
      }
    } finally {
      delete cancelTokensRef.current[item.id];
    }
  };

  // Sequential queue processing
  useEffect(() => {
    const nextItem = uploadQueue.find(item => item.status === 'queued');
    if (nextItem && !uploading) {
      uploadFileFromQueue(nextItem);
    }
  }, [uploadQueue, uploading]);

  const handleRemoveFromQueue = (id) => {
    if (cancelTokensRef.current[id]) {
      cancelTokensRef.current[id].cancel('Upload cancelled by user');
      delete cancelTokensRef.current[id];
    }
    setUploadQueue(prev => prev.filter(q => q.id !== id));
  };

  const handleRemoveAll = () => {
    Object.keys(cancelTokensRef.current).forEach(id => {
      cancelTokensRef.current[id].cancel('Upload cancelled by user');
      delete cancelTokensRef.current[id];
    });
    setUploadQueue([]);
  };

  
  const handleView = async (file) => {
    try {
      if (['pdf', 'image', 'video', 'audio'].includes(file.fileType)) {
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
      icon: <File size={24} style={{ color: 'var(--accent-indigo)' }} strokeWidth={1.5} />,
      title: searchQuery || typeFilter !== 'all' ? 'No matches found' : 'No files yet',
      subtitle: searchQuery || typeFilter !== 'all'
        ? 'Try adjusting your search or filters.'
        : 'Upload your first file to get started.',
      showUpload: !searchQuery && typeFilter === 'all' && (userRole === 'admin' || userRole === 'editor'),
    },
    favorites: {
      icon: <File size={24} style={{ color: 'var(--accent-indigo)' }} strokeWidth={1.5} />,
      title: 'No favorites yet',
      subtitle: 'Star files to access them quickly here.',
      showUpload: false,
    },
    trash: {
      icon: <Trash2 size={24} style={{ color: 'var(--accent-indigo)' }} strokeWidth={1.5} />,
      title: 'Trash is empty',
      subtitle: 'Deleted files appear here for 30 days.',
      showUpload: false,
    },
  };

  const emptyConfig = emptyStateConfig[activeTab] || emptyStateConfig.all;

  /* ── Command-center widget data ── */
  const totalBytes = files.reduce((sum, f) => sum + (f.size || 0), 0);
  const recentFiles = [...files]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);
  const typeCounts = files.reduce((acc, f) => {
    const key = f.fileType || 'file';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 4);
  const members = currentOrganization?.members || [];
  const roleCounts = members.reduce((acc, m) => {
    acc[m.role] = (acc[m.role] || 0) + 1;
    return acc;
  }, {});

  /* ── Storage analytics data ── */
  const storageByType = topTypes.map(([type, count]) => {
    const bytes = files.filter(f => f.fileType === type).reduce((s, f) => s + (f.size || 0), 0);
    return { type, count, bytes };
  });
  const maxBytes = Math.max(...storageByType.map(s => s.bytes), 1);

  const typeColors = {
    image: '#A78BFA',
    pdf: 'var(--accent-red)',
    document: 'var(--accent-indigo)',
    spreadsheet: 'var(--accent-green)',
    csv: 'var(--accent-green)',
    presentation: 'var(--accent-amber)',
    video: 'var(--accent-blue)',
    audio: '#06B6D4',
    archive: 'var(--accent-orange)',
    file: 'var(--text-tertiary)',
  };

  /* ── Overview Page ── */
  const renderOverview = () => (
    <div style={{ padding: '0 28px 40px' }}>
      {/* Metric cards */}
      <div className="dashboard-widgets-grid" style={{ marginTop: '20px' }}>
        {/* Storage */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="metric-label">STORAGE</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-indigo-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <HardDrive size={16} style={{ color: 'var(--accent-indigo)' }} strokeWidth={1.75} />
            </div>
          </div>
          <div className="metric-value" style={{ marginTop: '16px' }}>{formatBytes(totalBytes)}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            across {files.length} {files.length === 1 ? 'file' : 'files'}
          </div>
        </div>

        {/* Files */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="metric-label">TOTAL FILES</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-orange-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Folder size={16} style={{ color: 'var(--accent-orange)' }} strokeWidth={1.75} />
            </div>
          </div>
          <div className="metric-value" style={{ marginTop: '16px' }}>{files.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            {topTypes.length === 0 ? 'no files yet' : topTypes.map(([type, count]) => `${count} ${type}`).join(' · ')}
          </div>
        </div>

        {/* Team */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="metric-label">TEAM</span>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-green-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} style={{ color: 'var(--accent-green)' }} strokeWidth={1.75} />
            </div>
          </div>
          <div className="metric-value" style={{ marginTop: '16px' }}>{members.length}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            {roleCounts.admin || 0}A · {roleCounts.editor || 0}E · {roleCounts.viewer || 0}V
          </div>
        </div>

        {/* Uploads today */}
        <div className="stat-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="metric-label">UPLOADS</span>
              <div className="live-dot" />
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-blue-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={16} style={{ color: 'var(--accent-blue)' }} strokeWidth={1.75} />
            </div>
          </div>
          <div className="metric-value" style={{ marginTop: '16px' }}>
            {files.filter(f => {
              const d = new Date(f.createdAt);
              const today = new Date();
              return d.toDateString() === today.toDateString();
            }).length}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-quaternary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.02em' }}>
            today
          </div>
        </div>
      </div>

      {/* Second row — Recent Activity + Storage Analytics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '16px' }}>
        {/* Recent Activity */}
        <div className="stat-card" style={{ padding: '0' }}>
          <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="metric-label">RECENT ACTIVITY</span>
            <Activity size={14} style={{ color: 'var(--text-quaternary)' }} />
          </div>
          <div style={{ padding: '8px 20px 16px' }}>
            {recentFiles.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', margin: 0 }}>No activity yet</p>
              </div>
            ) : (
              recentFiles.map((f) => (
                <div key={f._id} className="activity-item" style={{ padding: '10px 0' }}>
                  <div style={{
                    width: '6px', height: '6px', borderRadius: '50%',
                    background: 'var(--accent-orange)', flexShrink: 0, marginTop: '6px',
                  }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span style={{
                      fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block',
                    }}>
                      {f.originalName}
                    </span>
                    <span style={{
                      fontSize: '10px', color: 'var(--text-quaternary)',
                      fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
                    }}>
                      {f.uploader?.name?.split(' ')[0]} · {formatRelativeTime(f.createdAt)}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '9px', fontWeight: 600,
                    fontFamily: 'var(--font-mono)',
                    letterSpacing: '0.06em',
                    color: 'var(--text-quaternary)',
                    flexShrink: 0,
                  }}>
                    {formatBytes(f.size)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Storage Analytics */}
        <div className="stat-card" style={{ padding: '0' }}>
          <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
            <span className="metric-label">STORAGE ANALYTICS</span>
            <BarChart3 size={14} style={{ color: 'var(--text-quaternary)' }} />
          </div>
          <div style={{ padding: '16px 20px' }}>
            {storageByType.length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center' }}>
                <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', margin: 0 }}>No data yet</p>
              </div>
            ) : (
              storageByType.map((item) => (
                <div key={item.type} style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 600,
                      fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.04em',
                      color: typeColors[item.type] || 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                    }}>
                      {item.type} · {item.count}
                    </span>
                    <span style={{
                      fontSize: '10px', color: 'var(--text-quaternary)',
                      fontFamily: 'var(--font-mono)',
                    }}>
                      {formatBytes(item.bytes)}
                    </span>
                  </div>
                  <div className="progress-bar-track">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${(item.bytes / maxBytes) * 100}%`,
                        background: typeColors[item.type] || 'var(--text-tertiary)',
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Third row — Recent Files */}
      <div className="stat-card" style={{ padding: '0', marginTop: '16px' }}>
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="metric-label">RECENT FILES</span>
          <button
            onClick={() => setActiveTab('all')}
            style={{
              fontSize: '10px', fontWeight: 600,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.06em',
              color: 'var(--accent-indigo)',
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '4px',
              transition: 'color 150ms ease',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-indigo-hover)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--accent-indigo)'}
          >
            VIEW ALL <ArrowUpRight size={10} />
          </button>
        </div>
        <div style={{ padding: '8px 12px 12px' }}>
          {recentFiles.length === 0 ? (
            <div style={{ padding: '32px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', margin: 0 }}>No files yet</p>
            </div>
          ) : (
            <div className="dashboard-recent-grid">
              {recentFiles.slice(0, 4).map((file) => (
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
                  isTrash={false}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fourth row — Team Activity */}
      <div className="stat-card" style={{ padding: '0', marginTop: '16px' }}>
        <div style={{ padding: '16px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)' }}>
          <span className="metric-label">TEAM ACTIVITY</span>
          <Users size={14} style={{ color: 'var(--text-quaternary)' }} />
        </div>
        <div style={{ padding: '12px 20px 16px' }}>
          {members.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', textAlign: 'center', padding: '20px 0', margin: 0 }}>No team members</p>
          ) : (
            members.filter(m => m.user).slice(0, 5).map((member, idx) => (
              <div key={member.user?._id || idx} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 0',
                borderBottom: idx < Math.min(members.length - 1, 4) ? '1px solid var(--border-subtle)' : 'none',
              }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--bg-card)', border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '10px', fontWeight: 600, color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-mono)',
                }}>
                  {member.user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', display: 'block' }}>
                    {member.user?.name || 'Unknown'}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-quaternary)', fontFamily: 'var(--font-mono)' }}>
                    {member.user?.email}
                  </span>
                </div>
                <span style={{
                  fontSize: '9px', fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '0.06em',
                  color: member.role === 'admin' ? 'var(--accent-indigo)' : member.role === 'editor' ? 'var(--accent-amber)' : 'var(--text-quaternary)',
                  background: member.role === 'admin' ? 'var(--accent-indigo-soft)' : member.role === 'editor' ? 'var(--accent-amber-soft)' : 'var(--bg-hover)',
                  padding: '3px 6px', borderRadius: '4px',
                  textTransform: 'uppercase',
                }}>
                  {member.role}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
    <style>{`
      .dashboard-main-offset { margin-left: 224px; }
      .dashboard-header { padding: 24px 28px 20px 28px; border-bottom: 1px solid var(--border-subtle); }
      .dashboard-controls-wrap { padding: 16px 28px 0 28px; }
      .dashboard-content { padding: 0; }
      .dashboard-widgets-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 14px;
      }
      .dashboard-recent-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 12px;
      }
      @media (max-width: 1199px) and (min-width: 768px) {
        .dashboard-widgets-grid { grid-template-columns: repeat(2, 1fr); }
        .dashboard-recent-grid { grid-template-columns: repeat(2, 1fr); }
      }
      .dashboard-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 14px;
        padding: 16px 28px 32px 28px;
      }
      .dashboard-empty-wrap { margin: 16px 28px; }
      .dashboard-table-wrap { margin: 16px 28px; }
      @media (max-width: 1023px) and (min-width: 768px) {
        .dashboard-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 767px) {
        .dashboard-main-offset { margin-left: 0 !important; }
        .dashboard-header { padding: 16px 16px 14px 16px; }
        .dashboard-controls-wrap { padding: 12px 16px 0 16px; }
        .dashboard-grid {
          grid-template-columns: 1fr;
          padding: 12px 16px 24px 16px;
        }
        .dashboard-empty-wrap { margin: 12px 16px; }
        .dashboard-table-wrap { margin: 12px 16px; }
        .dashboard-widgets-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
        .dashboard-recent-grid { grid-template-columns: 1fr; gap: 10px; }
      }
      @media (max-width: 900px) {
        .dashboard-overview-double-grid { grid-template-columns: 1fr !important; }
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
          <div className="dashboard-header" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.03em' }}>
                  {tabTitles[activeTab]}
                </h1>
                {activeTab === 'overview' && <div className="live-dot" />}
              </div>
              <p style={{
                fontSize: '11px', color: 'var(--text-quaternary)', margin: '4px 0 0',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
              }}>
                {currentOrganization?.name?.toUpperCase()} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toUpperCase()}
              </p>
            </div>
            {(activeTab === 'all' || activeTab === 'overview') && (
              <span style={{
                fontSize: '10px', fontWeight: 700, color: 'var(--accent-indigo)',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                background: 'var(--accent-indigo-soft)', padding: '4px 10px', borderRadius: '6px',
                whiteSpace: 'nowrap', flexShrink: 0,
                border: '1px solid rgba(99,102,241,0.2)',
              }}>
                {files.length} {files.length === 1 ? 'FILE' : 'FILES'}
              </span>
            )}
          </div>

          {activeTab === 'overview' ? (
            renderOverview()
          ) : (
            <>
              {/* Controls */}
              <div className="dashboard-controls-wrap">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '10px',
                  padding: '10px 12px',
                }}>
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
              </div>

              {/* File list / grid / empty / skeleton */}
              <div className="dashboard-content">
                {loading ? (
                  viewMode === 'grid' ? (
                    <div className="dashboard-grid" style={{ display: 'grid' }}>
                      {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                  ) : (
                    <div className="dashboard-table-wrap">
                    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                            {['Name', 'Type', 'Size', 'Uploaded by', 'Date', ''].map((h, i) => (
                              <th key={i} className="sys-label" style={{ padding: '0 16px', height: '36px', textAlign: 'left' }}>
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
                    </div>
                  )
                ) : filteredFiles.length === 0 ? (
                  /* Empty state */
                  <div className="dashboard-empty-wrap" style={{
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    background: 'var(--bg-card)',
                    minHeight: '320px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '12px',
                      background: 'var(--accent-indigo-soft)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {emptyConfig.icon}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', margin: '14px 0 0' }}>
                      {emptyConfig.title}
                    </p>
                    <p style={{ fontSize: '12px', fontWeight: 400, color: 'var(--text-tertiary)', margin: '4px 0 0', maxWidth: '240px', textAlign: 'center' }}>
                      {emptyConfig.subtitle}
                    </p>
                    {emptyConfig.showUpload && (
                      <button onClick={handleUploadClick} className="btn-primary" style={{ marginTop: '16px', gap: '4px' }}>
                        <Plus size={14} strokeWidth={2.5} />
                        Upload file
                      </button>
                    )}
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
                  <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}>
                          <th className="sys-label" style={{ padding: '0 16px', height: '36px', textAlign: 'left' }}>Name</th>
                          <th className="sys-label" style={{ padding: '0 16px', height: '36px', textAlign: 'left' }}>Type</th>
                          <th className="sys-label" style={{ padding: '0 16px', height: '36px', textAlign: 'left' }}>Size</th>
                          <th className="sys-label" style={{ padding: '0 16px', height: '36px', textAlign: 'left' }}>Uploaded by</th>
                          <th className="sys-label" style={{ padding: '0 16px', height: '36px', textAlign: 'left' }}>Date</th>
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
            </>
          )}
        </main>
      </div>
    </div>

    {/* ── Upload Center Modal ─────────────────────────── */}
      <Modal
        show={showUploadModal}
        onHide={() => { if (!uploading) { setShowUploadModal(false); setUploadQueue([]); } }}
        centered
        className="premium-modal"
      >
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          padding: '24px',
          width: '560px', maxWidth: '95vw',
          position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>Upload files</h2>
            <button
              onClick={() => { if (!uploading) { setShowUploadModal(false); setUploadQueue([]); } }}
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
              border: `1.5px dashed ${isDragging ? 'var(--accent-indigo)' : 'var(--border)'}`,
              borderRadius: '12px',
              padding: '36px 24px',
              textAlign: 'center',
              cursor: uploading ? 'not-allowed' : 'pointer',
              background: isDragging ? 'var(--accent-indigo-soft)' : 'transparent',
              transition: 'all 150ms ease',
              opacity: uploading ? 0.8 : 1,
            }}
          >
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
            <div style={{
              width: '40px', height: '40px', borderRadius: '8px',
              background: 'rgba(255, 107, 0, 0.08)',
              border: '1px solid rgba(255, 107, 0, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 12px',
            }}>
              <Upload size={18} style={{ color: 'var(--accent-indigo)' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', margin: 0 }}>
              Drag and drop or <span style={{ color: 'var(--accent-indigo)', textDecoration: 'underline' }}>browse files</span>
            </p>
            <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', margin: '6px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              MAX FILE SIZE: 20 MB
            </p>
          </div>

          {/* Upload queue list */}
          {uploadQueue.length > 0 && (
            <div style={{ maxHeight: '280px', overflowY: 'auto', marginTop: '16px', paddingRight: '4px' }}>
              {uploadQueue.map((item) => (
                <div
                  key={item.id}
                  style={{
                    marginBottom: '10px',
                    border: item.status === 'complete' ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    background: 'var(--bg-card)',
                    transition: 'all 200ms ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    {/* File Icon Box */}
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '8px', flexShrink: 0,
                      background: getQueueFileIcon(item.name).bg,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: '#FFFFFF', fontWeight: 700, fontSize: '9px', fontFamily: 'var(--font-mono)',
                      letterSpacing: '0.02em', marginTop: '2px',
                    }}>
                      {getQueueFileIcon(item.name).label}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </span>
                        
                        {/* Action icon (X or Trash) */}
                        <button
                          onClick={() => handleRemoveFromQueue(item.id)}
                          style={{
                            background: 'transparent', border: 'none', cursor: 'pointer',
                            color: 'var(--text-tertiary)', padding: '2px', borderRadius: '4px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'all 150ms ease',
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = 'var(--bg-hover)';
                            e.currentTarget.style.color = 'var(--text-primary)';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-tertiary)';
                          }}
                        >
                          {item.status === 'uploading' ? <X size={13} /> : <Trash2 size={13} />}
                        </button>
                      </div>

                      {/* Second Line: Size / Status */}
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px',
                        fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-tertiary)',
                        letterSpacing: '0.03em', textTransform: 'uppercase',
                      }}>
                        {item.status === 'complete' ? (
                          <>
                            <span>{formatBytes(item.size)}</span>
                            <span>/</span>
                            <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>
                              ✓ COMPLETE
                            </span>
                          </>
                        ) : item.status === 'uploading' ? (
                          <>
                            <span>{formatBytes(item.loadedBytes || 0)} OF {formatBytes(item.totalBytes || item.size)}</span>
                            <span>/</span>
                            <span style={{ color: 'var(--accent-indigo)', fontWeight: 600 }}>
                              UPLOADING...
                            </span>
                          </>
                        ) : item.status === 'queued' ? (
                          <>
                            <span>{formatBytes(item.size)}</span>
                            <span>/</span>
                            <span style={{ color: 'var(--text-tertiary)', fontWeight: 600 }}>
                              QUEUED
                            </span>
                          </>
                        ) : (
                          <>
                            <span>{formatBytes(item.size)}</span>
                            <span>/</span>
                            <span style={{ color: 'var(--accent-red)', fontWeight: 600 }}>
                              FAILED
                            </span>
                          </>
                        )}
                      </div>

                      {/* Third Line: Monospace Ticks Progress Bar */}
                      {item.status === 'uploading' && (
                        <div style={{ marginTop: '8px' }}>
                          {(() => {
                            const totalTicks = 48;
                            const filledTicks = Math.round((item.progress / 100) * totalTicks);
                            const emptyTicks = totalTicks - filledTicks;
                            return (
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{
                                  fontFamily: 'var(--font-mono)', fontSize: '11px', letterSpacing: '-0.7px',
                                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
                                  lineHeight: '1',
                                }}>
                                  <span style={{ color: 'var(--accent-indigo)' }}>{'|'.repeat(filledTicks)}</span>
                                  <span style={{ color: 'rgba(255,255,255,0.06)' }}>{'|'.repeat(emptyTicks)}</span>
                                </div>
                                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9.5px', color: 'var(--text-secondary)', marginLeft: '12px', flexShrink: 0 }}>
                                  {item.progress}%
                                </span>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            {/* Left side actions */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MoreVertical size={14} style={{ color: 'var(--text-quaternary)' }} />
              <div style={{ width: '1px', height: '14px', background: 'var(--border)' }} />
              <button
                onClick={handleRemoveAll}
                disabled={uploadQueue.length === 0}
                style={{
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  color: 'var(--text-tertiary)', fontSize: '10px', fontWeight: 600,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
                  display: 'flex', alignItems: 'center', opacity: uploadQueue.length === 0 ? 0.4 : 1,
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={e => { if (uploadQueue.length > 0) e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { if (uploadQueue.length > 0) e.currentTarget.style.color = 'var(--text-tertiary)'; }}
              >
                <Trash2 size={12} style={{ marginRight: '6px' }} />
                REMOVE ALL
              </button>
            </div>

            {/* Right side status / done button */}
            <div>
              {uploadQueue.some(item => item.status === 'uploading' || item.status === 'queued') ? (
                <button
                  disabled
                  style={{
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '12px',
                    fontWeight: 600, padding: '6px 20px', cursor: 'not-allowed',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  <div style={{ width: '10px', height: '10px', border: '2px solid rgba(255,255,255,0.2)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                  Uploading...
                </button>
              ) : (
                <button
                  onClick={() => { setShowUploadModal(false); setUploadQueue([]); }}
                  style={{
                    background: '#FFFFFF', border: 'none', borderRadius: '20px',
                    color: '#000000', fontSize: '12px', fontWeight: 600,
                    padding: '6px 20px', cursor: 'pointer',
                    transition: 'opacity 150ms ease',
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  Done
                </button>
              )}
            </div>
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
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
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
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <File size={15} style={{ color: 'var(--text-tertiary)' }} strokeWidth={1.75} />
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  {selectedFile?.originalName}
                </p>
                <p style={{ fontSize: '10px', color: 'var(--text-quaternary)', margin: '1px 0 0', fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
                  color: 'var(--text-tertiary)', cursor: 'pointer',
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
                  color: 'var(--text-tertiary)', cursor: 'pointer',
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
                <div style={{ width: '28px', height: '28px', border: '2.5px solid var(--border)', borderTopColor: 'var(--accent-indigo)', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                <p style={{ fontSize: '12px', color: 'var(--text-quaternary)', margin: 0, fontFamily: 'var(--font-mono)' }}>LOADING PREVIEW...</p>
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
            ) : selectedFile?.fileType === 'video' ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                style={{ maxWidth: '100%', maxHeight: '65vh', borderRadius: '10px', outline: 'none' }}
              />
            ) : selectedFile?.fileType === 'audio' ? (
              <div style={{ width: '100%', maxWidth: '500px', padding: '40px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '12px', textAlign: 'center' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <Activity size={24} style={{ color: '#06B6D4' }} />
                </div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
                  {selectedFile.originalName}
                </p>
                <audio
                  src={previewUrl}
                  controls
                  autoPlay
                  style={{ width: '100%' }}
                />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '12px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px',
                }}>
                  <File size={24} style={{ color: 'var(--text-quaternary)' }} />
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-tertiary)', margin: '0 0 16px' }}>Preview not available for this file type</p>
                <button onClick={() => window.open(selectedFile.path, '_blank')} className="btn-primary" style={{ margin: '0 auto' }}>
                  Open in new tab
                </button>
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Dashboard;
