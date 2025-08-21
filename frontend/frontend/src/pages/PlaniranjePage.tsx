import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
  Chip,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import EngineeringIcon from '@mui/icons-material/Engineering';

import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css';
import { PlaniranjeFormModal } from '../components/PlaniranjeFormModal';
import type { PlaniranjeTask } from '../services/planiranjeService';
import { getMachineTitles, getPlaniranjeTasks, createPlaniranjeTask, deletePlaniranjeTask } from '../services/planiranjeService';
import { format, setMonth, setYear, addMonths, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';
import { designTokens } from '../theme/designSystem';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

export const PlaniranjePage: React.FC = () => {
  const [value, onChange] = useState<Value>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<PlaniranjeTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlaniranjeTask | null>(null);
  const [allEvents, setAllEvents] = useState<PlaniranjeTask[]>([]);
  const [machineTitles, setMachineTitles] = useState<string[]>([]);
  const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(new Date());
  const [filterMachine, setFilterMachine] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const events = await getPlaniranjeTasks();
      setAllEvents(events);
      if (value instanceof Date) {
        const eventsForSelectedDate = events.filter(event => {
          const startDate = new Date(event.pocetniDatum);
          const endDate = new Date(event.zavrsniDatum);
          return value >= startDate && value <= endDate;
        });
        setSelectedDateEvents(eventsForSelectedDate);
      }
    } catch (error) {
      console.error('Error fetching planning tasks:', error);
      setError('Greška pri dohvaćanju planiranih zadataka');
    } finally {
      setLoading(false);
    }
  };

  const fetchMachineTitles = async () => {
    try {
      const titles = await getMachineTitles();
      setMachineTitles(titles);
    } catch (error) {
      console.error('Error fetching machine titles:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMachineTitles();
  }, []);

  useEffect(() => {
    if (value instanceof Date) {
      const eventsForSelectedDate = allEvents.filter(event => {
        const startDate = new Date(event.pocetniDatum);
        const endDate = new Date(event.zavrsniDatum);
        return value >= startDate && value <= endDate;
      });
      setSelectedDateEvents(eventsForSelectedDate);
    } else {
      setSelectedDateEvents([]);
    }
  }, [value, allEvents]);

  const onActiveStartDateChange = ({ activeStartDate, view }: { activeStartDate: Date | null; view: string }) => {
    if (activeStartDate && view === 'month') {
      setCurrentDisplayDate(activeStartDate);
    }
  };

  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const eventsForDate = allEvents.filter(event => {
        const startDate = new Date(event.pocetniDatum);
        const endDate = new Date(event.zavrsniDatum);
        return date >= startDate && date <= endDate;
      });
      if (eventsForDate.length > 0) {
        const firstEvent = eventsForDate[0];
        const strojIme = firstEvent.strojNaslov;
        return (
          <Box sx={{ mt: 0.5, textAlign: 'center', px: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#222', fontWeight: 700, fontSize: '0.95em', lineHeight: 1.15 }} noWrap>
              {firstEvent.vrstaZadataka} : {strojIme} - {firstEvent.opis}{strojIme ? ` (${strojIme})` : ''}
            </Typography>
            {eventsForDate.length > 1 && (
              <Typography variant="caption" sx={{ color: '#bb1e0f', fontSize: '0.8em', display: 'block' }}>+{eventsForDate.length - 1} više</Typography>
            )}
          </Box>
        );
      }
    }
    return null;
  };

  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const currentMonth = currentDisplayDate.getMonth();
      const dateMonth = date.getMonth();

      if (dateMonth !== currentMonth) {
        return 'adjacent-month-day';
      }

      const hasEvent = allEvents.some(event => {
        const startDate = new Date(event.pocetniDatum);
        const endDate = new Date(event.zavrsniDatum);
        return date >= startDate && date <= endDate;
      });

      let classes = [];
      if (hasEvent) {
        classes.push('day-has-event');
      }
      if (value instanceof Date && date.toDateString() === value.toDateString()) {
          classes.push('react-calendar__tile--active');
      }

      return classes.join(' ');
    }
    return null;
  };

  const handleDateChange = (nextValue: Value) => {
    if (nextValue instanceof Date) {
      setCurrentDisplayDate(nextValue);
    }
    onChange(nextValue);
  };

  const handlePrevMonth = () => {
    const newDate = subMonths(currentDisplayDate, 1);
    setCurrentDisplayDate(newDate);
    onChange(newDate);
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDisplayDate, 1);
    setCurrentDisplayDate(newDate);
    onChange(newDate);
  };

  const handleMonthChange = (event: { target: { value: unknown } }) => {
    const month = event.target.value as number;
    const newDate = setMonth(currentDisplayDate, month);
    setCurrentDisplayDate(newDate);
    onChange(newDate);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);
  const months = [
    { value: 0, label: 'Siječanj' }, { value: 1, label: 'Veljača' }, { value: 2, label: 'Ožujak' },
    { value: 3, label: 'Travanj' }, { value: 4, label: 'Svibanj' }, { value: 5, label: 'Lipanj' },
    { value: 6, label: 'Srpanj' }, { value: 7, label: 'Kolovoz' }, { value: 8, label: 'Rujan' },
    { value: 9, label: 'Listopad' }, { value: 10, label: 'Studeni' }, { value: 11, label: 'Prosinac' },
  ];

  const handleOpenModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTask(null);
  };

  const handleRowDoubleClick = (event: PlaniranjeTask) => {
    setSelectedTask(event);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (taskData: PlaniranjeTask) => {
    try {
      await createPlaniranjeTask(taskData);
      fetchEvents();
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deletePlaniranjeTask(id);
      fetchEvents();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleOpenDeleteDialog = (id: number) => {
    setDeleteId(id);
    setDeleteDialogOpen(true);
  };

  const filteredEvents = selectedDateEvents.filter(event => {
    if (filterMachine && event.strojNaslov !== filterMachine) {
      return false;
    }
    if (filterStatus && event.status !== filterStatus) {
      return false;
    }
    return true;
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
            Učitavanje planiranih zadataka...
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
            onClick={fetchEvents}
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
            onClick={handleOpenModal}
            sx={{
              borderRadius: designTokens.borderRadius.lg,
              fontWeight: 600,
              boxShadow: designTokens.shadows.md,
              '&:hover': {
                boxShadow: designTokens.shadows.lg,
              },
            }}
          >
            Dodaj zapis
          </Button>
        </Box>
      </Box>

      {/* Filters Card */}
      <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6" fontWeight={600} color="neutral.800">
              Filtri i navigacija
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <IconButton onClick={handlePrevMonth} size="small" sx={{ color: 'primary.main' }}>
                <ArrowBackIosIcon fontSize="small" />
              </IconButton>
              <Typography variant="h6" sx={{ fontSize: '1.1em', fontWeight: 'bold', color: 'primary.main', mx: 1 }}>
                {format(currentDisplayDate, 'MMMM yyyy', { locale: hr })}
              </Typography>
              <IconButton onClick={handleNextMonth} size="small" sx={{ color: 'primary.main' }}>
                <ArrowForwardIosIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          
          <Box display="flex" flexWrap="wrap" gap={2}>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Godina</InputLabel>
                <Select
                  value={currentDisplayDate.getFullYear()}
                  onChange={e => setCurrentDisplayDate(setYear(currentDisplayDate, Number(e.target.value)))}
                  label="Godina"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Mjesec</InputLabel>
                <Select
                  value={currentDisplayDate.getMonth()}
                  onChange={handleMonthChange}
                  label="Mjesec"
                >
                  {months.map(month => (
                    <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Stroj</InputLabel>
                <Select
                  value={filterMachine}
                  onChange={e => setFilterMachine(e.target.value as string)}
                  label="Stroj"
                >
                  <MenuItem value="">Svi strojevi</MenuItem>
                  {machineTitles.map(title => (
                    <MenuItem key={title} value={title}>{title}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(25% - 12px)' } }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value as string)}
                  label="Status"
                >
                  <MenuItem value="">Svi statusi</MenuItem>
                  <MenuItem value="Odrađeno">Odrađeno</MenuItem>
                  <MenuItem value="U tijeku">U tijeku</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Calendar Card */}
      <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md, overflow: 'hidden' }}>
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
          />
        </CardContent>
      </Card>

      {/* Events Table Card */}
      <Card sx={{ borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md, overflow: 'hidden' }}>
        <Box sx={{ 
          backgroundColor: 'primary.main', 
          color: 'white',
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2
        }}>
          <EngineeringIcon />
          <Typography variant="h6" fontWeight={600}>
            Događaji za odabrani datum: {value instanceof Date ? value.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Nema odabranog datuma'}
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead sx={{ backgroundColor: 'neutral.100' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Vrsta posla</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Početni datum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Završni datum</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Stroj</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Opis</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Djelatnik</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Akcije</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event, index) => (
                  <Tooltip key={event.id} title="Dvoklik za uređivanje" arrow placement="top">
                    <TableRow
                      onDoubleClick={() => handleRowDoubleClick(event)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'neutral.50' },
                        backgroundColor: index % 2 === 0 ? 'white' : 'neutral.50',
                        transition: 'background 0.2s',
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.92rem' }}>{event.vrstaZadataka}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{new Date(event.pocetniDatum).toLocaleDateString('hr-HR')}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{new Date(event.zavrsniDatum).toLocaleDateString('hr-HR')}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{event.strojNaslov}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{event.opis}</TableCell>
                      <TableCell sx={{ fontSize: '0.92rem' }}>{event.korisnikIme}</TableCell>
                      <TableCell>
                        <Chip 
                          label={event.status} 
                          size="small"
                          color={event.status === 'Odrađeno' ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton size="small" color="primary" onClick={() => { setSelectedTask(event); setIsModalOpen(true); }}>
                          <EventNoteIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleOpenDeleteDialog(event.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  </Tooltip>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: 'center', fontSize: '0.95rem', py: 4 }}>
                    Nema događaja za ovaj datum.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <PlaniranjeFormModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        onDelete={handleDeleteTask}
        initialData={selectedTask}
      />
      
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: designTokens.borderRadius.lg,
          }
        }}
      >
        <DialogTitle>Jeste li sigurni da želite obrisati ovaj zapis?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Odustani
          </Button>
          <Button
            onClick={() => {
              if (deleteId !== null) handleDeleteTask(deleteId);
              setDeleteDialogOpen(false);
              setDeleteId(null);
            }}
            color="error"
            variant="contained"
          >
            Obriši
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};