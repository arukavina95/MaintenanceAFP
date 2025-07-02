import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Paper, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel, TableContainer } from '@mui/material';
import Grid from '@mui/material/Grid';
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
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import NotificationsIcon from '@mui/icons-material/Notifications';
import GroupIcon from '@mui/icons-material/Group';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import axios from "axios";
import LoginPage from '../pages/LoginPage';



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

  React.useEffect(() => {
    fetchNotifications();
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await ObavijestiService.getObavijesti();
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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
          username: userFormFields.korisnik, // OVO JE KLJUČNO!
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
        // Ako je unesena nova lozinka, promijeni je
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
    // Provjeri je li odjel iz baze u listi departmenta
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
    if (!window.confirm('Jeste li sigurni da želite obrisati?')) return;
    try {
      await KorisniciService.deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
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

  return (
    <Box sx={{ display: 'flex', minHeight: '80vh', mt: 4, mb: 4, maxWidth: 1400, mx: 'auto', px: 2 }}>
      {/* Sidebar navigation */}
      <Box sx={{ width: 220, mr: 4, bgcolor: '#fff', borderRadius: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', p: 2, height: 'fit-content' }}>
        <List>
          <ListItem disablePadding>
            <ListItemButton selected={tabValue === 0} onClick={() => setTabValue(0)}
              sx={{
                bgcolor: tabValue === 0 ? '#e3f0fc' : 'transparent',
                color: tabValue === 0 ? '#1976d2' : '#555',
                '& .MuiListItemIcon-root': { color: tabValue === 0 ? '#1976d2' : '#888' },
                '& .MuiListItemText-primary': {
                  color: tabValue === 0 ? '#1976d2' : '#555',
                  fontWeight: tabValue === 0 ? 700 : 400,
                },
              }}
            >
              <ListItemIcon><NotificationsIcon /></ListItemIcon>
              <ListItemText primary="Obavijesti" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton selected={tabValue === 1} onClick={() => setTabValue(1)}
              sx={{
                bgcolor: tabValue === 1 ? '#e3f0fc' : 'transparent',
                color: tabValue === 1 ? '#1976d2' : '#555',
                '& .MuiListItemIcon-root': { color: tabValue === 1 ? '#1976d2' : '#888' },
                '& .MuiListItemText-primary': {
                  color: tabValue === 1 ? '#1976d2' : '#555',
                  fontWeight: tabValue === 1 ? 700 : 400,
                },
              }}
            >
              <ListItemIcon><GroupIcon /></ListItemIcon>
              <ListItemText primary="Korisnici" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
      {/* Main content */}
      <Box sx={{ flexGrow: 1 }}>
    
        {/* OBAVIJESTI TAB */}
        <Box hidden={tabValue !== 0} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenObavijestModal}
              startIcon={<NotificationsIcon />}
              sx={{
                backgroundColor: '#bb1e0f',
                '&:hover': { backgroundColor: '#96180c' },
                borderRadius: 2,
                px: 3,
                py: 1.2,
                fontWeight: 700,
                fontSize: '1rem',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              Dodaj obavijest
            </Button>
          </Box>
          <Dialog open={openObavijestModal} onClose={handleCloseObavijestModal} maxWidth="sm" fullWidth>
            <DialogTitle>Dodaj / Uredi obavijest</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Box sx={{ width: { xs: '100%', sm: 'calc(66.666667% - 8px)' } }}>
                  <TextField
                    label="Naslov"
                    variant="outlined"
                    size="small"
                    fullWidth
                    name="imeObavijesti"
                    value={imeObavijesti}
                    onChange={handleNotificationInputChange}
                    InputLabelProps={{ style: { color: '#222' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#222' },
                        '&:hover fieldset': { borderColor: '#222' },
                        '&.Mui-focused fieldset': { borderColor: '#222' }
                      },
                      input: { color: '#222' }
                    }}
                  />
                </Box>
                <Box sx={{ width: { xs: '100%', sm: 'calc(33.333333% - 8px)' } }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={aktivno}
                        onChange={handleNotificationInputChange}
                        name="aktivno"
                        sx={{ color: '#222', '&.Mui-checked': { color: '#222' } }}
                      />
                    }
                    label={<span style={{ color: '#222' }}>Aktivno</span>}
                    sx={{ color: '#222' }}
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
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
                    InputLabelProps={{ style: { color: '#222' } }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#222' },
                        '&:hover fieldset': { borderColor: '#222' },
                        '&.Mui-focused fieldset': { borderColor: '#222' }
                      },
                      input: { color: '#222' }
                    }}
                  />
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{ color: '#222', borderColor: '#222', '&:hover': { borderColor: '#111', color: '#111' } }}
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
                    <Typography variant="body2" sx={{ color: '#222' }}>
                      Odabrana slika: {typeof slika === 'string' ? slika : slika.name}
                    </Typography>
                  )}
                </Box>
                <Box sx={{ width: '100%' }}>
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
                          InputLabelProps: { style: { color: '#222' } },
                          sx: {
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#222' },
                              '&:hover fieldset': { borderColor: '#222' },
                              '&.Mui-focused fieldset': { borderColor: '#222' }
                            },
                            input: { color: '#222' }
                          }
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseObavijestModal} color="secondary">Odustani</Button>
              <Button onClick={async () => { await handleSaveNotification(); handleCloseObavijestModal(); }} color="primary" variant="contained">Spremi</Button>
            </DialogActions>
          </Dialog>
          {/* @ts-ignore */}
          <Grid component="div" sx={{ width: { xs: '100%', md: '100%' } }}>
            <Paper elevation={3} sx={{
              p: 3, display: 'flex', flexDirection: 'column', height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' },
              border: '1px solid #bb1e0f',
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#bb1e0f', mb: 2 }}>
                Obavijesti
              </Typography>
              <TableContainer>
                <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#bb1e0f' }}>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Naslov</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Opis</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Datum objave</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aktivno</TableCell>
                      <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {notifications.map((notification) => (
                      <TableRow
                        key={notification.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': { backgroundColor: '#ffebee' },
                        }}
                      >
                        <TableCell sx={{ color: '#222' }}>{notification.imeObavijesti}</TableCell>
                        <TableCell sx={{ color: '#222' }}>{notification.opis}</TableCell>
                        <TableCell sx={{ color: '#222' }}>{notification.datumObjave ? new Date(notification.datumObjave).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</TableCell>
                        <TableCell sx={{ color: '#222' }}>{notification.aktivno ? 'Da' : 'Ne'}</TableCell>
                        <TableCell align="right" sx={{ color: '#222' }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditNotification(notification)}
                            sx={{ color: '#1976d2', '&:hover': { color: '#115293' } }}
                          >
                            <EditIcon />
                            </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDeleteNotification(notification.id)}
                            sx={{ color: '#bb1e0f', '&:hover': { color: '#96180c' } }}
                          >
                            <DeleteIcon />
                            </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Box>
        {/* KORISNICI TAB */}
        <Box hidden={tabValue !== 1} sx={{ width: '100%' }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleOpenKorisnikModal}
              startIcon={<GroupIcon />}
              sx={{
                backgroundColor: '#bb1e0f',
                '&:hover': { backgroundColor: '#96180c' },
                borderRadius: 2,
                px: 3,
                py: 1.2,
                fontWeight: 700,
                fontSize: '1rem',
                color: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
              }}
            >
              Dodaj korisnika
            </Button>
          </Box>
          <Dialog open={openKorisnikModal} onClose={handleCloseKorisnikModal} maxWidth="sm" fullWidth>
            <DialogTitle>Dodaj / Uredi korisnika</DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <TextField
                  label="Korisničko ime"
                  variant="outlined"
                  size="small"
                  name="korisnik"
                  value={userFormFields.korisnik}
                  onChange={handleUserInputChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <TextField
                  label="Ime i prezime"
                  variant="outlined"
                  size="small"
                  name="ime"
                  value={userFormFields.ime}
                  onChange={handleUserInputChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }},
                        input: { color: '#bb1e0f' }
                      }}
                  />
                 
                <TextField
                  label="Broj kartice"
                  variant="outlined"
                  size="small"
                  name="brojKartice"
                  value={userFormFields.brojKartice}
                  onChange={handleUserInputChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <TextField
                  label="Potpis"
                  variant="outlined"
                  size="small"
                  name="potpis"
                  value={userFormFields.potpis}
                  onChange={handleUserInputChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <FormControl sx={{ flex: '1 1 calc(33% - 16px)' }} size="small">
                    <InputLabel id="odjel-label" htmlFor="odjel" sx={{ color: '#bb1e0f' }}>Odjel</InputLabel>
                  <Select
                    labelId="odjel-label"
                    id="odjel"
                    name="odjel"
                    value={userFormFields.odjel || ''}
                    label="Odjel"
                    onChange={(event: SelectChangeEvent<string>) => handleUserInputChange({ target: { name: 'odjel', value: event.target.value, type: 'text' } } as React.ChangeEvent<HTMLInputElement>)}
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bb1e0f' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bb1e0f' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#bb1e0f' },
                        '.MuiSelect-icon': { color: '#bb1e0f' },
                        color: '#bb1e0f'
                      }}
                  >
                    <MenuItem value="">Nijedan</MenuItem>
                    {departments.map((dept) => (
                      <MenuItem key={dept.id} value={dept.naslov}>
                        {dept.naslov}
                      </MenuItem>
                    ))}
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
                          InputLabelProps: { style: { color: '#bb1e0f' } },
                          sx: {
                            flex: '1 1 calc(33% - 16px)',
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#bb1e0f' },
                              '&:hover fieldset': { borderColor: '#bb1e0f' },
                              '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                            },
                            input: { color: '#bb1e0f' }
                          }
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
                          InputLabelProps: { style: { color: '#bb1e0f' } },
                          sx: {
                            flex: '1 1 calc(33% - 16px)',
                            '& .MuiOutlinedInput-root': {
                              '& fieldset': { borderColor: '#bb1e0f' },
                              '&:hover fieldset': { borderColor: '#bb1e0f' },
                              '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                            },
                            input: { color: '#bb1e0f' }
                          }
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
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <TextField
                  label="Ukupno dana starog GO"
                  variant="outlined"
                  size="small"
                  name="ukupnoDanaStarogGo"
                  type="number"
                  value={userFormFields.ukupnoDanaStarogGo}
                  onChange={handleUserInputChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <FormControl fullWidth size="small" sx={{ flex: '1 1 calc(33% - 16px)' }}>
                    <InputLabel sx={{ color: '#bb1e0f' }}>Razina pristupa</InputLabel>
                  <Select
                    name="razinaPristupa"
                    value={userFormFields.razinaPristupa}
                    onChange={handleUserSelectChange}
                    label="Razina pristupa"
                      sx={{
                        '& .MuiOutlinedInput-notchedOutline': { borderColor: '#bb1e0f' },
                        '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#bb1e0f' },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#bb1e0f' },
                        '.MuiSelect-icon': { color: '#bb1e0f' },
                        color: '#bb1e0f'
                      }}
                  >
                    <MenuItem value={1}>Administrator</MenuItem>
                    <MenuItem value={2}>Korisnik</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Lozinka"
                  variant="outlined"
                  size="small"
                  type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <TextField
                    label="Potvrdi lozinku"
                  variant="outlined"
                  size="small"
                  type="password"
                    value={confirmPassword}
                    onChange={handleConfirmPasswordChange}
                    InputLabelProps={{ style: { color: '#bb1e0f' } }}
                    sx={{
                      flex: '1 1 calc(33% - 16px)',
                      '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#bb1e0f' },
                        '&:hover fieldset': { borderColor: '#bb1e0f' },
                        '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                      },
                      input: { color: '#bb1e0f' }
                    }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={userFormFields.aktivan}
                      onChange={handleUserInputChange}
                      name="aktivan"
                        sx={{ color: '#bb1e0f', '&.Mui-checked': { color: '#bb1e0f' } }}
                    />
                  }
                  label="Aktivan"
                    sx={{ color: '#bb1e0f' }}
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseKorisnikModal} color="secondary">Odustani</Button>
              <Button onClick={async () => { await handleSaveUser(); handleCloseKorisnikModal(); }} color="primary" variant="contained">Spremi</Button>
            </DialogActions>
          </Dialog>
          {/* @ts-ignore */}
          <Grid component="div" sx={{ width: { xs: '100%', md: '100%' } }}>
            <Paper elevation={3} sx={{
              p: 3, display: 'flex', flexDirection: 'column', height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' },
              border: '1px solid #bb1e0f',
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#bb1e0f', mb: 2 }}>
                Korisnici
              </Typography>
              <TableContainer>
              <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: '#bb1e0f' }}>
                    
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Korisničko ime</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ime i prezime</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Broj kartice</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Potpis</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Odjel</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Razina pristupa</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Aktivan</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Akcije</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#f5f5f5' } }}>
                   
                        <TableCell>{user.korisnik}</TableCell>
                        <TableCell>{user.ime}</TableCell>
                        <TableCell>{user.brojKartice}</TableCell>
                        <TableCell>{user.potpis}</TableCell>
                        <TableCell>{user.odjel}</TableCell>
                        <TableCell>{user.razinaPristupa === 1 ? 'Administrator' : 'Korisnik'}</TableCell>
                        <TableCell>{user.aktivan ? 'Da' : 'Ne'}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleUserEdit(user)} size="small" sx={{ color: '#1976d2', '&:hover': { color: '#115293' } }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton color="secondary" onClick={() => handleUserDelete(user.id)} size="small" sx={{ color: '#bb1e0f', '&:hover': { color: '#96180c' } }}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminPage;