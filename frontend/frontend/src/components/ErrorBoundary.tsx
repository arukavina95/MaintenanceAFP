import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          minHeight: '50vh',
          justifyContent: 'center'
        }}>
          <Typography variant="h5" color="error" gutterBottom>
            Nešto je pošlo po krivu
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Došlo je do neočekivane greške. Molimo pokušajte ponovno.
          </Typography>
          <Button 
            variant="contained" 
            onClick={this.handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ mt: 2 }}
          >
            Osvježi stranicu
          </Button>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 