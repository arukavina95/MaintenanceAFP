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
  Checkbox,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  Chip,
  OutlinedInput
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Build as BuildIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createIzvodac } from '../services/izvodaciService';
import { getVanjskiIzvodaciLista } from '../services/vanjskiIzvodaciService';
import type { CreateIzvodaciDTO } from '../services/izvodaciService';
import { getUsers } from '../services/radniNaloziService';
import type { User } from '../services/radniNaloziService';
import { designTokens } from '../theme/designSystem';
import DodajVanjskiIzvodacModal from './DodajVanjskiIzvodacModal';

interface VanjskiIzvodaciModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Vrsta radova options
const vrstaRadovaOptions = [
  'Izvođenje radova na visini',
  'Radovi u zatvorenim prostorima',
  'Vrući radovi (radovi zavarivanja, rezanja i slično)',
  'Hladni radovi (radovi montaže i demontaže)',
  'Niskorizični radovi'
];

// Izvođač options
const izvodacOptions = [
  'Posjetioci',
  'Posjetioci koji ulaze u pogon',
  'Izvođači/podizvođači'
];

const VanjskiIzvodaciModal: React.FC<VanjskiIzvodaciModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateIzvodaciDTO>({
    broj: '',
    vanjskiIzvodac: '',
    kategorijaIzvodaca: '',
    pocetniDatum: '',
    zavrsniDatum: '',
    mjestoRada: '',
    kontakt: '',
    opisRada: '',
    odgovornaOsoba: '',
    zastoj: false,
    status: 'Zaprimljeno',
    tipRadova: '',
    privitak: ''
  });



  const [users, setUsers] = useState<User[]>([]);
  const [vanjskiIzvodaciLista, setVanjskiIzvodaciLista] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedVrstaRadova, setSelectedVrstaRadova] = useState<string[]>([]);
  const [showDodajModal, setShowDodajModal] = useState(false);

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchVanjskiIzvodaci();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchVanjskiIzvodaci = async () => {
    try {
      const izvodaciData = await getVanjskiIzvodaciLista();
      setVanjskiIzvodaciLista(izvodaciData);
    } catch (err) {
      console.error('Error fetching vanjski izvodaci:', err);
    }
  };

  const handleInputChange = (field: keyof CreateIzvodaciDTO, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVrstaRadovaChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value;
    setSelectedVrstaRadova(typeof value === 'string' ? value.split(',') : value);
  };

  const handleZastojChange = (checked: boolean) => {
    handleInputChange('zastoj', checked);
  };

  const handleDodajVanjskiIzvodac = () => {
    setShowDodajModal(true);
  };

  const handleDodajSuccess = () => {
    // Refresh the list of vanjski izvodaci
    fetchVanjskiIzvodaci();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...formData,

        tipRadova: selectedVrstaRadova.join('; ')
      };

      await createIzvodac(submitData);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error creating izvodac:', err);
             setError('Greška pri kreiranju izvođača');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      broj: '',
      vanjskiIzvodac: '',
      kategorijaIzvodaca: '',
      pocetniDatum: '',
      zavrsniDatum: '',
      mjestoRada: '',
      kontakt: '',
      opisRada: '',
      odgovornaOsoba: '',
      zastoj: false,
      status: 'Zaprimljeno',
      tipRadova: '',
      privitak: ''
    });

    setSelectedVrstaRadova([]);
    setError(null);
    onClose();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 3
          }
        }}
      >
        {/* Header */}
        <DialogTitle
          sx={{
            backgroundColor: designTokens.colors.primary[500],
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BuildIcon />
                                                   <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Nova prijava vanjskog izvođača
              </Typography>
          </Box>
          <Button
            onClick={handleClose}
            sx={{ color: 'white', minWidth: 'auto', p: 0 }}
          >
            <CloseIcon />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                                   {/* VANJSKI IZVOĐAČ - Lista iz baze */}
             <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  VANJSKI IZVOĐAČ
                </Typography>
               <Box sx={{ display: 'flex', gap: 1 }}>
                 <FormControl fullWidth>
                   <Select
                     value={formData.vanjskiIzvodac}
                     onChange={(e) => handleInputChange('vanjskiIzvodac', e.target.value)}
                     displayEmpty
                     sx={{ '& .MuiSelect-icon': { color: 'grey.500' } }}
                   >
                                          <MenuItem value="" disabled>
                        Odaberite vanjskog izvođača
                      </MenuItem>
                                          {vanjskiIzvodaciLista.map((option) => (
                       <MenuItem key={option} value={option}>
                         {option}
                       </MenuItem>
                     ))}
                   </Select>
                 </FormControl>
                 <Button
                   variant="outlined"
                   onClick={handleDodajVanjskiIzvodac}
                   sx={{
                     minWidth: 'auto',
                     px: 2,
                     borderColor: designTokens.colors.primary[500],
                     color: designTokens.colors.primary[500],
                     '&:hover': {
                       borderColor: designTokens.colors.primary[600],
                       backgroundColor: designTokens.colors.primary[50]
                     }
                   }}
                 >
                   <AddIcon />
                 </Button>
               </Box>
             </Box>

             {/* VANJSKI IZVOĐAČ - Kategorija */}
             <Box>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  VANJSKI IZVOĐAČ
                </Typography>
               <FormControl fullWidth>
                 <Select
                   value={formData.kategorijaIzvodaca}
                   onChange={(e) => handleInputChange('kategorijaIzvodaca', e.target.value)}
                   displayEmpty
                   sx={{ '& .MuiSelect-icon': { color: 'grey.500' } }}
                 >
                   <MenuItem value="" disabled>
                     Odaberite kategoriju
                   </MenuItem>
                                                             {izvodacOptions.map((option) => (
                       <MenuItem key={option} value={option}>
                         {option}
                       </MenuItem>
                     ))}
                 </Select>
               </FormControl>
             </Box>

            {/* DATUM RADA OD */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                DATUM RADA OD
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <DatePicker
                  value={formData.pocetniDatum ? new Date(formData.pocetniDatum) : null}
                  onChange={(date) => handleInputChange('pocetniDatum', date?.toISOString() || '')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: 'Odaberite datum'
                    }
                  }}
                />
                <DatePicker
                  value={formData.zavrsniDatum ? new Date(formData.zavrsniDatum) : null}
                  onChange={(date) => handleInputChange('zavrsniDatum', date?.toISOString() || '')}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      placeholder: 'Do'
                    }
                  }}
                />
                                 <FormControlLabel
                   control={
                     <Checkbox
                       checked={formData.zastoj}
                       onChange={(e) => handleZastojChange(e.target.checked)}
                     />
                   }
                   label="ZASTOJ STROJA"
                   sx={{ ml: 0 }}
                 />
              </Box>
            </Box>

            {/* OPIS POSLA */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                OPIS POSLA KOJI ĆE OBAVLJATI
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                value={formData.opisRada}
                onChange={(e) => handleInputChange('opisRada', e.target.value)}
                placeholder="Unesite opis posla..."
              />
            </Box>

            {/* MJESTO RADA */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                MJESTO RADA
              </Typography>
              <TextField
                fullWidth
                value={formData.mjestoRada}
                onChange={(e) => handleInputChange('mjestoRada', e.target.value)}
                placeholder="Unesite mjesto rada..."
              />
            </Box>

            {/* KONTAKT */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                KONTAKT
              </Typography>
              <TextField
                fullWidth
                value={formData.kontakt}
                onChange={(e) => handleInputChange('kontakt', e.target.value)}
                placeholder="Unesite kontakt..."
              />
            </Box>

            {/* INTERNO ODGOVORNA OSOBA */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                INTERNO ODGOVORNA OSOBA
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.odgovornaOsoba}
                  onChange={(e) => handleInputChange('odgovornaOsoba', e.target.value)}
                  displayEmpty
                  sx={{ '& .MuiSelect-icon': { color: 'grey.500' } }}
                >
                  <MenuItem value="" disabled>
                    Odaberite odgovornu osobu
                  </MenuItem>
                                     {users.map((user) => (
                     <MenuItem key={user.id} value={user.ime}>
                       {user.ime}
                     </MenuItem>
                   ))}
                </Select>
              </FormControl>
            </Box>

            {/* VRSTA RADOVA */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                VRSTA RADOVA
              </Typography>
                             <FormControl fullWidth>
                 <Select
                   multiple
                   value={selectedVrstaRadova}
                   onChange={handleVrstaRadovaChange}
                   input={<OutlinedInput />}
                   renderValue={(selected) => (
                     <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                       {selected.map((value) => (
                         <Chip 
                           key={value} 
                           label={value} 
                           size="small"
                           onDelete={() => {
                             setSelectedVrstaRadova(selected.filter(item => item !== value));
                           }}
                           deleteIcon={<CloseIcon />}
                           sx={{
                             backgroundColor: designTokens.colors.primary[50],
                             color: designTokens.colors.primary[700],
                             '& .MuiChip-deleteIcon': {
                               color: designTokens.colors.primary[500],
                               '&:hover': {
                                 color: designTokens.colors.primary[700]
                               }
                             }
                           }}
                         />
                       ))}
                     </Box>
                   )}
                   sx={{ 
                     '& .MuiSelect-icon': { color: 'grey.500' },
                     '& .MuiOutlinedInput-root': {
                       minHeight: '56px',
                       padding: '8px'
                     }
                   }}
                 >
                   {vrstaRadovaOptions.map((option) => (
                     <MenuItem key={option} value={option}>
                       <Checkbox 
                         checked={selectedVrstaRadova.indexOf(option) > -1}
                         sx={{ 
                           color: designTokens.colors.primary[500],
                           '&.Mui-checked': {
                             color: designTokens.colors.primary[500]
                           }
                         }}
                       />
                       {option}
                     </MenuItem>
                   ))}
                 </Select>
               </FormControl>
            </Box>

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            variant="outlined"
            onClick={handleClose}
            sx={{
              borderColor: designTokens.colors.primary[500],
              color: designTokens.colors.primary[500],
              '&:hover': {
                borderColor: designTokens.colors.primary[600],
                backgroundColor: designTokens.colors.primary[50]
              }
            }}
          >
            Odustani
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading}
            startIcon={<SaveIcon />}
            sx={{
              backgroundColor: '#fef2f2',
              color: 'black',
              border: `2px solid ${designTokens.colors.primary[500]}`,
              fontWeight: 'bold',
              textTransform: 'uppercase',
              '&:hover': {
                backgroundColor: designTokens.colors.primary[50]
              },
              '&:disabled': {
                backgroundColor: '#f5f5f5',
                color: '#999'
              }
            }}
          >
            NAJAVI IZVOĐAČA
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal za dodavanje novog vanjskog izvođača */}
      <DodajVanjskiIzvodacModal
        open={showDodajModal}
        onClose={() => setShowDodajModal(false)}
        onSuccess={handleDodajSuccess}
      />
    </>
  );
};

export default VanjskiIzvodaciModal;
