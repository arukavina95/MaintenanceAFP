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
  OutlinedInput,
  IconButton
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import {
  Close as CloseIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Build as BuildIcon,
  Upload as UploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { createIzvodac, updateIzvodac } from '../services/izvodaciService';
import type { CreateIzvodaciDTO, Izvodaci } from '../services/izvodaciService';
import { getVanjskiIzvodaciLista } from '../services/vanjskiIzvodaciService';
import { getUsers } from '../services/radniNaloziService';
import type { User } from '../services/radniNaloziService';
import { uploadFile } from '../services/uploadService';
import DodajVanjskiIzvodacModal from './DodajVanjskiIzvodacModal';
import { designTokens } from '../theme/designSystem';

interface IzvodaciModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editData?: Izvodaci | null;
  isEdit?: boolean;
}

// Vrsta radova options
const vrstaRadovaOptions = [
  'Izvođenje radova na visini',
  'Radovi u zatvorenim prostorima',
  'Vrući radovi (radovi zavarivanja, rezanja i slično)',
  'Hladni radovi (radovi montaže i demontaže)',
  'Niskorizični radovi'
];



const IzvodaciModal: React.FC<IzvodaciModalProps> = ({
  open,
  onClose,
  onSuccess,
  editData,
  isEdit = false
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchVanjskiIzvodaci();
      
      // If editing, populate form with existing data
      if (isEdit && editData) {
        setFormData({
          broj: editData.broj || '',
          vanjskiIzvodac: editData.vanjskiIzvodac || '',
          kategorijaIzvodaca: editData.kategorijaIzvodaca || '',
          pocetniDatum: editData.pocetniDatum || '',
          zavrsniDatum: editData.zavrsniDatum || '',
          mjestoRada: editData.mjestoRada || '',
          kontakt: editData.kontakt || '',
          opisRada: editData.opisRada || '',
          odgovornaOsoba: editData.odgovornaOsoba || '',
          zastoj: editData.zastoj || false,
          status: editData.status || 'Zaprimljeno',
          tipRadova: editData.tipRadova || '',
          privitak: editData.privitak || ''
        });
        
        // Set selected vrsta radova if they exist
        if (editData.tipRadova) {
          setSelectedVrstaRadova(editData.tipRadova.split('; ').filter(item => item.trim()));
        }
        
        // Set file name if privitak exists
        if (editData.privitak) {
          setFileName(editData.privitak);
        }
      }
    }
  }, [open, isEdit, editData]);

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFileName(file.name);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    console.log('🚀 Starting file upload...');
    console.log('📁 Selected file:', selectedFile);
    console.log('📄 File name:', selectedFile.name);
    console.log('📏 File size:', selectedFile.size, 'bytes');

    try {
      // Upload datoteku na backend
      console.log('📤 Calling uploadFile service...');
      const result = await uploadFile(selectedFile);
      console.log('✅ Upload successful!');
      console.log('📋 Backend response:', result);
      
      handleInputChange('privitak', result.fileName);
      setFileName(result.fileName);
      console.log('💾 File name saved to form:', result.fileName);
    } catch (error: any) {
      console.error('❌ Error uploading file:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      alert('Greška pri učitavanju datoteke');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    handleInputChange('privitak', '');
  };

     const handleSubmit = async () => {
     setLoading(true);
     setError(null);

     console.log('📝 handleSubmit: Starting form submission...');
     console.log('📝 handleSubmit: Form data before processing:', formData);
     console.log('📝 handleSubmit: Selected file:', selectedFile);
     console.log('📝 handleSubmit: File name:', fileName);

     try {
               // Ako ima odabranu datoteku a nije uploadana, uploadaj je prvo
        let updatedFormData = { ...formData };
        
        if (selectedFile && !formData.privitak) {
          console.log('📝 handleSubmit: File needs to be uploaded first...');
          try {
            const result = await uploadFile(selectedFile);
            console.log('📝 handleSubmit: File uploaded successfully:', result.fileName);
            updatedFormData.privitak = result.fileName;
            console.log('📝 handleSubmit: Updated formData.privitak:', updatedFormData.privitak);
          } catch (uploadError: any) {
            console.error('📝 handleSubmit: File upload failed:', uploadError);
            setError('Greška pri uploadu datoteke. Pokušajte ponovno.');
            setLoading(false);
            return;
          }
        }

        const submitData = {
          ...updatedFormData,
          broj: updatedFormData.broj.trim() || `IZV-${Date.now()}`, // Auto-generate if empty
          tipRadova: selectedVrstaRadova.join('; ')
        };

               console.log('📝 handleSubmit: Final submit data:', submitData);
        console.log('📝 handleSubmit: Privitak field value:', submitData.privitak);
        console.log('📝 handleSubmit: Full submitData object:', JSON.stringify(submitData, null, 2));

       if (isEdit && editData?.id) {
         // Update existing record
         console.log('📝 handleSubmit: Updating existing record...');
         await updateIzvodac(editData.id, {
           ...submitData,
           id: editData.id
         });
       } else {
         // Create new record
         console.log('📝 handleSubmit: Creating new record...');
         await createIzvodac(submitData);
       }
       
       console.log('📝 handleSubmit: Success! Closing modal...');
       onSuccess();
       handleClose();
     } catch (err: any) {
       console.error('📝 handleSubmit: Error saving izvodac:', err);
       console.error('📝 handleSubmit: Error details:', {
         message: err.message,
         status: err.response?.status,
         statusText: err.response?.statusText,
         data: err.response?.data
       });
       setError(isEdit ? 'Greška pri ažuriranju izvođača' : 'Greška pri kreiranju izvođača');
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
    setShowDodajModal(false);
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
               {isEdit ? 'Promjena prijave i statusa vanjskog izvođača i posjetioca' : 'Nova prijava izvođača'}
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
             {/* BROJ */}
             <Box>
               <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                 BROJ
               </Typography>
               <TextField
                 fullWidth
                 value={formData.broj}
                 onChange={(e) => handleInputChange('broj', e.target.value)}
                 placeholder="Unesite broj ili ostavite prazno za automatsko generiranje..."
                 helperText="Ako ostavite prazno, broj će se automatski generirati"
               />
             </Box>

             {/* IZVOĐAČ */}
             <Box>
                             <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                 IZVOĐAČ
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
                       Odaberite izvođača
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
                  <MenuItem value="Posjetioci">Posjetioci</MenuItem>
                  <MenuItem value="Posjetioci koji ulaze u pogon">Posjetioci koji ulaze u pogon</MenuItem>
                  <MenuItem value="Izvođači/podizvođači">Izvođači/podizvođači</MenuItem>
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

            {/* STATUS */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                STATUS
              </Typography>
              <FormControl fullWidth>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  displayEmpty
                  sx={{ '& .MuiSelect-icon': { color: 'grey.500' } }}
                >
                  <MenuItem value="Zaprimljeno" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    Zaprimljeno
                  </MenuItem>
                  <MenuItem value="Prihvaćeno" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    Prihvaćeno
                  </MenuItem>
                  <MenuItem value="Odbijeno" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                    Odbijeno
                  </MenuItem>
                  <MenuItem value="Odgođeno" sx={{ color: '#FFC107', fontWeight: 'bold' }}>
                    Odgođeno
                  </MenuItem>
                  <MenuItem value="Zatvoreno" sx={{ color: '#9E9E9E', fontWeight: 'bold' }}>
                    Zatvoreno
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* PRIVITAK */}
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                PRIVITAK
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <input
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                  style={{ display: 'none' }}
                  id="file-upload"
                  type="file"
                  onChange={handleFileSelect}
                />
                <label htmlFor="file-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    sx={{
                      borderColor: designTokens.colors.primary[500],
                      color: designTokens.colors.primary[500],
                      '&:hover': {
                        borderColor: designTokens.colors.primary[600],
                        backgroundColor: designTokens.colors.primary[50]
                      }
                    }}
                  >
                    Odaberi datoteku
                  </Button>
                </label>
                
                                 {selectedFile && !formData.privitak && (
                   <Button
                     variant="contained"
                     onClick={handleFileUpload}
                     startIcon={<AttachFileIcon />}
                     sx={{
                       backgroundColor: designTokens.colors.primary[500],
                       '&:hover': { backgroundColor: designTokens.colors.primary[600] }
                     }}
                   >
                     Učitaj
                   </Button>
                 )}
                
                {(fileName || formData.privitak) && (
                  <IconButton
                    onClick={handleRemoveFile}
                    sx={{ color: 'red' }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              
              {(fileName || formData.privitak) && (
                <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachFileIcon sx={{ fontSize: '1rem' }} />
                    {fileName || formData.privitak}
                  </Typography>
                </Box>
              )}
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
                         {isEdit ? 'SPREMI PROMJENE' : 'NAJAVI IZVOĐAČA'}
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

export default IzvodaciModal;
