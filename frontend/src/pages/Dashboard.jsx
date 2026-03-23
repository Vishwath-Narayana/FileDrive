import { useState, useEffect, useRef } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { X, File, Plus } from 'lucide-react';

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
  const fileInputRef = useRef(null);
  const { user, currentOrganization } = useAuth();
  
  const userRole = currentOrganization?.members?.find(
    m => (m.user._id?.toString() || m.user?.toString() || m.user) === user?._id?.toString()
  )?.role || 'viewer';

  useEffect(() => {
    if (!currentOrganization) return;

    fetchFiles();

    const interval = setInterval(() => {
      fetchFiles();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval);
  }, [currentOrganization, activeTab]);

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
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('organizationId', currentOrganization._id);

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFiles([response.data, ...files]);
      toast.success('File uploaded successfully');
      setShowUploadModal(false);
      setUploadFile(null);
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
      const response = await api.get(`/files/download/${file._id}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', file.originalName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started');
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
                <div className="text-center py-24 text-gray-300 font-medium animate-pulse">Loading workspace...</div>
              ) : filteredFiles.length === 0 ? (
                <div className="text-center py-32 bg-white rounded-[32px] border border-[#F0F0F0] border-dashed">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <File size={32} className="text-gray-200" />
                  </div>
                  <h3 className="text-lg font-bold text-black mb-2">
                    {searchQuery || typeFilter !== 'all' ? 'No matches found' : 'Empty workspace'}
                  </h3>
                  <p className="text-sm text-gray-400 max-w-[240px] mx-auto leading-relaxed">
                    {searchQuery || typeFilter !== 'all' ? 'Try adjusting your search or filters to find what you\'re looking for.' : 'Start by uploading your first file to this organization.'}
                  </p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredFiles.map((file) => (
                    <FileCard
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

      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered className="premium-modal">
        <div className="bg-white rounded-[32px] p-10 shadow-2xl border border-[#F0F0F0] max-w-lg mx-auto w-full relative">
          <button 
            onClick={() => setShowUploadModal(false)}
            className="absolute right-8 top-8 text-gray-300 hover:text-black transition-colors"
          >
            <X size={20} />
          </button>

          <div className="mb-10">
            <div className="w-14 h-14 bg-black rounded-2xl flex items-center justify-center mb-6 shadow-lg">
              <Plus size={28} className="text-white" strokeWidth={2.5} />
            </div>
            <h2 className="text-2xl font-bold text-black mb-2 tracking-tight">Upload File</h2>
            <p className="text-sm text-gray-400 font-medium">Select a file to add to <span className="text-black font-bold">{currentOrganization?.name}</span></p>
          </div>

          <div className="space-y-8">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group cursor-pointer border-2 border-dashed border-[#EDEDED] rounded-[24px] p-12 text-center hover:border-black hover:bg-gray-50 transition-all duration-300"
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="w-16 h-16 bg-gray-50 group-hover:bg-white rounded-full flex items-center justify-center mx-auto mb-4 transition-colors">
                <File size={28} className="text-gray-300 group-hover:text-black transition-colors" />
              </div>
              <p className="text-sm font-bold text-black mb-1">
                {uploadFile ? uploadFile.name : 'Click to browse files'}
              </p>
              <p className="text-xs text-gray-400">
                {uploadFile ? `${(uploadFile.size / 1024).toFixed(2)} KB` : 'PDF, Image, Video, or Text'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="flex-1 btn-secondary py-3.5 justify-center text-sm"
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUploadSubmit}
                className="flex-3 btn-primary py-3.5 justify-center text-sm"
                disabled={uploading || !uploadFile}
              >
                {uploading ? 'Processing...' : 'Start Upload'}
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
