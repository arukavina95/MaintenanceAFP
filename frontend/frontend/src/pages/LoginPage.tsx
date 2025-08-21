import React, { useCallback } from 'react';
import { Box, Container, Typography, Paper, Avatar } from '@mui/material';
import { LockOutlined } from '@mui/icons-material';
import TouchlessRfidTerminal from '../components/TouchlessRfidTerminal';
import { useNavigate } from 'react-router-dom';
import { designTokens } from '../theme/designSystem';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  
  const handleLogin = useCallback((user: any) => {
    onLogin(user);
    navigate('/obavijesti');
  }, [onLogin, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.1)',
          zIndex: 1,
        },
      }}
    >
      <Container maxWidth="md" sx={{ zIndex: 2 }}>
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: designTokens.borderRadius.xl,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: 'primary.main',
                mb: 2,
              }}
            >
              <LockOutlined sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="h4" fontWeight={600} color="neutral.800" gutterBottom>
              Maintenance application
            </Typography>
            <Typography variant="body1" color="neutral.600" textAlign="center" sx={{ mb: 3 }}>
              Prijavite se u sustav za upravljanje održavanjem
            </Typography>
          </Box>
          
          <TouchlessRfidTerminal onLogin={handleLogin} />
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;