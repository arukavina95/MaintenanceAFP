import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import { getIzostanci, deleteIzostanak } from "../services/KalendarService";
import type { Izostanak } from "../services/KalendarService";
import KalendarFormModal from "../components/KalendarFormModal";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,  
  TextField, 
  MenuItem, 
  InputAdornment, 
  Box, 
  Typography,
  IconButton, 
  Button,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import RefreshIcon from '@mui/icons-material/Refresh';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import { designTokens } from '../theme/designSystem';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';

import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';

const nazivPrikaz: Record<string, string> = {
  GodisnjiOdmor: "Godišnji odmor",
  PlaceniDopust: "Plaćeni dopust",
  DrzavniPraznik: "Državni praznik",
  Nepoznato: "Nepoznato",
  Bolovanje: "Bolovanje"
};



const KalendarPage: React.FC = () => {
    const [izostanci, setIzostanci] = useState<Izostanak[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIzostanak, setSelectedIzostanak] = useState<Izostanak | null>(null);
    const [sortBy, setSortBy] = useState<'razlogIzostankaNaziv' | 'pocetniDatum' | 'zavrsniDatum' | 'imeKorisnika'>('pocetniDatum');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterReason, setFilterReason] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [value, setValue] = useState<Date>(new Date());
    const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(new Date());
    
    const refreshIzostanci = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getIzostanci(currentDisplayDate.getFullYear(), currentDisplayDate.getMonth() + 1);
        setIzostanci(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching absences:', err);
        setError('Greška pri dohvaćanju izostanaka');
        setIzostanci([]);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      refreshIzostanci();
    }, [currentDisplayDate]);





  const handleDelete = async (id: number) => {
    await deleteIzostanak(id);
    setModalOpen(false);
    setSelectedIzostanak(null);
    refreshIzostanci();
  };

  const handleSort = (property: typeof sortBy) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortBy(property);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const handleDateChange = (nextValue: any) => {
    if (nextValue instanceof Date) {
      setValue(nextValue);
    }
  };

  const onActiveStartDateChange = ({ activeStartDate }: { activeStartDate: Date | null }) => {
    if (activeStartDate) {
      setCurrentDisplayDate(activeStartDate);
    }
  };

  const tileClassName = ({ date }: { date: Date }) => {
    const currentMonth = currentDisplayDate.getMonth();
    const dateMonth = date.getMonth();

    if (dateMonth !== currentMonth) {
      return 'adjacent-month-day';
    }

    // Prikazuj event samo na radnim danima
    const dayOfWeek = date.getDay();
    let classes = [];
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const hasEvent = izostanci.some(iz => {
        const startDate = new Date(iz.pocetniDatum);
        const endDate = new Date(iz.zavrsniDatum);
        return date >= startDate && date <= endDate;
      });
      if (hasEvent) {
        classes.push('day-has-event');
      }
    }
    if (value && date.toDateString() === value.toDateString()) {
      classes.push('react-calendar__tile--active');
    }
    // Dodaj weekend stilove
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      classes.push('react-calendar__month-view__days__day--weekend');
    }
    return classes.join(' ');
  };

  const tileContent = ({ date }: { date: Date }) => {
    // Prikazuj event samo na radnim danima
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return null;
    const eventsForDate = izostanci.filter(iz => {
      const startDate = new Date(iz.pocetniDatum);
      const endDate = new Date(iz.zavrsniDatum);
      return date >= startDate && date <= endDate;
    });
    if (eventsForDate.length > 0) {
      return (
        <Box sx={{ mt: 0.5, textAlign: 'center', px: 0.5 }}>
          {eventsForDate.map((iz, idx) => (
            <Box
              key={idx}
              sx={{
                color: iz.razlogIzostankaNaziv === "Bolovanje" ? "#64748b" : "#d32f2f",
                fontWeight: 500,
                borderRadius: designTokens.borderRadius.sm,
                px: 0.5,
                py: 0.2,
                my: 0.2,
                background: "#f5f5f5",
                cursor: "pointer",
                ":hover": { background: "#fef2f2" },
                fontSize: '0.8em',
                lineHeight: 1.2
              }}
              onClick={(e) => { 
                e.stopPropagation(); 
                setSelectedIzostanak(iz); 
                setModalOpen(true); 
              }}
            >
              {nazivPrikaz[iz.razlogIzostankaNaziv] || iz.razlogIzostankaNaziv} - {iz.imeKorisnika}
            </Box>
          ))}
        </Box>
      );
    }
    return null;
  };

  const filteredIzostanci = izostanci
    .filter(iz => (filterEmployee ? iz.imeKorisnika.toLowerCase().includes(filterEmployee.toLowerCase()) : true))
    .filter(iz => (filterReason ? iz.razlogIzostankaNaziv === filterReason : true))
    .sort((a, b) => {
      if (sortBy === 'pocetniDatum' || sortBy === 'zavrsniDatum') {
        const aDate = new Date(String(a[sortBy]));
        const bDate = new Date(String(b[sortBy]));
        if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      } else {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          py: 12,
          gap: 3
        }}>
          <CircularProgress size={56} color="primary" />
          <Typography variant="h6" color="neutral.600" fontWeight={500}>
            Učitavanje izostanaka...
          </Typography>
          <Typography variant="body2" color="neutral.500">
            Molimo pričekajte
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          py: 12,
          gap: 3
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: designTokens.borderRadius.lg,
              maxWidth: 500,
              '& .MuiAlert-icon': {
                fontSize: 28,
              },
              '& .MuiAlert-message': {
                fontSize: 16,
                fontWeight: 500,
              }
            }}
          >
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={4}>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refreshIzostanci}
            sx={{
              borderRadius: designTokens.borderRadius.lg,
              fontWeight: 600,
            }}
          >
            Osvježi
          </Button>
          <Button
            variant="contained"
            startIcon={<EventNoteIcon />}
            onClick={() => { setSelectedIzostanak(null); setModalOpen(true); }}
            sx={{
              borderRadius: designTokens.borderRadius.lg,
              fontWeight: 600,
              boxShadow: designTokens.shadows.md,
              '&:hover': {
                boxShadow: designTokens.shadows.lg,
              },
            }}
          >
            Dodaj izostanak
          </Button>
        </Box>
      </Box>

      {/* Navigation Card */}
      <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
            <IconButton 
              onClick={() => {
                const newDate = new Date(currentDisplayDate);
                newDate.setMonth(newDate.getMonth() - 1);
                setCurrentDisplayDate(newDate);
              }} 
              size="small" 
              sx={{ color: 'primary.main' }}
            >
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            <CalendarTodayIcon sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontSize: '1.1em', fontWeight: 'bold', color: 'primary.main' }}>
              {format(currentDisplayDate, 'MMMM yyyy', { locale: hr })}
            </Typography>
            <IconButton 
              onClick={() => {
                const newDate = new Date(currentDisplayDate);
                newDate.setMonth(newDate.getMonth() + 1);
                setCurrentDisplayDate(newDate);
              }} 
              size="small" 
              sx={{ color: 'primary.main' }}
            >
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>
        </CardContent>
      </Card>

      {/* Calendar Card */}
      <Card sx={{ mb: 4, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md, overflow: 'hidden' }}>
        <CardContent sx={{ p: 3 }}>
          <Calendar
            onChange={handleDateChange}
            value={value}
            tileClassName={tileClassName}
            tileContent={tileContent}
            locale="hr-HR"
            view="month"
            minDetail="month"
            maxDetail="month"
            navigationLabel={() => null}
            showNavigation={false}
            activeStartDate={currentDisplayDate}
            onActiveStartDateChange={onActiveStartDateChange}
            formatShortWeekday={(_locale: string | undefined, date: Date) => {
              const days = {
                0: 'Nedjelja',
                1: 'Ponedjeljak',
                2: 'Utorak',
                3: 'Srijeda',
                4: 'Četvrtak',
                5: 'Petak',
                6: 'Subota'
              };
              return days[date.getDay() as keyof typeof days];
            }}
            formatMonthYear={(_locale: string | undefined, date: Date) => format(date, 'MMMM yyyy', { locale: hr })}
            formatDay={(_locale: string | undefined, date: Date) => format(date, 'd')}
            onClickDay={(date) => {
              const eventsForDate = izostanci.filter(iz => {
                const startDate = new Date(iz.pocetniDatum);
                const endDate = new Date(iz.zavrsniDatum);
                return date >= startDate && date <= endDate;
              });
              if (eventsForDate.length > 0) {
                setSelectedIzostanak(eventsForDate[0]);
                setModalOpen(true);
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Filters Card */}
      <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} color="neutral.800" mb={2}>
            Filtri
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              label="Filtriraj po djelatniku"
              value={filterEmployee}
              onChange={e => setFilterEmployee(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <InputAdornment position="start">👤</InputAdornment>
              }}
            />
            <TextField
              label="Filtriraj po razlogu"
              value={filterReason}
              onChange={e => setFilterReason(e.target.value)}
              size="small"
              select
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Svi razlozi</MenuItem>
              {[...new Set(izostanci.map(iz => iz.razlogIzostankaNaziv))].map(razlog => (
                <MenuItem key={razlog} value={razlog}>{razlog}</MenuItem>
              ))}
            </TextField>
          </Box>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card sx={{ borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md, overflow: 'hidden' }}>
        <Box sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <CalendarTodayIcon />
          <Typography variant="h6" fontWeight={600}>
            Lista izostanaka za {format(currentDisplayDate, 'MMMM yyyy', { locale: hr })}
          </Typography>
        </Box>
        
        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: 'neutral.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Razlog izostanka</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Početni datum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Završni datum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Djelatnik</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Privitak</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredIzostanci.length > 0 ? filteredIzostanci.map((iz, idx) => (
                <TableRow
                  key={idx}
                  sx={{
                    background: idx % 2 === 0 ? 'white' : 'neutral.50',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    '&:hover': { background: 'primary.50' }
                  }}
                  onClick={() => { setSelectedIzostanak(iz); setModalOpen(true); }}
                >
                  <TableCell>
                    <Chip 
                      label={nazivPrikaz[iz.razlogIzostankaNaziv] || iz.razlogIzostankaNaziv} 
                      size="small"
                      color={iz.razlogIzostankaNaziv === "Bolovanje" ? "default" : "primary"}
                      sx={{ 
                        fontWeight: 600,
                        bgcolor: iz.razlogIzostankaNaziv === "Bolovanje" ? "#64748b" : "#ba1e0f",
                        color: "white"
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>{new Date(iz.pocetniDatum).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>{new Date(iz.zavrsniDatum).toLocaleDateString()}</TableCell>
                  <TableCell sx={{ color: 'neutral.700' }}>{iz.imeKorisnika}</TableCell>
                  <TableCell onClick={e => e.stopPropagation()}>
                    {iz.privitakNaziv && iz.privitakPath
                      ? <Button
                          variant="outlined"
                          size="small"
                          href={`http://localhost:5008${iz.privitakPath}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: designTokens.borderRadius.md,
                            fontWeight: 600,
                            textTransform: 'none'
                          }}
                        >
                          {iz.privitakNaziv}
                        </Button>
                      : ""}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'neutral.600', fontWeight: 600 }}>
                    Nema izostanaka za odabrani mjesec.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <KalendarFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedIzostanak(null); }}
        onSaved={refreshIzostanci}
        initialData={selectedIzostanak}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default KalendarPage;