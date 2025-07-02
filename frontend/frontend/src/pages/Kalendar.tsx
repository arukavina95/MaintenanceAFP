import React, { useState, useEffect } from "react";
import { getIzostanci, deleteIzostanak } from "../services/KalendarService";
import type { Izostanak } from "../services/KalendarService";
import KalendarFormModal from "../components/KalendarFormModal";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TextField, MenuItem, InputAdornment, Box, Typography,IconButton, Button } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const nazivPrikaz: Record<string, string> = {
  GodisnjiOdmor: "Godišnji odmor",
  PlaceniDopust: "Plaćeni dopust",
  DrzavniPraznik: "Državni praznik",
  Nepoznato: "Nepoznato",
  Bolovanje: "Bolovanje"
};

const daniUTjednu = ["PONEDJELJAK", "UTORAK", "SRIJEDA", "ČETVRTAK", "PETAK", "SUBOTA", "NEDJELJA"];

const mjeseci = [
  "Siječanj", "Veljača", "Ožujak", "Travanj", "Svibanj", "Lipanj",
  "Srpanj", "Kolovoz", "Rujan", "Listopad", "Studeni", "Prosinac"
];

function getDaysInMonth(year: number, month: number) {
  // month: 1-12
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number) {
  // 0 = nedjelja, 1 = ponedjeljak, ...
  const jsDay = new Date(year, month - 1, 1).getDay();
  return jsDay === 0 ? 6 : jsDay - 1; // pretvori u 0=ponedjeljak
}

const KalendarPage: React.FC = () => {
    const [godina, setGodina] = useState(new Date().getFullYear());
    const [mjesec, setMjesec] = useState(new Date().getMonth() + 1);
    const [izostanci, setIzostanci] = useState<Izostanak[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedIzostanak, setSelectedIzostanak] = useState<Izostanak | null>(null);
    const [sortBy, setSortBy] = useState<'razlogIzostankaNaziv' | 'pocetniDatum' | 'zavrsniDatum' | 'imeKorisnika'>('pocetniDatum');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterEmployee, setFilterEmployee] = useState('');
    const [filterReason, setFilterReason] = useState('');
    
    const refreshIzostanci = () => {
      getIzostanci(godina, mjesec)
        .then(data => setIzostanci(Array.isArray(data) ? data : []))
        .catch(() => setIzostanci([]));
    };

    useEffect(() => {
      refreshIzostanci();
    }, [godina, mjesec]);

  const daysInMonth = getDaysInMonth(godina, mjesec);
  const firstDayOfWeek = getFirstDayOfWeek(godina, mjesec);

  // Pripremi polje za prikaz kalendara (6 tjedana x 7 dana)
  const calendar: (number | null)[][] = [];
  let day = 1 - firstDayOfWeek;
  for (let week = 0; week < 6; week++) {
    const weekArr = [];
    for (let d = 0; d < 7; d++) {
      weekArr.push(day > 0 && day <= daysInMonth ? day : null);
      day++;
    }
    calendar.push(weekArr);
  }

  // Funkcija za dohvat izostanaka za određeni dan
  function izostanciZaDan(dan: number, danUTjednu: number) {
    if (!Array.isArray(izostanci)) return [];
    if (danUTjednu === 5 || danUTjednu === 6) return []; // 5=subota, 6=nedjelja
    const datum = new Date(godina, mjesec - 1, dan);
    return izostanci.filter(iz =>
      new Date(iz.pocetniDatum) <= datum && new Date(iz.zavrsniDatum) >= datum
    );
  }

  const handleDelete = async (id: number) => {
    await deleteIzostanak(id);
    setModalOpen(false);
    setSelectedIzostanak(null);
    refreshIzostanci();
  };

  const handleSort = (property: typeof sortBy) => {
    const isAsc = sortBy === property && sortDirection === 'asc';
    setSortBy(property);
    setSortDirection(isAsc ? 'desc' : 'asc');
  };

  const filteredIzostanci = izostanci
    .filter(iz => (filterEmployee ? iz.imeKorisnika.toLowerCase().includes(filterEmployee.toLowerCase()) : true))
    .filter(iz => (filterReason ? iz.razlogIzostankaNaziv === filterReason : true))
    .sort((a, b) => {
      if (sortBy === 'pocetniDatum' || sortBy === 'zavrsniDatum') {
        const aDate = new Date(String(a[sortBy]));
        const bDate = new Date(String(b[sortBy]));
        if (aDate < bDate) return sortDirection === 'asc' ? -1 : 1;
        if (aDate > bDate) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      } else {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
    });

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, background: "#f7f8fa", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: "#a00" }}>Kalendar izostanaka</Typography>
        <Typography variant="subtitle1" sx={{ color: "#555" }}>
          Upravljajte i pregledajte izostanke djelatnika po danima i mjesecima.
        </Typography>

        {/* Dodaj izostanak button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => { setSelectedIzostanak(null); setModalOpen(true); }}
            startIcon={<EventNoteIcon />}
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
            Dodaj izostanak
          </Button>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2, mt: 1 }}>
        <IconButton onClick={() => setMjesec(mjesec === 1 ? 12 : mjesec - 1)} size="small" sx={{ color: '#bb1e0f' }}>
          <ArrowBackIosIcon fontSize="small" />
        </IconButton>
        <EventNoteIcon sx={{ color: '#bb1e0f', mr: 0.5 }} />
        <Typography variant="h6" sx={{ fontSize: '1.1em', fontWeight: 'bold', color: '#bb1e0f', mx: 1 }}>
          {mjeseci[mjesec - 1].toLowerCase()} {godina}
        </Typography>
        <IconButton onClick={() => setMjesec(mjesec === 12 ? 1 : mjesec + 1)} size="small" sx={{ color: '#bb1e0f' }}>
          <ArrowForwardIosIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Calendar */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 3, mb: 4, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {daniUTjednu.map(dan => (
                <th key={dan} style={{
                  padding: 8, background: "#a00", color: "#fff", fontWeight: 700, fontSize: "1.05em", border: "none"
                }}>{dan}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {calendar.map((week, i) => (
              <tr key={i}>
                {week.map((dan, j) => (
                  <td
                    key={j}
                    style={{
                      minWidth: 90,
                      height: 70,
                      verticalAlign: "top",
                      background: dan ? (j >= 5 ? "#f5eaea" : "#fff") : "#f0f0f0",
                      border: "1px solid #eee",
                      cursor: dan ? "pointer" : "default",
                      position: "relative"
                    }}
                    onClick={() => dan && izostanciZaDan(dan, j).length > 0 && setSelectedIzostanak(izostanciZaDan(dan, j)[0])}
                  >
                    {dan && (
                      <Box>
                        <Typography sx={{ fontWeight: 700, color: "#a00", fontSize: "1.1em" }}>{dan}</Typography>
                        <Box sx={{ fontSize: 12 }}>
                          {izostanciZaDan(dan, j).map((iz, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                color: iz.razlogIzostankaNaziv === "Bolovanje" ? "#1976d2" : "#a00",
                                fontWeight: 500,
                                borderRadius: 1,
                                px: 0.5,
                                py: 0.2,
                                my: 0.2,
                                background: "#f9f9f9",
                                cursor: "pointer",
                                ":hover": { background: "#ffeaea" }
                              }}
                              onClick={e => { e.stopPropagation(); setSelectedIzostanak(iz); setModalOpen(true); }}
                            >
                              {iz.razlogIzostankaNaziv} - {iz.imeKorisnika}
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Paper>

      {/* Table of absences */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', gap: 2, p: 2, flexWrap: 'wrap', background: "#faf6f6" }}>
          <TextField
            label="Filtriraj po djelatniku"
            value={filterEmployee}
            onChange={e => setFilterEmployee(e.target.value)}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: <InputAdornment position="start">👤</InputAdornment>
            }}
          />
          <TextField
            label="Filtriraj po razlogu"
            value={filterReason}
            onChange={e => setFilterReason(e.target.value)}
            size="small"
            select
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Svi razlozi</MenuItem>
            {[...new Set(izostanci.map(iz => iz.razlogIzostankaNaziv))].map(razlog => (
              <MenuItem key={razlog} value={razlog}>{razlog}</MenuItem>
            ))}
          </TextField>
        </Box>
        <Table size="small" aria-label="Izostanci" sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow sx={{ background: '#a00' }}>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>RAZLOG IZOSTANKA</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>POČETNI DATUM</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>ZAVRŠNI DATUM</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>DJELATNIK</TableCell>
              <TableCell sx={{ color: '#fff', fontWeight: 700 }}>PRIVITAK</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredIzostanci.length > 0 ? filteredIzostanci.map((iz, idx) => (
              <TableRow
                key={idx}
                sx={{
                  background: idx % 2 === 0 ? '#fff' : '#faf6f6',
                  cursor: 'pointer',
                  transition: 'background 0.2s',
                  '&:hover': { background: '#ffeaea' }
                }}
                onClick={() => { setSelectedIzostanak(iz); setModalOpen(true); }}
              >
                <TableCell sx={{ fontWeight: 500, color: '#a00' }}>{nazivPrikaz[iz.razlogIzostankaNaziv] || iz.razlogIzostankaNaziv}</TableCell>
                <TableCell sx={{ color: '#222' }}>{new Date(iz.pocetniDatum).toLocaleDateString()}</TableCell>
                <TableCell sx={{ color: '#222' }}>{new Date(iz.zavrsniDatum).toLocaleDateString()}</TableCell>
                <TableCell sx={{ color: '#222' }}>{iz.imeKorisnika}</TableCell>
                <TableCell sx={{ color: '#222' }} onClick={e => e.stopPropagation()}>
                  {iz.privitakNaziv && iz.privitakPath
                    ? <a
                        href={`http://localhost:5008${iz.privitakPath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: "#a00",
                          textDecoration: "none",
                          fontWeight: 600,
                          border: "1px solid #a00",
                          borderRadius: 5,
                          padding: "4px 10px",
                          background: "#fff",
                          transition: "background 0.2s, color 0.2s",
                          display: "inline-block"
                        }}
                        onMouseOver={e => (e.currentTarget.style.background = "#a00", e.currentTarget.style.color = "#fff")}
                        onMouseOut={e => (e.currentTarget.style.background = "#fff", e.currentTarget.style.color = "#a00")}
                      >
                        {iz.privitakNaziv}
                      </a>
                    : ""}
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} sx={{ textAlign: 'center', padding: 4, color: '#a00', fontWeight: 600 }}>
                  Nema izostanaka za odabrani mjesec.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <KalendarFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedIzostanak(null); }}
        onSaved={refreshIzostanci}
        initialData={selectedIzostanak}
        onDelete={handleDelete}
      />
    </Box>
  );
};

export default KalendarPage;