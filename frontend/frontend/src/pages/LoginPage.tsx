import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import LoginForm from '../components/LoginForm';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
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
        <LoginForm onLogin={onLogin} />
      </Container>
    </Box>
  );
};

export default LoginPage;