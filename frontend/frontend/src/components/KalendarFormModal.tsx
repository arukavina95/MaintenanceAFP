import React, { useState, useEffect } from "react";
import { getRazloziIzostanka, createIzostanak, updateIzostanak } from "../services/KalendarService";
import authService from "../services/authService";

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, MenuItem, Box, Typography
} from "@mui/material";
import AttachFileIcon from '@mui/icons-material/AttachFile';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { hr } from 'date-fns/locale';
import { format } from 'date-fns';

interface KalendarFormModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: any;
  onDelete?: (id: number) => void;
}

const nazivPrikaz: Record<string, string> = {
  GodisnjiOdmor: "Godišnji odmor",
  PlaceniDopust: "Plaćeni dopust",
  DrzavniPraznik: "Državni praznik",
  Nepoznato: "Nepoznato",
  Bolovanje: "Bolovanje"
};

const fallbackRazlozi = [
  "GodisnjiOdmor",
  "PlaceniDopust",
  "DrzavniPraznik",
  "Nepoznato",
  "Bolovanje"
];

const KalendarFormModal: React.FC<KalendarFormModalProps> = ({ open, onClose, onSaved, initialData, onDelete }) => {
  const [razlozi, setRazlozi] = useState<string[]>([]);
  const [razlog, setRazlog] = useState("");
  const [pocetniDatum, setPocetniDatum] = useState("");
  const [zavrsniDatum, setZavrsniDatum] = useState("");
  const [privitak, setPrivitak] = useState<File | null>(null);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  
  // Helper funkcija za helper text
  const getHelperText = (field: string) => {
    if (errors[field]) return errors[field];
    if (razlog !== "GodisnjiOdmor") {
      return "Vikendi su onemogućeni (osim za rodendane)";
    }
    return "";
  };

  useEffect(() => {
    getRazloziIzostanka()
      .then(data => {
       
        if (Array.isArray(data) && data.length > 0) {
          setRazlozi(data);
        } else {
          setRazlozi(fallbackRazlozi);
        }
      })
      .catch((err) => {
        console.error("Greška kod dohvata razloga izostanka:", err);
        setRazlozi(fallbackRazlozi);
      });
    if (open && initialData) {
      setRazlog(initialData.razlogIzostankaNaziv || "");
      setPocetniDatum(initialData.pocetniDatum?.slice(0, 10) || "");
      setZavrsniDatum(initialData.zavrsniDatum?.slice(0, 10) || "");
      setPrivitak(null);
      setErrors({});
    }
    if (!open && !initialData) {
      setRazlog("");
      setPocetniDatum("");
      setZavrsniDatum("");
      setPrivitak(null);
      setErrors({});
    }
  }, [open, initialData]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!razlog) newErrors.razlog = "Obavezno";
    if (!pocetniDatum) newErrors.pocetniDatum = "Obavezno";
    if (!zavrsniDatum) newErrors.zavrsniDatum = "Obavezno";
    
    // Provjeri da li je početni datum prije završnog
    if (pocetniDatum && zavrsniDatum) {
      const pocetniDate = new Date(pocetniDatum);
      const zavrsniDate = new Date(zavrsniDatum);
      
      if (pocetniDate > zavrsniDate) {
        newErrors.zavrsniDatum = "Završni datum mora biti nakon početnog datuma";
        setErrors(newErrors);
        return false; // Zaustavi validaciju ako je datum neispravan
      }
    }
    
    // Provjeri da li se pokušava upisati vikend za tipove koji nisu rodendani
    if (pocetniDatum && zavrsniDatum && razlog !== "GodisnjiOdmor") {
      const pocetniDate = new Date(pocetniDatum);
      const zavrsniDate = new Date(zavrsniDatum);
      
      // Provjeri sve datume u rasponu
      const currentDate = new Date(pocetniDate);
      let hasWeekend = false;
      
      while (currentDate <= zavrsniDate) {
        const dan = currentDate.getDay();
        if (dan === 0 || dan === 6) {
          hasWeekend = true;
          break;
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      if (hasWeekend) {
        newErrors.pocetniDatum = "Ne možete upisati izostanak koji uključuje subotu ili nedjelju (osim rodendana)";
        newErrors.zavrsniDatum = "Ne možete upisati izostanak koji uključuje subotu ili nedjelju (osim rodendana)";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const user = authService.getCurrentUser();
    const korisnikId = user?.id;
    const formData = new FormData();
    formData.append("RazlogIzostanka", razlog);
    formData.append("pocetniDatum", pocetniDatum);
    formData.append("zavrsniDatum", zavrsniDatum);
    if (privitak) formData.append("privitak", privitak);
    formData.append("korisnikId", korisnikId);
    if (initialData) {
      await updateIzostanak(initialData.id, formData);
    } else {
      await createIzostanak(formData);
    }
    onSaved();
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, fontSize: '1.3rem', color: '#a00', pb: 0 }}>
          {initialData ? "Uredi izostanak" : "Upis izostanka"}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={hr}>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                  <Box sx={{ flex: 1.2, minWidth: 180 }}>
                    <TextField
                      select
                      label="Vrsta izostanka"
                      value={razlog}
                      onChange={e => {
                        setRazlog(e.target.value);
                        // Resetiraj greške za datume kada se promijeni razlog
                        if (e.target.value === "GodisnjiOdmor") {
                          setErrors(prev => ({ ...prev, pocetniDatum: "", zavrsniDatum: "" }));
                        } else {
                          // Validiraj postojeće datume kada se promijeni na ne-rodendan
                          if (pocetniDatum && zavrsniDatum) {
                            const pocetniDate = new Date(pocetniDatum);
                            const zavrsniDate = new Date(zavrsniDatum);
                            
                            // Provjeri da li je početni datum prije završnog
                            if (pocetniDate > zavrsniDate) {
                              setErrors(prev => ({ 
                                ...prev, 
                                zavrsniDatum: "Završni datum mora biti nakon početnog datuma"
                              }));
                            } else {
                              const currentDate = new Date(pocetniDate);
                              let hasWeekend = false;
                              
                              while (currentDate <= zavrsniDate) {
                                const dan = currentDate.getDay();
                                if (dan === 0 || dan === 6) {
                                  hasWeekend = true;
                                  break;
                                }
                                currentDate.setDate(currentDate.getDate() + 1);
                              }
                              
                              if (hasWeekend) {
                                setErrors(prev => ({ 
                                  ...prev, 
                                  pocetniDatum: "Ne možete upisati izostanak koji uključuje subotu ili nedjelju (osim rodendana)",
                                  zavrsniDatum: "Ne možete upisati izostanak koji uključuje subotu ili nedjelju (osim rodendana)"
                                }));
                              } else {
                                setErrors(prev => ({ 
                                  ...prev, 
                                  pocetniDatum: "",
                                  zavrsniDatum: ""
                                }));
                              }
                            }
                          }
                        }
                      }}
                      error={!!errors.razlog}
                      helperText={errors.razlog}
                      fullWidth
                      size="medium"
                      InputLabelProps={{ sx: { fontWeight: 600 } }}
                    >
                      {Array.isArray(razlozi) && razlozi.map(r => (
                        <MenuItem key={r} value={r}>{nazivPrikaz[r] || r}</MenuItem>
                      ))}
                    </TextField>
              </Box>
              <Box sx={{ flex: 1 , minWidth: 140}}>
                <DatePicker
                  label="Početni datum"
                  value={pocetniDatum ? new Date(pocetniDatum) : null}
                  onChange={date => {
                    const newDate = date ? format(date, 'yyyy-MM-dd') : '';
                    setPocetniDatum(newDate);
                                         // Validiraj datume kada se promijene
                     if (newDate && zavrsniDatum) {
                       const pocetniDate = new Date(newDate);
                       const zavrsniDate = new Date(zavrsniDatum);
                       
                       // Provjeri da li je početni datum prije završnog
                       if (pocetniDate > zavrsniDate) {
                         setErrors(prev => ({ ...prev, zavrsniDatum: "Završni datum mora biti nakon početnog datuma" }));
                       } else {
                         setErrors(prev => ({ ...prev, zavrsniDatum: "" }));
                       }
                       
                                               // Provjeri vikende samo ako nije rodendan
                        if (razlog !== "GodisnjiOdmor") {
                          const currentDate = new Date(pocetniDate);
                          let hasWeekend = false;
                          
                          while (currentDate <= zavrsniDate) {
                            const dan = currentDate.getDay();
                            if (dan === 0 || dan === 6) {
                              hasWeekend = true;
                              break;
                            }
                            currentDate.setDate(currentDate.getDate() + 1);
                          }
                          
                          if (hasWeekend) {
                            setErrors(prev => ({ ...prev, pocetniDatum: "Ne možete upisati izostanak koji uključuje subotu ili nedjelju (osim rodendana)" }));
                          } else {
                            setErrors(prev => ({ ...prev, pocetniDatum: "" }));
                          }
                        }
                      }
                  }}
                  format="dd.MM.yyyy"
                  shouldDisableDate={date => {
                    const day = date.getDay();
                    // Dozvoli rodendane (GodisnjiOdmor) subotom i nedjeljom
                    if (razlog === "GodisnjiOdmor") {
                      return false; // Dozvoli sve datume za rodendane
                    }
                    return day === 0 || day === 6; // Blokiraj vikende za ostale tipove
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.pocetniDatum,
                      helperText: getHelperText('pocetniDatum'),
                      size: 'medium',
                      InputLabelProps: { sx: { fontWeight: 600 } },
                      placeholder: 'Odaberi datum'
                    }
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 , minWidth: 140}}>
                <DatePicker
                  label="Završni datum"
                  value={zavrsniDatum ? new Date(zavrsniDatum) : null}
                  onChange={date => {
                    const newDate = date ? format(date, 'yyyy-MM-dd') : '';
                    setZavrsniDatum(newDate);
                    // Validiraj datume kada se promijene
                    if (pocetniDatum && newDate) {
                      const pocetniDate = new Date(pocetniDatum);
                      const zavrsniDate = new Date(newDate);
                      
                      // Provjeri da li je početni datum prije završnog
                      if (pocetniDate > zavrsniDate) {
                        setErrors(prev => ({ ...prev, zavrsniDatum: "Završni datum mora biti nakon početnog datuma" }));
                      } else {
                        setErrors(prev => ({ ...prev, zavrsniDatum: "" }));
                      }
                      
                      // Provjeri vikende samo ako nije rodendan
                      if (razlog !== "GodisnjiOdmor") {
                        const currentDate = new Date(pocetniDate);
                        let hasWeekend = false;
                        
                        while (currentDate <= zavrsniDate) {
                          const dan = currentDate.getDay();
                          if (dan === 0 || dan === 6) {
                            hasWeekend = true;
                            break;
                          }
                          currentDate.setDate(currentDate.getDate() + 1);
                        }
                        
                        if (hasWeekend) {
                          setErrors(prev => ({ ...prev, zavrsniDatum: "Ne možete upisati izostanak koji uključuje subotu ili nedjelju (osim rodendana)" }));
                        } else {
                          setErrors(prev => ({ ...prev, zavrsniDatum: "" }));
                        }
                      }
                    }
                  }}
                  format="dd.MM.yyyy"
                  shouldDisableDate={date => {
                    const day = date.getDay();
                    // Dozvoli rodendane (GodisnjiOdmor) subotom i nedjeljom
                    if (razlog === "GodisnjiOdmor") {
                      return false; // Dozvoli sve datume za rodendane
                    }
                    return day === 0 || day === 6; // Blokiraj vikende za ostale tipove
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.zavrsniDatum,
                      helperText: getHelperText('zavrsniDatum'),
                      size: 'medium',
                      InputLabelProps: { sx: { fontWeight: 600 } },
                      placeholder: 'Odaberi datum'
                    }
                  }}
                />
              </Box>
            </Box>
          </LocalizationProvider>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
            <Button
              variant={privitak ? "contained" : "outlined"}
              component="label"
              color="secondary"
              startIcon={<AttachFileIcon />}
              sx={{ minWidth: 140 }}
            >
              {privitak ? privitak.name : "Privitak"}
              <input
                type="file"
                hidden
                onChange={e => setPrivitak(e.target.files ? e.target.files[0] : null)}
              />
            </Button>
            {initialData?.privitakNaziv && !privitak && (
              <Typography variant="body2" sx={{ color: '#222', ml: 1 }}>
                Trenutni: <a href={initialData.privitak} target="_blank" rel="noopener noreferrer" style={{ color: '#a00', textDecoration: 'underline' }}>{initialData.privitakNaziv}</a>
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, pt: 3 }}>
          {initialData && onDelete && (
            <Button onClick={() => setConfirmDeleteOpen(true)} color="error" variant="outlined" sx={{ mr: 'auto' }}>
              Obriši
            </Button>
          )}
          <Button onClick={onClose} color="secondary" variant="outlined">Odustani</Button>
          <Button onClick={handleSave} color="primary" variant="contained" sx={{ fontWeight: 700, minWidth: 120 }}>
            Spremi
          </Button>
        </DialogActions>
      </Dialog>
      {/* Confirm delete dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle sx={{ color: '#a00', fontWeight: 700 }}>Potvrda brisanja</DialogTitle>
        <DialogContent>
          <Typography>Jeste li sigurni da želite obrisati ovaj izostanak?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="secondary">Odustani</Button>
          <Button onClick={() => { setConfirmDeleteOpen(false); if (initialData && onDelete) onDelete(initialData.id); }} color="error" variant="contained">Potvrdi</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default KalendarFormModal;
