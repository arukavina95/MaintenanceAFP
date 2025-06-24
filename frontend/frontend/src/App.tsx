import {  useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ObavijestiPage from './pages/ObavijestiPage';
import Header from './components/Header';
import AdminPage from './pages/AdminPage';
import { Box } from '@mui/material';
import authService from './services/authService';
import { PlaniranjePage } from './pages/PlaniranjePage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setUsername(user.username);
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = (user: string) => {
    setUsername(user);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setUsername('');
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <Router>
      <Header username={username} onLogout={handleLogout} />
      <Box component="main" sx={{ mt: '64px' }}>
        <Routes>
          <Route path="/news" element={<ObavijestiPage username={username} onLogout={handleLogout} />} />
          <Route path="/admin" element={<AdminPage username={username} onLogout={handleLogout} />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
          <Route path="/planiranje" element={<PlaniranjePage username={username} onLogout={handleLogout}/>} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;