import React, { useState } from 'react';
import { Box, Typography, Button, TextField, Table, TableBody, TableCell, TableHead, TableRow, IconButton, Paper, FormControlLabel, Checkbox, Select, MenuItem, FormControl, InputLabel, Tabs, Tab, TableContainer } from '@mui/material';
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
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import type { Department } from '../services/OdjeliPrijave';
import DepartmentService from '../services/OdjeliPrijave';

interface AdminPageProps {
  userType?: number;
  korisnikId?: number;
  username?: string;
  onLogout?: () => void;
}

const AdminPage: React.FC<AdminPageProps> = () => {
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [tabValue, setTabValue] = React.useState(0);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


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
        id: 0, // ili koristi id ako je edit
        imeObavijesti,
        opis,
        datumObjave,
        aktivno,
        slika,
        dokumenti
      };
      if (obavijest.id) {
        await ObavijestiService.updateObavijest(obavijest.id, obavijest);
      } else {
        await ObavijestiService.createObavijest(obavijest);
      }
      fetchNotifications();
      handleClearNotificationForm();
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
  };

  const handleDeleteNotification = async (id: number) => {
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
      const userToSave = {
        ...userFormFields,
        lozinkaHash: password,
        lozinkaSalt: 'salt' // This should be properly handled in the backend
      };

      if (userFormFields.id) {
        await KorisniciService.updateUser(userFormFields.id, userToSave);
      } else {
        await KorisniciService.createUser(userToSave);
      }
      fetchUsers();
      handleClearUserForm();
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleUserEdit = (user: User) => {
    setCurrentUser(user);
    setUserFormFields({
      ...user,
      datumRodenja: user.datumRodenja ? format(new Date(user.datumRodenja), 'yyyy-MM-dd') : '',
      zaposlenOd: user.zaposlenOd ? format(new Date(user.zaposlenOd), 'yyyy-MM-dd') : '',
    });
    setPassword('');
    setConfirmPassword('');
  };

  const handleUserDelete = async (id: number | null) => {
    if (id === null) return;
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
    setCurrentUser(null);
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmPassword(e.target.value);
  };


  return (
    <Box sx={{ mt: 4, mb: 4, maxWidth: 'lg', mx: 'auto', px: 2 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ color: '#bb1e0f', mb: 4 }}>
        Admin Panel
          </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="admin tabs"
          TabIndicatorProps={{ sx: { bgcolor: '#bb1e0f' } }}
          variant="fullWidth"
          sx={{ width: '100%' }}
        >
              <Tab
        label="Obavijesti"
        sx={{
          color: tabValue === 0 ? '#bb1e0f' : '#bb1e0f',
          fontWeight: tabValue === 0 ? 'bold' : 'normal', // bold za aktivni tab
          fontSize: tabValue === 0 ? '1.2rem' : '1rem',   // veći font za aktivni tab
          flexGrow: 1,
          minWidth: 0
        }}
      />
      <Tab
        label="Korisnici"
        sx={{
          color: tabValue === 1 ? '#bb1e0f' : '#bb1e0f',
          fontWeight: tabValue === 1 ? 'bold' : 'normal',
          fontSize: tabValue === 1 ? '1.2rem' : '1rem',
          flexGrow: 1,
          minWidth: 0
        }}
      />
        </Tabs>
      </Box>

      <Box hidden={tabValue !== 0} sx={{ width: '100%' }}>
        <Grid container spacing={3}>
          {/* @ts-ignore */}
          <Grid component="div" sx={{ width: { xs: '100%', md: '100%' } }}>
            <Paper elevation={3} sx={{
              p: 3, display: 'flex', flexDirection: 'column', height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' },
              border: '1px solid #bb1e0f',
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#bb1e0f', mb: 2 }}>
                Dodaj/uredi obavijest
            </Typography>
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
                  InputLabelProps={{ style: { color: '#bb1e0f' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#bb1e0f' },
                      '&:hover fieldset': { borderColor: '#bb1e0f' },
                      '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                    },
                    input: { color: '#bb1e0f' }
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
                      sx={{ color: '#bb1e0f', '&.Mui-checked': { color: '#bb1e0f' } }}
                    />
                  }
                  label="Aktivno"
                  sx={{ color: '#bb1e0f' }}
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
                  InputLabelProps={{ style: { color: '#bb1e0f' } }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': { borderColor: '#bb1e0f' },
                      '&:hover fieldset': { borderColor: '#bb1e0f' },
                      '&.Mui-focused fieldset': { borderColor: '#bb1e0f' }
                    },
                    input: { color: '#bb1e0f' }
                  }}
                />
              </Box>
              <Box sx={{ width: '100%' }}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{ color: '#bb1e0f', borderColor: '#bb1e0f', '&:hover': { borderColor: '#8a1a0b', color: '#8a1a0b' } }}
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
                  <Typography variant="body2" sx={{ color: '#bb1e0f' }}>
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
                        InputLabelProps: { style: { color: '#bb1e0f' } },
                        sx: {
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
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotification}
                sx={{
                  bgcolor: '#bb1e0f', color: 'white', '&:hover': { bgcolor: '#8a1a0b' },
                  flexGrow: 1,
                }}
              >
                Spremi
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={handleClearNotificationForm}
                sx={{
                  color: '#bb1e0f', borderColor: '#bb1e0f', '&:hover': { borderColor: '#8a1a0b', color: '#8a1a0b' },
                  flexGrow: 1,
                }}
              >
                Poništi
              </Button>
            </Box>
            </Paper>
          </Grid>
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
                        <TableCell sx={{ color: '#bb1e0f' }}>{notification.imeObavijesti}</TableCell>
                        <TableCell sx={{ color: '#bb1e0f' }}>{notification.opis}</TableCell>
                        <TableCell sx={{ color: '#bb1e0f' }}>{notification.datumObjave ? new Date(notification.datumObjave).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}</TableCell>
                        <TableCell sx={{ color: '#bb1e0f' }}>{notification.aktivno ? 'Da' : 'Ne'}</TableCell>
                        <TableCell align="right" sx={{ color: '#bb1e0f' }}>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditNotification(notification)}
                            sx={{ color: '#bb1e0f', '&:hover': { color: '#8a1a0b' } }}
                          >
                            <EditIcon />
                            </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => handleDeleteNotification(notification.id)}
                            sx={{ color: '#bb1e0f', '&:hover': { color: '#8a1a0b' } }}
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
        </Grid>
      </Box>

      <Box hidden={tabValue !== 1} sx={{ width: '100%' }}>
        <Grid container spacing={3}>
          {/* @ts-ignore */}
          <Grid component="div" sx={{ width: { xs: '100%', md: '100%' } }}>
            <Paper elevation={3} sx={{
              p: 3, display: 'flex', flexDirection: 'column', height: '100%',
              transition: 'transform 0.3s ease-in-out',
              '&:hover': { transform: 'translateY(-5px)' },
              border: '1px solid #bb1e0f',
            }}>
              <Typography variant="h5" gutterBottom sx={{ color: '#bb1e0f', mb: 2 }}>
                Dodaj/uredi korisnika
            </Typography>
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
                label="Ime"
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
                  value={userFormFields.odjel}
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

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveUser}
                  sx={{
                    bgcolor: '#bb1e0f', color: 'white', '&:hover': { bgcolor: '#8a1a0b' },
                    flexGrow: 1,
                  }}
                >
                  Spremi
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleClearUserForm}
                  sx={{
                    color: '#bb1e0f', borderColor: '#bb1e0f', '&:hover': { borderColor: '#8a1a0b', color: '#8a1a0b' },
                    flexGrow: 1,
                  }}
                >
                  Poništi
                </Button>
            </Box>
            </Paper>
          </Grid>
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
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ime</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Broj kartice</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Potpis</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Odjel</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Datum rođenja</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Zaposlen od</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ukupno dana GO</TableCell>
                      <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Ukupno dana starog GO</TableCell>
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
                        <TableCell>{user.datumRodenja}</TableCell>
                        <TableCell>{user.zaposlenOd}</TableCell>
                        <TableCell>{user.ukupnoDanaGo}</TableCell>
                        <TableCell>{user.ukupnoDanaStarogGo}</TableCell>
                        <TableCell>{user.razinaPristupa === 1 ? 'Administrator' : 'Korisnik'}</TableCell>
                        <TableCell>{user.aktivan ? 'Da' : 'Ne'}</TableCell>
                        <TableCell>
                          <IconButton color="warning" onClick={() => handleUserEdit(user)} size="small" sx={{ color: '#bb1e0f' }}><EditIcon fontSize="small" /></IconButton>
                          <IconButton color="error" onClick={() => handleUserDelete(user.id)} size="small" sx={{ color: '#bb1e0f' }}><DeleteIcon fontSize="small" /></IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>
      </Box>
  );
};

export default AdminPage;