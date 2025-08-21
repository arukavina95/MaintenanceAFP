import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText, 
  Box, 
  Divider 
} from '@mui/material';
import { 
  Dashboard, 
  Assignment, 
  CalendarToday, 
  Notifications, 
  Settings, 
  Engineering,
  Assessment,
  CheckCircle,
  Business
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { designTokens } from '../theme/designSystem';
import authService from '../services/authService';

const menuItems = [
  { text: 'Vijesti', icon: <Notifications />, path: '/obavijesti' },
  { text: 'Dashboard', icon: <Dashboard />, path: '/dashboard' },
  { text: 'Radni nalozi', icon: <Assignment />, path: '/radni-nalozi' },
  { text: 'Zadaci/Ev', icon: <CheckCircle />, path: '/zadaci-ev' },
  { text: 'Planiranje', icon: <Engineering />, path: '/planiranje' },
  { text: 'Kalendar', icon: <CalendarToday />, path: '/kalendar' },
  { text: 'Izvođači', icon: <Business />, path: '/vanjski-izvodaci' },
  { text: 'Admin', icon: <Assessment />, path: '/admin', adminOnly: true },
];

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = authService.getCurrentUser();
  const razinaPristupa = currentUser?.razinaPristupa || 2;

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  // Filtriraj stavke prema razini pristupa
  const filteredMenuItems = menuItems.filter(item => !item.adminOnly || razinaPristupa === 1);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          borderRight: '1px solid',
          borderColor: 'neutral.200',
          backgroundColor: 'white',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
          marginTop: '70px', // Add margin top to account for fixed header
          height: 'calc(100vh - 70px)', // Adjust height to account for header
          overflowY: 'auto', // Allow scrolling if content is too long
        },
      }}
    >
      <List sx={{ pt: 2, px: 2 }}>
        {filteredMenuItems.map((item, index) => (
          <ListItem 
            key={index}
            onClick={() => handleNavigation(item.path)}
            sx={{
              mb: 1,
              borderRadius: designTokens.borderRadius.lg,
              cursor: 'pointer',
              backgroundColor: location.pathname === item.path ? 'primary.50' : 'transparent',
              border: location.pathname === item.path ? '1px solid' : '1px solid transparent',
              borderColor: location.pathname === item.path ? 'primary.200' : 'transparent',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: 'primary.50',
                borderColor: 'primary.200',
                transform: 'translateX(4px)',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
                '& .MuiListItemText-primary': {
                  color: 'primary.main',
                },
              },
            }}
          >
            <ListItemIcon sx={{ 
              color: location.pathname === item.path ? 'primary.main' : 'neutral.600',
              minWidth: 40,
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{
                fontWeight: location.pathname === item.path ? 700 : 600,
                color: location.pathname === item.path ? 'primary.main' : 'neutral.700',
                fontSize: '0.95rem',
              }}
            />
          </ListItem>
        ))}
      </List>

      <Box sx={{ mt: 'auto', p: 3 }}>
        <Divider sx={{ mb: 2, opacity: 0.3 }} />
        <ListItem sx={{ 
          borderRadius: designTokens.borderRadius.lg, 
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: 'neutral.50',
            '& .MuiListItemIcon-root': {
              color: 'neutral.700',
            },
          },
        }}>
          <ListItemIcon sx={{ color: 'neutral.500', minWidth: 40 }}>
            <Settings />
          </ListItemIcon>
          <ListItemText 
            primary="Postavke"
            primaryTypographyProps={{
              fontWeight: 600,
              color: 'neutral.700',
              fontSize: '0.95rem',
            }}
          />
        </ListItem>
      </Box>
    </Drawer>
  );
}; 