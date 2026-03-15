import { useState, useEffect, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardControls from '../components/DashboardControls';
import FileCard from '../components/FileCard';
import FileRow from '../components/FileRow';
import AdminModal from '../components/AdminModal';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchFiles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [files, searchQuery, typeFilter]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/files');
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

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);

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
    if (!window.confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    try {
      await api.delete(`/files/${file._id}`);
      setFiles(files.filter(f => f._id !== file._id));
      toast.success('File deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar onOpenAdminModal={() => setShowAdminModal(true)} />
        
        <main className="flex-1 overflow-y-auto p-8">
          <DashboardControls
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            onUpload={handleUploadClick}
          />

          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading files...</div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              {searchQuery || typeFilter !== 'all' ? 'No files match your filters' : 'No files yet'}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded On
                    </th>
                    <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="py-3 px-4"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFiles.map((file) => (
                    <FileRow
                      key={file._id}
                      file={file}
                      onDownload={handleDownload}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Upload File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 mb-2">
              Select a file to upload
            </label>
            <input
              id="file-upload"
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            {uploadFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {uploadFile.name} ({(uploadFile.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button
            onClick={() => setShowUploadModal(false)}
            className="btn-secondary"
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            onClick={handleUploadSubmit}
            className="btn-primary"
            disabled={uploading || !uploadFile}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </Modal.Footer>
      </Modal>

      <AdminModal show={showAdminModal} onHide={() => setShowAdminModal(false)} />
    </div>
  );
};

export default Dashboard;
