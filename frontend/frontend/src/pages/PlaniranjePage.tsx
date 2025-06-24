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
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import 'react-calendar/dist/Calendar.css';
import '../styles/calendar.css'; // Vaš custom CSS file
import Header from '../components/Header';
import { PlaniranjeFormModal } from '../components/PlaniranjeFormModal';
import type { PlaniranjeTask } from '../services/planiranjeService';
import { getMachines, getPlaniranjeTasks, createPlaniranjeTask, deletePlaniranjeTask } from '../services/planiranjeService';
import { format, setMonth, setYear, addMonths, subMonths } from 'date-fns';
import { hr } from 'date-fns/locale';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface PlaniranjePageProps {
  username: string;
  onLogout: () => void;
}

export const PlaniranjePage: React.FC<PlaniranjePageProps> = ({ username, onLogout }) => {
  const [value, onChange] = useState<Value>(new Date());
  const [selectedDateEvents, setSelectedDateEvents] = useState<PlaniranjeTask[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<PlaniranjeTask | null>(null);
  const [allEvents, setAllEvents] = useState<PlaniranjeTask[]>([]);
  const [machinesMap, setMachinesMap] = useState<Map<number, string>>(new Map());
  const [currentDisplayDate, setCurrentDisplayDate] = useState<Date>(new Date());

  const fetchEvents = async () => {
    try {
      const events = await getPlaniranjeTasks();
      setAllEvents(events);
      if (value instanceof Date) {
        const eventsForSelectedDate = events.filter(event =>
          new Date(event.pocetniDatum).toDateString() === value.toDateString()
        );
        setSelectedDateEvents(eventsForSelectedDate);
      }
    } catch (error) {
      console.error('Error fetching planning tasks:', error);
    }
  };

  const fetchMachinesData = async () => {
    try {
      const machines = await getMachines();
      const map = new Map<number, string>();
      machines.forEach(machine => map.set(machine.id, machine.naslov));
      setMachinesMap(map);
    } catch (error) {
      console.error('Error fetching machines:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchMachinesData();
  }, []);

  useEffect(() => {
    if (value instanceof Date) {
      const eventsForSelectedDate = allEvents.filter(event =>
        new Date(event.pocetniDatum).toDateString() === value.toDateString()
      );
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
        // Check if the event spans across the current date
        return date >= startDate && date <= endDate;
      });

      if (eventsForDate.length > 0) {
        return (
          <Box className="event-content-wrapper">
            {eventsForDate.map((event, index) => {
              console.log('Event object:', event);
              return (
                <Typography key={index} component="span">
                  {event.vrstaZadataka} - {event.opis} - {machinesMap.get(event.strojId || 0) || 'N/A'} - {event.smjena || 'N/A'}
                </Typography>
              );
            })}
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

  const handleYearChange = (event: { target: { value: unknown } }) => {
    const year = event.target.value as number;
    const newDate = setYear(currentDisplayDate, year);
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
      const taskDataToSend = {
        ...taskData,
        strojId: taskData.strojId !== null ? Number(taskData.strojId) : null,
      };
      await createPlaniranjeTask(taskDataToSend as PlaniranjeTask);
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

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#f5f6fa' }}> {/* Overall light background */}
      <Header username={username} onLogout={onLogout} />
      {/* Main container for all content below the header: everything is stacked vertically */}
      <Box sx={{ flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', mt: '64px' }}>

        {/* --- Top Control Section: Year/Month Select, Navigation, and ADD/RECORD button --- */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          maxWidth: '800px',
          mb: 3,
          borderBottom: '1px solid #bb1e0f', /* New hex color line below controls */
          pb: 1, /* Padding bottom for the line */
        }}>
          {/* Left side: Year and Month Selects */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel shrink htmlFor="year-select">ODABIR GODINE</InputLabel>
              <Select
                value={currentDisplayDate.getFullYear()}
                onChange={handleYearChange}
                label="ODABIR GODINE"
                inputProps={{ id: 'year-select' }}
                sx={{
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
                }}
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
                sx={{
                  '.MuiOutlinedInput-notchedOutline': { borderColor: '#ccc' },
                  '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#aaa' },
                }}
              >
                {months.map(month => (
                  <MenuItem key={month.value} value={month.value}>{month.label}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Center: Navigation (Arrows and Month Year) */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1 }}>
            <IconButton onClick={handlePrevMonth} size="small" sx={{ color: '#bb1e0f' }}>
              <ArrowBackIosIcon fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ fontSize: '1em', fontWeight: 'bold', mx: 1, color: '#bb1e0f' }}>
              {format(currentDisplayDate, 'MMMM yyyy', { locale: hr })}
            </Typography>
            <IconButton onClick={handleNextMonth} size="small" sx={{ color: '#bb1e0f' }}>
              <ArrowForwardIosIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Right side: ADD RECORD Button */}
          <Button
            variant="contained"
            onClick={handleOpenModal}
            startIcon={<EventNoteIcon />}
            sx={{
              backgroundColor: '#bb1e0f',
              '&:hover': { backgroundColor: '#96180c' },
              borderRadius: '4px',
              p: '8px 15px',
              color: 'white',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
            }}
          >
            DODAJ ZAPIS
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
              <TableHead sx={{ backgroundColor: '#bb1e0f' }}>
                <TableRow>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '10px 15px' }}>VRSTA POSLA</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '10px 15px' }}>POČETNI DATUM</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '10px 15px' }}>ZAVRŠNI DATUM</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '10px 15px' }}>STROJ</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '10px 15px' }}>OPIS</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.85rem', padding: '10px 15px' }}>DJELATNIK</TableCell>
                  <TableCell sx={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', fontSize: '0.85rem', padding: '10px 15px' }}>
                    STATUS
                    <Tooltip title="Status information">
                      <InfoIcon sx={{ color: 'white', ml: 0.5, fontSize: '1rem' }} />
                    </Tooltip>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedDateEvents.length > 0 ? (
                  selectedDateEvents.map((event, index) => (
                    <TableRow 
                      key={event.id}
                      onDoubleClick={() => handleRowDoubleClick(event)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f0f0f0' }, /* Light gray on hover */
                        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9f9f9', /* Zebra striping */
                        borderBottom: '1px solid #e9ecef', // Subtle line between rows
                        '&:last-child': { borderBottom: 'none' }, // No border on the last row
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{event.vrstaZadataka}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{new Date(event.pocetniDatum).toLocaleDateString('hr-HR')}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{new Date(event.zavrsniDatum).toLocaleDateString('hr-HR')}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{event.strojId ? machinesMap.get(event.strojId) || 'N/A' : 'N/A'}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{event.opis}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{username}</TableCell>
                      <TableCell sx={{ fontSize: '0.8rem', padding: '10px 15px', borderBottom: 'none' }}>{event.status}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', fontSize: '0.9rem', padding: '10px 15px', borderBottom: 'none' }}>
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
    </Box>
  );
};