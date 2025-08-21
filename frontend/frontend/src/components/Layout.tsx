import React from 'react';
import { Box } from '@mui/material';
import { useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import Header from './Header';
import authService from '../services/authService';

// Map routes to page names
const getPageName = (pathname: string): string => {
  switch (pathname) {
    case '/obavijesti':
      return 'Vijesti';
    case '/dashboard':
      return 'Dashboard';
    case '/radni-nalozi':
      return 'Radni nalozi';
    case '/zadaci-ev':
      return 'Zadaci/Ev';
    case '/planiranje':
      return 'Planiranje';
    case '/kalendar':
      return 'Kalendar';
    case '/admin':
      return 'Admin';
    default:
      return '';
  }
};

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = authService.getCurrentUser();
  const location = useLocation();
  const currentPage = getPageName(location.pathname);

  const handleLogout = () => {
    authService.logout();
    window.location.reload();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      
      <Box sx={{ flexGrow: 1, mt: '70px' }}> {/* Add margin top to account for fixed header */}
        <Header 
          username={currentUser?.ime || 'Korisnik'}
          razinaPristupa={currentUser?.razinaPristupa}
          onLogout={handleLogout}
          currentPage={currentPage}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            backgroundColor: 'neutral.50', 
            minHeight: 'calc(100vh - 70px)', // Adjust height to account for header
            pt: 1,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}; 