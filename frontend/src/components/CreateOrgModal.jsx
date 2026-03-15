import { useState } from 'react';
import { Modal } from 'react-bootstrap';
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
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Create Organization</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="org-name" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name
            </label>
            <input
              id="org-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="My Organization"
              autoFocus
            />
          </div>
        </form>
      </Modal.Body>
      <Modal.Footer>
        <button
          onClick={onHide}
          className="btn-secondary"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          className="btn-primary"
          disabled={loading || !name.trim()}
        >
          {loading ? 'Creating...' : 'Create Organization'}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateOrgModal;
