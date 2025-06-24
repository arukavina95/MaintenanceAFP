import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import GroupsIcon from '@mui/icons-material/Groups';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import BuildIcon from '@mui/icons-material/Build';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import { useNavigate, useLocation } from 'react-router-dom';

interface HeaderProps {
  username: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'OBAVIJESTI', icon: NotificationsIcon, path: '/news' },
    { label: 'PLANIRANJE', icon: EventNoteIcon, path: '/planiranje' },
    { label: 'STATISTIKA', icon: AssessmentIcon, path: '/statistics' },
    { label: 'RADNI NALOZI', icon: AssignmentIcon, path: '/work-orders' },
    { label: 'ZADACI / EV', icon: CheckBoxIcon, path: '/tasks-ev' },
    { label: 'SKLADIŠTE', icon: WarehouseIcon, path: '/warehouse' },
    { label: 'NARUDŽBE', icon: ShoppingCartIcon, path: '/orders' },
    { label: 'KALENDAR', icon: CalendarMonthIcon, path: '/calendar' },
    { label: 'IZVOĐAČI', icon: GroupsIcon, path: '/executors' },
    { label: 'PROJEKTI', icon: FolderOpenIcon, path: '/projects' },
    { label: 'OPREMA', icon: BuildIcon, path: '/equipment' },
    { label: 'PREVENTIVA', icon: HealthAndSafetyIcon, path: '/preventive' },
    { label: 'ADMIN', icon: AdminPanelSettingsIcon, path: '/admin' },
  ];

  return (
    <Box
      sx={{
        width: '100%',
        bgcolor: '#ffffff', // White background
        color: '#333', // Dark text color
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)', // Softer shadow
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1100,
      }}
    >
      {/* Left section: Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#bb1e0f' }}>ERGA</Typography>
      </Box>

      {/* Center section: Navigation links */}
      <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Button
              key={index}
              onClick={() => navigate(item.path)}
              sx={{
                display: 'flex',
                flexDirection: 'row', // Horizontal layout
                alignItems: 'center',
                textTransform: 'none',
                color: isActive ? 'white' : '#555',
                bgcolor: isActive ? '#bb1e0f' : 'transparent',
                gap: 0.5,
                minWidth: 90, // Slightly wider for horizontal layout
                px: 1,
                py: 0.8, // Increased vertical padding
                borderRadius: 1,
                transition: 'background-color 0.2s, color 0.2s',
                '&:hover': {
                  bgcolor: isActive ? '#96180c' : '#f0f0f0', // Darker on hover for active, light gray for inactive
                  color: isActive ? 'white' : '#333',
                },
              }}
            >
              <IconComponent sx={{ fontSize: '1.2rem' }} /> {/* Slightly smaller icon */}
              <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                {item.label}
              </Typography>
            </Button>
          );
        })}
      </Box>

      {/* Right section: User info and logout */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: 1, px: 1, py: 0.5 }}>
          <PersonIcon sx={{ verticalAlign: 'middle', color: '#555', fontSize: '1.2rem' }} />
          <Typography variant="subtitle1" noWrap sx={{ fontSize: '0.9rem' }}>{username}</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: 1, px: 1, py: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>0</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: '#f5f5f5', borderRadius: 1, px: 1, py: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>0</Typography>
        </Box>
        <IconButton color="inherit" onClick={onLogout} sx={{ ml: 1, color: '#555', '&:hover': { bgcolor: '#f0f0f0' } }}>
          <ExitToAppIcon sx={{ fontSize: '1.5rem' }} />
        </IconButton>
      </Box>
    </Box>
  );
};

export default Header;