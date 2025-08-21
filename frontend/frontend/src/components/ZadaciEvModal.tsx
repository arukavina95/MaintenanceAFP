import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Add as AddIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { hr } from 'date-fns/locale';
import { getMachines } from '../services/radniNaloziService';
import { type ZadaciEvData } from '../services/zadaciEvService';
import authService from '../services/authService';

interface ZadaciEvModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  editData?: ZadaciEvData | null; // Dodano za edit mode
  isEditMode?: boolean; // Dodano za edit mode
}

interface Stroj {
  id: number;
  naslov: string;
}

const ZadaciEvModal: React.FC<ZadaciEvModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  editData = null, 
  isEditMode = false 
}) => {
  const [formData, setFormData] = useState({
    datum: format(new Date(), 'dd.M.yyyy. HH:mm:ss', { locale: hr }),
    smjena: '',
    prostorRada: '',
    stroj: '',
    elementPozicija: '',
    satiRada: '',
    detaljanOpis: '',
    napomena: '',
    ugradeniDijelovi: '',
    sudjelovali: ''
  });

  const [strojevi, setStrojevi] = useState<Stroj[]>([]);
  const [loading, setLoading] = useState(false);

  const smjene = ['1', '2', '3', 'Dež'];
  
  const prostoriRada = [
    'Brusiona',
    'Čimoza',
    'Energana',
    'Etigraf',
    'Hala 1',
    'Hala 2',
    'Hala 3',
    'Hala 4',
    'Hala 5A',
    'Hala 5B',
    'Laboratorij',
    'Marendaona',
    'Mix stanica',
    'Nabava',
    'Okoliš',
    'Ostalo',
    'Podrum',
    'Podstanica',
    'Porta',
    'Praona nova',
    'Praona stara',
    'Predhala',
    'Radiona',
    'Rekuperacija otapala',
    'Rezaona',
    'Skladište GR',
    'Skladište PM',
    'Skladište RK',
    'Sušara',
    'Svlačionica muška',
    'Svlačionica ženska',
    'Tisak i kaširanje',
    'Uprava'
  ];

  useEffect(() => {
    if (open) {
      if (isEditMode && editData) {
        // Popunjavanje forme s postojećim podacima za edit
        setFormData({
          datum: format(new Date(editData.datum), 'dd.M.yyyy. HH:mm:ss', { locale: hr }),
          smjena: editData.smjena,
          prostorRada: editData.prostorRada,
          stroj: editData.stroj,
          elementPozicija: editData.elePoz,
          satiRada: editData.satiRada.toString(),
          detaljanOpis: editData.opisRada,
          napomena: editData.napomena || '', // Popunjavanje s postojećom napomenom
          ugradeniDijelovi: editData.ugradeniDijelovi,
          sudjelovali: '' // TODO: dodati u backend model
        });
      } else {
        // Reset forme za novi zapis
        setFormData({
          datum: format(new Date(), 'dd.M.yyyy. HH:mm:ss', { locale: hr }),
          smjena: '',
          prostorRada: '',
          stroj: '',
          elementPozicija: '',
          satiRada: '',
          detaljanOpis: '',
          napomena: '',
          ugradeniDijelovi: '',
          sudjelovali: ''
        });
      }
      
      // Fetch strojevi data
      fetchStrojevi();
    }
  }, [open, isEditMode, editData]);

  const fetchStrojevi = async () => {
    try {
      setLoading(true);
      const strojeviData = await getMachines();
      setStrojevi(strojeviData);
    } catch (error) {
      console.error('Greška pri dohvaćanju strojeva:', error);
      // Fallback na mock data ako API ne radi
      setStrojevi([
        { id: 1, naslov: 'CNC Mlin' },
        { id: 2, naslov: 'Torno' },
        { id: 3, naslov: 'Bušilica' },
        { id: 4, naslov: 'Varilica' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validacija obaveznih polja
    if (!formData.smjena || !formData.prostorRada || !formData.stroj) {
      alert('Molimo popunite sva obavezna polja (SMJENA, PROSTOR RADA, STROJ)');
      return;
    }

    // Dohvaćanje podataka o trenutnom korisniku
    const currentUser = authService.getCurrentUser();
    const djelatnik = currentUser ? currentUser.ime : 'Nepoznat korisnik';
    const odjel = currentUser ? 'Održavanje' : 'Nepoznat odjel'; // TODO: dodati odjel u user data

    // Formatiranje podataka za API
    const apiData = {
      ...formData,
      datum: isEditMode && editData ? editData.datum : new Date().toISOString(), // Zadržavamo originalni datum za edit
      djelatnik: editData?.djelatnik || djelatnik, // Koristimo trenutnog korisnika ili postojećeg za edit
      odjel: editData?.odjel || odjel, // Koristimo trenutni odjel ili postojeći za edit
      broj: editData?.broj || `EV-${Date.now().toString().slice(-6)}` // Zadržavamo originalni broj za edit
    };

    onSubmit(apiData);
  };

  const handleDodajRd = () => {
    // TODO: Implementirati funkcionalnost za dodavanje RD
    console.log('Dodaj RD clicked');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh'
        }
      }}
    >
      {/* Header */}
      <DialogTitle 
        sx={{ 
          background: 'linear-gradient(135deg, #9c27b0 0%, #7b1fa2 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SettingsIcon sx={{ fontSize: 20 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {isEditMode ? 'Uredi evidenciju rada' : 'Evidencija rada'}
          </Typography>
        </Box>
        <IconButton 
          onClick={onClose}
          sx={{ color: 'white' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* Left Column */}
          <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* First Row */}
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <TextField
                label="DATUM"
                value={formData.datum}
                onChange={(e) => handleInputChange('datum', e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1, '& .MuiInputLabel-root': { fontWeight: 600 } }}
              />
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontWeight: 600 }}>SMJENA</InputLabel>
                <Select
                  value={formData.smjena}
                  label="SMJENA"
                  onChange={(e: SelectChangeEvent) => handleInputChange('smjena', e.target.value)}
                >
                  {smjene.map((smjena) => (
                    <MenuItem key={smjena} value={smjena}>
                      {smjena}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Second Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontWeight: 600 }}>PROSTOR RADA</InputLabel>
                <Select
                  value={formData.prostorRada}
                  label="PROSTOR RADA"
                  onChange={(e: SelectChangeEvent) => handleInputChange('prostorRada', e.target.value)}
                >
                  {prostoriRada.map((prostor) => (
                    <MenuItem key={prostor} value={prostor}>
                      {prostor}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ flex: 1 }}>
                <InputLabel sx={{ fontWeight: 600 }}>STROJ</InputLabel>
                <Select
                  value={formData.stroj}
                  label="STROJ"
                  onChange={(e: SelectChangeEvent) => handleInputChange('stroj', e.target.value)}
                  disabled={loading}
                >
                  {strojevi.map((stroj) => (
                    <MenuItem key={stroj.id} value={stroj.naslov}>
                      {stroj.naslov}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Third Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="ELEMENT / POZICIJA"
                value={formData.elementPozicija}
                onChange={(e) => handleInputChange('elementPozicija', e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1, '& .MuiInputLabel-root': { fontWeight: 600 } }}
              />
              <TextField
                label="SATI RADA"
                value={formData.satiRada}
                onChange={(e) => handleInputChange('satiRada', e.target.value)}
                variant="outlined"
                size="small"
                type="number"
                inputProps={{ min: 0, step: 0.5 }}
                sx={{ flex: 1, '& .MuiInputLabel-root': { fontWeight: 600 } }}
              />
            </Box>

            {/* Detaljan opis rada */}
            <TextField
              label="DETALJAN OPIS RADA"
              value={formData.detaljanOpis}
              onChange={(e) => handleInputChange('detaljanOpis', e.target.value)}
              variant="outlined"
              multiline
              rows={4}
              sx={{ '& .MuiInputLabel-root': { fontWeight: 600 } }}
            />

            {/* Napomena */}
            <TextField
              label="NAPOMENA"
              value={formData.napomena}
              onChange={(e) => handleInputChange('napomena', e.target.value)}
              variant="outlined"
              multiline
              rows={3}
              sx={{ '& .MuiInputLabel-root': { fontWeight: 600 } }}
            />

            {/* Ugrađeni dijelovi and DODAJ RD */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>
              <TextField
                label="UGRAĐENI DIJELOVI"
                value={formData.ugradeniDijelovi}
                onChange={(e) => handleInputChange('ugradeniDijelovi', e.target.value)}
                variant="outlined"
                size="small"
                sx={{ flex: 1, '& .MuiInputLabel-root': { fontWeight: 600 } }}
              />
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleDodajRd}
                sx={{
                  height: 40,
                  borderColor: '#9c27b0',
                  color: '#9c27b0',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#7b1fa2',
                    backgroundColor: 'rgba(156, 39, 176, 0.04)'
                  }
                }}
              >
                DODAJ RD
              </Button>
            </Box>
          </Box>

          {/* Right Column */}
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="SUDJELOVALI"
              value={formData.sudjelovali}
              onChange={(e) => handleInputChange('sudjelovali', e.target.value)}
              variant="outlined"
              multiline
              rows={20}
              sx={{ 
                '& .MuiInputLabel-root': { fontWeight: 600 },
                height: '100%'
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: 3, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSubmit}
          sx={{
            background: 'linear-gradient(135deg, #ba1e0f 0%, #8b160b 100%)',
            color: 'white',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            '&:hover': {
              background: 'linear-gradient(135deg, #a11a0d 0%, #7a140a 100%)',
            }
          }}
        >
          {isEditMode ? 'SPREMI PROMJENE' : 'EVIDENTIRAJ'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ZadaciEvModal;
