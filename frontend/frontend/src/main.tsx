import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { hr } from 'date-fns/locale'
import './index.css'
import App from './App.tsx'

// Kreiranje custom theme s crvenom bojom
const theme = createTheme({
  palette: {
    primary: {
      main: '#ba1e0f',
      light: '#fef2f2',
      dark: '#991b1b',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#f8fafc',
      dark: '#475569',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hr}>
        <CssBaseline />
        <App />
      </LocalizationProvider>
    </ThemeProvider>
  </StrictMode>,
)
