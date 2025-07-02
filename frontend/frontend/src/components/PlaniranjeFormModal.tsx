import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  Box,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';
import type { PlaniranjeTask } from '../services/planiranjeService';
import { getMachines } from '../services/planiranjeService';
import type { Machine } from '../services/planiranjeService';
import authService from '../services/authService';

interface PlaniranjeFormModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (taskData: PlaniranjeTask) => void;
  onDelete?: (id: number) => void;
  initialData?: PlaniranjeTask | null;
}

export const PlaniranjeFormModal: React.FC<PlaniranjeFormModalProps> = ({
  open,
  onClose,
  onSave,
  onDelete,
  initialData,
}) => {
  const [vrstaZadataka, setVrstaZadataka] = useState<string>('Preventiva');
  const [opis, setOpis] = useState<string>('');
  const [pocetniDatum, setPocetniDatum] = useState<Date | null>(null);
  const [zavrsniDatum, setZavrsniDatum] = useState<Date | null>(null);
  const [strojevi, setStrojevi] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(null);
  const [strojNaslov, setStrojNaslov] = useState<string>('');
  const [smjena, setSmjena] = useState<string>('Prva');
  const [status, setStatus] = useState<string>('U tijeku');
  const [privitak, setPrivitak] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getMachines()
      .then((machines) => {
        setStrojevi(machines);
        if (initialData) {
          const found = machines.find(m => m.naslov === initialData.strojNaslov);
          setSelectedMachineId(found ? found.id : null);
        }
      })
      .catch((error) => {
        console.error('Error fetching machines:', error);
      });

    if (initialData) {
      setVrstaZadataka(initialData.vrstaZadataka);
      setOpis(initialData.opis);
      setPocetniDatum(initialData.pocetniDatum ? new Date(initialData.pocetniDatum) : null);
      setZavrsniDatum(initialData.zavrsniDatum ? new Date(initialData.zavrsniDatum) : null);
      setStrojNaslov(initialData.strojNaslov || '');
      setSmjena(initialData.smjena);
      setStatus(initialData.status);
    } else {
      setVrstaZadataka('Preventiva');
      setOpis('');
      setPocetniDatum(null);
      setZavrsniDatum(null);
      setStrojNaslov('');
      setSelectedMachineId(null);
      setSmjena('Prva');
      setStatus('U tijeku');
      setPrivitak(null);
    }
    setErrors({});
  }, [open, initialData]);

  const validate = () => {
    let isValid = true;
    const tempErrors: Record<string, string> = {};

    if (!vrstaZadataka) {
      tempErrors.vrstaZadataka = 'Vrsta zadatka je obavezna.';
      isValid = false;
    }
    if (!opis) {
      tempErrors.opis = 'Opis radova je obavezan.';
      isValid = false;
    }
    if (!pocetniDatum) {
      tempErrors.pocetniDatum = 'Početni datum je obavezan.';
      isValid = false;
    }
    if (!zavrsniDatum) {
      tempErrors.zavrsniDatum = 'Završni datum je obavezan.';
      isValid = false;
    }
    if (!selectedMachineId) {
      tempErrors.strojNaslov = 'Stroj je obavezan.';
      isValid = false;
    }
    if (!smjena) {
      tempErrors.smjena = 'Smjena je obavezna.';
      isValid = false;
    }
    if (!status) {
      tempErrors.status = 'Status je obavezan.';
      isValid = false;
    }

    setErrors({
      ...tempErrors,
    });

    return isValid;
  };

  const handleSave = async () => {
    if (validate()) {
      const formattedPocetniDatum = pocetniDatum ? format(pocetniDatum, 'yyyy-MM-dd') : '';
      const formattedZavrsniDatum = zavrsniDatum ? format(zavrsniDatum, 'yyyy-MM-dd') : '';
      const user = authService.getCurrentUser();

      const newTask: PlaniranjeTask = {
        id: initialData?.id || 0,
        vrstaZadataka,
        opis,
        pocetniDatum: formattedPocetniDatum,
        zavrsniDatum: formattedZavrsniDatum,
        strojId: selectedMachineId,
        strojNaslov: strojevi.find(m => m.id === selectedMachineId)?.naslov || '',
        smjena,
        privitak,
        status,
        djelatnik: user?.korisnik,
      };
      onSave(newTask);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Uredi Zapis Planiranja' : 'Dodaj Zapis Planiranja'}
      </DialogTitle>
      <DialogContent>
        <Box component="form" sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                select
                label="Vrsta Zadataka"
                value={vrstaZadataka}
                onChange={e => setVrstaZadataka(e.target.value)}
                fullWidth
                error={!!errors.vrstaZadataka}
                helperText={errors.vrstaZadataka}
              >
                <MenuItem value="Preventiva">Preventiva</MenuItem>
                <MenuItem value="Tekuće">Tekuće</MenuItem>
                <MenuItem value="Ostalo">Ostalo</MenuItem>
              </TextField>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                select
                label="Stroj"
                value={selectedMachineId ?? ''}
                onChange={e => {
                  const id = Number(e.target.value);
                  setSelectedMachineId(id);
                  const machine = strojevi.find(m => m.id === id);
                  setStrojNaslov(machine ? machine.naslov : '');
                }}
                fullWidth
                error={!!errors.strojNaslov}
                helperText={errors.strojNaslov}
              >
                {strojevi.map(machine => (
                  <MenuItem key={machine.id} value={machine.id}>{machine.naslov}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Početni Datum"
                  value={pocetniDatum}
                  onChange={date => setPocetniDatum(date)}
                  format="dd-MM-yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.pocetniDatum,
                      helperText: errors.pocetniDatum,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Završni Datum"
                  value={zavrsniDatum}
                  onChange={date => setZavrsniDatum(date)}
                  format="dd-MM-yyyy"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.zavrsniDatum,
                      helperText: errors.zavrsniDatum,
                    },
                  }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                select
                label="Smjena"
                value={smjena}
                onChange={e => setSmjena(e.target.value)}
                fullWidth
                error={!!errors.smjena}
                helperText={errors.smjena}
              >
                <MenuItem value="Prva">Prva</MenuItem>
                <MenuItem value="Druga">Druga</MenuItem>
                <MenuItem value="Treća">Treća</MenuItem>
              </TextField>
            </Grid>
            <Grid sx={{ width: { xs: '100%', md: '50%' } }}>
              <TextField
                select
                label="Status"
                value={status}
                onChange={e => setStatus(e.target.value)}
                fullWidth
                error={!!errors.status}
                helperText={errors.status}
              >
                <MenuItem value="Odrađeno">Odrađeno</MenuItem>
                <MenuItem value="U tijeku">U tijeku</MenuItem>
              </TextField>
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <TextField
                label="Opis Radova"
                multiline
                rows={4}
                value={opis}
                onChange={e => setOpis(e.target.value)}
                fullWidth
                error={!!errors.opis}
                helperText={errors.opis}
              />
            </Grid>
            <Grid sx={{ width: '100%' }}>
              <input
                type="file"
                onChange={e => setPrivitak(e.target.files ? e.target.files[0] : null)}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        {initialData && onDelete && (
          <Button 
            onClick={() => {
              if (initialData.id && onDelete) {
                onDelete(initialData.id);
                onClose();
              }
            }} 
            color="error"
            sx={{ mr: 'auto' }}
          >
            Obriši
          </Button>
        )}
        <Button onClick={onClose} color="secondary">
          Poništi
        </Button>
        <Button onClick={handleSave} color="primary">
          Spremi
        </Button>
      </DialogActions>
    </Dialog>
  );
};