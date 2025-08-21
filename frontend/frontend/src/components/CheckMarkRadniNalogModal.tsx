import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box, TextField, Button, DialogActions, Select, MenuItem, InputLabel, FormControl, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UpisRadovaModal from './UpisRadovaModal';
import AddIcon from '@mui/icons-material/Add';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import EditIcon from '@mui/icons-material/Edit';
import { updateRadniNalog } from '../services/radniNaloziService';
import authService from '../services/authService';





interface CheckMarkRadniNalogModalProps {
  open: boolean;
  onClose: () => void;
  data: any; // Replace 'any' with a more specific type if available
  onSuccess?: () => void;
  departments: Array<{ id: number; naslov: string }>;
  machines: Array<{ id: number; naslov: string }>;
  users: Array<{ id: number; ime: string }>; // Dodaj users prop
}

const CheckMarkRadniNalogModal: React.FC<CheckMarkRadniNalogModalProps> = ({ open, onClose, data, onSuccess, departments, machines, users }) => {
  const [upisModalOpen, setUpisModalOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [editOpis, setEditOpis] = React.useState(false);
  const [opisValue, setOpisValue] = React.useState('');
  const [obrazlozenjeInfoOpen, setObrazlozenjeInfoOpen] = React.useState(false);
  const [zatvoriRnModalOpen, setZatvoriRnModalOpen] = React.useState(false);
  const [nacinRjesavanjaInfoOpen, setNacinRjesavanjaInfoOpen] = React.useState(false);
  const [napomenaModalOpen, setNapomenaModalOpen] = React.useState(false);
  const [napomenaValue, setNapomenaValue] = React.useState('');
  const [napomenaLoading, setNapomenaLoading] = React.useState(false);
  
  // Uklonjeno: editOpisIndex, editOpisText

  // Dodajem state za unos nacin rjesavanja
  const [zatvoriOpis, setZatvoriOpis] = React.useState('');
  const [zatvoriSati, setZatvoriSati] = React.useState('');
  const [zatvoriDjelatnici, setZatvoriDjelatnici] = React.useState('1');
  const [nacinRjesavanja, setNacinRjesavanja] = React.useState(data?.nacinRjesavanja || '');

  // Dodajem state za status, nalog zatvorio i ukupne sate
  const [statusRn, setStatusRn] = React.useState(data?.status || '');
  const [satiRada, setSatiRada] = React.useState(0);
  const [nalogZatvorioId, setNalogZatvorioId] = React.useState(() => {
    if (users && users.length > 0) {
      return users[0].id;
    }
    return '';
  });

  React.useEffect(() => {
    if (data) {
      setOpisValue(data.opisKvara || '');
      setNacinRjesavanja(data.nacinRjesavanja || '');
      setStatusRn(data.status || '');
      setNapomenaValue(data.napomena || '');
      // Ako ID nije u users, postavi na prvi dostupni ili ''
      if (users && users.length > 0) {
        const id = data.odradioId && users.some(u => u.id === data.odradioId)
          ? data.odradioId
          : users[0].id;
        setNalogZatvorioId(id);
      } else {
        setNalogZatvorioId('');
      }
    }
  }, [data, users]);

  const handleEditOpisClick = () => {
    setEditOpis(true);
    setOpisValue(data.opisKvara || '');
  };

  const handleOpisChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setOpisValue(e.target.value);
  };

  const handleOpisSave = async () => {
    await handleUpisSave({ opis: opisValue, sati: 0, djelatnici: 0 });
    setEditOpis(false);
    setOpisValue(opisValue); // ažuriraj lokalni prikaz
  };

  const handleOpisCancel = () => {
    setEditOpis(false);
    setOpisValue(data.opisKvara || '');
  };

  // Novi handler za spremanje zapisa iz UpisRadovaModal
  const handleUpisSave = async ({ opis, sati, djelatnici }: { opis: string; sati: number; djelatnici: number }) => {
    setLoading(true);
    try {
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      const datum = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}. ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
      const korisnik = authService.getCurrentUser()?.ime || 'Nepoznato';
      // Dodaj novi zapis na postojeće
      const entries = parseOpisKvara(data.opisKvara || '');
      entries.push({
        tekst: opis,
        meta: `${korisnik}, ${datum}, Broj djelatnika: ${djelatnici}, Sati rada: ${sati}`
      });
      const noviOpis = joinOpisKvara(entries);
      const currentUserId = authService.getCurrentUser()?.id;
      const odjel = departments.find(d => d.naslov === data.odjelPrijave);
      const odjelPrijaveId = odjel ? odjel.id : undefined;
      const stroj = machines.find(m => m.naslov === data.stroj);
      const strojId = stroj ? stroj.id : undefined;
      // Izračunaj sumu svih sati iz svih zapisa
      const sumSati = entries.reduce((acc, entry) => {
        const match = entry.meta.match(/Sati rada: (\d+)/);
        return acc + (match ? parseInt(match[1], 10) : 0);
      }, 0);
      const payload = {
        Id: data.id,
        BrojRN: data.brojRN,
        Naslov: data.naslov,
        OdjelPrijaveId: odjelPrijaveId || 1,
        UstanovioId: currentUserId || 1,
        DatumPrijave: data.datumPrijave,
        StrojId: strojId || 1,
        OpisKvara: noviOpis,
        ZaOdjel: data.zaOdjel,
        StupanjHitnosti: data.stupanjHitnosti,
        OtklonitiDo: data.otklonitiDo,
        VrstaNaloga: data.vrstaNaloga,
        Status: data.status,
        Obrazlozenje: data.obrazlozenje,
        TehnoloskaOznaka: data.tehnoloskaOznaka,
        NacinRjesavanja: data.nacinRjesavanja,
        UtrosenoMaterijala: data.utrosenoMaterijala,
        DatumZatvaranja: data.datumZatvaranja,
        Napomena: data.napomena,
        OdradioId: Number(data.odradioId) || 1,
        SatiRada: sumSati,
        RDIFOPrema: data.rdifOprema,
        DatumVrijemePreuzimanja: data.datumVrijemePreuzimanja,
        DodijeljenoId: data.dodijeljenoId,
        DatumVrijemeDodjele: data.datumVrijemeDodjele,
        SudjelovaliIds: Array.isArray(data.sudjelovaliIds) && data.sudjelovaliIds.length > 0
          ? data.sudjelovaliIds
          : [currentUserId || 1],
      };
      console.log('Payload:', payload);
      await updateRadniNalog(data.id, payload);
      setOpisValue(noviOpis);
      setUpisModalOpen(false);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('FULL ERROR:', err);
      if (err.response && err.response.data) {
        if (err.response.data.errors) {
          alert('Greška pri spremanju:\n' + JSON.stringify(err.response.data.errors, null, 2));
        } else {
          alert(JSON.stringify(err.response.data));
        }
      } else {
        alert('Greška pri spremanju opisa radova!');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handler za spremanje unosa iz modala ZATVORI RN
  const handleZatvoriRnSave = () => {
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const datum = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}. ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    const korisnik = (authService.getCurrentUser && authService.getCurrentUser()?.ime) || 'Nepoznato';
    const meta = `${korisnik}, ${datum}, Broj djelatnika: ${zatvoriDjelatnici}, Sati rada: ${zatvoriSati}`;
    const noviUnos = `${zatvoriOpis}\n${meta}`;
    setNacinRjesavanja((prev: string) => prev ? prev + '\n' + noviUnos : noviUnos);
    setZatvoriOpis('');
    setZatvoriSati('');
    setZatvoriDjelatnici('1');
    setZatvoriRnModalOpen(false);
    // Automatski postavi status, ime usera i sate
    setStatusRn('Zavrsen'); // Promijenjeno iz "Završen" u "Zavrsen" (bez dijakritičkih znakova)
    setNalogZatvorioId(authService.getCurrentUser()?.id || '');
    setSatiRada(getTotalSatiRada() + Number(zatvoriSati));
  };

  // Funkcija za parsiranje opisa u blokove (tekst + meta info)
  function parseOpisKvara(opisKvara: string) {
    if (!opisKvara) return [];
    // Svaki unos završava s meta info: "ime, datum, Broj djelatnika: x, Sati rada: y"
    // Meta info prepoznaj po zadnjem pojavljivanju tog uzorka u bloku
    const regex = /(.*?)([\wšđčćžŠĐČĆŽ .,-]+, \d{1,2}\.\d{1,2}\.\d{4}\. \d{2}:\d{2}:\d{2}, Broj djelatnika: \d+, Sati rada: \d+)/gs;
    let match;
    const resultArr = [];
    while ((match = regex.exec(opisKvara)) !== null) {
      resultArr.push({
        tekst: match[1].trim(),
        meta: match[2].trim(),
      });
    }
    // Ako regex ne nađe ništa, vrati sve kao jedan blok
    if (resultArr.length === 0) {
      return [{ tekst: opisKvara, meta: '' }];
    }
    return resultArr;
  }

  // Funkcija za zbroj svih sati rada iz svih unosa (opisKvara + nacinRjesavanja)
  function getTotalSatiRada() {
    let total = 0;
    const opisEntries = parseOpisKvara(opisValue || '');
    opisEntries.forEach(entry => {
      const match = entry.meta.match(/Sati rada: (\d+)/);
      if (match) total += parseInt(match[1], 10);
    });
    if (nacinRjesavanja) {
      const nacinEntries = parseOpisKvara(nacinRjesavanja);
      nacinEntries.forEach(entry => {
        const match = entry.meta.match(/Sati rada: (\d+)/);
        if (match) total += parseInt(match[1], 10);
      });
    }
    return total;
  }
  // Funkcija za spajanje niza unosa natrag u string
  function joinOpisKvara(entries: { tekst: string; meta: string }[]) {
    return entries.map(e => `${e.tekst}\n${e.meta}`).join('\n');
  }

  // Handler za brisanje unosa
  const handleDeleteEntry = async (idx: number) => {
    // koristi uvijek svježi opis iz baze (data.opisKvara)
    const entries = parseOpisKvara(data.opisKvara || '');
    if (entries.length === 0) return;
    entries.splice(idx, 1);
    const noviOpis = joinOpisKvara(entries);
    // Pripremi payload kao i kod handleUpisSave, ali bez dodavanja novog zapisa
    setLoading(true);
    try {
      const currentUserId = authService.getCurrentUser()?.id;
      const odjel = departments.find(d => d.naslov === data.odjelPrijave);
      const odjelPrijaveId = odjel ? odjel.id : undefined;
      const stroj = machines.find(m => m.naslov === data.stroj);
      const strojId = stroj ? stroj.id : undefined;
      // Izračunaj sumu svih sati i djelatnika iz svih zapisa
      const sumSati = entries.reduce((acc, entry) => {
        const match = entry.meta.match(/Sati rada: (\d+)/);
        return acc + (match ? parseInt(match[1], 10) : 0);
      }, 0);
    
      const payload = {
        Id: data.id,
        BrojRN: data.brojRN,
        Naslov: data.naslov,
        OdjelPrijaveId: odjelPrijaveId || 1,
        UstanovioId: currentUserId || 1,
        DatumPrijave: data.datumPrijave,
        StrojId: strojId || 1,
        OpisKvara: noviOpis,
        ZaOdjel: data.zaOdjel,
        StupanjHitnosti: data.stupanjHitnosti,
        OtklonitiDo: data.otklonitiDo,
        VrstaNaloga: data.vrstaNaloga,
        Status: data.status,
        Obrazlozenje: data.obrazlozenje,
        TehnoloskaOznaka: data.tehnoloskaOznaka,
        NacinRjesavanja: data.nacinRjesavanja,
        UtrosenoMaterijala: data.utrosenoMaterijala,
        DatumZatvaranja: data.datumZatvaranja,
        Napomena: data.napomena,
        OdradioId: Number(data.odradioId) || 1,
        SatiRada: sumSati,
        RDIFOPrema: data.rdifOprema,
        DatumVrijemePreuzimanja: data.datumVrijemePreuzimanja,
        DodijeljenoId: data.dodijeljenoId,
        DatumVrijemeDodjele: data.datumVrijemeDodjele,
        SudjelovaliIds: Array.isArray(data.sudjelovaliIds) && data.sudjelovaliIds.length > 0
          ? data.sudjelovaliIds
          : [currentUserId || 1],
      };
      console.log('Payload:', payload);
      await updateRadniNalog(data.id, payload);
      setOpisValue(noviOpis);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      alert('Greška pri brisanju zapisa!');
    } finally {
      setLoading(false);
    }
  };

  // Uklonjeno: handleri za uređivanje pojedinačnih zapisa

  // Handler za brisanje unosa iz nacinRjesavanja (ZATVORI RN)
  const handleDeleteNacinRjesavanjaEntry = (idx: number) => {
    const entries = parseOpisKvara(nacinRjesavanja);
    if (entries.length === 0) return;
    entries.splice(idx, 1);
    const noviNacin = joinOpisKvara(entries);
    setNacinRjesavanja(noviNacin);
  };

  // Update satiRada kad se promijene unosi
  React.useEffect(() => {
    setSatiRada(getTotalSatiRada());
  }, [opisValue, nacinRjesavanja]);

  const handleSpremi = async () => {
    const currentUser = authService.getCurrentUser();
    const validUserId = currentUser?.id || 1;
    const sudionici = Array.isArray(data.sudjelovaliIds) && data.sudjelovaliIds.length > 0
      ? data.sudjelovaliIds
      : validUserId ? [validUserId] : [];
    const payload = {
      Id: data.id,
      BrojRN: data.brojRN,
      Naslov: data.naslov,
      OdjelPrijaveId: Number(data.odjelPrijaveId) || Number(data.odjelPrijave) || (departments[0]?.id ?? 1),
      UstanovioId: Number(data.ustanovioId) || Number(data.ustanovio) || (authService.getCurrentUser()?.id ?? 1),
      DatumPrijave: data.datumPrijave || '',
      StrojId: data.strojId || 1,
      OpisKvara: opisValue || '',
      ZaOdjel: data.zaOdjel || 1,
      StupanjHitnosti: data.stupanjHitnosti || '',
      OtklonitiDo: data.otklonitiDo || '',
      VrstaNaloga: data.vrstaNaloga || '',
      Status: 'Zavrsen', // Promijenjeno iz "Zatvoreno" u "Završen"
      Obrazlozenje: data.obrazlozenje || '',
      TehnoloskaOznaka: data.tehnoloskaOznaka || '',
      NacinRjesavanja: nacinRjesavanja || '',
      UtrosenoMaterijala: data.utrosenoMaterijala || '',
      DatumZatvaranja: new Date().toISOString(),
      Napomena: data.napomena || '',
      OdradioId: Number(nalogZatvorioId),
      SatiRada: getTotalSatiRada(),
      RDIFOPrema: data.rdifOprema || '',
      DatumVrijemePreuzimanja: data.datumVrijemePreuzimanja || '',
      // DodijeljenoId: data.dodijeljenoId || 0, // maknuto zbog FK greške
      DatumVrijemeDodjele: data.datumVrijemeDodjele || '',
      SudjelovaliIds: sudionici,
    };
    console.log('Payload:', payload);
    try {
      await updateRadniNalog(data.id, payload);
      setStatusRn('Zavrsen');
      setNalogZatvorioId(currentUser?.id || '');
      setSatiRada(getTotalSatiRada());
      if (onSuccess) onSuccess();
      onClose();
      // Quick fix: update local data so the changes are shown immediately
      if (data) {
        data.nacinRjesavanja = nacinRjesavanja || '';
        data.status = 'Zavrsen'; // Promijenjeno iz "Završen" u "Zavrsen"
        data.satiRada = getTotalSatiRada();
        data.nalogZatvorioId = currentUser?.id || '';
      }
    } catch (err: any) {
      alert('Greška pri spremanju naloga!');
    }
  };

  const handleNapomenaSave = async () => {
    setNapomenaLoading(true);
    try {
      const currentUserId = authService.getCurrentUser()?.id || 1;
  
      const payload = {
        Id: data.id,
        BrojRN: data.brojRN,
        Naslov: data.naslov,
        OdjelPrijaveId: Number(data.odjelPrijaveId) || Number(data.odjelPrijave) || (departments && departments.length > 0 ? departments[0].id : 1),
        UstanovioId: Number(data.ustanovioId) || Number(data.ustanovio) || (currentUserId ?? 1),
        DatumPrijave: data.datumPrijave || '',
        StrojId: data.strojId || 1,
        OpisKvara: data.opisKvara || '',
        ZaOdjel: data.zaOdjel || 1,
        StupanjHitnosti: data.stupanjHitnosti || '',
        OtklonitiDo: data.otklonitiDo || '',
        VrstaNaloga: data.vrstaNaloga || '',
        Status: data.status || '',
        Obrazlozenje: data.obrazlozenje || '',
        TehnoloskaOznaka: data.tehnoloskaOznaka || '',
        NacinRjesavanja: data.nacinRjesavanja || '',
        UtrosenoMaterijala: data.utrosenoMaterijala || '',
        DatumZatvaranja: data.datumZatvaranja || '',
        Napomena: napomenaValue,
        OdradioId: Number(data.odradioId) || Number(currentUserId),
        SatiRada: data.satiRada || 0,
        RDIFOPrema: data.rdifOprema || '',
        DatumVrijemePreuzimanja: data.datumVrijemePreuzimanja || '',
        DatumVrijemeDodjele: data.datumVrijemeDodjele || '',
        SudjelovaliIds: Array.isArray(data.sudjelovaliIds) && data.sudjelovaliIds.length > 0
          ? data.sudjelovaliIds
          : [currentUserId],
      };
      console.log('NAPOMENA PAYLOAD:', payload);
      await updateRadniNalog(data.id, payload);
      setNapomenaModalOpen(false);
      if (onSuccess) onSuccess();
      // Quick fix: update local data so the note is shown immediately
      if (data) data.napomena = napomenaValue;
    } catch (err: any) {
      if (err.response) {
        console.log('NAPOMENA ERROR:', err.response.data);
        alert(JSON.stringify(err.response.data, null, 2));
      }
      alert('Greška pri spremanju napomene!');
    } finally {
      setNapomenaLoading(false);
    }
  };

  if (!data) return null;
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth PaperProps={{ sx: { borderRadius: 7, p: 2, background: '#fff', boxShadow: 8, minWidth: 1200 } }}>
      <DialogTitle sx={{ fontSize: 28, fontWeight: 800, color: '#222', pb:2, pt: 1, px: 4, borderBottom: '1px solid #eee', background: 'transparent', letterSpacing: 0.5 }}>
        Detalji radnog naloga
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: 'absolute', right: 16, top: 16, color: '#888' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: 3, pb: 1, px: { xs: 2, sm: 4 } }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#bb1e0f', mb: 2, letterSpacing: 0.5 }}>Osnovni podaci</Typography>
        <Box display="flex" gap={4} flexWrap="wrap">
          {/* Lijeva strana - readonly */}
          <Box flex={1.1} minWidth={450} display="flex" flexDirection="column" gap={1} sx={{ border: '2px solid #e0e0e0', borderRadius: 3, p: 1, background: '#fafbfc' }}>
            <TextField label="Broj radnog naloga" value={data.brojRN || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <TextField label="Naslov" value={data.naslov || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <TextField label="Odjel prijave" value={data.odjelPrijave || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <TextField label="Ustanovio" value={data.ustanovio || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <Box display="flex" gap={1}>
              <TextField label="DATUM PRIJAVE" value={data.datumPrijave || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" size="small" />
              <TextField label="ZA ODJEL" value={
                (() => {
                  const odjel = departments.find(d => d.id === Number(data.zaOdjel) || d.naslov === data.zaOdjel);
                  return odjel ? odjel.naslov : data.zaOdjel || '';
                })()
              } fullWidth InputProps={{ readOnly: true }} margin="dense" size="small" />
            </Box>
            <TextField label="Stroj" value={data.stroj || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <TextField label="Hitnost" value={data.stupanjHitnosti || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <TextField label="Otkloniti do" value={data.otklonitiDo || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <TextField label="Tehnološka oznaka" value={data.tehnoloskaOznaka || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" />
            <Box display="flex" gap={1}>
              <TextField label="ZA DJELATNIKA" value={(() => {
                if (!data) return '';
                // Koristi DodijeljenoId za korisnika koji je dodijeljen radnom nalogu
                let userId = data.DodijeljenoId || data.dodijeljenoId;
                
                // Ako nema DodijeljenoId, pokušaj s sudionici nizom kao fallback
                if (!userId && data.sudionici && data.sudionici.length > 0) {
                  userId = data.sudionici[0].id;
                }
                
                const user = users && users.find(u => String(u.id) === String(userId));
                return user ? user.ime : (userId ? `ID: ${userId}` : '');
              })()} fullWidth InputProps={{ readOnly: true }} margin="dense" size="small" />
              <TextField label="DATUM DODJELE" value={data ? (data.DatumVrijemeDodjele || data.datumVrijemeDodjele || '') : ''} fullWidth InputProps={{ readOnly: true }} margin="dense" size="small" />
            </Box>

            <TextField label="VRSTA NALOGA" value={data.vrstaNaloga || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" size="small" />
            <TextField label="OPIS KVARA" value={data.opisKvara || ''} fullWidth InputProps={{ readOnly: true }} margin="dense" size="small" multiline minRows={2} />
          </Box>
          {/* Desna strana - RADNI NALOG */}
          <Box flex={1.2} minWidth={550} display="flex" flexDirection="column" gap={1.5} sx={{ border: '2px solid #e0e0e0', borderRadius: 3, p: 2, background: '#fff' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d13b3b', mb: 1.5, letterSpacing: 0.5 }}>Radni zapisi</Typography>
            <Box border={1} borderColor="#ddd" borderRadius={2} p={1.2} mb={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.5}>
                <Box display="flex" alignItems="center" gap={1}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{ borderColor: '#d13b3b', color: '#d13b3b', fontWeight: 700, borderWidth: 2, minWidth: 0, px: 1, py: 0.2, fontSize: 13 }}
                    onClick={() => setUpisModalOpen(true)}
                  >
                    ZAPIS U TIJEKU
                  </Button>
                  <IconButton size="small" sx={{ border: '1px solid #d13b3b', color: '#d13b3b', ml: 0.5 }} onClick={handleEditOpisClick}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" sx={{ border: '1px solid #d13b3b', color: '#d13b3b', ml: 0.5 }} onClick={() => setObrazlozenjeInfoOpen(true)}><HelpOutlineIcon fontSize="small" /></IconButton>
                </Box>
                <Box sx={{ fontSize: 13, color: '#888', minWidth: 120, textAlign: 'right' }}>{data.datumZatvaranja || ''}</Box>
              </Box>
              {editOpis ? (
                <Box>
                  <TextField
                    multiline
                    minRows={4}
                    fullWidth
                    value={opisValue}
                    onChange={handleOpisChange}
                    sx={{ background: '#fff', borderRadius: 1, fontFamily: 'monospace' }}
                  />
                  <Box display="flex" gap={1} mt={1}>
                    <Button variant="contained" color="primary" size="small" onClick={handleOpisSave} disabled={loading}>Spremi</Button>
                    <Button variant="outlined" color="secondary" size="small" onClick={handleOpisCancel} disabled={loading}>Odustani</Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ background: '#fff', borderRadius: 1, minHeight: 120, p: 1 }}>
                  {parseOpisKvara(opisValue).map((entry, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        border: '1px solid #e0e0e0',
                        borderRadius: 2,
                        mb: 2,
                        p: 1.2,
                        background: '#fafbfc',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                      }}
                    >
                      <Box sx={{ fontFamily: 'monospace', fontSize: 15, color: '#222', mb: 0.5, whiteSpace: 'pre-line' }}>{entry.tekst}</Box>
                      {entry.meta && (
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 13,
                          color: '#555',
                          fontFamily: 'monospace',
                          background: '#f3f6fa',
                          borderRadius: 1,
                          px: 1,
                          py: 0.5,
                          mt: 0.5,
                          mb: 0.5
                        }}>
                          <span>{entry.meta}</span>
                          <Box display="flex" gap={1} ml={2}>
                            <IconButton size="small" onClick={() => handleDeleteEntry(idx)} sx={{ color: '#d13b3b' }}><CloseIcon fontSize="small" /></IconButton>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3b8ad1', mb: 1.5, letterSpacing: 0.5 }}>Zatvaranje naloga</Typography>
            <Box border={1} borderColor="#ddd" borderRadius={2} p={1.2} mb={2}>
              <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                <Button variant="outlined" size="small" startIcon={<AddIcon />} sx={{ borderColor: '#3b8ad1', color: '#3b8ad1', fontWeight: 700, borderWidth: 2, minWidth: 0, px: 1, py: 0.2, fontSize: 13 }} onClick={() => setZatvoriRnModalOpen(true)}>ZATVORI RN</Button>
                <IconButton size="small" sx={{ border: '1px solid #3b8ad1', color: '#3b8ad1', ml: 0.5 }} onClick={() => setZatvoriRnModalOpen(true)}><EditIcon fontSize="small" /></IconButton>
                <IconButton size="small" sx={{ border: '1px solid #3b8ad1', color: '#3b8ad1', ml: 0.5 }} onClick={() => setNacinRjesavanjaInfoOpen(true)}><HelpOutlineIcon fontSize="small" /></IconButton>
              </Box>
              {/* Prikaz unosa za ZATVORI RN */}
              <Box sx={{ background: '#fff', borderRadius: 1, minHeight: 60, p: 1 }}>
                {parseOpisKvara(nacinRjesavanja).map((entry, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 2,
                      mb: 2,
                      p: 1.2,
                      background: '#fafbfc',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Box sx={{ fontFamily: 'monospace', fontSize: 15, color: '#222', mb: 0.5, whiteSpace: 'pre-line' }}>{entry.tekst}</Box>
                    {entry.meta && (
                      <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 13,
                        color: '#555',
                        fontFamily: 'monospace',
                        background: '#f3f6fa',
                        borderRadius: 1,
                        px: 1,
                        py: 0.5,
                        mt: 0.5,
                        mb: 0.5
                      }}>
                        <span>{entry.meta}</span>
                        <Box display="flex" gap={1} ml={2}>
                          <IconButton size="small" onClick={() => handleDeleteNacinRjesavanjaEntry(idx)} sx={{ color: '#3b8ad1' }}><CloseIcon fontSize="small" /></IconButton>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
            {/* Modal za ZATVORI RN */}
            <Dialog open={zatvoriRnModalOpen} onClose={() => setZatvoriRnModalOpen(false)} maxWidth="xs" fullWidth>
              <DialogTitle sx={{ background: '#e6c6f5', color: '#6d217f', fontWeight: 700, fontSize: 18 }}>
                UPIS OBRAZLOŽENJA
                <IconButton
                  aria-label="close"
                  onClick={() => setZatvoriRnModalOpen(false)}
                  sx={{ position: 'absolute', right: 8, top: 8, color: '#6d217f' }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent sx={{ pt: 2 }}>
                <TextField
                  label="OPIS RADOVA"
                  value={zatvoriOpis}
                  onChange={e => setZatvoriOpis(e.target.value)}
                  multiline
                  minRows={6}
                  fullWidth
                  margin="normal"
                />
                <Box display="flex" gap={2}>
                  <TextField
                    label="UKUPNO SATI"
                    value={zatvoriSati}
                    onChange={e => setZatvoriSati(e.target.value.replace(/[^0-9]/g, ''))}
                    fullWidth
                    margin="normal"
                  />
                  <TextField
                    label="UKUPNO DJELATNIKA"
                    value={zatvoriDjelatnici}
                    onChange={e => setZatvoriDjelatnici(e.target.value.replace(/[^0-9]/g, ''))}
                    fullWidth
                    margin="normal"
                  />
                </Box>
              </DialogContent>
              <DialogActions sx={{ pb: 2, px: 3 }}>
                <Button
                  variant="outlined"
                  onClick={handleZatvoriRnSave}
                  fullWidth
                  sx={{ borderColor: '#6d217f', color: '#6d217f', fontWeight: 700, borderWidth: 2 }}
                >
                  <span role="img" aria-label="disketa">💾</span> SPREMI OPIS
                </Button>
              </DialogActions>
            </Dialog>
            {/* Info modal za NACIN RIJESAVANJA */}
            <Dialog open={nacinRjesavanjaInfoOpen} onClose={() => setNacinRjesavanjaInfoOpen(false)}>
              <DialogTitle>Informacije o polju nacin rjesavanja</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ color: '#1976d2', mt: 0.5 }}>
                    <i className="material-icons">info</i>
                  </Box>
                  <Box>
                    <span>
                      Polje se ispunjava kada je posao odrađen do kraja, prozor za upis otvara se pritiskom na gumb 'ZATVORI RADNI NALOG' detaljno se opiše što je odrađeno, i sati rada Nakon unošenja podataka u polje 'NACIN RJESAVANJA' status radnog naloga automatski se prebacuje u stanje 'ZATVORENO'
                    </span>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setNacinRjesavanjaInfoOpen(false)} autoFocus>OK</Button>
              </DialogActions>
            </Dialog>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#3bd13b', mb: 1.5, letterSpacing: 0.5 }}>Materijal / RD</Typography>
            <Box border={1} borderColor="#ddd" borderRadius={2} p={1.2} mb={2}>
              <TextField multiline minRows={3} fullWidth margin="dense" InputProps={{ readOnly: true }} sx={{ background: '#fff', borderRadius: 1 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#d1b13b', mb: 1.5, letterSpacing: 0.5 }}>Napomena</Typography>
            <Box border={1} borderColor="#ddd" borderRadius={2} p={1.2} mb={2}>
              <Box display="flex" alignItems="center" justifyContent="flex-start" mb={0.5}>
                <Button
                  variant="outlined"
                  size="small"
                  sx={{ borderColor: '#d1b13b', color: '#d1b13b', fontWeight: 700, borderWidth: 2, minWidth: 0, px: 1, py: 0.2, fontSize: 13 }}
                  onClick={() => setNapomenaModalOpen(true)}
                >
                  NAPOMENA
                </Button>
              </Box>
              <TextField multiline minRows={3} fullWidth margin="dense" value={data.napomena || ''} InputProps={{ readOnly: true }} sx={{ background: '#fff', borderRadius: 1 }} />
              {/* Modal za uređivanje napomene */}
              <Dialog open={napomenaModalOpen} onClose={() => setNapomenaModalOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ background: '#e6c6f5', color: '#6d217f', fontWeight: 700, fontSize: 18 }}>
                  Upis radova u tijeku
                  <IconButton
                    aria-label="close"
                    onClick={() => setNapomenaModalOpen(false)}
                    sx={{ position: 'absolute', right: 8, top: 8, color: '#6d217f' }}
                  >
                    <CloseIcon />
                  </IconButton>
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                  <TextField
                    label="NAPOMENA"
                    value={napomenaValue}
                    onChange={e => setNapomenaValue(e.target.value)}
                    multiline
                    minRows={6}
                    fullWidth
                    margin="normal"
                  />
                </DialogContent>
                <DialogActions sx={{ pb: 2, px: 3 }}>
                  <Button
                    variant="outlined"
                    onClick={handleNapomenaSave}
                    fullWidth
                    sx={{ borderColor: '#6d217f', color: '#6d217f', fontWeight: 700, borderWidth: 2 }}
                    disabled={napomenaLoading}
                  >
                    <span role="img" aria-label="disketa">💾</span> SPREMI OPIS
                  </Button>
                </DialogActions>
              </Dialog>
            </Box>
            {/* Info modal za OBRAZLOŽENJE */}
            <Dialog open={obrazlozenjeInfoOpen} onClose={() => setObrazlozenjeInfoOpen(false)}>
              <DialogTitle>Informacije o polju obrazlozenje</DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ color: '#1976d2', mt: 0.5 }}>
                    <i className="material-icons">info</i>
                  </Box>
                  <Box>
                    <span>
                      Polje se ispunjava kada posao nije odrađen do kraja, prozor za upis otvara se pritiskom na gumb 'DODAJ ZAPIS U TIJEKU' napiše se što je odrađeno i utvrđeno do tada, i sati rada. Nakon unošenja podataka u polje 'OBRAZLOŽENJE' status radnog naloga automatski se prebacuje u stanje 'U POSTUPKU'.
                    </span>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setObrazlozenjeInfoOpen(false)} autoFocus>OK</Button>
              </DialogActions>
            </Dialog>
            {/* DODATNA POLJA ISPOD SEKCIJA */}
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="SATI RADA"
                value={satiRada}
                fullWidth
                margin="dense"
                InputProps={{ readOnly: true }}
              />
              <TextField
                label="STATUS RN"
                value={statusRn}
                fullWidth
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <FormControl fullWidth margin="dense">
                <InputLabel shrink>NALOG ZATVORIO</InputLabel>
                <Select
                  name="nalogZatvorioId"
                  value={users && users.some(u => u.id === nalogZatvorioId) ? nalogZatvorioId : ''}
                  label="NALOG ZATVORIO"
                  onChange={e => setNalogZatvorioId(Number(e.target.value))}
                  displayEmpty
                >
                  {users && users.map((u) => (
                    <MenuItem key={u.id} value={u.id}>{u.ime}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="STROJ ČIST I ISPRAVAN, ODGOVORNA OSOBA"
                value={data.odgovornaOsoba || ''}
                fullWidth
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Box>
            <Box display="flex" gap={2} mt={2}>
              <TextField
                label="SUDJELOVALI"
                value={Array.isArray(data.sudjelovali) ? data.sudjelovali.join(', ') : (data.sudjelovali || '')}
                fullWidth
                margin="dense"
                InputProps={{ readOnly: true }}
              />
            </Box>
            {/* Buttoni za spremanje i odustani */}
            <Box display="flex" gap={2} mt={4}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSpremi}
                sx={{ fontWeight: 700, borderRadius: 2, minWidth: 180, fontSize: 18, py: 1.5, background: '#bb1e0f', ':hover': { background: '#a11a0d' } }}
                fullWidth
              >
                SPREMI
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={onClose}
                sx={{ fontWeight: 700, borderRadius: 2, minWidth: 120, fontSize: 18, py: 1.5, color: '#bb1e0f', borderColor: '#bb1e0f', ':hover': { borderColor: '#a11a0d', color: '#a11a0d', background: '#f9eaea' } }}
                fullWidth
              >
                Odustani
              </Button>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <UpisRadovaModal open={upisModalOpen} onClose={() => setUpisModalOpen(false)} onSave={handleUpisSave} />
    </Dialog>
  );
};

export default CheckMarkRadniNalogModal;
