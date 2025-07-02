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
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogTitle,
  DialogActions,
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteIcon from '@mui/icons-material/Delete';

import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css'; // Vaš custom CSS file
import Header from '../components/Header';
import { PlaniranjeFormModal } from '../components/PlaniranjeFormModal';
import type { PlaniranjeTask } from '../services/planiranjeService';
import { getMachineTitles, getPlaniranjeTasks, createPlaniranjeTask, deletePlaniranjeTask } from '../services/planiranjeService';
import { format, setMonth, setYear, addMonths, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface PlaniranjePageProps {
  username: string;
  razinaPristupa: number;
  onLogout: () => void;
}

export const PlaniranjePage: React.FC<PlaniranjePageProps> = ({ username, razinaPristupa, onLogout }) => {
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

  const fetchEvents = async () => {
    try {
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

      // Style for days outside the current month (gray background)
      if (dateMonth !== currentMonth) {
        return 'adjacent-month-day';
      }

      const hasEvent = allEvents.some(event => {
        const startDate = new Date(event.pocetniDatum);
        const endDate = new Date(event.zavrsniDatum);
        // Check if the event spans across the current date
        return date >= startDate && date <= endDate;
      });

      let classes = [];
      if (hasEvent) {
        classes.push('day-has-event'); // Use general event class
      }
      // The specific date classes (event-22-may, selected-16-june) were removed in a previous step
      // If you need specific styling for certain dates, consider adding a more robust system (e.g., metadata in events)
      if (value instanceof Date && date.toDateString() === value.toDateString()) {
          classes.push('react-calendar__tile--active'); // default class for selected day
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f6fa' }}> {/* Overall light background */}
      <Header username={username} razinaPristupa={razinaPristupa} onLogout={onLogout} />
      {/* Main container for all content below the header: everything is stacked vertically */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '32px' }}>

        {/* --- Top Control Section: Year/Month Select, Navigation, and ADD/RECORD button --- */}
        <Box sx={{ width: '100%', maxWidth: '1200px', mb: 1, mt: 0 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#bb1e0f', mb: 0.5 }}>Planiranje</Typography>
          <Typography variant="subtitle1" sx={{ color: '#555', mb: 2 }}>Pregled i upravljanje planiranim zadacima i događajima.</Typography>
        </Box>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '1200px',
          mb: 3,
          borderBottom: '1px solid #bb1e0f',
          pb: 1,
          gap: 2,
        }}>
          {/* Left: Year/Month selects */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel shrink htmlFor="year-select">ODABIR GODINE</InputLabel>
              <Select
                value={currentDisplayDate.getFullYear()}
                onChange={e => setCurrentDisplayDate(setYear(currentDisplayDate, Number(e.target.value)))}
                label="ODABIR GODINE"
                inputProps={{ id: 'year-select' }}
              >
                {years.map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel shrink htmlFor="month-select">ODABIR MJESECA</InputLabel>
              <Select
                value={currentDisplayDate.getMonth()}
                onChange={handleMonthChange}
                label="ODABIR MJESECA"
                inputProps={{ id: 'month-select' }}
              >
                {months.map(month => (
                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel shrink htmlFor="machine-select">STROJ</InputLabel>
              <Select
                value={filterMachine}
                onChange={e => setFilterMachine(e.target.value as string)}
                label="STROJ"
                inputProps={{ id: 'machine-select' }}
              >
                <MenuItem value="">Svi strojevi</MenuItem>
                {machineTitles.map(title => (
                  <MenuItem key={title} value={title}>{title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel shrink htmlFor="status-select">STATUS</InputLabel>
              <Select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value as string)}
                label="STATUS"
                inputProps={{ id: 'status-select' }}
              >
                <MenuItem value="">Svi statusi</MenuItem>
                <MenuItem value="Odrađeno">Odrađeno</MenuItem>
                <MenuItem value="U tijeku">U tijeku</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {/* Center: Month/Year with icon and arrows */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton onClick={handlePrevMonth} size="small" sx={{ color: '#bb1e0f' }}><ArrowBackIosIcon fontSize="small" /></IconButton>
            <EventNoteIcon sx={{ color: '#bb1e0f', mr: 0.5 }} />
            <Typography variant="h6" sx={{ fontSize: '1.1em', fontWeight: 'bold', color: '#bb1e0f', mx: 1 }}>
              {format(currentDisplayDate, 'MMMM yyyy', { locale: hr })}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small" sx={{ color: '#bb1e0f' }}><ArrowForwardIosIcon fontSize="small" /></IconButton>
          </Box>
          {/* Right: Add button */}
          <Button
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<EventNoteIcon />}
            sx={{
              backgroundColor: '#bb1e0f',
              '&:hover': { backgroundColor: '#96180c' },
              borderRadius: '6px',
              px: 3,
              py: 1.2,
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
            }}
          >
            Dodaj zapis
          </Button>
        </Box>

        {/* --- Calendar Section --- */}
        <Box sx={{
          border: '1px solid #e0e0e0', /* Subtle gray border */
          borderRadius: '8px',
          overflow: 'hidden',
          width: '100%',
          maxWidth: '1200px',
          mb: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', /* Soft shadow */
          backgroundColor: '#ffffff', /* White background for the card */
          p: 2, /* Padding inside the card */
        }}>
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
        </Box>

        {/* --- Events Table Section (REFRESH button, Title, and Table) --- */}
        <Box sx={{
          width: '100%',
          maxWidth: '1200px',
          border: '1px solid #e0e0e0', /* Subtle gray border */
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)', /* Soft shadow */
          backgroundColor: '#ffffff', /* White background for the card */
          mt: 0, /* No top margin needed, handled by calendar's mb */
        }}>
          {/* Header for events table (new color background with REFRESH button) */}
          <Box sx={{ display: 'flex', backgroundColor: '#bb1e0f', color: 'white' }}>
            {/* REFRESH Button inside the block */}
            <Button
              variant="contained"
              onClick={fetchEvents}
              sx={{
                backgroundColor: '#bb1e0f',
                '&:hover': { backgroundColor: '#96180c' },
                color: 'white',
                minWidth: 'auto',
                height: 'auto',
                borderRadius: 0,
                p: '10px 15px',
                borderRight: '1px solid white',
                fontWeight: 'bold',
                flexShrink: 0
              }}
            >
              OSVJEŽI
            </Button>
            {/* "Events for selected date" text */}
            <Typography variant="h6" sx={{ flexGrow: 1, p: 1, fontSize: '1rem', display: 'flex', alignItems: 'center' }}>
              Događaji za odabrani datum: {value instanceof Date ? value.toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Nema odabranog datuma'}
            </Typography>
          </Box>

          {/* Main Table Header (JOB TYPE, START DATE etc.) */}
          <TableContainer component={Paper} sx={{ flexGrow: 1, mt: 0, boxShadow: 'none', borderRadius: 0 }}>
            <Table size="small">
              <TableHead sx={{ backgroundColor: '#222' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px' }}>VRSTA POSLA</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px' }}>POČETNI DATUM</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px' }}>ZAVRŠNI DATUM</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px' }}>STROJ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px' }}>OPIS</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px' }}>DJELATNIK</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', fontSize: '0.95rem', padding: '10px 15px' }}>
                    STATUS
                    <Tooltip title="Status informacije">
                      <InfoIcon sx={{ color: 'white', ml: 0.5, fontSize: '1rem' }} />
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.95rem', padding: '10px 15px', textAlign: 'center' }}>AKCIJE</TableCell>
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
                          '&:hover': { backgroundColor: '#f0f0f0' },
                          backgroundColor: index % 2 === 0 ? '#fff' : '#f7fafd',
                          borderBottom: '1px solid #e9ecef',
                          '&:last-child': { borderBottom: 'none' },
                          transition: 'background 0.2s',
                        }}
                      >
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{event.vrstaZadataka}</TableCell>
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{new Date(event.pocetniDatum).toLocaleDateString('hr-HR')}</TableCell>
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{new Date(event.zavrsniDatum).toLocaleDateString('hr-HR')}</TableCell>
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{event.strojNaslov}</TableCell>
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{event.opis}</TableCell>
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{event.korisnikIme}</TableCell>
                        <TableCell sx={{ fontSize: '0.92rem', padding: '10px 15px', borderBottom: 'none' }}>{event.status}</TableCell>
                        <TableCell sx={{ textAlign: 'center', borderBottom: 'none' }}>
                          <IconButton size="small" color="primary" onClick={() => { setSelectedTask(event); setIsModalOpen(true); }}>
                            <EventNoteIcon />
                          </IconButton>
                          <IconButton size="small" color="secondary" onClick={() => handleOpenDeleteDialog(event.id)} sx={{ color: '#bb1e0f', '&:hover': { color: '#96180c' } }}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    </Tooltip>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', fontSize: '0.95rem', padding: '10px 15px', borderBottom: 'none' }}>
                      Nema događaja za ovaj datum.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
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