import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Tooltip,
  Chip,
  TextField,
  InputAdornment,
  Fade,
  Zoom,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import ZadaciEvModal from '../components/ZadaciEvModal';
import { getZadaciEv, createZadaciEv, deleteZadaciEv, type ZadaciEvData, updateZadaciEv } from '../services/zadaciEvService';
import authService from '../services/authService';

const ZadaciEvPage: React.FC = () => {
  const [data, setData] = useState<ZadaciEvData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState<ZadaciEvData[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ZadaciEvData | null>(null);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [recordToDeleteId, setRecordToDeleteId] = useState<number | null>(null);

  // Dohvaćanje podataka
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getZadaciEv();
      setData(result);
    } catch (err) {
      console.error('Greška pri dohvaćanju podataka:', err);
      setError('Greška pri dohvaćanju podataka. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const filtered = data.filter(item =>
      item.broj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.djelatnik.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.odjel.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.stroj.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.opisRada.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const handleUpiši = () => {
    setIsEditMode(false);
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setIsEditMode(false);
    setSelectedRecord(null);
  };

  const handleModalSubmit = async (formData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      if (isEditMode && selectedRecord) {
        // Edit mode - ažuriranje postojećeg zapisa
        const updatedRecord = await updateZadaciEv(selectedRecord.id!, {
          ...selectedRecord,
          ...formData,
          opisRada: formData.detaljanOpis,
          elePoz: formData.elementPozicija,
          napomena: formData.napomena // Dodano
        });
        
        setData(prev => prev.map(item => 
          item.id === selectedRecord.id ? updatedRecord : item
        ));
        setSuccess('Zapis uspješno ažuriran!');
      } else {
        // Create mode - dodavanje novog zapisa
        const currentUser = authService.getCurrentUser();
        const djelatnik = currentUser ? currentUser.ime : 'Nepoznat korisnik';
        const odjel = currentUser ? 'Održavanje' : 'Nepoznat odjel'; // TODO: dodati odjel u user data
        
        const apiData = {
          broj: formData.broj || `EV-${Date.now().toString().slice(-6)}`,
          datum: new Date().toISOString(),
          smjena: formData.smjena,
          djelatnik: djelatnik,
          odjel: odjel,
          prostorRada: formData.prostorRada,
          stroj: formData.stroj,
          opisRada: formData.detaljanOpis,
          elePoz: formData.elementPozicija,
          satiRada: parseFloat(formData.satiRada) || 0,
          ugradeniDijelovi: formData.ugradeniDijelovi,
          napomena: formData.napomena // Dodano
        };

        const newRecord = await createZadaciEv(apiData);
        setData(prev => [newRecord, ...prev]);
        setSuccess('Zapis uspješno dodan!');
      }
      
      setModalOpen(false);
      setIsEditMode(false);
      setSelectedRecord(null);
    } catch (err) {
      console.error('Greška pri spremanju zapisa:', err);
      setError('Greška pri spremanju zapisa. Molimo pokušajte ponovno.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async (id: number) => {
    const recordToEdit = data.find(item => item.id === id);
    if (recordToEdit) {
      setIsEditMode(true);
      setSelectedRecord(recordToEdit);
      setModalOpen(true);
    }
  };

  const handleDelete = async (id: number) => {
    setRecordToDeleteId(id);
    setDeleteConfirmationOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (recordToDeleteId) {
      try {
        setLoading(true);
        setError(null);
        await deleteZadaciEv(recordToDeleteId);
        setData(prev => prev.filter(item => item.id !== recordToDeleteId));
        setSuccess('Zapis uspješno obrisan!');
      } catch (err) {
        console.error('Greška pri brisanju zapisa:', err);
        setError('Greška pri brisanju zapisa. Molimo pokušajte ponovno.');
      } finally {
        setLoading(false);
        setDeleteConfirmationOpen(false);
        setRecordToDeleteId(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmationOpen(false);
    setRecordToDeleteId(null);
  };

  const handleExport = () => {
    // TODO: Implementirati export funkcionalnost
    console.log('Export clicked');
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleCloseSnackbar = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      {/* Header */}
      <Fade in timeout={800}>
        <Box sx={{ mb: 3 }}>
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 700, 
              color: 'primary.main',
              mb: 1,
              background: 'linear-gradient(135deg, #ba1e0f 0%, #8b160b 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}
          >
            Evidencija rada - Zadaci/Ev
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upravljanje evidencijom rada i zadacima održavanja
          </Typography>
        </Box>
      </Fade>

      {/* Controls */}
      <Zoom in timeout={1000}>
        <Paper 
          elevation={2} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 3,
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Search */}
            <TextField
              size="small"
              placeholder="Pretraži zadatke..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'primary.main' }} />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 300, flexGrow: 1 }}
            />

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleUpiši}
                disabled={loading}
                sx={{
                  background: 'linear-gradient(135deg, #ba1e0f 0%, #8b160b 100%)',
                  color: 'white',
                  fontWeight: 600,
                  px: 3,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #a11a0d 0%, #7a140a 100%)',
                  }
                }}
              >
                UPIŠI
              </Button>

              <Tooltip title="Osvježi podatke">
                <IconButton
                  onClick={handleRefresh}
                  disabled={loading}
                  sx={{
                    bgcolor: 'rgba(186, 30, 15, 0.08)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(186, 30, 15, 0.12)',
                    }
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Izvezi podatke">
                <IconButton
                  onClick={handleExport}
                  sx={{
                    bgcolor: 'rgba(186, 30, 15, 0.08)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(186, 30, 15, 0.12)',
                    }
                  }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>

              <Tooltip title="Filtri">
                <IconButton
                  sx={{
                    bgcolor: 'rgba(186, 30, 15, 0.08)',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(186, 30, 15, 0.12)',
                    }
                  }}
                >
                  <FilterIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </Paper>
      </Zoom>

      {/* Data Table */}
      <Fade in timeout={1200}>
        <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#ba1e0f' }}>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>BROJ</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>DATUM</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>SMJENA</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>DJELATNIK</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>ODJEL</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>PROSTOR RADA</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>STROJ</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>OPIS RADA</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>ELE/POZ</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>SATI RADA</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>UGRAĐENI DIJELOVI</TableCell>
                  <TableCell sx={{ color: 'black', fontWeight: 700, fontSize: '0.9rem' }}>AKCIJE</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Učitavanje podataka...
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body1" color="text.secondary">
                        Nema dostupnih podataka
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((row) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:hover': {
                          backgroundColor: 'rgba(186, 30, 15, 0.04)',
                        },
                        transition: 'background-color 0.2s ease'
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: 'primary.main' }}>{row.broj}</TableCell>
                      <TableCell>{new Date(row.datum).toLocaleString('hr-HR')}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.smjena} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{row.djelatnik}</TableCell>
                      <TableCell>
                        <Chip 
                          label={row.odjel} 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'rgba(186, 30, 15, 0.1)',
                            color: 'primary.main',
                            fontWeight: 600
                          }}
                        />
                      </TableCell>
                      <TableCell>{row.prostorRada}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{row.stroj}</TableCell>
                      <TableCell sx={{ maxWidth: 200 }}>
                        <Typography variant="body2" sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '0.85rem'
                        }}>
                          {row.opisRada}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={row.elePoz} 
                          size="small" 
                          color={row.elePoz === 'ELE' ? 'success' : 'warning'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>{row.satiRada}h</TableCell>
                      <TableCell sx={{ maxWidth: 150 }}>
                        <Typography variant="body2" sx={{ 
                          overflow: 'hidden', 
                          textOverflow: 'ellipsis', 
                          whiteSpace: 'nowrap',
                          fontSize: '0.85rem'
                        }}>
                          {row.ugradeniDijelovi}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                          <Tooltip title="Uredi">
                            <IconButton
                              size="small"
                              onClick={() => handleEdit(row.id!)}
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(186, 30, 15, 0.1)',
                                }
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Obriši">
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(row.id!)}
                              disabled={loading}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(211, 47, 47, 0.1)',
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Fade>

      {/* Summary */}
      <Fade in timeout={1400}>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Ukupno zapisa: {filteredData.length}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ukupno sati: {filteredData.reduce((sum, item) => sum + item.satiRada, 0)}h
          </Typography>
        </Box>
      </Fade>

      {/* Modal */}
      <ZadaciEvModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        isEditMode={isEditMode}
        editData={selectedRecord}
      />

      {/* Snackbar za poruke */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>

      {/* Confirmation Dialog for Delete */}
      <Dialog
        open={deleteConfirmationOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 400
          }
        }}
      >
        <DialogTitle 
          id="delete-dialog-title"
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
            color: 'white',
            fontWeight: 600
          }}
        >
          <WarningIcon sx={{ mr: 1, fontSize: 24 }} />
          Potvrdite brisanje zapisa
        </DialogTitle>
        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Typography id="delete-dialog-description" variant="body1">
            Sigurni ste da želite obrisati ovaj zapis? Ovo je nepovratna akcija.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleCancelDelete} 
            variant="outlined"
            sx={{ 
              borderColor: '#9c27b0', 
              color: '#9c27b0',
              '&:hover': {
                borderColor: '#7b1fa2',
                backgroundColor: 'rgba(156, 39, 176, 0.04)'
              }
            }}
          >
            Odustani
          </Button>
          <Button 
            onClick={handleConfirmDelete} 
            variant="contained"
            disabled={loading}
            sx={{
              background: 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)',
              color: 'white',
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #d32f2f 0%, #c62828 100%)',
              },
              '&:disabled': {
                background: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.38)'
              }
            }}
          >
            {loading ? 'Brisanje...' : 'Obriši'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ZadaciEvPage;
