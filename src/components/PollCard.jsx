import { Clock, CheckCircle2, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePolls } from '../context/PollContext';
import './PollCard.css';

const PollCard = ({ poll }) => {
  const navigate = useNavigate();
  const { hasVoted } = usePolls();
  const voted = hasVoted(poll.id);

  // Determine category label
  let categoryTag = 'General Election';
  if (poll.title?.toLowerCase().includes('cr') || poll.title?.toLowerCase().includes('class representative')) {
    categoryTag = 'CR Election';
  } else if (poll.title?.toLowerCase().includes('gr') || poll.title?.toLowerCase().includes('girls representative')) {
    categoryTag = 'GR Election';
  } else if (poll.audience === 'teacher' || poll.title?.toLowerCase().includes('faculty')) {
    categoryTag = 'Faculty Election';
  }

  const isLive = poll.status === 'LIVE';

  return (
    <div className={`poll-card ${voted ? 'poll-card-voted' : ''}`}>
      <div className="poll-card-top">
        <span className="poll-category-chip">{categoryTag}</span>
        <div className={`poll-live-pill ${!isLive ? 'pill-ended' : ''}`}>
          <span className="pulse-dot"></span>
          <span>{isLive ? 'Active' : poll.status}</span>
        </div>
      </div>

      <div className="poll-content">
        <h4 className="poll-title">{poll.title}</h4>
        
        <div className="poll-meta-row">
          <div className="poll-meta-item">
            <Clock size={15} className="meta-icon" />
            <span>{poll.expiry || 'Closes 5:00 PM'}</span>
          </div>
          {poll.options && (
            <div className="poll-meta-item">
              <Users size={15} className="meta-icon" />
              <span>{poll.options.length} Candidates</span>
            </div>
          )}
        </div>
      </div>

      <div className="poll-card-footer">
        {voted ? (
          <div className="voted-status-strip">
            <span className="voted-chip">
              <CheckCircle2 size={16} /> Ballot Cast Successfully
            </span>
            <button 
              className="vote-button voted-btn" 
              onClick={() => navigate(`/vote/${poll.id}`)}
            >
              <span>View Ballot Details</span>
            </button>
          </div>
        ) : (
          <button 
            className="vote-button action-btn" 
            onClick={() => navigate(`/vote/${poll.id}`)}
          >
            <span>Cast Your Vote</span>
            <ArrowRight size={17} className="btn-arrow" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PollCard;
