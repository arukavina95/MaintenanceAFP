import {  useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ObavijestiPage from './pages/ObavijestiPage';
import Header from './components/Header';
import AdminPage from './pages/AdminPage';
import { Box } from '@mui/material';
import authService from './services/authService';
import { PlaniranjePage } from './pages/PlaniranjePage';
import KalendarPage from './pages/Kalendar';



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
      {isLoggedIn && (
        <Header username={user?.korisnik || ''} razinaPristupa={user?.razinaPristupa} onLogout={handleLogout} />
      )}
      <Box component="main" sx={{ mt: '64px' }}>
        <Routes>
          {!isLoggedIn ? (
            <Route path="*" element={<LoginPage onLogin={handleLogin} />} />
          ) : (
            <>
              <Route path="/news" element={<ObavijestiPage username={user?.korisnik || ''} razinaPristupa={user?.razinaPristupa} onLogout={handleLogout} />} />
              <Route path="/admin" element={<AdminPage user={user} username={user?.korisnik || ''} onLogout={handleLogout} />} />
              <Route path="/planiranje" element={<PlaniranjePage username={user?.korisnik || ''} razinaPristupa={user?.razinaPristupa} onLogout={handleLogout}/>} />
              <Route path="/kalendar" element={<KalendarPage  />} />
              <Route path="/" element={<Navigate to="/news" />} />
              <Route path="*" element={<Navigate to="/news" />} />
            </>
          )}
        </Routes>
      </Box>
    </Router>
  );
}

export default App;