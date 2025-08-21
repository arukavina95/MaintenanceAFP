import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  CircularProgress, 
  Fade, 
  Zoom,
  Chip,
  Alert,
  IconButton,
  Button,
  TextField,
  InputAdornment,
  Divider
} from '@mui/material';
import RfidIcon from '@mui/icons-material/Nfc';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import { useRfidReader } from '../hooks/useRfidReader';
import authService from '../services/authService';
import { AxiosError } from 'axios';
import { designTokens } from '../theme/designSystem';

interface TouchlessRfidTerminalProps {
  onLogin: (user: any) => void;
}

const TouchlessRfidTerminal: React.FC<TouchlessRfidTerminalProps> = ({ onLogin }) => {
  const { rfidCode, isReading, clearRfidCode } = useRfidReader();
  const [scanStatus, setScanStatus] = useState<'ready' | 'scanning' | 'success' | 'error'>('ready');
  const [lastCard, setLastCard] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [scanCount, setScanCount] = useState(0);
  const [showClassicLogin, setShowClassicLogin] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRfidLogin = useCallback(async (cardNumber: string) => {
    setScanStatus('scanning');
    setLastCard(cardNumber);
    setError(null);
    setScanCount(prev => prev + 1);

    try {
      const response = await authService.rfidLogin(cardNumber);
      setScanStatus('success');
      
      // Automatski prijava nakon uspješnog skeniranja
      setTimeout(() => {
        onLogin(response.user);
      }, 1500);
      
    } catch (err: unknown) {
      setScanStatus('error');
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Neispravan broj kartice!');
      } else {
        setError('Greška pri čitanju kartice');
      }
      
      // Reset nakon greške
      setTimeout(() => {
        setScanStatus('ready');
        setError(null);
      }, 3000);
    }
  }, [onLogin]);

  const handleClassicLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login({ username, password });
      onLogin(response.user);
    } catch (err: unknown) {
      if (err instanceof AxiosError) {
        setError(err.response?.data?.message || 'Pogrešno korisničko ime ili lozinka!');
      } else {
        setError('Došlo je do nepoznate pogreške.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (rfidCode && !isReading) {
      handleRfidLogin(rfidCode);
      clearRfidCode();
    }
  }, [rfidCode, isReading, clearRfidCode, handleRfidLogin]);

  const handleReset = () => {
    setScanStatus('ready');
    setError(null);
    setScanCount(0);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const getStatusContent = () => {
    switch (scanStatus) {
      case 'ready':
        return (
          <Zoom in={true} timeout={800}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  border: '3px solid',
                  borderColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '2px solid',
                    borderColor: 'primary.light',
                    animation: 'pulse 2s infinite',
                  },
                  '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 1 },
                    '50%': { transform: 'scale(1.1)', opacity: 0.5 },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                  },
                }}
              >
                <RfidIcon sx={{ fontSize: 48, color: 'primary.main' }} />
              </Box>
              <Typography variant="h5" color="primary.main" gutterBottom fontWeight="bold">
                Priložite karticu
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Automatski će se očitati i prijaviti
              </Typography>
              <Chip 
                label={`Skeneri: ${scanCount}`} 
                color="primary" 
                variant="outlined"
                size="small"
              />
            </Box>
          </Zoom>
        );

      case 'scanning':
        return (
          <Fade in={true} timeout={300}>
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress 
                size={80} 
                thickness={4}
                sx={{ 
                  mb: 3,
                  color: 'primary.main',
                  '& .MuiCircularProgress-circle': {
                    strokeLinecap: 'round',
                  },
                }} 
              />
              <Typography variant="h6" color="primary.main" gutterBottom>
                Čitanje kartice...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Molimo pričekajte
              </Typography>
            </Box>
          </Fade>
        );

      case 'success':
        return (
          <Zoom in={true} timeout={500}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: 'success.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  animation: 'successPulse 0.6s ease-out',
                  '@keyframes successPulse': {
                    '0%': { transform: 'scale(0.8)', opacity: 0 },
                    '50%': { transform: 'scale(1.1)' },
                    '100%': { transform: 'scale(1)', opacity: 1 },
                  },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h6" color="success.main" gutterBottom fontWeight="bold">
                Uspješna prijava!
              </Typography>
              <Chip 
                label={`Kartica: ${lastCard}`} 
                color="success" 
                variant="outlined"
                sx={{ mb: 1 }}
              />
              <Typography variant="body2" color="text.secondary">
                Preusmjeravanje...
              </Typography>
            </Box>
          </Zoom>
        );

      case 'error':
        return (
          <Fade in={true} timeout={300}>
            <Box sx={{ textAlign: 'center' }}>
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  backgroundColor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 3,
                  animation: 'errorShake 0.5s ease-in-out',
                  '@keyframes errorShake': {
                    '0%, 100%': { transform: 'translateX(0)' },
                    '25%': { transform: 'translateX(-5px)' },
                    '75%': { transform: 'translateX(5px)' },
                  },
                }}
              >
                <ErrorIcon sx={{ fontSize: 48, color: 'white' }} />
              </Box>
              <Typography variant="h6" color="error.main" gutterBottom fontWeight="bold">
                Greška pri prijavi
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Pokušajte ponovno
              </Typography>
              <IconButton 
                onClick={handleReset}
                color="primary"
                sx={{ 
                  border: '1px solid',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                  },
                }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          </Fade>
        );
    }
  };

  if (showClassicLogin) {
    return (
      <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ width: '100%', mb: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        <Paper
          elevation={8}
          sx={{
            p: 4,
            borderRadius: designTokens.borderRadius.xl,
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: 'background.paper',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            minHeight: 300,
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h5" color="primary.main" gutterBottom fontWeight="bold">
              Klasična prijava
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Unesite korisničko ime i lozinku
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleClassicLogin} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Korisničko ime"
              variant="outlined"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon color="action" />
                  </InputAdornment>
                ),
              }}
              required
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: designTokens.borderRadius.lg,
                },
              }}
            />
            <TextField
              label="Lozinka"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <LockIcon /> : <LockIcon color="action" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              required
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: designTokens.borderRadius.lg,
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              startIcon={<LoginIcon />}
              sx={{ 
                fontWeight: 600, 
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: designTokens.borderRadius.lg,
                boxShadow: designTokens.shadows.md,
                '&:hover': {
                  boxShadow: designTokens.shadows.lg,
                },
              }}
              disabled={loading}
            >
              {loading ? 'Prijava u tijeku...' : 'Prijava'}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                ili
              </Typography>
            </Divider>
            
            <Button
              variant="outlined"
              color="primary"
              size="large"
              fullWidth
              startIcon={<RfidIcon />}
              onClick={() => setShowClassicLogin(false)}
              sx={{ 
                fontWeight: 600, 
                py: 1.5,
                borderRadius: designTokens.borderRadius.lg,
                borderWidth: 2,
                '&:hover': {
                  borderWidth: 2,
                },
              }}
            >
              Povratak na RFID prijavu
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', maxWidth: 400, mx: 'auto' }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ width: '100%', mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      <Paper
        elevation={8}
        sx={{
          p: 4,
          borderRadius: designTokens.borderRadius.xl,
          border: scanStatus === 'scanning' ? '3px solid' : '1px solid',
          borderColor: scanStatus === 'scanning' ? 'primary.main' : 'divider',
          backgroundColor: scanStatus === 'scanning' ? 'primary.50' : 'background.paper',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          minHeight: 300,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': scanStatus === 'scanning' ? {
            content: '""',
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(25, 118, 210, 0.1), transparent)',
            animation: 'scanning 2s infinite',
            '@keyframes scanning': {
              '0%': { left: '-100%' },
              '100%': { left: '100%' },
            },
          } : {},
        }}
      >
        {getStatusContent()}
      </Paper>

      {/* Fallback button for classic login */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="text"
          color="primary"
          onClick={() => setShowClassicLogin(true)}
          sx={{ 
            textTransform: 'none',
            fontSize: '0.9rem',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          Zaboravili ste karticu? Prijavite se s korisničkim imenom i lozinkom
        </Button>
      </Box>
    </Box>
  );
};

export default TouchlessRfidTerminal; 