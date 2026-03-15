import { useState, useEffect } from 'react';
import { Modal, Tab, Tabs, Dropdown } from 'react-bootstrap';
import { X } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-hot-toast';

const AdminModal = ({ show, onHide }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show) {
      fetchUsers();
    }
  }, [show]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? response.data : u));
      toast.success('Role updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header className="border-0 pb-0">
        <Modal.Title className="text-xl font-semibold">Members</Modal.Title>
        <button onClick={onHide} className="btn-close" aria-label="Close"></button>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <Tabs defaultActiveKey="members" className="mb-3">
          <Tab eventKey="members" title="Members">
            <div className="space-y-2">
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading...</div>
              ) : users.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No users found</div>
              ) : (
                users.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="outline-secondary" size="sm" id={`role-dropdown-${user._id}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Dropdown.Toggle>

                      <Dropdown.Menu>
                        <Dropdown.Item onClick={() => handleRoleChange(user._id, 'admin')}>
                          Admin
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRoleChange(user._id, 'editor')}>
                          Editor
                        </Dropdown.Item>
                        <Dropdown.Item onClick={() => handleRoleChange(user._id, 'viewer')}>
                          Viewer
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                ))
              )}
            </div>
          </Tab>
          <Tab eventKey="invitations" title="Invitations">
            <div className="text-center py-8 text-gray-500">
              No pending invitations
            </div>
          </Tab>
        </Tabs>
      </Modal.Body>
    </Modal>
  );
};

export default AdminModal;
