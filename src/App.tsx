// Main App Component - Clean architecture with role-based app components
import Login from './components/auth/Login';
import { AdminApp } from './components/apps/AdminApp';
import { ParentApp } from './components/apps/ParentApp';
import { DriverApp } from './components/apps/DriverApp';
import { AppDataProvider } from './contexts/AppDataContext';
import { useAuth } from './hooks';

const App = () => {
  // Authentication using custom hook
  const { user, login, logout, isAuthenticated } = useAuth();

  // Handle login with actual username/password validation
  const handleLogin = async (username: string, password: string) => {
    console.log('Login attempt:', { username, password });
    const result = await login(username, password);
    console.log('Login result:', result, 'User:', user);
    return result;
  };

  // Show login screen if not authenticated
  if (!isAuthenticated || !user) {
    return <Login onLogin={handleLogin} />;
  }

  // Route to appropriate app based on user role with access control
  const renderApp = () => {
    // Security check: ensure user has valid role
    if (!user.role || !['admin', 'parent', 'driver'].includes(user.role)) {
      logout(); // Force logout if invalid role
      return <Login onLogin={handleLogin} />;
    }

    switch (user.role) {
      case 'admin':
        return <AdminApp user={user} onLogout={logout} />;
      case 'parent':
        return <ParentApp user={user} onLogout={logout} />;
      case 'driver':
        return <DriverApp user={user} onLogout={logout} />;
      default:
        // Fallback to logout if role is not recognized
        logout();
        return <Login onLogin={handleLogin} />;
    }
  };

  return (
    <AppDataProvider>
      {renderApp()}
    </AppDataProvider>
  );
};

export default App;