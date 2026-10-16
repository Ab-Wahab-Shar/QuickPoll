import { LayoutDashboard, BarChart2, User } from 'lucide-react';
import { useLocation, Link } from 'react-router-dom';
import { usePolls } from '../context/PollContext';
import './BottomNav.css';

const BottomNav = () => {
  const location = useLocation();
  const { currentUser } = usePolls();

  const isTeacher = currentUser?.role === 'teacher' || 
    currentUser?.id?.toUpperCase()?.startsWith('T-') || 
    currentUser?.id?.toUpperCase() === 'ADMIN' || 
    currentUser?.id?.toLowerCase() === 'teacher';

  const homePath = isTeacher ? '/teacher' : '/dashboard';

  const navItems = [
    { path: homePath, label: 'Home', icon: LayoutDashboard },
    { path: '/results', label: 'Results', icon: BarChart2 },
    { path: '/profile', label: 'Profile', icon: User }
  ];

  return (
    <nav className="shared-bottom-nav" aria-label="Bottom Navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isHome = item.path === homePath;
        const isActive = isHome 
          ? (location.pathname === '/dashboard' || location.pathname === '/teacher')
          : location.pathname.startsWith(item.path);

        return (
          <Link
            key={item.label}
            to={item.path}
            className={`nav-item ${isActive ? 'active' : ''}`}
            title={item.label}
          >
            <Icon size={22} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;
