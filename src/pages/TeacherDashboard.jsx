import { useEffect } from 'react';
import { usePolls } from '../context/PollContext';
import { LogOut, Play, Pause, Square, TrendingUp, Users, Activity, BarChart2, Shield, UserCheck, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import './TeacherDashboard.css';

const TeacherDashboard = () => {
  const { polls, changePollStatus, logout, hasVoted, currentUser } = usePolls();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest') {
      navigate('/login');
    } else if (currentUser.role !== 'teacher') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-logo">
          <div className="admin-logo-badge">
            <Shield size={20} />
          </div>
          <div>
            <h2>Faculty Portal</h2>
            <span className="admin-sub">Election Control Center</span>
          </div>
        </div>
        <div className="admin-header-actions">
          <button className="admin-nav-btn results-btn" onClick={() => navigate('/results')}>
            <BarChart2 size={17} /> <span>Results</span>
          </button>
          <button className="admin-nav-btn profile-btn" onClick={() => navigate('/profile')}>
            <UserCheck size={17} /> <span>Profile</span>
          </button>
          <button className="admin-nav-btn logout-top-btn" onClick={handleLogout}>
            <LogOut size={17} /> <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="admin-main">
        {Object.values(polls).filter(p => p.audience === 'teacher').map(poll => {
          const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
          const remaining = Math.max(poll.totalEligible - totalVotes, 0);
          const participationNum = poll.totalEligible > 0 ? (totalVotes / poll.totalEligible) * 100 : 0;
          const participation = participationNum.toFixed(1);

          return (
            <div key={poll.id} className="admin-card">
              <div className="admin-card-header">
                <div>
                  <span className="admin-cat-chip">Faculty Election</span>
                  <h3 className="admin-poll-title">{poll.title}</h3>
                </div>
                <div className="admin-status-wrap">
                  <span className={`status-dot ${poll.status.toLowerCase()}`}></span>
                  <span className="admin-status-text">Status: {poll.status}</span>
                </div>
              </div>
              
              <div className="admin-stats-grid">
                <div className="admin-stat-box">
                  <Users className="stat-icon blue" size={22}/>
                  <div className="stat-val">{poll.totalEligible}</div>
                  <div className="stat-label">Eligible Faculty</div>
                </div>
                <div className="admin-stat-box">
                  <Activity className="stat-icon green" size={22}/>
                  <div className="stat-val">{totalVotes}</div>
                  <div className="stat-label">Votes Cast</div>
                </div>
                <div className="admin-stat-box">
                  <TrendingUp className="stat-icon purple" size={22}/>
                  <div className="stat-val">{participation}%</div>
                  <div className="stat-label">Turnout</div>
                </div>
              </div>

              {/* Turnout Bar */}
              <div className="faculty-turnout-wrap">
                <div className="faculty-turnout-header">
                  <span>Turnout Progress</span>
                  <span><strong>{remaining}</strong> voters remaining</span>
                </div>
                <div className="faculty-turnout-bg">
                  <div className="faculty-turnout-fill" style={{ width: `${Math.min(participationNum, 100)}%` }}></div>
                </div>
              </div>

              {/* Controls bar */}
              <div className="admin-controls-card">
                <div className="controls-label">Election State Controls</div>
                <div className="admin-controls">
                  <button 
                    className={`control-btn start ${poll.status === 'LIVE' ? 'disabled' : ''}`} 
                    disabled={poll.status === 'LIVE'}
                    onClick={() => changePollStatus(poll.id, 'LIVE')}
                  >
                    <Play size={16}/> <span>Start Live</span>
                  </button>
                  <button 
                    className={`control-btn pause ${poll.status !== 'LIVE' ? 'disabled' : ''}`} 
                    disabled={poll.status !== 'LIVE'}
                    onClick={() => changePollStatus(poll.id, 'PAUSED')}
                  >
                    <Pause size={16}/> <span>Pause</span>
                  </button>
                  <button 
                    className={`control-btn end ${poll.status === 'ENDED' ? 'disabled' : ''}`} 
                    disabled={poll.status === 'ENDED'}
                    onClick={() => changePollStatus(poll.id, 'ENDED')}
                  >
                    <Square size={16}/> <span>End Election</span>
                  </button>
                </div>

                <div className="admin-vote-action-row">
                  {poll.status === 'LIVE' && !hasVoted(poll.id) && (
                    <button 
                      className="cast-faculty-vote-btn" 
                      onClick={() => navigate(`/vote/${poll.id}`)}
                    >
                      <span>Cast Your Faculty Ballot</span>
                      <span className="btn-arrow-right">→</span>
                    </button>
                  )}
                  {hasVoted(poll.id) && (
                    <div className="admin-voted-pill">
                      <CheckCircle2 size={16} />
                      <span>Your Faculty Vote Has Been Cast</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Results */}
              <div className="quick-results">
                <div className="quick-results-header">
                  <h4>Live Candidates Standings</h4>
                  <span className="quick-results-sub">Preview</span>
                </div>
                <div className="mini-results-list">
                  {poll.options.slice().sort((a,b) => b.votes - a.votes).map((opt, i) => {
                    const optPercent = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : '0.0';
                    return (
                      <div key={i} className="mini-result">
                        <div className="mini-result-left">
                          <span className="mini-rank">#{i + 1}</span>
                          <span className="mini-name">{opt.name}</span>
                          {opt.rollNo && <span className="mini-designation">{opt.rollNo}</span>}
                        </div>
                        <div className="mini-result-right">
                          <strong className="mini-percent">{optPercent}%</strong>
                          <span className="mini-votes">{opt.votes} {opt.votes === 1 ? 'vote' : 'votes'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </main>
      <BottomNav />
    </div>
  );
};

export default TeacherDashboard;
