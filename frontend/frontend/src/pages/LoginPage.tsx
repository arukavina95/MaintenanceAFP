import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const navigate = useNavigate();
  const handleLogin = useCallback((user: any) => {
    onLogin(user);
    if (user.razinaPristupa === 1) {
      navigate('/admin');
    } else {
      navigate('/news');
    }
  }, [onLogin, navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100vw',
        backgroundColor: '#f5f6fa',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="xs" sx={{ zIndex: 2 }}>
        <Typography variant="h4" align="center" gutterBottom color="#bb1e0f">
          PRIJAVA KORISNIKA
        </Typography>
        <LoginForm onLogin={handleLogin} />
      </Container>
    </Box>
  );
};

export default LoginPage;