import {useState } from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { Bell, Calendar, BarChart2, Clipboard, CheckSquare, Home, ShoppingCart, Users, Folder, Tool, Shield, User, LogOut, Settings } from 'react-feather';
import { useNavigate, useLocation } from 'react-router-dom';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Tooltip from '@mui/material/Tooltip';

interface HeaderProps {
  username: string;
  razinaPristupa?: number;
  onLogout: () => void;
}

const navItems = [
  { label: 'OBAVIJESTI', icon: Bell, path: '/novosti' },
  { label: 'PLANIRANJE', icon: Calendar, path: '/planiranje' },
  { label: 'STATISTIKA', icon: BarChart2, path: '/statistika' },
  { label: 'RADNI NALOZI', icon: Clipboard, path: '/radni-nalozi' },
  { label: 'ZADACI / EV', icon: CheckSquare, path: '/zadaci-ev' },
  { label: 'SKLADIŠTE', icon: Home, path: '/skladiste' },
  { label: 'NARUDŽBE', icon: ShoppingCart, path: '/narudzbe' },
  { label: 'KALENDAR', icon: Calendar, path: '/kalendar' },
  { label: 'IZVOĐAČI', icon: Users, path: '/izvodaci' },
  { label: 'PROJEKTI', icon: Folder, path: '/projekti' },
  { label: 'OPREMA', icon: Tool, path: '/oprema' },
  { label: 'PREVENTIVA', icon: Shield, path: '/preventiva' },
  { label: 'ADMIN', icon: Settings, path: '/admin', adminOnly: true },
];

const Header = ({ username, razinaPristupa, onLogout }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const filteredNavItems = navItems.filter(item => !item.adminOnly || Number(razinaPristupa) === 1);
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);

  return (
    <Box
      component="nav"
      aria-label="Glavna navigacija"
      sx={{
        width: '100%',
        bgcolor: '#fff',
        color: '#222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        p: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1100,
        borderBottom: '1.5px solid #ececec',
      }}
    >
      {/* Logo */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 2 }}>
        <a
          href="http://erga.hr/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ display: 'inline-block', borderRadius: 8 }}
          title="Posjetite službenu stranicu Erga d.o.o."
        >
          <img src="/erga.png" alt="Erga logo" style={{ height: 40, borderRadius: 8, transition: 'box-shadow 0.2s' }} />
        </a>
      </Box>

      {/* Navigation */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          gap: 0.8,
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {filteredNavItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          const IconComponent = item.icon;
          return (
            <Button
              key={index}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              tabIndex={0}
              onClick={() => navigate(item.path)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                textTransform: 'none',
                color: isActive ? '#fff' : '#222',
                bgcolor: isActive ? '#bb1e0f' : 'transparent',
                gap: 0.3,
                minWidth: 60,
                px: 0.7,
                py: 0.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '0.82rem',
                letterSpacing: 0.2,
                transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
                boxShadow: isActive ? 4 : 0,
                position: 'relative',
                overflow: 'hidden',
                outline: isActive ? '2px solid #bb1e0f' : 'none',
                '&:focus': {
                  outline: '2px solid #1976d2',
                  outlineOffset: 2,
                },
                '&:hover': {
                  bgcolor: isActive ? '#96180c' : '#f0f0f0',
                  color: isActive ? '#fff' : '#bb1e0f',
                  transform: 'scale(1.06) translateY(-1px)',
                  boxShadow: 6,
                  zIndex: 2,
                },
                '&:active': {
                  transform: 'scale(0.98)',
                  boxShadow: 2,
                },
              }}
            >
              <IconComponent aria-hidden="true" size={15} />
              <Typography variant="caption" sx={{ fontSize: '0.82rem', fontWeight: 'bold', letterSpacing: 0.2 }}>
                {item.label}
              </Typography>
            </Button>
          );
        })}
      </Box>

      {/* User info and logout */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        <Tooltip title="Prijavljeni korisnik" arrow>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              bgcolor: '#e3f0fc',
              borderRadius: 2,
              px: 2,
              py: 0.7,
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              border: '1.5px solid #bb1e0f',
              fontWeight: 600,
              transition: 'all 0.18s cubic-bezier(.4,2,.6,1)',
              '&:hover': {
                boxShadow: '0 4px 16px rgba(187,30,15,0.13)',
                bgcolor: '#f5f5f5',
                borderColor: '#1976d2',
              },
              cursor: 'default',
            }}
          >
            <User aria-hidden="true" size={20} color="#1976d2" />
            <Typography variant="subtitle1" noWrap sx={{ fontSize: '1rem', fontWeight: 700, letterSpacing: 0.2 }}>
              {username}
            </Typography>
          </Box>
        </Tooltip>
        <IconButton
          color="inherit"
          aria-label="Odjava"
          onClick={() => setOpenLogoutDialog(true)}
          sx={{ ml: 1, color: '#555', '&:hover': { bgcolor: '#f0f0f0' } }}
        >
          <LogOut aria-hidden="true" size={20} />
        </IconButton>
      </Box>

      {/* Logout confirmation dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
      >
        <DialogTitle>Jeste li sigurni da se želite odjaviti?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setOpenLogoutDialog(false)} color="primary">
            Odustani
          </Button>
          <Button
            onClick={() => {
              setOpenLogoutDialog(false);
              onLogout();
            }}
            color="error"
            variant="contained"
          >
            Odjavi se
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Header;