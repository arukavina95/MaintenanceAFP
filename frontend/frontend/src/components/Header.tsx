import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  Badge, 
  Avatar, 
  Menu, 
  MenuItem, 
  Divider,
  Fade
} from '@mui/material';
import { 
  Notifications,
  Search,
  Person,
  Logout as LogOut, 
  Settings,
  KeyboardArrowDown as ChevronDown,
  Security,
} from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

interface HeaderProps {
  username: string;
  razinaPristupa?: number;
  onLogout: () => void;
  currentPage?: string; // Added for dynamic page title
}

const Header = ({ username, razinaPristupa, onLogout, currentPage }: HeaderProps) => {
  
  const [openLogoutDialog, setOpenLogoutDialog] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <>
      <Box
        component="header"
        sx={{
          width: '100%',
          bgcolor: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.06)' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1200,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: scrolled 
            ? '0 2px 12px rgba(0, 0, 0, 0.06)' 
            : '0 1px 4px rgba(0, 0, 0, 0.02)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: { xs: 2, md: 4 },
            py: 1.5,
            height: '70px',
            maxWidth: '1920px',
            mx: 'auto',
          }}
        >
          {/* Logo Section - Improved spacing and sizing */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Fade in timeout={600}>
              <Box
                component="a"
                href="http://erga.hr/"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none',
                  transition: 'transform 0.2s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <img 
                  src="/erga.png" 
                  alt="Erga logo" 
                  style={{ 
                    height: 36, 
                    borderRadius: 6,
                    filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.08))'
                  }} 
                />
              </Box>
            </Fade>

            {/* App Branding - Reduced size and improved spacing */}
            <Fade in timeout={800}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* App Title and Subtitle - Clean typography without gradients */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: 'neutral.800',
                        letterSpacing: '-0.3px',
                        display: { xs: 'none', sm: 'block' },
                        lineHeight: 1.2,
                      }}
                    >
                      Maintenance Application
                    </Typography>
                    {currentPage && (
                      <>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 400,
                            color: 'neutral.500',
                            letterSpacing: '-0.3px',
                            display: { xs: 'none', sm: 'block' },
                            lineHeight: 1.2,
                          }}
                        >
                          |
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 500,
                            color: 'primary.main',
                            letterSpacing: '-0.3px',
                            display: { xs: 'none', sm: 'block' },
                            lineHeight: 1.2,
                          }}
                        >
                          {currentPage}
                        </Typography>
                      </>
                    )}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'neutral.600',
                      fontWeight: 500,
                      letterSpacing: '0.3px',
                      display: { xs: 'none', md: 'block' },
                      textTransform: 'uppercase',
                      fontSize: '0.65rem',
                    }}
                  >
                    Upravljanje održavanjem
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>

          {/* Right Section - Unified container for all right-side elements */}
          <Fade in timeout={1200}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* Status Indicators - Moved to right, more subtle */}
              <Box sx={{ 
                display: { xs: 'none', lg: 'flex' }, 
                alignItems: 'center', 
                gap: 2,
                mr: 2,
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'success.main',
                      boxShadow: '0 0 4px rgba(76, 175, 80, 0.4)',
                    }}
                  />
                  <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 500, fontSize: '0.7rem' }}>
                    Online
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  <Security sx={{ fontSize: 14, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ color: 'neutral.600', fontWeight: 500, fontSize: '0.7rem' }}>
                    Secure
                  </Typography>
                </Box>
              </Box>

              {/* Unified Icon Buttons */}
              <IconButton
                sx={{
                  bgcolor: 'rgba(25, 118, 210, 0.06)',
                  color: 'primary.main',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Badge badgeContent={4} color="error" max={99}>
                  <Notifications sx={{ fontSize: 18 }} />
                </Badge>
              </IconButton>

              <IconButton
                sx={{
                  bgcolor: 'rgba(0, 0, 0, 0.03)',
                  color: 'text.secondary',
                  width: 40,
                  height: 40,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.06)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <Search sx={{ fontSize: 18 }} />
              </IconButton>

              {/* User Menu - Compact and clean */}
              <Button
                onClick={handleUserMenuOpen}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2,
                  bgcolor: 'rgba(25, 118, 210, 0.06)',
                  color: 'primary.main',
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    bgcolor: 'rgba(25, 118, 210, 0.1)',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: 'primary.main',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {getUserInitials(username)}
                </Avatar>
                <Typography sx={{ fontWeight: 600, fontSize: '0.8rem' }}>
                  {username}
                </Typography>
                <ChevronDown sx={{ fontSize: 14 }} />
              </Button>
            </Box>
          </Fade>
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 220,
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            border: '1px solid rgba(0,0,0,0.08)',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleUserMenuClose} sx={{ py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: 'primary.main',
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              {getUserInitials(username)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {razinaPristupa === 1 ? 'Administrator' : 'Korisnik'}
              </Typography>
            </Box>
          </Box>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleUserMenuClose}>
          <Person sx={{ mr: 2, fontSize: 18 }} />
          Profil
        </MenuItem>
        <MenuItem onClick={handleUserMenuClose}>
          <Settings sx={{ mr: 2, fontSize: 18 }} />
          Postavke
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => {
            handleUserMenuClose();
            setOpenLogoutDialog(true);
          }}
          sx={{ color: 'error.main' }}
        >
          <LogOut sx={{ mr: 2, fontSize: 18 }} />
          Odjavi se
        </MenuItem>
      </Menu>

      {/* Logout Dialog */}
      <Dialog
        open={openLogoutDialog}
        onClose={() => setOpenLogoutDialog(false)}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.08)',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Potvrda odjave
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography color="text.secondary">
            Jeste li sigurni da se želite odjaviti iz aplikacije?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
          <Button
            onClick={() => setOpenLogoutDialog(false)}
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Odustani
          </Button>
          <Button
            onClick={() => {
              setOpenLogoutDialog(false);
              onLogout();
            }}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2 }}
          >
            Odjavi se
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Header;