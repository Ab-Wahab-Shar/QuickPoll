import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Vote, ArrowRight, Lock, User, ShieldCheck, Eye, EyeOff, Sparkles, GraduationCap, Briefcase } from 'lucide-react';
import { usePolls } from '../context/PollContext';
import './Login.css';

const Login = () => {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [roleType, setRoleType] = useState('student');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = usePolls();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (studentId.trim() && password) {
      setIsLoading(true);
      try {
        const user = await login(studentId.trim(), roleType, password);
        if (user && user.role === 'teacher') {
          navigate('/teacher');
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Login failed:", err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="login-wrapper">
      {/* Ambient background decorations */}
      <div className="login-ambient orb-left"></div>
      <div className="login-ambient orb-right"></div>
      <div className="login-ambient orb-bottom"></div>

      <div className="login-glass-card">
        <div className="login-left-panel">
          <div className="brand-header">
            <div className="brand-logo-container">
              <Vote size={30} className="brand-logo" />
            </div>
            <div>
              <h1 className="brand-title">QuickPoll</h1>
              <span className="brand-tagline">Campus Voting System</span>
            </div>
          </div>
          
          <div className="login-hero-text">
            <h2>Your Voice.<br />Your Campus.<br /><span className="highlight-text">Your Vote.</span></h2>
            <p>A secure, transparent, and verified digital ballot designed for university representation.</p>
          </div>

          <div className="feature-badges">
            <span className="badge"><ShieldCheck size={16}/> Verified Ballot</span>
            <span className="badge"><Lock size={16}/> End-to-End Secure</span>
            <span className="badge"><Sparkles size={16}/> Realtime Auditing</span>
          </div>
        </div>

        <div className="login-right-panel">
          <div className="form-header">
            <h3>Welcome Back</h3>
            <p>Select your account role to access elections.</p>
          </div>
          
          <div className="role-toggle-container">
            <button 
              type="button"
              className={`role-tab ${roleType === 'student' ? 'active' : ''}`}
              onClick={() => { setRoleType('student'); setStudentId(''); }}
            >
              <GraduationCap size={18} />
              <span>Student</span>
            </button>
            <button 
              type="button"
              className={`role-tab ${roleType === 'teacher' ? 'active' : ''}`}
              onClick={() => { setRoleType('teacher'); setStudentId(''); }}
            >
              <Briefcase size={18} />
              <span>Faculty Member</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="login-form-modern">
            <div className="input-group-modern">
              <label htmlFor="studentId">{roleType === 'teacher' ? 'Faculty Member ID' : 'University Roll Number'}</label>
              <div className="input-wrapper">
                <User size={19} className="input-icon" />
                <input 
                  type="text" 
                  id="studentId" 
                  placeholder={roleType === 'teacher' ? "e.g. T-01 or teacher" : "e.g. STU-TEST-001"}
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  autoComplete="username"
                  required 
                />
              </div>
            </div>
            
            <div className="input-group-modern">
              <label htmlFor="password">Security PIN / Password</label>
              <div className="input-wrapper">
                <Lock size={19} className="input-icon" />
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required 
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" defaultChecked />
                <span>Remember on this device</span>
              </label>
              <a href="#" onClick={(e) => e.preventDefault()} className="forgot-link">Need help?</a>
            </div>
            
            <button type="submit" className="login-submit-btn" disabled={isLoading}>
              <span>{isLoading ? 'Signing In...' : 'Sign In to Portal'}</span>
              <ArrowRight size={19} className="btn-icon" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
