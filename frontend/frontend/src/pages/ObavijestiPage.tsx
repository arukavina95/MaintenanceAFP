import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CircularProgress, Alert, Dialog, DialogContent, IconButton, Chip } from '@mui/material';
import Header from '../components/Header';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import ObavijestiService, { type Obavijest } from '../services/ObavijestiService';


interface ObavijestiPageProps {
  username: string;
  razinaPristupa: number;
  onLogout: () => void;
}

const ObavijestiPage: React.FC<ObavijestiPageProps> = ({ username, razinaPristupa, onLogout }) => {
  const [news, setNews] = useState<Obavijest[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const data = await ObavijestiService.getObavijesti();
        const activeNews = data.filter(obavijest => obavijest.aktivno);
        setNews(activeNews);
        if (activeNews.length === 0) {
          setError("Nema dostupnih obavijesti.");
        }
      } catch (err) {
        setError("Došlo je do pogreške prilikom dohvaćanja obavijesti.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  useEffect(() => {
    if (!isRunning || news.length === 0) return;
  
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < news.length - 1 ? prev + 1 : 0));
    }, 10000); // 10 sekundi
  
    return () => clearInterval(interval);
  }, [isRunning, news.length]);

  const handlePokreni = () => setIsRunning(true);
  const handleZaustavi = () => setIsRunning(false);
  const handlePrethodna = () => {
    if (news.length > 0) {
      setCurrentIndex((prev) => prev > 0 ? prev - 1 : news.length - 1);
    }
  };
  const handleSljedeca = () => {
    if (news.length > 0) {
      setCurrentIndex((prev) => prev < news.length - 1 ? prev + 1 : 0);
    }
  };

  const obavijest = news[currentIndex];

  const handleImageClick = () => {
    setIsImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <>
      <Header username={username} razinaPristupa={razinaPristupa} onLogout={onLogout} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
          bgcolor: '#f7f9fa',
          pt: 4,
          px: 2,
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 1200,
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
            p: { xs: 2, sm: 4 },
            mb: 4,
          }}
        >
          <Chip label="Vijesti" color="error" sx={{ mb: 2, fontWeight: 700, fontSize: 16, letterSpacing: 1 }} />

          <Box sx={{ display: 'flex', gap: 1, mb: 2, justifyContent: 'center' }}>
            <IconButton onClick={handlePokreni} color={isRunning ? "success" : "default"}>
              <PlayArrowIcon />
            </IconButton>
            <IconButton onClick={handleZaustavi} color={!isRunning ? "error" : "default"}>
              <StopIcon />
            </IconButton>
            <IconButton onClick={handlePrethodna}>
              <ArrowBackIosNewIcon />
            </IconButton>
            <IconButton onClick={handleSljedeca}>
              <ArrowForwardIosIcon />
            </IconButton>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<DescriptionIcon />}
              sx={{ ml: 2, borderRadius: 2, fontWeight: 600 }}
            >
              Dokumenti
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : obavijest ? (
            <Card
              sx={{
                maxWidth: 700,
                mx: 'auto',
                borderRadius: 4,
                boxShadow: '0 4px 32px rgba(0,0,0,0.10)',
                overflow: 'hidden',
                transition: 'box-shadow 0.2s',
                '&:hover': { boxShadow: '0 8px 40px rgba(0,0,0,0.18)' },
                bgcolor: 'background.paper',
                animation: 'fadein 0.7s',
                '@keyframes fadein': {
                  from: { opacity: 0 },
                  to: { opacity: 1 }
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, pt: 2, pr: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(obavijest.datumObjave).toLocaleDateString('hr-HR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </Typography>
                {(() => {
                  const now = new Date();
                  const datum = new Date(obavijest.datumObjave);
                  const diff = (now.getTime() - datum.getTime()) / (1000 * 60 * 60 * 24);
                  if (diff <= 2) {
                    return (
                      <Chip label="Nova obavijest" color="error" size="small" sx={{ fontWeight: 700, fontSize: 13, letterSpacing: 1 }} />
                    );
                  }
                  return null;
                })()}
              </Box>
              <Box sx={{ p: 3, pb: 0 }}>
                <Typography variant="h4" fontWeight={500} sx={{ mb: 2 }}>
                  {obavijest.imeObavijesti}
                </Typography>
              </Box>
              {obavijest.slika && (
                <Box sx={{ position: 'relative' }}>
                  <Box
                    component="img"
                    src={`data:image/jpeg;base64,${obavijest.slika}`}
                    alt="Slika obavijesti"
                    sx={{
                      width: '70%',
                      aspectRatio: 'auto',
                      objectFit: 'cover',
                      display: 'block',
                      borderTopLeftRadius: 16,
                      borderTopRightRadius: 16,
                      cursor: 'pointer',
                      mx:'auto'
                    }}
                    onClick={handleImageClick}
                  />
                </Box>
              )}
              <Box
                sx={{
                  maxHeight: 500,
                  overflowY: 'auto',
                  bgcolor: '#fff',
                  borderRadius: 1,
                  p: 2,
                  border: '1px solid #eee',
                }}
                dangerouslySetInnerHTML={{ __html: obavijest.opis }}
              />
              {/* Modal za uvećanje slike */}
              <Dialog open={isImageModalOpen} onClose={handleCloseImageModal} maxWidth="md">
                <DialogContent sx={{ p: 0, bgcolor: '#222' }}>
                  <IconButton
                    onClick={handleCloseImageModal}
                    sx={{ position: 'absolute', top: 8, right: 8, color: '#fff', zIndex: 2 }}
                  >
                    <CloseIcon />
                  </IconButton>
                  <Box
                    component="img"
                    src={`data:image/jpeg;base64,${obavijest.slika}`}
                    alt="Slika obavijesti uvećana"
                    sx={{
                      display: 'block',
                      maxWidth: '90vw',
                      maxHeight: '80vh',
                      margin: 'auto',
                      borderRadius: 2,
                    }}
                  />
                </DialogContent>
              </Dialog>
            </Card>
          ) : null}
        </Box>
      </Box>
    </>
  );
};

export default ObavijestiPage; 