import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CreateOrgModal = ({ show, onHide }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { refreshOrganizations } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Organization name is required');
      return;
    }

    try {
      setLoading(true);
      await api.post('/organizations', { name });
      toast.success('Organization created successfully');
      await refreshOrganizations();
      setName('');
      onHide();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered className="premium-modal">
      <div className="p-10">
        <div className="mb-8 text-center">
          <div className="w-12 h-12 bg-black rounded-xl mx-auto mb-4 shadow-lg flex items-center justify-center text-white">
            <Plus size={24} strokeWidth={3} />
          </div>
          <h2 className="text-xl font-bold text-black">New Organization</h2>
          <p className="text-sm text-gray-400 mt-1">Create a shared workspace for your team</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="org-name" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Workspace Name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="e.g. Design Team, Engineering"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onHide}
              className="btn-secondary justify-center py-3"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary justify-center py-3"
              disabled={loading || !name.trim()}
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateOrgModal;
