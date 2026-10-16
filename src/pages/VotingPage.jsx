import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Vote, BadgeCheck, AlertCircle } from 'lucide-react';
import { usePolls } from '../context/PollContext';
import BottomNav from '../components/BottomNav';
import './VotingPage.css';

import { useEffect } from 'react';

const VotingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { polls, castVote, hasVoted, currentUser } = usePolls();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!currentUser || currentUser.id === 'guest') {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  const returnPath = currentUser.role === 'teacher' ? '/teacher' : '/dashboard';

  const poll = polls[id];
  const alreadyVoted = hasVoted(id);
  const isLive = poll?.status === 'LIVE';
  const isAudienceMismatch = poll?.audience && poll.audience !== currentUser.role;

  if (!poll) {
    return (
      <div className="voting-container not-found">
        <h2>Poll not found</h2>
        <button onClick={() => navigate(returnPath)} className="back-btn-simple">Back to Dashboard</button>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (selectedOption !== null && !alreadyVoted && isLive && !isAudienceMismatch && !isSubmitting) {
      setIsSubmitting(true);
      setErrorMsg('');
      const result = await castVote(id, selectedOption);
      setIsSubmitting(false);
      if (result && result.success) {
        setSubmitted(true);
        setTimeout(() => navigate(returnPath), 2500);
      } else {
        setErrorMsg(result?.message || 'Vote could not be submitted');
      }
    }
  };

  return (
    <div className="voting-container">
      {/* Glassmorphism Header */}
      <header className="glass-header">
        <div className="header-inner">
          <button className="back-btn-premium" onClick={() => navigate(returnPath)} aria-label="Go Back">
            <ArrowLeft size={20} />
          </button>
          <div className="header-logo-premium">
            <div className="logo-icon-bg">
              <Vote size={18} className="logo-icon" />
            </div>
            <span className="logo-text">QuickPoll</span>
          </div>
          <div className="spacer"></div>
        </div>
      </header>

      <main className="voting-main">
        {submitted ? (
          <div className="success-state-modern">
            <div className="success-blob">
              <CheckCircle2 size={72} strokeWidth={1.5} className="success-icon-modern" />
            </div>
            <h3>Vote Confirmed!</h3>
            <p>Your anonymously verified vote has been recorded securely.</p>
            <div className="loading-bar-container">
              <div className="loading-bar"></div>
            </div>
            <p className="redirect-text-modern">Redirecting to dashboard...</p>
          </div>
        ) : (
          <div className="voting-card-modern">
            <div className="poll-info-modern">
              <div className="poll-badges-row">
                <span className="poll-cat-tag">
                  {poll.title?.toLowerCase().includes('cr') || poll.title?.toLowerCase().includes('class representative') ? 'CR Election' :
                   poll.title?.toLowerCase().includes('gr') || poll.title?.toLowerCase().includes('girls representative') ? 'GR Election' :
                   poll.audience === 'teacher' ? 'Faculty Election' : 'General Ballot'}
                </span>
                <div className={`badge-modern ${!isLive ? 'badge-ended' : ''}`}>
                  <span className="live-dot-mini"></span>
                  {isLive ? 'LIVE ELECTION' : 'CLOSED / PAUSED'}
                </div>
              </div>

              <h1 className="poll-title-modern">{poll.title}</h1>

              {isAudienceMismatch ? (
                <div className="eligibility-alert-badge">
                  <AlertCircle size={18} />
                  <span>Only {poll.audience === 'teacher' ? 'Faculty Members' : 'Students'} are eligible to vote in this election</span>
                </div>
              ) : alreadyVoted ? (
                <div className="already-voted-badge">
                  <CheckCircle2 size={18} />
                  <span>Your ballot has already been securely cast for this election</span>
                </div>
              ) : (
                <p className="subtitle-modern">Review the candidates below and choose your representative</p>
              )}
              
              <div className="timeline-wrapper">
                {isLive && <div className="expiry-indicator"></div>}
                <span className="poll-expiry-text">
                  {isLive ? `Total Registered Voters: ${poll.totalEligible}` : 'Voting is currently closed'}
                </span>
              </div>
            </div>

            <div className={`candidates-grid ${alreadyVoted || !isLive || isAudienceMismatch ? 'disabled-grid' : ''}`}>
              {poll.options.map((option, index) => {
                const isSelected = selectedOption === index;
                return (
                  <div 
                    key={index} 
                    className={`candidate-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (!alreadyVoted && isLive && !isAudienceMismatch) setSelectedOption(index);
                    }}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="candidate-card-bg"></div>
                    
                    <div className="candidate-avatar">
                      {option.initials}
                    </div>
                    
                    <div className="candidate-details">
                      <div className="candidate-name-wrapper">
                        <span className="candidate-name">{option.name}</span>
                        {isSelected && <BadgeCheck size={19} className="verified-badge-icon" />}
                      </div>
                      {option.rollNo && (
                        <span className="candidate-rollno">{option.rollNo}</span>
                      )}
                    </div>

                    {!alreadyVoted && isLive && !isAudienceMismatch && (
                      <div className={`custom-radio-modern ${isSelected ? 'active' : ''}`}>
                        <div className="radio-inner"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="action-area">
              {errorMsg && (
                <div className="error-alert-banner">
                  <AlertCircle size={18} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <button 
                className={`submit-btn-premium ${selectedOption !== null && !alreadyVoted && isLive && !isAudienceMismatch && !isSubmitting ? 'ready' : ''}`}
                disabled={selectedOption === null || alreadyVoted || !isLive || isAudienceMismatch || isSubmitting}
                onClick={handleSubmit}
              >
                <span>
                  {isSubmitting ? 'Verifying & Recording Ballot...' : 
                   isAudienceMismatch ? 'Not Eligible For This Poll' : 
                   alreadyVoted ? 'Ballot Already Recorded ✓' : 
                   !isLive ? 'Election Closed' : 
                   selectedOption === null ? 'Select Candidate to Vote' : 
                   'Confirm & Cast Ballot'}
                </span>
                {!alreadyVoted && isLive && !isAudienceMismatch && !isSubmitting && selectedOption !== null && <div className="btn-glow"></div>}
              </button>
              
              {!alreadyVoted && isLive && !isAudienceMismatch && (
                <p className="vote-warning-modern">
                  <span className="lock-icon">🔒</span> Single verified ballot. Once cast, your choice cannot be altered.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
      
      {/* Ambient background decoration */}
      <div className="ambient-orb orb-1"></div>
      <div className="ambient-orb orb-2"></div>
      <BottomNav />
    </div>
  );
};

export default VotingPage;
