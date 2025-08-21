import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableRow, 
  IconButton, 
  FormControlLabel, 
  Checkbox, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TableContainer,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Tabs,
  Tab
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { hr } from 'date-fns/locale';
import { format } from 'date-fns';
import DeleteIcon from '@mui/icons-material/Delete';
import ObavijestiService, { type Obavijest } from '../services/ObavijestiService';
import KorisniciService, { type User } from '../services/KorisniciService';
import EditIcon from '@mui/icons-material/Edit';
import type { Department } from '../services/OdjeliPrijave';
import DepartmentService from '../services/OdjeliPrijave';
import authService from '../services/authService';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupIcon from '@mui/icons-material/Group';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import RefreshIcon from '@mui/icons-material/Refresh';

import axios from "axios";
import LoginPage from '../pages/LoginPage';
import { designTokens } from '../theme/designSystem';

interface AdminPageProps {
  userType?: number;
  korisnikId?: number;
  username?: string;
  onLogout?: () => void;
  user?: any;
}

const AdminPage: React.FC<AdminPageProps> = ({ user }) => {
  const [notifications, setNotifications] = useState<Obavijest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [imeObavijesti, setImeObavijesti] = useState('');
  const [opis, setOpis] = useState('');
  const [datumObjave, setDatumObjave] = useState('');
  const [aktivno, setAktivno] = useState(false);
  const [slika, setSlika] = useState<File | null>(null);
  const [dokumenti, setDokumenti] = useState<File | null>(null);
  const [userFormFields, setUserFormFields] = useState<User>({
    id: 0,
    korisnik: '',
    ime: '',
    razinaPristupa: 2,
    aktivan: true,
    brojKartice: '',
    potpis: '',
    odjel: '',
    datumRodenja: '',
    zaposlenOd: '',
    ukupnoDanaGo: 0,
    ukupnoDanaStarogGo: 0,
    lozinkaHash: '',
    lozinkaSalt: ''
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tabValue, setTabValue] = React.useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [openObavijestModal, setOpenObavijestModal] = useState(false);
  const [openKorisnikModal, setOpenKorisnikModal] = useState(false);
  const [editedNotificationId, setEditedNotificationId] = useState<number | null>(null);
  const [editedUserId, setEditedUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    fetchNotifications();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ObavijestiService.getObavijesti();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError('Greška pri dohvaćanju obavijesti');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await KorisniciService.getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await DepartmentService.getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleNotificationInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    if (name === 'imeObavijesti') {
      setImeObavijesti(inputValue as string);
    } else if (name === 'opis') {
      setOpis(inputValue as string);
    } else if (name === 'datumObjave') {
      setDatumObjave(inputValue as string);
    } else if (name === 'aktivno') {
      setAktivno(inputValue as boolean);
    } else if (name === 'slika') {
      if (e.target instanceof HTMLInputElement && e.target.files && e.target.files.length > 0) {
        setSlika(e.target.files[0]);
      } else {
        setSlika(null);
      }
    } else if (name === 'dokumenti') {
      if (e.target instanceof HTMLInputElement && e.target.files && e.target.files.length > 0) {
        setDokumenti(e.target.files[0]);
      } else {
        setDokumenti(null);
      }
    }
  };

  const handleNotificationImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSlika(e.target.files[0]);
    }
  };

  const handleSaveNotification = async () => {
    try {
      const obavijest: Obavijest = {
        id: editedNotificationId ?? 0,
        imeObavijesti,
        opis,
        datumObjave,
        aktivno,
        slika,
        dokumenti
      };
      if (editedNotificationId) {
        await ObavijestiService.updateObavijest(editedNotificationId, obavijest);
      } else {
        await ObavijestiService.createObavijest(obavijest);
      }
      fetchNotifications();
      handleClearNotificationForm();
      setEditedNotificationId(null);
    } catch (error) {
      console.error('Error saving notification:', error);
    }
  };

  const handleEditNotification = (notification: Obavijest) => {
    setImeObavijesti(notification.imeObavijesti);
    setOpis(notification.opis);
    setDatumObjave(notification.datumObjave ? format(new Date(notification.datumObjave), 'yyyy-MM-dd') : '');
    setAktivno(notification.aktivno);
    setSlika(notification.slika && typeof notification.slika !== 'string' ? notification.slika : null);
    setDokumenti(notification.dokumenti && typeof notification.dokumenti !== 'string' ? notification.dokumenti : null);
    setEditedNotificationId(notification.id);
    setOpenObavijestModal(true);
  };

  const handleDeleteNotification = async (id: number) => {
    if (!window.confirm('Jeste li sigurni da želite obrisati?')) return;
    try {
      await ObavijestiService.deleteObavijest(id);
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleClearNotificationForm = () => {
    setImeObavijesti('');
    setOpis('');
    setDatumObjave('');
    setAktivno(false);
    setSlika(null);
    setDokumenti(null);
    setEditedNotificationId(null);
  };

  const handleUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const inputValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setUserFormFields({
      ...userFormFields,
      [name]: inputValue,
    });
  };

  const handleUserSelectChange = (e: SelectChangeEvent<string | number>) => {
    const { name, value } = e.target;
    setUserFormFields({
      ...userFormFields,
      [name]: value,
    });
  };

  const handleSaveUser = async () => {
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      if (!editedUserId) {
        const userToSave = {
          username: userFormFields.korisnik,
          ime: userFormFields.ime,
          razinaPristupa: userFormFields.razinaPristupa,
          aktivan: userFormFields.aktivan,
          brojKartice: userFormFields.brojKartice,
          potpis: userFormFields.potpis,
          odjel: userFormFields.odjel,
          datumRodenja: userFormFields.datumRodenja,
          zaposlenOd: userFormFields.zaposlenOd,
          ukupnoDanaGo: userFormFields.ukupnoDanaGo,
          ukupnoDanaStarogGo: userFormFields.ukupnoDanaStarogGo,
          password,
        };
        await KorisniciService.createUser(userToSave);
      } else {
        let userToSave = {
          ...userFormFields,
          id: editedUserId ?? 0,
        };
        await KorisniciService.updateUser(editedUserId, userToSave);
        if (password && password === confirmPassword) {
          await KorisniciService.changeUserPassword(editedUserId, password);
        }
      }
      fetchUsers();
      handleClearUserForm();
      setEditedUserId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Error creating user:", error);
        if (error.response) {
          console.error("Response data:", error.response.data);
          if (error.response.data && error.response.data.errors) {
            Object.entries(error.response.data.errors).forEach(([field, messages]) => {
              console.error(`Validation error for ${field}:`, messages);
            });
          }
          console.error("Status:", error.response.status);
          console.error("Headers:", error.response.headers);
        }
      } else {
        console.error("Unknown error:", error);
      }
    }
  };

  const handleUserEdit = (user: User) => {
    const validOdjel = departments.some(d => d.naslov === user.odjel) ? user.odjel : '';
    setUserFormFields({
      ...user,
      odjel: validOdjel,
      datumRodenja: user.datumRodenja ? format(new Date(user.datumRodenja), 'yyyy-MM-dd') : '',
      zaposlenOd: user.zaposlenOd ? format(new Date(user.zaposlenOd), 'yyyy-MM-dd') : '',
    });
    setPassword('');
    setConfirmPassword('');
    setEditedUserId(user.id);
    setOpenKorisnikModal(true);
  };

  const handleUserDelete = async (id: number | null) => {
    if (id === null) return;
    
    // Provjeri da li se pokušava obrisati trenutno prijavljen korisnik
    const currentUser = authService.getCurrentUser();
    if (currentUser && currentUser.id === id) {
      alert('Ne možete obrisati sami sebe!');
      return;
    }
    
    // Pronađi korisnika koji se pokušava obrisati
    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) {
      alert('Korisnik nije pronađen!');
      return;
    }
    
    // Potvrda brisanja
    const confirmDelete = window.confirm(
      `Sigurno želite obrisati korisnika "${userToDelete.ime}"?\n\n` +
      `Ova akcija je nepovratna!`
    );
    
    if (!confirmDelete) return;
    
    try {
      console.log(`Attempting to delete user with id: ${id}`);
      await KorisniciService.deleteUser(id);
      console.log('User deleted successfully');
      fetchUsers();
    } catch (error: any) {
      console.error('Error deleting user:', error);
      
      // Prikaži korisniku detaljniju poruku o grešci
      let errorMessage = 'Greška pri brisanju korisnika.';
      
      if (error.response) {
        if (error.response.status === 500) {
          errorMessage = 'Server greška - korisnik se koristi u drugim tablicama (radni nalozi, zadaci, itd.).\n\n' +
                        'Molimo prvo uklonite sve reference na ovog korisnika.';
        } else if (error.response.status === 404) {
          errorMessage = 'Korisnik nije pronađen.';
        } else if (error.response.status === 403) {
          errorMessage = 'Nemate dozvolu za brisanje korisnika.';
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      }
      
      // Prikaži alert korisniku
      alert(errorMessage);
    }
  };

  const handleClearUserForm = () => {
    setUserFormFields({
      id: 0,
      korisnik: '',
      ime: '',
      razinaPristupa: 2,
      aktivan: true,
      brojKartice: '',
      potpis: '',
      odjel: '',
      datumRodenja: '',
      zaposlenOd: '',
      ukupnoDanaGo: 0,
      ukupnoDanaStarogGo: 0,
      lozinkaHash: '',
      lozinkaSalt: ''
    });
    setPassword('');
    setConfirmPassword('');
    setEditedUserId(null);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };

  const handleOpenObavijestModal = () => setOpenObavijestModal(true);
  const handleCloseObavijestModal = () => { setOpenObavijestModal(false); handleClearNotificationForm(); };
  const handleOpenKorisnikModal = () => setOpenKorisnikModal(true);
  const handleCloseKorisnikModal = () => { setOpenKorisnikModal(false); handleClearUserForm(); };

  if (!user) {
    return <LoginPage onLogin={() => window.location.reload()} />;
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          py: 12,
          gap: 3
        }}>
          <CircularProgress size={56} color="primary" />
          <Typography variant="h6" color="neutral.600" fontWeight={500}>
            Učitavanje podataka...
          </Typography>
          <Typography variant="body2" color="neutral.500">
            Molimo pričekajte
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center', 
          py: 12,
          gap: 3
        }}>
          <Alert 
            severity="error" 
            sx={{ 
              borderRadius: designTokens.borderRadius.lg,
              maxWidth: 500,
              '& .MuiAlert-icon': {
                fontSize: 28,
              },
              '& .MuiAlert-message': {
                fontSize: 16,
                fontWeight: 500,
              }
            }}
          >
            {error}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={4}>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
            sx={{
              borderRadius: designTokens.borderRadius.lg,
              fontWeight: 600,
            }}
          >
            Osvježi
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue as number)}
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem',
            },
            '& .Mui-selected': {
              color: 'primary.main',
            },
          }}
        >
          <Tab 
            icon={<NotificationsIcon />} 
            label="Obavijesti" 
            iconPosition="start"
          />
          <Tab 
            icon={<GroupIcon />} 
            label="Korisnici" 
            iconPosition="start"
          />
        </Tabs>
      </Card>

      {/* OBAVIJESTI TAB */}
      <Box hidden={tabValue !== 0}>
        <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600} color="neutral.800">
                Obavijesti
              </Typography>
              <Button
                variant="contained"
                startIcon={<NotificationsIcon />}
                onClick={handleOpenObavijestModal}
                sx={{
                  borderRadius: designTokens.borderRadius.lg,
                  fontWeight: 600,
                  boxShadow: designTokens.shadows.md,
                  '&:hover': {
                    boxShadow: designTokens.shadows.lg,
                  },
                }}
              >
                Dodaj obavijest
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'neutral.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Naslov</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Opis</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Datum objave</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {notifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      sx={{
                        '&:hover': { backgroundColor: 'neutral.50' },
                        transition: 'background 0.2s',
                      }}
                    >
                      <TableCell sx={{ color: 'neutral.700' }}>{notification.imeObavijesti}</TableCell>
                      <TableCell sx={{ color: 'neutral.700' }}>{notification.opis}</TableCell>
                      <TableCell sx={{ color: 'neutral.700' }}>
                        {notification.datumObjave ? new Date(notification.datumObjave).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={notification.aktivno ? 'Aktivno' : 'Neaktivno'} 
                          size="small"
                          color={notification.aktivno ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton
                          color="primary"
                          onClick={() => handleEditNotification(notification)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteNotification(notification.id)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* KORISNICI TAB */}
      <Box hidden={tabValue !== 1}>
        <Card sx={{ mb: 3, borderRadius: designTokens.borderRadius.lg, boxShadow: designTokens.shadows.md }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h6" fontWeight={600} color="neutral.800">
                Korisnici
              </Typography>
              <Button
                variant="contained"
                startIcon={<GroupIcon />}
                onClick={handleOpenKorisnikModal}
                sx={{
                  borderRadius: designTokens.borderRadius.lg,
                  fontWeight: 600,
                  boxShadow: designTokens.shadows.md,
                  '&:hover': {
                    boxShadow: designTokens.shadows.lg,
                  },
                }}
              >
                Dodaj korisnika
              </Button>
            </Box>

            <TableContainer>
              <Table size="small">
                <TableHead sx={{ backgroundColor: 'neutral.100' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Korisničko ime</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Ime i prezime</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Broj kartice</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Potpis</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Odjel</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Razina pristupa</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user: User) => (
                    <TableRow 
                      key={user.id} 
                      sx={{ 
                        '&:hover': { backgroundColor: 'neutral.50' },
                        transition: 'background 0.2s',
                      }}
                    >
                      <TableCell sx={{ color: 'neutral.700' }}>{user.korisnik}</TableCell>
                      <TableCell sx={{ color: 'neutral.700' }}>{user.ime}</TableCell>
                      <TableCell sx={{ color: 'neutral.700' }}>{user.brojKartice}</TableCell>
                      <TableCell sx={{ color: 'neutral.700' }}>{user.potpis}</TableCell>
                      <TableCell sx={{ color: 'neutral.700' }}>{user.odjel}</TableCell>
                      <TableCell>
                        <Chip 
                          label={user.razinaPristupa === 1 ? 'Administrator' : 'Korisnik'} 
                          size="small"
                          color={user.razinaPristupa === 1 ? 'error' : 'primary'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={user.aktivan ? 'Aktivan' : 'Neaktivan'} 
                          size="small"
                          color={user.aktivan ? 'success' : 'default'}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton 
                          color="primary" 
                          onClick={() => handleUserEdit(user)} 
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton 
                          color="error" 
                          onClick={() => handleUserDelete(user.id)} 
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>

      {/* Modals */}
      <Dialog 
        open={openObavijestModal} 
        onClose={handleCloseObavijestModal} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designTokens.borderRadius.lg,
          }
        }}
      >
        <DialogTitle>Dodaj / Uredi obavijest</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, mt: 1 }}>
            <TextField
              label="Naslov"
              variant="outlined"
              size="small"
              fullWidth
              name="imeObavijesti"
              value={imeObavijesti}
              onChange={handleNotificationInputChange}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={aktivno}
                  onChange={handleNotificationInputChange}
                  name="aktivno"
                />
              }
              label="Aktivno"
            />
            <TextField
              label="Sadržaj"
              variant="outlined"
              size="small"
              fullWidth
              multiline
              rows={4}
              name="opis"
              value={opis}
              onChange={handleNotificationInputChange}
            />
            <Button
              variant="outlined"
              component="label"
            >
              Dodaj sliku
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleNotificationImageChange}
              />
            </Button>
            {slika && (
              <Typography variant="body2" color="neutral.600">
                Odabrana slika: {typeof slika === 'string' ? slika : slika.name}
              </Typography>
            )}
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hr}>
              <DatePicker
                label="Datum objave"
                value={datumObjave ? new Date(datumObjave) : null}
                onChange={(newValue: Date | null) => {
                  setDatumObjave(newValue ? format(newValue, 'yyyy-MM-dd') : '');
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseObavijestModal} color="secondary">Odustani</Button>
          <Button onClick={async () => { await handleSaveNotification(); handleCloseObavijestModal(); }} color="primary" variant="contained">Spremi</Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={openKorisnikModal} 
        onClose={handleCloseKorisnikModal} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: designTokens.borderRadius.lg,
          }
        }}
      >
        <DialogTitle>Dodaj / Uredi korisnika</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3, mt: 1 }}>
            <TextField
              label="Korisničko ime"
              variant="outlined"
              size="small"
              name="korisnik"
              value={userFormFields.korisnik}
              onChange={handleUserInputChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <TextField
              label="Ime i prezime"
              variant="outlined"
              size="small"
              name="ime"
              value={userFormFields.ime}
              onChange={handleUserInputChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <TextField
              label="Broj kartice"
              variant="outlined"
              size="small"
              name="brojKartice"
              value={userFormFields.brojKartice}
              onChange={handleUserInputChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <TextField
              label="Potpis"
              variant="outlined"
              size="small"
              name="potpis"
              value={userFormFields.potpis}
              onChange={handleUserInputChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <FormControl sx={{ flex: '1 1 calc(50% - 8px)' }} size="small">
              <InputLabel>Odjel</InputLabel>
              <Select
                name="odjel"
                value={userFormFields.odjel || ''}
                label="Odjel"
                onChange={(event: SelectChangeEvent<string>) => handleUserInputChange({ target: { name: 'odjel', value: event.target.value, type: 'text' } } as React.ChangeEvent<HTMLInputElement>)}
              >
                <MenuItem value="">Nijedan</MenuItem>
                {departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.naslov}>
                    {dept.naslov}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ flex: '1 1 calc(50% - 8px)' }} size="small">
              <InputLabel>Razina pristupa</InputLabel>
              <Select
                name="razinaPristupa"
                value={userFormFields.razinaPristupa}
                onChange={handleUserSelectChange}
                label="Razina pristupa"
              >
                <MenuItem value={1}>Administrator</MenuItem>
                <MenuItem value={2}>Korisnik</MenuItem>
              </Select>
            </FormControl>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hr}>
              <DatePicker
                label="Datum rođenja"
                value={userFormFields.datumRodenja ? new Date(userFormFields.datumRodenja) : null}
                onChange={(newValue: Date | null) => {
                  setUserFormFields({
                    ...userFormFields,
                    datumRodenja: newValue ? format(newValue, 'yyyy-MM-dd') : ''
                  });
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { flex: '1 1 calc(50% - 8px)' }
                  },
                }}
              />
            </LocalizationProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hr}>
              <DatePicker
                label="Zaposlen od"
                value={userFormFields.zaposlenOd ? new Date(userFormFields.zaposlenOd) : null}
                onChange={(newValue: Date | null) => {
                  setUserFormFields({
                    ...userFormFields,
                    zaposlenOd: newValue ? format(newValue, 'yyyy-MM-dd') : ''
                  });
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    sx: { flex: '1 1 calc(50% - 8px)' }
                  },
                }}
              />
            </LocalizationProvider>
            <TextField
              label="Ukupno dana GO"
              variant="outlined"
              size="small"
              name="ukupnoDanaGo"
              type="number"
              value={userFormFields.ukupnoDanaGo}
              onChange={handleUserInputChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <TextField
              label="Ukupno dana starog GO"
              variant="outlined"
              size="small"
              name="ukupnoDanaStarogGo"
              type="number"
              value={userFormFields.ukupnoDanaStarogGo}
              onChange={handleUserInputChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <TextField
              label="Lozinka"
              variant="outlined"
              size="small"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <TextField
              label="Potvrdi lozinku"
              variant="outlined"
              size="small"
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              sx={{ flex: '1 1 calc(50% - 8px)' }}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={userFormFields.aktivan}
                  onChange={handleUserInputChange}
                  name="aktivan"
                />
              }
              label="Aktivan"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseKorisnikModal} color="secondary">Odustani</Button>
          <Button onClick={async () => { await handleSaveUser(); handleCloseKorisnikModal(); }} color="primary" variant="contained">Spremi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPage;