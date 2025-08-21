import {  useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ObavijestiPage from './pages/ObavijestiPage';
import AdminPage from './pages/AdminPage';
import authService from './services/authService';
import { PlaniranjePage } from './pages/PlaniranjePage';
import KalendarPage from './pages/Kalendar';
import RadniNaloziPage from './pages/RadniNaloziPage';
import ZadaciEvPage from './pages/ZadaciEvPage';
import IzvodaciPage from './pages/IzvodaciPage';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

// Komponenta za zaštitu ruta
const ProtectedRoute: React.FC<{ 
  element: React.ReactElement; 
  adminOnly?: boolean; 
  user: any; 
}> = ({ element, adminOnly = false, user }) => {
  if (adminOnly && user?.razinaPristupa !== 1) {
    return <Navigate to="/obavijesti" replace />;
  }
  return element;
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userObj = authService.getCurrentUser();
    if (userObj) {
      setUser(userObj);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (userObj: any) => {
    if (userObj) {
      if (userObj.user) {
        setUser(userObj.user);
      } else {
        setUser(userObj);
      }
      setIsLoggedIn(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <Router>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <Layout>
          <ErrorBoundary>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/obavijesti" element={<ObavijestiPage />} />
              <Route path="/admin" element={<ProtectedRoute element={<AdminPage user={user} />} adminOnly={true} user={user} />} />
              <Route path="/planiranje" element={<PlaniranjePage />} />
              <Route path="/kalendar" element={<KalendarPage  />} />
              <Route path="/radni-nalozi" element={<RadniNaloziPage />} />
              <Route path="/zadaci-ev" element={<ZadaciEvPage />} />
              <Route path="/vanjski-izvodaci" element={<IzvodaciPage />} />
              <Route path="/" element={<Navigate to="/obavijesti" />} />
              <Route path="*" element={<Navigate to="/obavijesti" />} />
            </Routes>
          </ErrorBoundary>
        </Layout>
      )}
    </Router>
  );
}

export default App;