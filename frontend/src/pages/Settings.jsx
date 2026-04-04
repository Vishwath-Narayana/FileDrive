import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowLeft, Camera, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const navigate = useNavigate();
  const { user, updateAvatar, updatePassword } = useAuth();
  
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age || '');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? `http://localhost:5001${user.avatar}` : null
  );
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }
    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result);
    reader.readAsDataURL(file);
    setAvatarFile(file);

    // Upload immediately
    try {
      setUploadingAvatar(true);
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await api.post('/users/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateAvatar(response.data.avatar);
      toast.success('Profile picture updated!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }

    try {
      setSavingProfile(true);
      await api.put('/users/profile', { name, age: age ? Number(age) : null });
      toast.success('Profile updated successfully');
      window.location.reload();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setUpdatingPassword(true);
      await updatePassword(newPassword);
      toast.success('Password updated successfully');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#FAFAFA]">
      <Sidebar activeTab="settings" setActiveTab={() => {}} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar 
          onOpenAdminModal={() => {}} 
          onOpenCreateOrgModal={() => {}}
        />
        
        <main className="flex-1 overflow-y-auto p-12">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 text-gray-400 hover:text-black mb-6 transition-colors text-sm font-medium border-none bg-transparent p-0 focus:outline-none"
              >
                <ArrowLeft size={16} strokeWidth={2.5} />
                Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold tracking-tight text-black mb-1">Settings</h1>
              <p className="text-sm text-gray-500">Manage your profile preferences</p>
            </div>

            <div className="card-premium overflow-hidden bg-white">
              <div className="px-6 pt-4 pb-0 border-b border-[#EDEDED]">
                <span className="flex items-center gap-2 px-2 py-4 text-sm font-bold text-black">
                  <User size={16} />
                  Profile
                </span>
              </div>

              <div className="p-10">
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Your Avatar
                    </label>
                    <div className="flex items-center gap-8">
                      <div className="relative group">
                        <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-[#EDEDED] p-1 overflow-hidden transition-all group-hover:border-black">
                          <div className="w-full h-full rounded-full bg-black text-white flex items-center justify-center text-2xl font-bold overflow-hidden">
                            {avatarPreview ? (
                              <img
                                src={avatarPreview}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              user?.name?.charAt(0).toUpperCase()
                            )}
                          </div>
                        </div>
                        {uploadingAvatar && (
                          <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="avatar-upload"
                          className="btn-secondary py-2 text-xs"
                        >
                          <Camera size={14} />
                          {uploadingAvatar ? 'Uploading...' : 'Change Photo'}
                        </label>
                        <input
                          id="avatar-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarChange}
                          disabled={uploadingAvatar}
                        />
                        <p className="text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-tighter">Square PNG or JPG • Max 5MB</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label htmlFor="name" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field"
                        placeholder="John Doe"
                      />
                    </div>

                    <div>
                      <label htmlFor="age" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Age (Optional)
                      </label>
                      <input
                        id="age"
                        type="number"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        className="input-field"
                        placeholder="e.g. 25"
                        min="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      className="input-field opacity-60 cursor-not-allowed"
                      disabled
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Email is managed by your authentication provider</p>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#FAFAFA]">
                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="btn-primary"
                    >
                      {savingProfile ? 'Saving...' : 'Update Details'}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Security Section */}
            <div className="card-premium overflow-hidden bg-white mt-8">
              <div className="px-6 pt-4 pb-0 border-b border-[#EDEDED]">
                <span className="flex items-center gap-2 px-2 py-4 text-sm font-bold text-black">
                  <Lock size={16} />
                  Security
                </span>
              </div>

              <div className="p-10">
                <form onSubmit={handleUpdatePassword} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="input-field pr-12"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors focus:outline-none border-none bg-transparent p-0"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-300 mt-2 font-medium">Minimum 6 characters</p>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="input-field"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-[#FAFAFA]">
                    <button
                      type="submit"
                      disabled={updatingPassword || !newPassword || !confirmPassword}
                      className="btn-primary"
                    >
                      {updatingPassword ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;
