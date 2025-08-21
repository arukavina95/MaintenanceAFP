import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface UpisRadovaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { opis: string; sati: number; djelatnici: number }) => void;
}

const UpisRadovaModal: React.FC<UpisRadovaModalProps> = ({ open, onClose, onSave }) => {
  const [opis, setOpis] = useState('');
  const [sati, setSati] = useState('');
  const [djelatnici, setDjelatnici] = useState('1');

  const handleSave = () => {
    onSave({ opis, sati: Number(sati), djelatnici: Number(djelatnici) });
    setOpis('');
    setSati('');
    setDjelatnici('1');
    onClose();
  };

  const handleClose = () => {
    setOpis('');
    setSati('');
    setDjelatnici('1');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ background: '#e6c6f5', color: '#6d217f', fontWeight: 700, fontSize: 18 }}>
        Upis radova u tijeku
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{ position: 'absolute', right: 8, top: 8, color: '#6d217f' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <TextField
          label="OPIS RADOVA"
          value={opis}
          onChange={e => setOpis(e.target.value)}
          multiline
          minRows={6}
          fullWidth
          margin="normal"
        />
        <Box display="flex" gap={2}>
          <TextField
            label="UKUPNO SATI"
            value={sati}
            onChange={e => setSati(e.target.value.replace(/[^0-9]/g, ''))}
            fullWidth
            margin="normal"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
          <TextField
            label="UKUPNO DJELATNIKA"
            value={djelatnici}
            onChange={e => setDjelatnici(e.target.value.replace(/[^0-9]/g, ''))}
            fullWidth
            margin="normal"
            inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ pb: 2, px: 3 }}>
        <Button
          variant="outlined"
          onClick={handleSave}
          fullWidth
          sx={{ borderColor: '#6d217f', color: '#6d217f', fontWeight: 700, borderWidth: 2 }}
        >
          <span role="img" aria-label="disketa">💾</span> SPREMI OPIS
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpisRadovaModal; 