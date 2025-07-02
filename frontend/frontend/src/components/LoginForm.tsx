import React, { useState } from 'react';
import { Box, Button, Paper, TextField, InputAdornment, IconButton, Divider, Alert } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import LockIcon from '@mui/icons-material/Lock';
import LoginIcon from '@mui/icons-material/Login';
import RfidIcon from '@mui/icons-material/Nfc';
import authService from '../services/authService';
import { AxiosError } from 'axios';

interface LoginFormProps {
  onLogin: (user: any) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [rfid, setRfid] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRfidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ovdje možeš dodati RFID login logiku
    alert(`RFID prijava: ${rfid}`);
  };

  const handleClassicSubmit = async (e: React.FormEvent) => {
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

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  return (
    <Paper
      elevation={8}
      sx={{
        p: 4,
        borderRadius: 3,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        alignItems: 'center',
        minWidth: 320,
        backgroundColor: 'rgba(255,255,255,0.95)',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      )}

      {/* RFID prijava */}
      <Box component="form" onSubmit={handleRfidSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="RFID PRIJAVA"
          variant="outlined"
          value={rfid}
          onChange={(e) => setRfid(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <RfidIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="secondary"
          size="large"
          fullWidth
          sx={{ fontWeight: 'bold', letterSpacing: 1, fontSize: '1.1rem', borderRadius: 2 }}
        >
          RFID PRIJAVA
        </Button>
      </Box>

      {/* Separator */}
      <Divider sx={{ width: '100%' }}>ILI</Divider>

      {/* Klasična prijava */}
      <Box component="form" onSubmit={handleClassicSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Korisnik"
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
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          startIcon={<LoginIcon />}
          sx={{ fontWeight: 'bold', letterSpacing: 1, fontSize: '1.1rem', borderRadius: 2 }}
          disabled={loading}
        >
          {loading ? 'PRIJAVA U TOKU...' : 'PRIJAVA'}
        </Button>
      </Box>
    </Paper>
  );
};

export default LoginForm; 