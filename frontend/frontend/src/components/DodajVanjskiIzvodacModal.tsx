import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Business as BusinessIcon,
  Upload as UploadIcon,
  AttachFile as AttachFileIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { createVanjskiIzvodac, uploadDocument } from '../services/vanjskiIzvodaciService';
import type { CreateVanjskiIzvodaciDTO } from '../services/vanjskiIzvodaciService';
import { designTokens } from '../theme/designSystem';

interface DodajVanjskiIzvodacModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const DodajVanjskiIzvodacModal: React.FC<DodajVanjskiIzvodacModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<CreateVanjskiIzvodaciDTO>({
    imeFirme: '',
    kontaktOsoba: '',
    kontaktTelefon: '',
    kontaktEmail: '',
    opisPoslova: '',
    opremaServisiraju: '',
    dokumenti: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('');

  const handleInputChange = (field: keyof CreateVanjskiIzvodaciDTO, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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

    console.log('🚀 Starting document upload...');
    console.log('📁 Selected file:', selectedFile);
    console.log('📄 File name:', selectedFile.name);
    console.log('📏 File size:', selectedFile.size, 'bytes');

    try {
      console.log('📤 Calling uploadDocument service...');
      const result = await uploadDocument(selectedFile);
      console.log('✅ Upload successful!');
      console.log('📋 Backend response:', result);
      
      handleInputChange('dokumenti', result.fileName);
      setFileName(result.fileName);
      console.log('💾 Document name saved to form:', result.fileName);
    } catch (error: any) {
      console.error('❌ Error uploading document:', error);
      console.error('🔍 Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      alert('Greška pri učitavanju dokumenta');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileName('');
    handleInputChange('dokumenti', '');
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
      
      if (selectedFile && !formData.dokumenti) {
        console.log('📝 handleSubmit: Document needs to be uploaded first...');
        try {
          const result = await uploadDocument(selectedFile);
          console.log('📝 handleSubmit: Document uploaded successfully:', result.fileName);
          updatedFormData.dokumenti = result.fileName;
          console.log('📝 handleSubmit: Updated formData.dokumenti:', updatedFormData.dokumenti);
        } catch (uploadError: any) {
          console.error('📝 handleSubmit: Document upload failed:', uploadError);
          setError('Greška pri uploadu dokumenta. Pokušajte ponovno.');
          setLoading(false);
          return;
        }
      }

      console.log('📝 handleSubmit: Final submit data:', updatedFormData);
      console.log('📝 handleSubmit: Dokumenti field value:', updatedFormData.dokumenti);

      await createVanjskiIzvodac(updatedFormData);
      onSuccess();
      handleClose();
    } catch (err) {
      console.error('Error creating vanjski izvodac:', err);
      setError('Greška pri kreiranju vanjskog izvođača');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      imeFirme: '',
      kontaktOsoba: '',
      kontaktTelefon: '',
      kontaktEmail: '',
      opisPoslova: '',
      opremaServisiraju: '',
      dokumenti: ''
    });
    setSelectedFile(null);
    setFileName('');
    setError(null);
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
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
          <BusinessIcon />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Dodaj novog vanjskog izvođača
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
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* IME FIRME */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              IME FIRME *
            </Typography>
            <TextField
              fullWidth
              value={formData.imeFirme}
              onChange={(e) => handleInputChange('imeFirme', e.target.value)}
              placeholder="Unesite ime firme..."
              required
            />
          </Box>

          {/* KONTAKT OSOBA */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              KONTAKT OSOBA *
            </Typography>
            <TextField
              fullWidth
              value={formData.kontaktOsoba}
              onChange={(e) => handleInputChange('kontaktOsoba', e.target.value)}
              placeholder="Unesite kontakt osobu..."
              required
            />
          </Box>

          {/* KONTAKT TELEFON */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              KONTAKT TELEFON *
            </Typography>
            <TextField
              fullWidth
              value={formData.kontaktTelefon}
              onChange={(e) => handleInputChange('kontaktTelefon', e.target.value)}
              placeholder="Unesite kontakt telefon..."
              required
            />
          </Box>

          {/* KONTAKT EMAIL */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              KONTAKT EMAIL *
            </Typography>
            <TextField
              fullWidth
              type="email"
              value={formData.kontaktEmail}
              onChange={(e) => handleInputChange('kontaktEmail', e.target.value)}
              placeholder="Unesite kontakt email..."
              required
            />
          </Box>

          {/* OPIS POSLOVA */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              OPIS POSLOVA
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              value={formData.opisPoslova}
              onChange={(e) => handleInputChange('opisPoslova', e.target.value)}
              placeholder="Unesite opis poslova..."
            />
          </Box>

          {/* OPREMA SERVISIRAJU */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              OPREMA SERVISIRAJU
            </Typography>
            <TextField
              fullWidth
              value={formData.opremaServisiraju}
              onChange={(e) => handleInputChange('opremaServisiraju', e.target.value)}
              placeholder="Unesite opremu..."
            />
          </Box>

          {/* DOKUMENTI */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
              DOKUMENTI
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <input
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                style={{ display: 'none' }}
                id="document-upload"
                type="file"
                onChange={handleFileSelect}
              />
              <label htmlFor="document-upload">
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
                  Odaberi dokument
                </Button>
              </label>
              
              {selectedFile && !formData.dokumenti && (
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
              
              {(fileName || formData.dokumenti) && (
                <IconButton
                  onClick={handleRemoveFile}
                  sx={{ color: 'red' }}
                >
                  <DeleteIcon />
                </IconButton>
              )}
            </Box>
            
            {(fileName || formData.dokumenti) && (
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AttachFileIcon sx={{ fontSize: '1rem' }} />
                  {fileName || formData.dokumenti}
                </Typography>
              </Box>
            )}
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
            backgroundColor: designTokens.colors.primary[500],
            '&:hover': {
              backgroundColor: designTokens.colors.primary[600]
            },
            '&:disabled': {
              backgroundColor: '#f5f5f5',
              color: '#999'
            }
          }}
        >
          Spremi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DodajVanjskiIzvodacModal;
