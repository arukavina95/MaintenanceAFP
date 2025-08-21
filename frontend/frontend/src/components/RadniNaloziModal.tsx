import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
  Typography,
  IconButton,
  Alert
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { User, Machine, Department, CreateRadniNalogDTO } from '../services/radniNaloziService';
import { createRadniNalog } from '../services/radniNaloziService';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { format, parse } from 'date-fns';

interface RadniNaloziModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
  machines: Machine[];
  departments: Department[];
  onSuccess?: () => void;
}

const initialForm = {
  brojRN: '',
  naslov: '',
  odjelPrijaveId: 0,
  ustanovioId: 0,
  datumPrijave: '',
  strojId: 0,
  opisKvara: '',
  zaOdjel: 0,
  stupanjHitnosti: '',
  otklonitiDo: '',
  vrstaNaloga: 'popravak',
  tehnoloskaOznaka: '',
  dodijeljenoId: 0,
  datumVrijemeDodjele: '',
  status: 'Otvoren' as const,
  sudjelovaliIds: [] as number[]
};

const vrstaNalogaOptions = [
  { value: 'preventiva', label: 'Preventiva' },
  { value: 'neproizvodni', label: 'Neproizvodni dio' },
  { value: 'brusenje', label: 'Brušenje / Stroja obrada' },
  { value: 'zamjena', label: 'Zamjena alata' },
  { value: 'popravak', label: 'Nalog za popravak stroja' },
];

const stupanjHitnostiOptions = [
  { value: 'Nizak', label: 'Nizak' },
  { value: 'Srednji', label: 'Srednji' },
  { value: 'Visok', label: 'Visok' },
  { value: 'Kritičan', label: 'Kritičan' },
];

const zaOdjelOptions = [
  { id: 1, naslov: "Mehanika" },
  { id: 2, naslov: "Elektronika" },
  { id: 3, naslov: "Energetika" },
  { id: 4, naslov: "Strojna obrada" },
  { id: 5, naslov: "Logistika" },
  { id: 6, naslov: "Održavanje građevinski dio" },
  { id: 7, naslov: "Protupožarni sustav" },
  { id: 8, naslov: "Rekuperacija otapala" },
  { id: 9, naslov: "Strojna obrada alatnica" },
  { id: 10, naslov: "Video nadzor" },
  { id: 11, naslov: "Vigitek" }
];

const RadniNaloziModal: React.FC<RadniNaloziModalProps> = ({ open, onClose, users, machines, departments, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name!]: value
    }));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    let updated;
    if (name === 'zaOdjel' || name === 'odjelPrijaveId' || name === 'ustanovioId' || name === 'strojId' || name === 'dodijeljenoId') {
      updated = { ...form, [name]: Number(value) };
    } else {
      updated = { ...form, [name!]: value };
    }
    setForm(updated);
  };

  const handleDateChange = (date: Date | null) => {
    setForm((prev) => ({ 
      ...prev, 
      otklonitiDo: date ? format(date, 'yyyy-MM-dd') : '' 
    }));
  };

  const handleOpisChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, opisKvara: e.target.value }));
  };

  const validateForm = () => {
    const requiredFields = [
      'brojRN', 'naslov', 'odjelPrijaveId', 'ustanovioId', 'strojId', 
      'zaOdjel', 'stupanjHitnosti', 'otklonitiDo', 'vrstaNaloga', 'opisKvara'
    ];

    for (const field of requiredFields) {
      const value = form[field as keyof typeof form];
      if (
        value === undefined ||
        value === null ||
        (typeof value === 'string' && !value.trim()) ||
        (typeof value === 'number' && value === 0)
      ) {
        setError(`Polje ${field} je obavezno!`);
        return false;
      }
    }

    if (form.opisKvara.trim().length < 10) {
      setError('Opis kvara mora imati minimalno 10 znakova!');
      return false;
    }

    setError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      // Set current date for DatumPrijave if not already set
      const currentDate = new Date().toISOString();
      
      // Ensure SudjelovaliIds contains at least the user who established the work order
      const sudjelovaliIds = form.sudjelovaliIds.length > 0 
        ? form.sudjelovaliIds 
        : [form.ustanovioId];

      // Pripremi podatke za slanje prema DTO strukturi
      const dataToSend: CreateRadniNalogDTO = {
        BrojRN: form.brojRN,
        Naslov: form.naslov,
        OdjelPrijaveId: form.odjelPrijaveId,
        UstanovioId: form.ustanovioId,
        DatumPrijave: form.datumPrijave || currentDate,
        StrojId: form.strojId,
        OpisKvara: form.opisKvara,
        ZaOdjel: form.zaOdjel,
        StupanjHitnosti: form.stupanjHitnosti,
        OtklonitiDo: form.otklonitiDo,
        VrstaNaloga: form.vrstaNaloga,
        Status: form.status,
        TehnoloskaOznaka: form.tehnoloskaOznaka || undefined,
        DodijeljenoId: form.dodijeljenoId || undefined,
        DatumVrijemeDodjele: form.datumVrijemeDodjele || undefined,
        SudjelovaliIds: sudjelovaliIds,
      };

      await createRadniNalog(dataToSend);
      
      setForm(initialForm);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      console.error('Error creating work order:', err);
      if (err.response?.data?.errors) {
        setError('Greška pri kreiranju radnog naloga: ' + JSON.stringify(err.response.data.errors));
      } else {
        setError('Greška pri kreiranju radnog naloga');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm(initialForm);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ 
        fontSize: 28, 
        fontWeight: 800, 
        color: '#222', 
        pb: 2, 
        pt: 1, 
        px: 4, 
        borderBottom: '1px solid #eee', 
        background: 'transparent', 
        letterSpacing: 0.5 
      }}>
        Novi radni nalog
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 16, top: 16, color: '#888' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1, px: { xs: 2, sm: 4 } }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#bb1e0f', mb: 2, letterSpacing: 0.5 }}>
            Osnovni podaci
          </Typography>
          <Box display="flex" flexDirection={{ xs: 'column', sm: 'row' }} gap={4}>
            {/* Lijeva kolona */}
            <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
              <TextField
                label={<span>BROJ RADNOG NALOGA <span style={{color:'#bb1e0f'}}>*</span></span>}
                name="brojRN"
                value={form.brojRN}
                onChange={handleChange}
                fullWidth
                margin="none"
                InputLabelProps={{ shrink: true }}
                required
                error={!!error && !form.brojRN}
                helperText={!form.brojRN && error ? 'Obavezno polje.' : ''}
              />
              <TextField
                label={<span>NASLOV <span style={{color:'#bb1e0f'}}>*</span></span>}
                name="naslov"
                value={form.naslov}
                onChange={handleChange}
                fullWidth
                margin="none"
                InputLabelProps={{ shrink: true }}
                required
                error={!!error && !form.naslov}
                helperText={!form.naslov && error ? 'Obavezno polje.' : ''}
              />
              <FormControl fullWidth required error={!!error && !form.odjelPrijaveId}>
                <InputLabel shrink>ODJEL PRIJAVE <span style={{color:'#bb1e0f'}}>*</span></InputLabel>
                <Select
                  name="odjelPrijaveId"
                  value={form.odjelPrijaveId}
                  label="ODJEL PRIJAVE"
                  onChange={handleSelectChange}
                  displayEmpty
                  required
                >
                  <MenuItem value={0}><em>Odaberi</em></MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept.id} value={dept.id}>{dept.naslov}</MenuItem>
                  ))}
                </Select>
                {(!form.odjelPrijaveId && error) && <Typography color="error" fontSize={13} mt={0.5}>Obavezno polje.</Typography>}
              </FormControl>
              <FormControl fullWidth required error={!!error && !form.ustanovioId}>
                <InputLabel shrink>USTANOVIO <span style={{color:'#bb1e0f'}}>*</span></InputLabel>
                <Select
                  name="ustanovioId"
                  value={form.ustanovioId}
                  label="USTANOVIO"
                  onChange={handleSelectChange}
                  displayEmpty
                  required
                >
                  <MenuItem value={0}><em>Odaberi</em></MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.ime}</MenuItem>
                  ))}
                </Select>
                {(!form.ustanovioId && error) && <Typography color="error" fontSize={13} mt={0.5}>Obavezno polje.</Typography>}
              </FormControl>
              <FormControl fullWidth required error={!!error && !form.zaOdjel}>
                <InputLabel shrink>ZA ODJEL <span style={{color:'#bb1e0f'}}>*</span></InputLabel>
                <Select
                  name="zaOdjel"
                  value={form.zaOdjel}
                  label="ZA ODJEL"
                  onChange={handleSelectChange}
                  displayEmpty
                  required
                >
                  <MenuItem value={0}><em>Odaberi</em></MenuItem>
                  {zaOdjelOptions.map((odjel) => (
                    <MenuItem key={odjel.id} value={odjel.id}>{odjel.naslov}</MenuItem>
                  ))}
                </Select>
                {(!form.zaOdjel && error) && <Typography color="error" fontSize={13} mt={0.5}>Obavezno polje.</Typography>}
              </FormControl>
              <FormControl fullWidth required error={!!error && !form.strojId}>
                <InputLabel shrink>STROJ <span style={{color:'#bb1e0f'}}>*</span></InputLabel>
                <Select
                  name="strojId"
                  value={form.strojId}
                  label="STROJ"
                  onChange={handleSelectChange}
                  displayEmpty
                  required
                >
                  <MenuItem value={0}><em>Odaberi</em></MenuItem>
                  {machines.map((m) => (
                    <MenuItem key={m.id} value={m.id}>{m.naslov}</MenuItem>
                  ))}
                </Select>
                {(!form.strojId && error) && <Typography color="error" fontSize={13} mt={0.5}>Obavezno polje.</Typography>}
              </FormControl>
              <FormControl fullWidth required error={!!error && !form.stupanjHitnosti}>
                <InputLabel shrink>STUPANJ HITNOSTI <span style={{color:'#bb1e0f'}}>*</span></InputLabel>
                <Select
                  name="stupanjHitnosti"
                  value={form.stupanjHitnosti}
                  label="STUPANJ HITNOSTI"
                  onChange={handleSelectChange}
                  displayEmpty
                  required
                >
                  <MenuItem value=""><em>Odaberi</em></MenuItem>
                  {stupanjHitnostiOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
                {(!form.stupanjHitnosti && error) && <Typography color="error" fontSize={13} mt={0.5}>Obavezno polje.</Typography>}
              </FormControl>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label={<span>OTKLONITI DO <span style={{color:'#bb1e0f'}}>*</span></span>}
                  value={form.otklonitiDo ? parse(form.otklonitiDo, 'yyyy-MM-dd', new Date()) : null}
                  onChange={handleDateChange}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "none",
                      required: true,
                      error: !!error && !form.otklonitiDo,
                      helperText: !form.otklonitiDo && error ? 'Obavezno polje.' : ''
                    }
                  }}
                />
              </LocalizationProvider>
              <FormControl fullWidth required error={!!error && !form.vrstaNaloga}>
                <InputLabel shrink>VRSTA NALOGA <span style={{color:'#bb1e0f'}}>*</span></InputLabel>
                <Select
                  name="vrstaNaloga"
                  value={form.vrstaNaloga}
                  label="VRSTA NALOGA"
                  onChange={handleSelectChange}
                  displayEmpty
                  required
                >
                  <MenuItem value=""><em>Odaberi</em></MenuItem>
                  {vrstaNalogaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                  ))}
                </Select>
                {(!form.vrstaNaloga && error) && <Typography color="error" fontSize={13} mt={0.5}>Obavezno polje.</Typography>}
              </FormControl>
            </Box>
            
            {/* Desna kolona */}
            <Box flex={1} display="flex" flexDirection="column" gap={2.5}>
              <TextField
                label="TEHNOLOŠKA OZNAKA"
                name="tehnoloskaOznaka"
                value={form.tehnoloskaOznaka}
                onChange={handleChange}
                fullWidth
                margin="none"
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel shrink>DODIJELJENO</InputLabel>
                <Select
                  name="dodijeljenoId"
                  value={form.dodijeljenoId}
                  label="DODIJELJENO"
                  onChange={handleSelectChange}
                  displayEmpty
                >
                  <MenuItem value={0}><em>Odaberi</em></MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.ime}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="OPIS KVARA"
                name="opisKvara"
                value={form.opisKvara}
                onChange={handleOpisChange}
                fullWidth
                multiline
                minRows={4}
                margin="none"
                InputLabelProps={{ shrink: true }}
                required
                error={!!error && !form.opisKvara}
                helperText={!form.opisKvara && error ? 'Obavezno polje.' : ''}
              />
            </Box>
          </Box>
          
          <Box display="flex" gap={2} mt={4}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{ 
                fontWeight: 700, 
                borderRadius: 2, 
                minWidth: 180, 
                fontSize: 18, 
                py: 1.5, 
                background: '#bb1e0f', 
                ':hover': { background: '#a11a0d' } 
              }}
              fullWidth
            >
              {loading ? 'Spremanje...' : 'SPREMI RADNI NALOG'}
            </Button>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={loading}
              sx={{ 
                fontWeight: 700, 
                borderRadius: 2, 
                minWidth: 120, 
                fontSize: 18, 
                py: 1.5, 
                color: '#bb1e0f', 
                borderColor: '#bb1e0f', 
                ':hover': { borderColor: '#a11a0d', color: '#a11a0d', background: '#f9eaea' } 
              }}
              fullWidth
            >
              Odustani
            </Button>
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RadniNaloziModal;
