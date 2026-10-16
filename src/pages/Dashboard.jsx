import { useEffect } from 'react';
import { Vote, User, ShieldCheck, Sparkles, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePolls } from '../context/PollContext';
import PollCard from '../components/PollCard';
import BottomNav from '../components/BottomNav';
import './Dashboard.css';

const Dashboard = () => {
  const { polls, currentUser, getStudentProfile, hasVoted } = usePolls();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest') {
      navigate('/login');
    } else if (currentUser.role === 'teacher') {
      navigate('/teacher');
    }
  }, [currentUser, navigate]);

  const profile = getStudentProfile(currentUser.id);
  const studentPolls = Object.values(polls).filter(poll => poll.audience === 'student');
  const votedCount = studentPolls.filter(poll => hasVoted(poll.id)).length;
  const allVoted = studentPolls.length > 0 && votedCount === studentPolls.length;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-logo">
          <div className="header-logo-icon-bg">
            <Vote size={22} className="logo-icon" />
          </div>
          <div className="header-brand-text">
            <span className="logo-text">QuickPoll</span>
            <span className="header-sub">Campus Portal</span>
          </div>
        </div>
        <div 
          className="user-profile" 
          onClick={() => navigate('/profile')} 
          role="button" 
          tabIndex={0} 
          title="View Profile"
        >
          {profile?.avatarUrl ? (
            <img src={profile.avatarUrl} alt="Avatar" className="user-avatar-img" />
          ) : (
            <div className="user-avatar">
              <User size={19} />
            </div>
          )}
          <span className="user-profile-badge">Student</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        {/* Welcome Hero Banner */}
        <div className="voter-hero-card">
          <div className="hero-top-row">
            <div className="hero-text-content">
              <div className="verified-chip">
                <ShieldCheck size={14} />
                <span>Verified Student Voter</span>
              </div>
              <h2 className="voter-name">
                {profile?.name || (currentUser.id !== 'guest' ? currentUser.id : 'Student')}
              </h2>
              <div className="voter-meta-badges">
                <span className="student-id-pill">
                  Roll No: {profile?.rollNo || currentUser.id}
                </span>
                <span className="department-pill">
                  {profile?.department || 'Information Technology'}
                </span>
              </div>
            </div>

            <div className="voter-progress-box">
              <div className="progress-circle-wrap">
                <Award size={24} className="award-icon" />
              </div>
              <div className="progress-labels">
                <span className="progress-fraction">{votedCount}/{studentPolls.length}</span>
                <span className="progress-desc">{allVoted ? 'All Cast ✓' : 'Voted'}</span>
              </div>
            </div>
          </div>

          <div className="hero-notice-bar">
            <Sparkles size={14} className="sparkle-icon" />
            <span>Official digital election. Your ballot is completely anonymous & encrypted.</span>
          </div>
        </div>

        {/* Polls Section */}
        <section className="polls-section">
          <div className="section-header">
            <div className="section-title-wrap">
              <h3>Active Campus Elections</h3>
              <span className="section-pulse-badge">
                <span className="section-dot"></span> LIVE
              </span>
            </div>
            <span className="poll-count-chip">{studentPolls.length} Elections</span>
          </div>
          
          <div className="polls-grid">
            {studentPolls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default Dashboard;
