import React, { useEffect, useState } from 'react';
import { Box, Typography, Button, Card, CircularProgress, Alert, Dialog, DialogContent, IconButton } from '@mui/material';
import Header from '../components/Header';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DescriptionIcon from '@mui/icons-material/Description';
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import CloseIcon from '@mui/icons-material/Close';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ObavijestiService, { type Obavijest } from '../services/ObavijestiService';


interface ObavijestiPageProps {
  username: string;
  onLogout: () => void;
}

const ObavijestiPage: React.FC<ObavijestiPageProps> = ({ username, onLogout }) => {
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
      <Header username={username} onLogout={onLogout} />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100vh - 64px)', // Fixed height to fill remaining viewport
          bgcolor: '#f5f5f5', // Changed background color to a light gray
          alignItems: 'center', // Center content horizontally
          justifyContent: 'flex-start', // Align content to the top within the available space
          overflowY: 'auto', // Allow vertical scrolling if content overflows
        }}
      >
        <Box
          sx={{
            p: 3, // Increased padding
            background: '#fff',
            maxWidth: '960px', // Increased max-width
            width: '100%',
            boxSizing: 'border-box', // Include padding in width calculation
            borderRadius: '8px', // Added border radius
            mt: 3, // Added margin-top
            mb: 3, // Added margin-bottom
          }}
        >
            <Typography variant="h4" color="error" fontWeight="bold" gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
             VIJESTI
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2, pr: 2 }}>
              <Box sx={{ flexGrow: 1 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                {obavijest ? new Date(obavijest.datumObjave).toLocaleDateString() : ''}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handlePokreni}
                  sx={{
                    borderColor: '#4caf50',
                    color: '#4caf50',
                    '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.1)' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textTransform: 'none',
                    px: 1.5,
                    py: 1,
                    minWidth: 'unset',
                    gap: 0.5,
                  }}
                >
                  <PlayArrowIcon />
                  POKRENI
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleZaustavi}
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.1)' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textTransform: 'none',
                    px: 1.5,
                    py: 1,
                    minWidth: 'unset',
                    gap: 0.5,
                  }}
                >
                  <StopIcon />
                  ZAUSTAVI
                </Button>
                <Button
                  variant="outlined"
                  onClick={handlePrethodna}
                  sx={{
                    borderColor: '#2196f3',
                    color: '#2196f3',
                    '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textTransform: 'none',
                    px: 1.5,
                    py: 1,
                    minWidth: 'unset',
                    gap: 0.5,
                  }}
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: '1rem' }} />
                  PREDHODNA
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSljedeca}
                  sx={{
                    borderColor: '#2196f3',
                    color: '#2196f3',
                    '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' },
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textTransform: 'none',
                    px: 1.5,
                    py: 1,
                    minWidth: 'unset',
                    gap: 0.5,
                  }}
                >
                  <ArrowForwardIosIcon sx={{ fontSize: '1rem' }} />
                  SLJEDEĆA
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: '#9e9e9e',
                    '&:hover': { bgcolor: '#757575' },
                    color: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 0.5,
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    textTransform: 'none',
                    fontSize: '1rem',
                    border: '1px solid #757575',
                  }}
                >
                  <DescriptionIcon />
                  DOKUMENTI
                </Button>
              </Box>
            </Box>

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress />
              </Box>
            )}

            {error && !loading && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>{error}</Alert>
            )}

            {!loading && !error && news.length > 0 && obavijest && (
              <Card elevation={3} sx={{ p: 3, mb: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mr: 1 }}><MovieCreationIcon sx={{ color: 'grey.700' }} /></Box>{obavijest.imeObavijesti}
                  </Typography>
                </Box>
                
                {obavijest.slika && (
                  <Box sx={{ position: 'relative', width: '100%', mb: 2 }}>
                    <Box
                      component="img"
                      src={`data:image/jpeg;base64,${obavijest.slika}`}
                      alt="Slika obavijesti"
                      onClick={handleImageClick}
                      sx={{
                        width: '100%',
                        height: '650px',
                        objectFit: 'contain',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'block',
                        margin: 'auto',
                        '&:hover': {
                          opacity: 0.9,
                        },
                      }}
                    />
                    <IconButton
                      onClick={handleImageClick}
                      sx={{
                        position: 'absolute',
                        bottom: 8,
                        right: 8,
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.9)',
                        },
                      }}
                    >
                      <ZoomInIcon />
                    </IconButton>
                  </Box>
                )}

                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {obavijest.opis}
                </Typography>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1 }}>
                  <Typography variant="body1" fontWeight="bold">
                    {/* Podnaslov iz baze ako ga imate */}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary">
                    Datum objave: {new Date(obavijest.datumObjave).toLocaleDateString('hr-HR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  {/* Uklonjen SharePoint gumb */}
                </Box>
              </Card>
            )}
            
            {!loading && !error && news.length === 0 && (
              <Typography variant="h6" color="text.secondary" sx={{ mt: 4, textAlign: 'center' }}>
                Trenutno nema aktivnih obavijesti.
              </Typography>
            )}

          </Box>
      </Box>

      {/* Image Modal */}
      <Dialog
        open={isImageModalOpen}
        onClose={handleCloseImageModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: 'transparent',
            boxShadow: 'none',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              bgcolor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
          {obavijest?.slika && (
            <Box
              component="img"
              src={`data:image/jpeg;base64,${obavijest.slika}`}
              alt="Slika obavijesti"
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '90vh',
                objectFit: 'contain',
                display: 'block',
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ObavijestiPage; 