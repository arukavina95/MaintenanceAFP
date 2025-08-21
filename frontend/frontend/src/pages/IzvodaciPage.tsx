import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Chip,
  Checkbox,

  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,

  MenuItem,
  FormControl,
  Select,
  Tooltip,

} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  PictureAsPdf as PdfIcon,
  Description as DocIcon,
  TableChart as XlsIcon,
  Image as ImageIcon,
  TextFields as TxtIcon,
  GetApp as DownloadIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon,
  Sort as SortIcon
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { hr } from 'date-fns/locale';
import { getIzvodaci, deleteIzvodac } from '../services/izvodaciService';
import { getVanjskiIzvodaci } from '../services/vanjskiIzvodaciService';
import { downloadFile } from '../services/uploadService';
import { downloadDocument } from '../services/vanjskiIzvodaciService';
import type { Izvodaci } from '../services/izvodaciService';
import type { VanjskiIzvodaci } from '../services/vanjskiIzvodaciService';
import IzvodaciModal from '../components/IzvodaciModal';
import DocumentViewerModal from '../components/DocumentViewerModal';
import { designTokens } from '../theme/designSystem';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const IzvodaciPage: React.FC = () => {
  const [data, setData] = useState<Izvodaci[]>([]);
  const [vanjskiIzvodaci, setVanjskiIzvodaci] = useState<VanjskiIzvodaci[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Izvodaci | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dokumentacija states
  const [docSearchTerm, setDocSearchTerm] = useState('');
  const [docFilterType, setDocFilterType] = useState('all');
  const [docSortBy, setDocSortBy] = useState('date');
  const [docFilterSource, setDocFilterSource] = useState('all'); // 'all', 'privitak', 'dokument'
  
  // Document viewer states
  const [viewerModal, setViewerModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<{ fileName: string; fileType: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [izvodaciData, vanjskiData] = await Promise.all([
        getIzvodaci(),
        getVanjskiIzvodaci()
      ]);
      setData(izvodaciData);
      setVanjskiIzvodaci(vanjskiData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Greška pri učitavanju podataka');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Implement search logic if needed
  };

  const handleAdd = () => {
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleModalSuccess = () => {
    fetchData();
  };

  const handleEdit = (item: Izvodaci) => {
    setSelectedItem(item);
    setEditModal(true);
  };

  const handleEditModalClose = () => {
    setEditModal(false);
    setSelectedItem(null);
  };

  const handleEditModalSuccess = () => {
    fetchData();
    setEditModal(false);
    setSelectedItem(null);
  };

  const handleDelete = async (item: Izvodaci) => {
    if (window.confirm(`Jeste li sigurni da želite obrisati izvođača "${item.broj}"?`)) {
      try {
        await deleteIzvodac(item.id!);
        fetchData(); // Refresh the data after successful deletion
      } catch (err) {
        console.error('Error deleting izvodac:', err);
        alert('Greška pri brisanju izvođača');
      }
    }
  };

  const handleDownloadFile = async (fileName: string) => {
    try {
      const blob = await downloadFile(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Greška pri preuzimanju datoteke');
    }
  };

  const handleDownloadDocument = async (fileName: string) => {
    try {
      const blob = await downloadDocument(fileName);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Greška pri preuzimanju dokumenta');
    }
  };

  const handleViewDocument = (fileName: string, fileType: string) => {
    setSelectedDocument({ fileName, fileType });
    setViewerModal(true);
  };

  const handleViewerModalClose = () => {
    setViewerModal(false);
    setSelectedDocument(null);
  };

  const handleViewerDownload = () => {
    if (selectedDocument) {
      handleDownloadFile(selectedDocument.fileName);
    }
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'pdf':
        return <PdfIcon sx={{ color: 'red', fontSize: '2rem' }} />;
      case 'doc':
      case 'docx':
        return <DocIcon sx={{ color: 'blue', fontSize: '2rem' }} />;
      case 'xls':
      case 'xlsx':
        return <XlsIcon sx={{ color: 'green', fontSize: '2rem' }} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon sx={{ color: 'orange', fontSize: '2rem' }} />;
      case 'txt':
        return <TxtIcon sx={{ color: 'grey', fontSize: '2rem' }} />;
      default:
        return <FileIcon sx={{ color: 'grey', fontSize: '2rem' }} />;
    }
  };

  const formatFileSize = (size: string) => {
    return size; // Placeholder - trebalo bi implementirati pravu logiku
  };

  const truncateFileName = (fileName: string, maxLength: number = 25) => {
    if (fileName.length <= maxLength) return fileName;
    const extension = fileName.split('.').pop();
    const name = fileName.substring(0, fileName.lastIndexOf('.'));
    const truncatedName = name.substring(0, maxLength - 3);
    return `${truncatedName}...${extension ? '.' + extension : ''}`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'dd.MM.yy HH:mm', { locale: hr });
    } catch {
      return dateString;
    }
  };

  const filteredData = data.filter(item =>
    item.broj.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.vanjskiIzvodac.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.mjestoRada.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.odgovornaOsoba.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dokumentacija data processing - sada uključuje i dokumente iz vanjskih izvođača
  const allDocuments = [
    // Privitci iz glavnih izvođača
    ...data
      .filter(item => item.privitak)
      .map(item => ({
        id: `privitak-${item.id}`,
        fileName: item.privitak,
        uploadDate: item.pocetniDatum,
        fileType: item.privitak?.split('.').pop()?.toLowerCase() || 'unknown',
        size: '1.2 MB',
        uploadedBy: item.odgovornaOsoba,
        relatedItem: item.broj,
        source: 'privitak' as const,
        sourceLabel: 'Privitak izvođača'
      })),
    // Dokumenti iz vanjskih izvođača
    ...vanjskiIzvodaci
      .filter(item => item.dokumenti)
      .map(item => ({
        id: `dokument-${item.id}`,
        fileName: item.dokumenti,
        uploadDate: item.datumKreiranja,
        fileType: item.dokumenti?.split('.').pop()?.toLowerCase() || 'unknown',
        size: '1.2 MB',
        uploadedBy: item.imeFirme,
        relatedItem: item.imeFirme,
        source: 'dokument' as const,
        sourceLabel: 'Dokument vanjskog izvođača'
      }))
  ];

  const filteredDocuments = allDocuments.filter(doc => {
    const matchesSearch = doc.fileName.toLowerCase().includes(docSearchTerm.toLowerCase()) ||
                         doc.uploadedBy.toLowerCase().includes(docSearchTerm.toLowerCase());
    const matchesFilter = docFilterType === 'all' || doc.fileType === docFilterType;
    const matchesSource = docFilterSource === 'all' || doc.source === docFilterSource;
    return matchesSearch && matchesFilter && matchesSource;
  });

  const sortedDocuments = [...filteredDocuments].sort((a, b) => {
    switch (docSortBy) {
      case 'name':
        return a.fileName.localeCompare(b.fileName);
      case 'date':
        return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
      case 'size':
        return a.size.localeCompare(b.size);
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography>Učitavanje...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

     return (
     <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
              {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: { xs: 'center', sm: 'flex-end' }, 
          alignItems: 'center', 
          mb: 1,
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
                     <Button
             variant="contained"
             startIcon={<AddIcon />}
             onClick={handleAdd}
             sx={{
               backgroundColor: designTokens.colors.primary[500],
               '&:hover': { backgroundColor: designTokens.colors.primary[600] },
               fontSize: { xs: '0.75rem', sm: '0.875rem' },
               px: { xs: 1, sm: 2 },
               py: { xs: 0.5, sm: 1 }
             }}
           >
             NOVA
           </Button>
           <Button
             variant="contained"
             startIcon={<SearchIcon />}
             onClick={handleSearch}
             sx={{
               backgroundColor: designTokens.colors.secondary[500],
               '&:hover': { backgroundColor: designTokens.colors.secondary[600] },
               fontSize: { xs: '0.75rem', sm: '0.875rem' },
               px: { xs: 1, sm: 2 },
               py: { xs: 0.5, sm: 1 }
             }}
           >
             PRETRAŽI
           </Button>
           <Button
             variant="contained"
             startIcon={<AddIcon />}
             onClick={handleAdd}
             sx={{
               backgroundColor: designTokens.colors.primary[500],
               '&:hover': { backgroundColor: designTokens.colors.primary[600] },
               fontSize: { xs: '0.75rem', sm: '0.875rem' },
               px: { xs: 1, sm: 2 },
               py: { xs: 0.5, sm: 1 }
             }}
           >
             Nova
           </Button>
        </Box>
      </Box>

                           {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
         <Tabs 
           value={tabValue} 
           onChange={(event, newValue) => setTabValue(newValue)}
           variant="scrollable"
           scrollButtons="auto"
           sx={{
             '& .MuiTab-root': {
               color: 'text.secondary',
               fontWeight: 'bold',
               textTransform: 'none',
               fontSize: { xs: '0.875rem', sm: '1rem' },
               minWidth: { xs: 'auto', sm: 'auto' },
               px: { xs: 1, sm: 2 }
             },
             '& .Mui-selected': {
               color: designTokens.colors.primary
             },
             '& .MuiTabs-indicator': {
               backgroundColor: designTokens.colors.primary,
               height: 3
             }
           }}
         >
           <Tab label="IZVOĐAČI" />
           <Tab label="DOKUMENTACIJA" />
         </Tabs>
       </Box>

             <TabPanel value={tabValue} index={0}>
                  {/* Search Bar */}
          <Box sx={{ 
            display: 'flex', 
            gap: { xs: 1, sm: 2 }, 
            mb: 2, 
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
           <TextField
             placeholder="Pretraži izvođače..."
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
             sx={{
               flexGrow: 1,
               width: '100%',
               '& .MuiOutlinedInput-root': {
                 borderRadius: 2,
                 '& fieldset': {
                   borderColor: 'grey.300'
                 },
                 '&:hover fieldset': {
                   borderColor: designTokens.colors.primary
                 }
               }
             }}
             InputProps={{
               startAdornment: <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
             }}
           />
           <Button
             variant="contained"
             onClick={handleSearch}
             sx={{
               backgroundColor: designTokens.colors.primary[500],
               borderRadius: 2,
               px: { xs: 2, sm: 3 },
               py: { xs: 1, sm: 1.5 },
               fontSize: { xs: '0.75rem', sm: '0.875rem' },
               width: { xs: '100%', sm: 'auto' }
             }}
           >
             Pretraži
           </Button>
         </Box>

                                   {/* Table */}
          <TableContainer 
            component={Paper} 
            sx={{ 
              boxShadow: 2, 
              borderRadius: 1,
              overflowX: 'auto',
              '& .MuiTable-root': {
                minWidth: { xs: 800, sm: 1000, md: 1200 }
              }
            }}
          >
            <Table size="small">
             <TableHead>
               <TableRow sx={{ backgroundColor: designTokens.colors.primary }}>
                                   <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    width: { xs: 60, sm: 80 }, 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' }
                  }}>
                    AKCIJE
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 120 }
                  }}>
                    BROJ
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 120 }
                  }}>
                    IZVOĐAČ
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 90, sm: 110 }
                  }}>
                    POČETNI DATUM
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 90, sm: 110 }
                  }}>
                    ZAVRŠNI DATUM
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 100 }
                  }}>
                    MJESTO RADA
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 120 }
                  }}>
                    KONTAKT
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 120, sm: 150 }
                  }}>
                    OPIS RADA
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 120 }
                  }}>
                    ODGOVORNA OSOBA
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 50, sm: 60 }
                  }}>
                    ZASTOJ
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 100 }
                  }}>
                    STATUS
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 80, sm: 120 }
                  }}>
                    TIP RADOVA
                  </TableCell>
                  <TableCell sx={{ 
                    color: 'black', 
                    fontWeight: 'bold', 
                    py: { xs: 0.5, sm: 1 }, 
                    px: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '0.65rem', sm: '0.75rem' },
                    width: { xs: 60, sm: 80 }
                  }}>
                    PRIVITAK
                  </TableCell>
               </TableRow>
             </TableHead>
                         <TableBody>
                               {filteredData.map((row) => (
                  <TableRow key={row.id} hover sx={{ '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}>
                    <TableCell sx={{ py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } }}>
                      <Box sx={{ display: 'flex', gap: { xs: 0.25, sm: 0.5 } }}>
                        <IconButton 
                          size="small"
                          onClick={() => handleEdit(row)}
                          sx={{ 
                            color: 'green',
                            p: { xs: 0.25, sm: 0.5 },
                            '&:hover': { 
                              backgroundColor: 'green.50',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <EditIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                        </IconButton>
                        <IconButton 
                          size="small"
                          onClick={() => handleDelete(row)}
                          sx={{ 
                            color: 'red',
                            p: { xs: 0.25, sm: 0.5 },
                            '&:hover': { 
                              backgroundColor: 'red.50',
                              transform: 'scale(1.05)'
                            }
                          }}
                        >
                          <DeleteIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                    }}>
                      {row.broj}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                    }}>
                      {row.vanjskiIzvodac}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.65rem', sm: '0.75rem' } 
                    }}>
                      {formatDate(row.pocetniDatum)}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.65rem', sm: '0.75rem' } 
                    }}>
                      {formatDate(row.zavrsniDatum)}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                    }}>
                      {row.mjestoRada}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                    }}>
                      {row.kontakt}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.65rem', sm: '0.75rem' },
                      maxWidth: { xs: 120, sm: 150 }, 
                      wordWrap: 'break-word',
                      lineHeight: 1.2
                    }}>
                      {row.opisRada}
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.7rem', sm: '0.8rem' } 
                    }}>
                      {row.odgovornaOsoba}
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } }}>
                      <Checkbox 
                        checked={row.zastoj} 
                        disabled 
                        size="small"
                        sx={{ p: 0 }}
                      />
                    </TableCell>
                    <TableCell sx={{ py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } }}>
                      <Chip 
                        label={row.status} 
                        size="small"
                        sx={{
                          backgroundColor: 
                            row.status === 'Zaprimljeno' ? '#FF9800' : // Orange
                            row.status === 'Prihvaćeno' ? '#4CAF50' : // Green
                            row.status === 'Odbijeno' ? '#F44336' : // Red
                            row.status === 'Odgođeno' ? '#FFC107' : // Yellow/Amber
                            row.status === 'Zatvoreno' ? '#9E9E9E' : // Grey
                            '#2196F3', // Default blue
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: { xs: '0.6rem', sm: '0.65rem' },
                          height: { xs: '18px', sm: '20px' },
                          '& .MuiChip-label': {
                            px: { xs: 0.5, sm: 1 }
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ 
                      py: { xs: 0.25, sm: 0.5 }, 
                      px: { xs: 0.5, sm: 1 }, 
                      fontSize: { xs: '0.6rem', sm: '0.7rem' },
                      maxWidth: { xs: 80, sm: 120 }, 
                      wordWrap: 'break-word',
                      lineHeight: 1.2
                    }}>
                      {row.tipRadova}
                    </TableCell>
                                         <TableCell sx={{ py: { xs: 0.25, sm: 0.5 }, px: { xs: 0.5, sm: 1 } }}>
                       {row.privitak ? (
                         <Box sx={{ display: 'flex', gap: { xs: 0.25, sm: 0.5 } }}>
                           <IconButton 
                             size="small" 
                             sx={{ p: { xs: 0.25, sm: 0.5 } }}
                             onClick={() => handleDownloadFile(row.privitak)}
                             title="Preuzmi prilog"
                           >
                             <PdfIcon sx={{ 
                               color: 'red', 
                               fontSize: { xs: '0.875rem', sm: '1rem' } 
                             }} />
                           </IconButton>
                           <IconButton 
                             size="small" 
                             sx={{ p: { xs: 0.25, sm: 0.5 } }}
                             onClick={() => handleViewDocument(row.privitak, row.privitak?.split('.').pop()?.toLowerCase() || 'unknown')}
                             title="Pregledaj prilog"
                           >
                             <ViewIcon sx={{ 
                               color: 'blue', 
                               fontSize: { xs: '0.875rem', sm: '1rem' } 
                             }} />
                           </IconButton>
                         </Box>
                       ) : (
                         <IconButton 
                           size="small" 
                           sx={{ p: { xs: 0.25, sm: 0.5 } }}
                           disabled
                           title="Nema priloga"
                         >
                           <FileIcon sx={{ 
                             color: 'grey.400', 
                             fontSize: { xs: '0.875rem', sm: '1rem' } 
                           }} />
                         </IconButton>
                       )}
                     </TableCell>
                  </TableRow>
                ))}
             </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

                           <TabPanel value={tabValue} index={1}>
                {/* Dokumentacija Header */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: designTokens.colors.primary[700] }}>
                    📚 Dokumentacija
                  </Typography>
                  
                  {/* Search and Filter Bar */}
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 2, 
                    mb: 3, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' }
                  }}>
                    <TextField
                      placeholder="Pretraži dokumente..."
                      value={docSearchTerm}
                      onChange={(e) => setDocSearchTerm(e.target.value)}
                      sx={{
                        flexGrow: 1,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          '& fieldset': {
                            borderColor: 'grey.300'
                          },
                          '&:hover fieldset': {
                            borderColor: designTokens.colors.primary
                          }
                        }
                      }}
                      InputProps={{
                        startAdornment: <SearchIcon sx={{ color: 'grey.500', mr: 1 }} />
                      }}
                    />
                    
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                      <Select
                        value={docFilterType}
                        onChange={(e) => setDocFilterType(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: 2 }}
                        startAdornment={<FilterIcon sx={{ color: 'grey.500', mr: 1 }} />}
                      >
                        <MenuItem value="all">Svi tipovi</MenuItem>
                        <MenuItem value="pdf">PDF</MenuItem>
                        <MenuItem value="doc">DOC/DOCX</MenuItem>
                        <MenuItem value="xls">XLS/XLSX</MenuItem>
                        <MenuItem value="jpg">Slike</MenuItem>
                        <MenuItem value="txt">TXT</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                      <Select
                        value={docFilterSource}
                        onChange={(e) => setDocFilterSource(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: 2 }}
                        startAdornment={<FilterIcon sx={{ color: 'grey.500', mr: 1 }} />}
                      >
                        <MenuItem value="all">Svi izvori</MenuItem>
                        <MenuItem value="privitak">Privitci</MenuItem>
                        <MenuItem value="dokument">Dokumenti</MenuItem>
                      </Select>
                    </FormControl>

                    <FormControl sx={{ minWidth: { xs: '100%', sm: 150 } }}>
                      <Select
                        value={docSortBy}
                        onChange={(e) => setDocSortBy(e.target.value)}
                        displayEmpty
                        sx={{ borderRadius: 2 }}
                        startAdornment={<SortIcon sx={{ color: 'grey.500', mr: 1 }} />}
                      >
                        <MenuItem value="date">Po datumu</MenuItem>
                        <MenuItem value="name">Po imenu</MenuItem>
                        <MenuItem value="size">Po veličini</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Documents Grid */}
                {sortedDocuments.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    py: 8,
                    textAlign: 'center'
                  }}>
                    <FileIcon sx={{ fontSize: '4rem', color: 'grey.400', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                      Nema pronađenih dokumenata
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {docSearchTerm || docFilterType !== 'all' || docFilterSource !== 'all' 
                        ? 'Pokušajte promijeniti kriterije pretraživanja' 
                        : 'Dokumenti će se prikazati ovdje kada budu uploadani'
                      }
                    </Typography>
                  </Box>
                                 ) : (
                   <Box sx={{ 
                     display: 'grid', 
                     gridTemplateColumns: { 
                       xs: 'repeat(1, 1fr)', 
                       sm: 'repeat(2, 1fr)', 
                       md: 'repeat(3, 1fr)', 
                       lg: 'repeat(4, 1fr)' 
                     },
                     gap: 3
                   }}>
                     {sortedDocuments.map((doc) => (
                       <Card 
                         key={doc.id}
                         sx={{ 
                           height: '100%',
                           display: 'flex',
                           flexDirection: 'column',
                           transition: 'all 0.3s ease',
                           '&:hover': {
                             transform: 'translateY(-4px)',
                             boxShadow: 4
                           }
                         }}
                       >
                         <CardContent sx={{ flexGrow: 1, textAlign: 'center', pb: 1 }}>
                           <Box sx={{ mb: 2 }}>
                             {getFileIcon(doc.fileType)}
                           </Box>
                           
                           <Tooltip title={doc.fileName} placement="top">
                             <Typography 
                               variant="h6" 
                               sx={{ 
                                 fontWeight: 'bold',
                                 fontSize: '0.9rem',
                                 mb: 1,
                                 wordBreak: 'break-word'
                               }}
                             >
                               {truncateFileName(doc.fileName)}
                             </Typography>
                           </Tooltip>
                           
                           <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                             {formatDate(doc.uploadDate)}
                           </Typography>
                           
                           <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                             {formatFileSize(doc.size)}
                           </Typography>
                           
                           <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                             Uploadao: {doc.uploadedBy}
                           </Typography>
                           
                           <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                             <Chip 
                               label={`Povezano: ${doc.relatedItem}`}
                               size="small"
                               sx={{
                                 backgroundColor: designTokens.colors.primary[50],
                                 color: designTokens.colors.primary[700],
                                 fontSize: '0.7rem'
                               }}
                             />
                             <Chip 
                               label={doc.sourceLabel}
                               size="small"
                               sx={{
                                 backgroundColor: doc.source === 'dokument' 
                                   ? designTokens.colors.secondary[50] 
                                   : '#f0fdf4',
                                 color: doc.source === 'dokument' 
                                   ? designTokens.colors.secondary[600] 
                                   : designTokens.colors.success,
                                 fontSize: '0.6rem',
                                 fontWeight: 'bold'
                               }}
                             />
                           </Box>
                         </CardContent>
                         
                         <CardActions sx={{ justifyContent: 'center', pt: 0 }}>
                           <Tooltip title="Preuzmi" placement="top">
                             <IconButton 
                               size="small"
                               onClick={() => doc.source === 'dokument' 
                                 ? handleDownloadDocument(doc.fileName)
                                 : handleDownloadFile(doc.fileName)
                               }
                               sx={{ 
                                 color: designTokens.colors.primary[500],
                                 '&:hover': { 
                                   backgroundColor: designTokens.colors.primary[50]
                                 }
                               }}
                             >
                               <DownloadIcon />
                             </IconButton>
                           </Tooltip>
                           
                                                       <Tooltip title="Pregledaj" placement="top">
                              <IconButton 
                                size="small"
                                onClick={() => handleViewDocument(doc.fileName, doc.fileType)}
                                sx={{ 
                                  color: designTokens.colors.secondary[500],
                                  '&:hover': { 
                                    backgroundColor: designTokens.colors.secondary[50]
                                  }
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                         </CardActions>
                       </Card>
                     ))}
                   </Box>
                 )}
                
                {/* Summary */}
                {sortedDocuments.length > 0 && (
                  <Box sx={{ mt: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Prikazano {sortedDocuments.length} od {allDocuments.length} dokumenata
                    </Typography>
                  </Box>
                )}
              </TabPanel>

       {/* Create Modal */}
       <IzvodaciModal
         open={modalOpen}
         onClose={handleModalClose}
         onSuccess={handleModalSuccess}
       />

               {/* Edit Modal */}
        <IzvodaciModal
          open={editModal}
          onClose={handleEditModalClose}
          onSuccess={handleEditModalSuccess}
          editData={selectedItem}
          isEdit={true}
        />

        {/* Document Viewer Modal */}
        <DocumentViewerModal
          open={viewerModal}
          onClose={handleViewerModalClose}
          fileName={selectedDocument?.fileName || ''}
          fileType={selectedDocument?.fileType || ''}
          onDownload={handleViewerDownload}
        />
      </Box>
    );
  };

export default IzvodaciPage;

