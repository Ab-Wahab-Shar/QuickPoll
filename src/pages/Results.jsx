import { useState, useEffect } from 'react';
import { usePolls } from '../context/PollContext';
import { ArrowLeft, Trophy, Users, BarChart, Award, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import './Results.css';

const Results = () => {
  const { polls, currentUser } = usePolls();
  const navigate = useNavigate();
  const [filterTab, setFilterTab] = useState(currentUser.role === 'teacher' ? 'all' : 'student');

  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const renderPollResults = (poll) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const participationNum = poll.totalEligible > 0 ? (totalVotes / poll.totalEligible) * 100 : 0;
    const participation = participationNum.toFixed(1);
    
    // Find winner
    const maxVotes = Math.max(...poll.options.map(o => o.votes), 0);
    const winners = maxVotes > 0 ? poll.options.filter(o => o.votes === maxVotes) : [];
    const hasVotes = totalVotes > 0;

    // Category tag
    let catTag = 'Campus Election';
    if (poll.title?.toLowerCase().includes('cr') || poll.title?.toLowerCase().includes('class representative')) {
      catTag = 'CR Election';
    } else if (poll.title?.toLowerCase().includes('gr') || poll.title?.toLowerCase().includes('girls representative')) {
      catTag = 'GR Election';
    } else if (poll.audience === 'teacher' || poll.title?.toLowerCase().includes('faculty')) {
      catTag = 'Faculty Election';
    }

    return (
      <div key={poll.id} className="result-card">
        <div className="result-header">
          <div className="result-title-group">
            <span className="result-category-chip">{catTag}</span>
            <h3 className="result-poll-title">{poll.title}</h3>
          </div>
          <span className={`status-badge-modern ${poll.status.toLowerCase()}`}>
            <span className="status-dot-mini"></span>
            {poll.status}
          </span>
        </div>

        {/* Highlight Winner Spotlight if there are votes */}
        {hasVotes && winners.length > 0 && (
          <div className="winner-spotlight-card">
            <div className="spotlight-trophy-wrap">
              <Trophy size={22} className="spotlight-trophy-icon" />
            </div>
            <div className="spotlight-content">
              <span className="spotlight-tag">{winners.length > 1 ? 'Current Co-Leaders' : 'Leading Candidate / Winner'}</span>
              <h4 className="spotlight-winner-name">
                {winners.map(w => w.name).join(' & ')}
              </h4>
              <span className="spotlight-meta">
                {((maxVotes / totalVotes) * 100).toFixed(1)}% of total votes ({maxVotes} {maxVotes === 1 ? 'vote' : 'votes'})
              </span>
            </div>
          </div>
        )}
        
        <div className="stats-grid-results">
          <div className="stat-pill-modern">
            <Users size={16} className="stat-icon-muted" />
            <div className="pill-text-wrap">
              <span className="pill-label">Eligible</span>
              <span className="pill-value">{poll.totalEligible}</span>
            </div>
          </div>
          <div className="stat-pill-modern">
            <BarChart size={16} className="stat-icon-muted" />
            <div className="pill-text-wrap">
              <span className="pill-label">Votes Cast</span>
              <span className="pill-value">{totalVotes}</span>
            </div>
          </div>
          <div className="stat-pill-modern turnout-pill">
            <TrendingUp size={16} className="turnout-icon" />
            <div className="pill-text-wrap">
              <span className="pill-label">Turnout</span>
              <span className="pill-value">{participation}%</span>
            </div>
          </div>
        </div>

        {/* Turnout Progress Bar */}
        <div className="turnout-bar-container">
          <div className="turnout-bar-label">
            <span>Voter Participation</span>
            <span>{totalVotes} of {poll.totalEligible} voters</span>
          </div>
          <div className="turnout-bar-bg">
            <div className="turnout-bar-fill" style={{ width: `${Math.min(participationNum, 100)}%` }}></div>
          </div>
        </div>

        {/* Candidate Breakdown List */}
        <div className="candidates-results">
          <div className="breakdown-header">Candidate Standings</div>
          {poll.options.slice().sort((a, b) => b.votes - a.votes).map((opt, i) => {
            const isWinner = winners.some(w => w.id === opt.id);
            const percentage = totalVotes > 0 ? ((opt.votes / totalVotes) * 100).toFixed(1) : '0.0';
            const winnerText = winners.length > 1 ? 'Co-Leader' : 'Winner';
            const votesText = `${opt.votes} ${opt.votes === 1 ? 'vote' : 'votes'}`;

            return (
              <div key={i} className={`result-row ${isWinner ? 'winner' : ''}`}>
                <div className="result-row-main">
                  <div className="rank-badge">#{i + 1}</div>
                  <div className="result-candidate-info">
                    <div className="name-line">
                      <span className="result-name">{opt.name}</span>
                      {opt.rollNo && (
                        <span className="result-rollno">{opt.rollNo}</span>
                      )}
                      {isWinner && hasVotes && (
                        <span className="winner-label">
                          <Award size={12} /> {winnerText}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="result-stats-column">
                    <span className="result-percent-bold">{percentage}%</span>
                    <span className="result-votes-count">{votesText}</span>
                  </div>
                </div>

                <div className="progress-bar-bg">
                  <div 
                    className="progress-bar-fill" 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const displayedPolls = Object.values(polls).filter(p => {
    if (currentUser.role === 'teacher') {
      if (filterTab === 'all') return true;
      return p.audience === filterTab;
    }
    return p.audience === 'student';
  });

  return (
    <div className="results-container">
      {/* Background decorations matching the theme */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>

      <header className="glass-header">
        <div className="header-inner">
          <button className="back-btn-premium" onClick={() => navigate(currentUser.role === 'teacher' ? '/teacher' : '/dashboard')}>
            <ArrowLeft size={20} />
          </button>
          <h2 className="header-title">Election Results</h2>
          <div className="spacer"></div>
        </div>
      </header>

      <main className="results-main">
        {currentUser.role === 'teacher' && (
          <div className="results-filter-tabs">
            <button 
              className={`results-tab-btn ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All Elections ({Object.values(polls).length})
            </button>
            <button 
              className={`results-tab-btn ${filterTab === 'teacher' ? 'active' : ''}`}
              onClick={() => setFilterTab('teacher')}
            >
              Faculty Elections ({Object.values(polls).filter(p => p.audience === 'teacher').length})
            </button>
            <button 
              className={`results-tab-btn ${filterTab === 'student' ? 'active' : ''}`}
              onClick={() => setFilterTab('student')}
            >
              Student Elections ({Object.values(polls).filter(p => p.audience === 'student').length})
            </button>
          </div>
        )}

        {displayedPolls.map(poll => renderPollResults(poll))}
      </main>
      <BottomNav />
    </div>
  );
};
export default Results;
