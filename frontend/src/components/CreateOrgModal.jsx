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
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px', height: '48px', borderRadius: '12px',
              background: 'var(--accent-indigo-soft)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 14px',
              boxShadow: 'var(--accent-indigo-glow)',
            }}
          >
            <Plus size={24} strokeWidth={2.5} style={{ color: 'var(--accent-indigo)' }} />
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.02em' }}>
            New Workspace
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '6px', fontFamily: 'var(--font-mono)', letterSpacing: '0.03em' }}>
            CREATE A SHARED WORKSPACE FOR YOUR TEAM
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label
              htmlFor="org-name"
              style={{
                display: 'block', fontSize: '10.5px', fontWeight: 600,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-tertiary)',
                marginBottom: '8px',
              }}
            >
              WORKSPACE NAME
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={onHide}
              className="btn-secondary"
              disabled={loading}
              style={{ justifyContent: 'center' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !name.trim()}
              style={{ justifyContent: 'center' }}
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
