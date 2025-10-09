import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import DashboardContent from './dashboard/Dashboard_KPI';
import AdminDashboard from './admin/AdminDashboard';
import Sources from './Sources';
import FilesPage from './FilesPage';
import Settings from './Settings';
import Profile from './Profile';
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import KPIMindmap from './Mapping';
import DashboardLevelSelector from './DashboardLevelSelector';
import PropTypes from 'prop-types';

DashboardLayout.propTypes = {
  user: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired,
  user_role: PropTypes.string,
  fetchUserRole: PropTypes.func.isRequired,
};

function DashboardLayout({ user, loading, user_role, fetchUserRole }) {
  const [activeItem, setActiveItem] = useState(0);
  const [Switch, setSwitch] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    if (user) fetchUserRole(user.id);
  }, [user, fetchUserRole]);

  const CanAccess = user?.is_superuser && Switch;

  const renderContent = () => {
    const contentMap = {
      1: <Settings />,
      2: <Sources />,
      3: <FilesPage />,
      4: <Profile user={user} logout={logout} />,
      5: <KPIMindmap />,
      6: <DashboardLevelSelector />,
    };

    if (activeItem === 0) {
      return CanAccess
        ? <AdminDashboard setSwitch={setSwitch} />
        : <DashboardContent user={user} user_role={user_role} loading={loading} />;
    }

    return contentMap[activeItem] || null;
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-50 transition-all">
        <DashboardHeader
          setSwitch={setSwitch}
          setActiveItem={setActiveItem}
          user={user}
          logout={logout}
        />
      </div>

      {/* Sidebar + Main */}
      <div className="flex flex-1 pt-16">
        <div className="fixed left-0 top-16 bottom-0">
          <DashboardSidebar
            activeItem={activeItem}
            onSelect={setActiveItem}
            is_superuser={user?.is_superuser}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        </div>

        <div className={`flex-1 transition-all ${isSidebarOpen ? 'ml-48' : 'ml-16'}`}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;