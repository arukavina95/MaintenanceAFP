import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  Button, 
  IconButton,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { 
  Add as AddIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getRadniNalozi, getUsers, getMachines, getDepartments, updateRadniNalog, convertToUpdateDTO } from '../services/radniNaloziService';
import type { RadniNalog, User, Machine, Department } from '../services/radniNaloziService';
import type { SelectChangeEvent } from '@mui/material/Select';
import RadniNaloziModal from '../components/RadniNaloziModal';
import RadniNalogEditModal from '../components/RadniNalogEditModal';
import CheckMarkRadniNalogModal from '../components/CheckMarkRadniNalogModal';
import { WorkOrderCard } from '../components/WorkOrderCard';
import { designTokens } from '../theme/designSystem';
import { format } from 'date-fns';

const filterInitial = {
  zaOdjel: '',
  stroj: '',
  prijavaOd: '',
  zatvorenoOd: '',
  vrstaRn: '',
  status: '',
  odjelPrijave: '',
  brojRn: '',
  ustanovio: '',
  stupanjHitnosti: '',
};



const RadniNaloziPage: React.FC = () => {
  const [data, setData] = useState<RadniNalog[]>([]);
  const [filters, setFilters] = useState(filterInitial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [openCheckModal, setOpenCheckModal] = useState(false);
  const [selectedCheckRow, setSelectedCheckRow] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Move fetchData outside of useEffect
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Prvo dohvati radne naloge (glavni podatak)
      const nalogRes = await getRadniNalozi();
      setData(nalogRes);
      
      // Zatim pokušaj dohvatiti dodatne podatke (users, machines, departments)
      // Ako neki ne uspije, nastavi bez njih
      try {
        const usersRes = await getUsers();
        setUsers(usersRes);
      } catch (usersErr) {
        console.warn('Nije moguće dohvatiti korisnike:', usersErr);
        setUsers([]);
      }
      
      try {
        const machinesRes = await getMachines();
        setMachines(machinesRes);
      } catch (machinesErr) {
        console.warn('Nije moguće dohvatiti strojeve:', machinesErr);
        setMachines([]);
      }
      
      try {
        const departmentsRes = await getDepartments();
        setDepartments(departmentsRes);
      } catch (departmentsErr) {
        console.warn('Nije moguće dohvatiti odjele:', departmentsErr);
        setDepartments([]);
      }
      
    } catch (err: any) {
      setError('Greška pri dohvaćanju radnih naloga.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name!]: value }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name!]: value }));
  };

  const handleFilter = () => {
    // TODO: Filtriraj podatke prema filterima (možeš filtrirati lokalno ili pozivati API s parametrima)
  };

  const handleClear = () => {
    setFilters(filterInitial);
    // TODO: Vrati sve podatke (ponovno dohvatiti ili resetirati lokalni filter)
  };

  const getUserIdByName = (name: string) => {
    const user = users.find(u => u.ime === name);
    return user ? user.id : '';
  };
  const getDepartmentIdByName = (name: string) => {
    const dept = departments.find(d => d.naslov === name);
    return dept ? dept.id : '';
  };
  const getMachineIdByName = (name: string) => {
    const machine = machines.find(m => m.naslov === name);
    return machine ? machine.id : '';
  };

  const getDepartmentNameById = (id: number) => {
    const dept = departments.find(d => d.id === id);
    return dept ? dept.naslov : '';
  };

  const getVrstaNalogaValueByLabel = (input: string) => {
    const allowed = ['preventiva', 'neproizvodni', 'brusenje', 'zamjena', 'popravak'];
    if (allowed.includes(input)) return input;
    const options = [
      { value: 'preventiva', label: 'Preventiva' },
      { value: 'neproizvodni', label: 'Neproizvodni dio' },
      { value: 'brusenje', label: 'Brušenje / Stroja obrada' },
      { value: 'zamjena', label: 'Zamjena al' },
      { value: 'popravak', label: 'Nalog za popravak stroja' },
    ];
    const found = options.find(opt => opt.label === input);
    return found ? found.value : '';
  };

  const handleEditClick = (row: any) => {
    // Provjeri da li postoje svi potrebni podaci
    if (!row || !row.brojRN || !row.naslov) {
      console.error('Nedostaju podaci za uređivanje:', row);
      return;
    }

    setEditData({
      id: row.id,
      brojRadnogNaloga: row.brojRN || '',
      naslov: row.naslov || '',
      odjelPrijave: getDepartmentIdByName(row.odjelPrijave) || '',
      ustanovio: getUserIdByName(row.ustanovio) || '',
      datumPrijave: row.datumPrijave || '',
      zaOdjel: row.zaOdjel || '',
      stroj: getMachineIdByName(row.stroj) || '',
      hitnost: row.stupanjHitnosti || '',
      otklonitiDo: row.otklonitiDo || '',
      ppBroj: row.ppBroj || '',
      tehnoloskaOznaka: row.tehnoloskaOznaka || '',
      zaDjelatnika: getUserIdByName(row.zaDjelatnika) || '',
      datumDodjele: row.datumDodjele || '',
      vrstaNaloga: getVrstaNalogaValueByLabel(row.vrstaNaloga) || '',
      opisKvara: row.opisKvara || '',
      obrazlozenje: row.obrazlozenje || '',
      satiRada: row.satiRada || '',
      nalogZatvorio: getUserIdByName(row.nalogZatvorio) || '',
      sudjelovaliIds: row.sudionici ? row.sudionici.map((u: any) => u.id) : [],
    });
    setOpenEditModal(true);
  };
  const handleEditClose = () => {
    setOpenEditModal(false);
    setEditData(null);
  };
  const handleEditSave = async (updatedNalog: any) => {
    try {
      // Convert the updatedNalog to the proper DTO format
      const updateDTO = convertToUpdateDTO(updatedNalog.id, updatedNalog);
      await updateRadniNalog(updatedNalog.id, updateDTO);
      const refreshedData = await getRadniNalozi();
      setData(refreshedData);
    } catch (err) {
      setError('Greška pri spremanju izmjena.');
    }
    setOpenEditModal(false);
    setEditData(null);
  };

  function getOpisOnly(opisKvara: string) {
  if (!opisKvara) return '';
  // Parsiraj sve blokove iz opisa
  const regex = /(.*?)([\wšđčćžŠĐČĆŽ .,-]+, \d{1,2}\.\d{1,2}\.\d{4}\. \d{2}:\d{2}:\d{2}, Broj djelatnika: \d+, Sati rada: \d+)/gs;
  let match;
  let resultArr: string[] = [];
  while ((match = regex.exec(opisKvara)) !== null) {
    resultArr.push(match[1].trim());
  }
  // Ako regex ne nađe ništa, vrati cijeli opis
  if (resultArr.length === 0) {
    return opisKvara;
  }
  // Spoji sve opise u jedan string (odvoji ih novim redom)
  return resultArr.join('\n');
}

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="flex-end" alignItems="center" mb={4}>
        <Box display="flex" gap={2}>
          <Button
            variant={viewMode === 'grid' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('grid')}
            size="small"
          >
            Grid
          </Button>
          <Button
            variant={viewMode === 'table' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('table')}
            size="small"
          >
            Tablica
          </Button>
                     <Button
             variant="contained"
             startIcon={<AddIcon />}
             onClick={() => setOpenModal(true)}
             sx={{
               backgroundColor: 'primary.main',
               '&:hover': { backgroundColor: 'primary.dark' },
               fontWeight: 600,
               px: 3,
               py: 1.5,
               borderRadius: designTokens.borderRadius.lg,
               boxShadow: designTokens.shadows.md,
             }}
           >
             Novi radni nalog
           </Button>
        </Box>
      </Box>

      {/* Filteri */}
      <Card sx={{ 
        mb: 4, 
        p: 3, 
        border: '1px solid',
        borderColor: 'neutral.200',
        borderRadius: designTokens.borderRadius.lg,
        boxShadow: designTokens.shadows.sm,
      }}>
        <Typography variant="h6" fontWeight={600} mb={2}>
          Filtri
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={2}>
          <TextField
            label="Broj RN"
            name="brojRn"
            value={filters.brojRn}
            onChange={handleFilterChange}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              name="status"
              value={filters.status}
              label="Status"
              onChange={handleSelectChange}
            >
              <MenuItem value="">Svi</MenuItem>
              <MenuItem value="Otvoren">Otvoren</MenuItem>
              <MenuItem value="U tijeku">U tijeku</MenuItem>
              <MenuItem value="Zatvoren">Zatvoren</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <InputLabel>Hitnost</InputLabel>
            <Select
              name="stupanjHitnosti"
              value={filters.stupanjHitnosti}
              label="Hitnost"
              onChange={handleSelectChange}
            >
              <MenuItem value="">Svi</MenuItem>
              <MenuItem value="Visok">Visok</MenuItem>
              <MenuItem value="Srednji">Srednji</MenuItem>
              <MenuItem value="Nizak">Nizak</MenuItem>
            </Select>
          </FormControl>
          <Box display="flex" gap={1}>
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={handleFilter}
            >
              Filtriraj
            </Button>
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClear}
            >
              Očisti
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Sadržaj */}
      {viewMode === 'grid' ? (
        // Grid view
        <Box display="flex" flexWrap="wrap" gap={3}>
          {loading ? (
            <Box width="100%">
              <Typography>Učitavanje...</Typography>
            </Box>
          ) : error ? (
            <Box width="100%">
              <Typography color="error">{error}</Typography>
            </Box>
          ) : data.length === 0 ? (
            <Box width="100%">
              <Typography>Nema podataka.</Typography>
            </Box>
          ) : (
            data.map((workOrder) => (
              <Box key={workOrder.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 12px)', lg: 'calc(33.33% - 16px)' } }}>
                <WorkOrderCard
                  workOrder={workOrder}
                  users={users}
                  onClick={() => {
                    setSelectedCheckRow(workOrder);
                    setOpenCheckModal(true);
                  }}
                />
              </Box>
            ))
          )}
        </Box>
      ) : (
        // Table view
        <TableContainer component={Paper} sx={{ borderRadius: designTokens.borderRadius.lg, overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Akcije</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>RN</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>NASLOV</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ODJEL PRIJAVE</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>USTANOVIO</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>DATUM PRIJAVE</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>STROJ</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>OPIS PRIJAVE</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ZA ODJEL</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>PRIORITET</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>OTKLONITI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>STATUS</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>ZATVORIO</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={13}>Učitavanje...</TableCell></TableRow>
              ) : error ? (
                <TableRow><TableCell colSpan={13} sx={{ color: 'error.main' }}>{error}</TableCell></TableRow>
              ) : data.length === 0 ? (
                <TableRow><TableCell colSpan={13}>Nema podataka.</TableCell></TableRow>
              ) : (
                                 data.map((row) => (
                   <TableRow key={row.id} hover>
                     <TableCell>
                                               <Box display="flex" gap={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleEditClick(row)}
                            sx={{ color: 'primary.main' }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedCheckRow(row);
                              setOpenCheckModal(true);
                            }}
                            sx={{ color: 'success.main' }}
                          >
                            <CheckCircleIcon />
                          </IconButton>
                        </Box>
                     </TableCell>
                     <TableCell>{row.brojRN}</TableCell>
                     <TableCell>{row.naslov}</TableCell>
                     <TableCell>{row.odjelPrijave}</TableCell>
                     <TableCell>{row.ustanovio}</TableCell>
                     <TableCell>{format(new Date(row.datumPrijave), 'dd.MM.yyyy')}</TableCell>
                     <TableCell>{row.stroj}</TableCell>
                     <TableCell>{getOpisOnly(row.opisKvara)}</TableCell>
                     <TableCell>{getDepartmentNameById(row.zaOdjel)}</TableCell>
                     <TableCell>
                       <Chip
                         label={row.stupanjHitnosti}
                         color={
                           row.stupanjHitnosti === 'Kritičan' ? 'error' :
                           row.stupanjHitnosti === 'Visok' ? 'warning' :
                           row.stupanjHitnosti === 'Srednji' ? 'info' :
                           row.stupanjHitnosti === 'Nizak' ? 'success' : 'default'
                         }
                         size="small"
                       />
                     </TableCell>
                     <TableCell>{row.otklonitiDo ? format(new Date(row.otklonitiDo), 'dd.MM.yyyy') : '-'}</TableCell>
                     <TableCell>
                       <Chip
                         label={row.status}
                         color={
                           row.status === 'Otvoren' ? 'warning' :
                           row.status === 'U tijeku' ? 'info' :
                           row.status === 'Zatvoren' ? 'success' : 'default'
                         }
                         size="small"
                       />
                     </TableCell>
                     <TableCell>{row.odradio || '-'}</TableCell>
                   </TableRow>
                 ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modalni prozori */}
      <RadniNaloziModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        users={users}
        machines={machines}
        departments={departments}
        onSuccess={fetchData}
      />

      <RadniNalogEditModal
        open={openEditModal}
        onClose={handleEditClose}
        data={editData}
        users={users}
        machines={machines}
        departments={departments}
        onSave={handleEditSave}
      />

      <CheckMarkRadniNalogModal
        open={openCheckModal}
        onClose={() => setOpenCheckModal(false)}
        data={selectedCheckRow}
        users={users}
        machines={machines}
        departments={departments}
        onSuccess={fetchData}
      />
    </Box>
  );
};

export default RadniNaloziPage;
