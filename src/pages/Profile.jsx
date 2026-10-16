import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, BookOpen, Users, LogOut, Edit3, CheckCircle, XCircle, Award, Shield, Key, Save, X, Camera, ArrowLeft } from 'lucide-react';
import { usePolls } from '../context/PollContext';
import BottomNav from '../components/BottomNav';
import './Profile.css';

const Profile = () => {
  const { currentUser, userVotes, getStudentProfile, updateProfile, logout, polls } = usePolls();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [saveMessage, setSaveMessage] = useState('');
  const [saveStatus, setSaveStatus] = useState('success');

  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const profile = getStudentProfile(currentUser.id);

  useEffect(() => {
    if (profile && !isEditing) {
      setEditForm({ ...profile });
    }
  }, [currentUser.id, isEditing, profile?.name, profile?.email, profile?.designation, profile?.semester, profile?.avatarUrl, profile?.role]);

  if (!profile || !editForm) return <div className="loading-state">Loading...</div>;

  // Calculate voting stats for current user audience
  const audiencePolls = Object.values(polls).filter(poll => poll.audience === currentUser.role);
  const totalPolls = audiencePolls.length;
  const userVoteData = userVotes[currentUser.id] || {};
  const votedPollsCount = Object.keys(userVoteData).filter(pId => polls[pId]?.audience === currentUser.role).length;
  const hasVotedAll = votedPollsCount >= totalPolls && totalPolls > 0;
  const votingStatusText = votedPollsCount > 0 ? (hasVotedAll ? 'All Votes Cast' : 'Partially Voted') : 'Not Voted';

  const handleLogout = () => {
    if (logout) logout();
    navigate('/login');
  };

  const handleSave = async () => {
    if (updateProfile) {
      const res = await updateProfile(currentUser.id, editForm);
      if (res && res.status === 'success') {
        setSaveStatus('success');
        setSaveMessage('Profile changes saved successfully! ✓');
        setIsEditing(false);
      } else {
        setSaveStatus('error');
        setSaveMessage(res?.message || 'Failed to save profile changes to database.');
      }
      setTimeout(() => setSaveMessage(''), 3500);
    }
  };

  const handleCancel = () => {
    setEditForm(profile);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="profile-container">
      <div className="profile-ambient orb-top"></div>
      <div className="profile-ambient orb-bottom"></div>

      <header className="profile-header">
        <button className="back-btn" onClick={() => navigate(currentUser.role === 'teacher' ? '/teacher' : '/dashboard')}>
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
        <h2>{profile.role === 'teacher' ? 'Faculty Profile' : 'Student Profile'}</h2>
        {!isEditing ? (
          <button className="edit-btn" onClick={() => setIsEditing(true)}>
            <Edit3 size={17} />
            <span>Edit</span>
          </button>
        ) : (
          <div className="header-actions-group">
            <button className="edit-btn btn-save" onClick={handleSave}>
              <Save size={17} />
              <span>Save</span>
            </button>
            <button className="edit-btn btn-cancel" onClick={handleCancel}>
              <X size={17} />
              <span>Cancel</span>
            </button>
          </div>
        )}
      </header>

      {saveMessage && (
        <div className={`profile-toast-message ${saveStatus === 'error' ? 'toast-error' : ''}`}>
          {saveMessage}
        </div>
      )}

      <main className="profile-main">
        <section className="profile-hero">
          <div className="avatar-wrapper">
            {isEditing ? (
              <>
                <label htmlFor="avatar-upload" className="avatar-upload-label">
                  <div className="avatar-circle editing-avatar-circle">
                    {(editForm.avatarUrl || profile.avatarUrl) ? (
                      <img src={editForm.avatarUrl || profile.avatarUrl} alt="Avatar" className="avatar-img" />
                    ) : (
                      <User size={56} className="avatar-icon" />
                    )}
                    <div className="camera-overlay-badge">
                      <Camera size={18} />
                    </div>
                  </div>
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditForm(prev => ({ ...prev, avatarUrl: reader.result }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  style={{ display: 'none' }}
                />
              </>
            ) : (
              <div className="avatar-circle">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="avatar-img" />
                ) : (
                  <User size={56} className="avatar-icon" />
                )}
              </div>
            )}
            <div className="role-badge">
              <Shield size={13} /> <span>{profile.role === 'teacher' ? 'Faculty' : 'Student'}</span>
            </div>
          </div>
          {isEditing ? (
            <input
              className="edit-input-hero"
              name="name"
              value={editForm.name || ''}
              onChange={handleChange}
              placeholder="Your Name"
            />
          ) : (
            <h1 className="profile-name">{profile.name}</h1>
          )}
          <p className="profile-handle">@{profile.role === 'teacher' ? (profile.facultyId?.toLowerCase() || profile.rollNo?.toLowerCase() || 'faculty') : (profile.rollNo?.toLowerCase() || 'id')}</p>
        </section>

        <section className="stats-row">
          <div className={`stat-card ${votedPollsCount > 0 ? 'active' : ''}`}>
            <div className="stat-icon-wrapper">
              <Award size={24} />
            </div>
            <div className="stat-info">
              <h3>{votedPollsCount}</h3>
              <p>Votes Submitted</p>
            </div>
          </div>
          <div className={`stat-card ${hasVotedAll ? 'complete' : ''}`}>
            <div className="stat-icon-wrapper">
              {hasVotedAll ? <CheckCircle size={24} /> : <XCircle size={24} />}
            </div>
            <div className="stat-info">
              <h3>Status</h3>
              <p>{votingStatusText}</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">{profile.role === 'teacher' ? 'Professional Details' : 'Personal Details'}</h3>
          <div className="info-list">
            {profile.role === 'teacher' ? (
              /* FACULTY MEMBER FORM */
              <>
                <div className="info-item">
                  <div className="info-icon"><Key size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Faculty ID</span>
                    {isEditing ? (
                      <input className="edit-input" name="facultyId" value={editForm.facultyId || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.facultyId || currentUser.id}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><BookOpen size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Department</span>
                    {isEditing ? (
                      <input className="edit-input" name="department" value={editForm.department || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.department}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Users size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Designation</span>
                    {isEditing ? (
                      <input className="edit-input" name="designation" value={editForm.designation || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.designation}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Mail size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Email Address</span>
                    {isEditing ? (
                      <input className="edit-input" name="email" type="email" value={editForm.email || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.email}</span>
                    )}
                  </div>
                </div>
              </>
            ) : (
              /* STUDENT FORM */
              <>
                <div className="info-item">
                  <div className="info-icon"><Key size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">University Roll Number</span>
                    {isEditing ? (
                      <input className="edit-input" name="rollNo" value={editForm.rollNo || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.rollNo}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><BookOpen size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Department</span>
                    {isEditing ? (
                      <input className="edit-input" name="department" value={editForm.department || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.department}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Users size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Current Class / Semester</span>
                    {isEditing ? (
                      <input className="edit-input" name="semester" value={editForm.semester || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.semester}</span>
                    )}
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-icon"><Mail size={20} /></div>
                  <div className="info-content">
                    <span className="info-label">Academic Email Address</span>
                    {isEditing ? (
                      <input className="edit-input" name="email" type="email" value={editForm.email || ''} onChange={handleChange} />
                    ) : (
                      <span className="info-value">{profile.email}</span>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        <section className="action-section">
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Sign Out Securely</span>
          </button>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

export default Profile;
