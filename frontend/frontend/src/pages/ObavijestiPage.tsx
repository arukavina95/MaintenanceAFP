import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CircularProgress, 
  Alert, 
  Dialog, 
  DialogContent, 
  IconButton, 
  Container,
  Fade,
  Zoom,
  Grow,
  keyframes
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ObavijestiService, { type Obavijest } from '../services/ObavijestiService';
import { designTokens } from '../theme/designSystem';

// Custom keyframes for animations
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const ObavijestiPage: React.FC = () => {
  const [news, setNews] = useState<Obavijest[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageHovered, setImageHovered] = useState(false);
  
  
  
  // Memoized current obavijest
  const obavijest = useMemo(() => news[currentIndex], [news, currentIndex]);

  // Fetch news data
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
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

  // Auto-rotation effect
  useEffect(() => {
    if (!isRunning || news.length === 0) return;
  
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev < news.length - 1 ? prev + 1 : 0));
    }, 10000);
  
    return () => clearInterval(interval);
  }, [isRunning, news.length]);

  // Event handlers
  const handlePokreni = useCallback(() => setIsRunning(true), []);
  const handleZaustavi = useCallback(() => setIsRunning(false), []);
  
  const handlePrethodna = useCallback(() => {
    if (news.length > 0) {
      setCurrentIndex((prev) => prev > 0 ? prev - 1 : news.length - 1);
    }
  }, [news.length]);
  
  const handleSljedeca = useCallback(() => {
    if (news.length > 0) {
      setCurrentIndex((prev) => prev < news.length - 1 ? prev + 1 : 0);
    }
  }, [news.length]);

  const handleImageClick = useCallback(() => setIsImageModalOpen(true), []);
  const handleCloseImageModal = useCallback(() => setIsImageModalOpen(false), []);

  // Utility functions
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hr-HR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }, []);

  const isNewNews = useCallback((dateString: string) => {
    const now = new Date();
    const datum = new Date(dateString);
    const diff = (now.getTime() - datum.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 2;
  }, []);

  // Responsive styles
  const responsiveStyles = {
    container: {
      py: { xs: 0.5, sm: 1, md: 1.5 }, // Reduced padding
      px: { xs: 1, sm: 1.5, md: 2 } // Reduced padding
    },
    title: {
      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem', lg: '3rem' },
      lineHeight: { xs: 1.3, md: 1.2 }
    },
    card: {
      maxWidth: { xs: '100%', sm: 800, md: 1000, lg: 1200 },
      mx: { xs: 0.5, sm: 1, md: 'auto' } // Reduced margins
    },
    image: {
      maxHeight: { xs: 300, sm: 400, md: 500 }
    }
  };

  return (
    <Container maxWidth="xl" sx={responsiveStyles.container}>
      {/* Unified Navigation Controls - Moved to top */}
      <Zoom in timeout={800}>
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 2,
          justifyContent: 'center', 
          alignItems: 'center',
          mb: 3
        }}>
          <Button
            variant="contained"
            onClick={handlePrethodna}
            size="medium"
            sx={{ 
              minWidth: 'auto',
              px: 2,
              py: 1,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateX(-2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowBackIosNewIcon />
          </Button>
          
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500, px: 2 }}>
            {currentIndex + 1} od {news.length}
          </Typography>
          
          <Button
            variant="contained"
            onClick={handleSljedeca}
            size="medium"
            sx={{ 
              minWidth: 'auto',
              px: 2,
              py: 1,
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
                transform: 'translateX(2px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <ArrowForwardIosIcon />
          </Button>
          
          <Button
            variant={isRunning ? "contained" : "outlined"}
            onClick={isRunning ? handleZaustavi : handlePokreni}
            size="medium"
            sx={{
              minWidth: 'auto',
              px: 2,
              py: 1,
              boxShadow: isRunning ? designTokens.shadows.sm : 'none',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: isRunning ? designTokens.shadows.md : designTokens.shadows.sm,
              },
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: isRunning ? `${pulse} 2s infinite` : 'none'
            }}
          >
            {isRunning ? <StopIcon /> : <PlayArrowIcon />}
          </Button>
          
          <IconButton
            size="medium"
            sx={{ 
              border: '1px solid',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'primary.main',
                color: 'white',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <DescriptionIcon />
          </IconButton>
        </Box>
      </Zoom>

      {/* Content Area - Now the main focus */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        minHeight: 'calc(100vh - 200px)',
      }}>
        {loading ? (
          <Fade in timeout={800}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center', 
              py: { xs: 8, md: 12 },
              gap: 3
            }}>
              <CircularProgress 
                size={56} 
                color="primary"
                sx={{
                  animation: `${shimmer} 1.5s ease-in-out infinite`
                }}
              />
              <Typography variant="h6" color="neutral.600" fontWeight={500}>
                Učitavanje vijesti...
              </Typography>
              <Typography variant="body2" color="neutral.500">
                Molimo pričekajte
              </Typography>
            </Box>
          </Fade>
        ) : error ? (
          <Fade in timeout={800}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center', 
              py: { xs: 8, md: 12 },
              gap: 3
            }}>
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: 2,
                  maxWidth: { xs: '90%', sm: 500 },
                  '& .MuiAlert-icon': {
                    fontSize: 28,
                  },
                  '& .MuiAlert-message': {
                    fontSize: { xs: 14, md: 16 },
                    fontWeight: 500,
                  }
                }}
              >
                {error}
              </Alert>
            </Box>
          </Fade>
        ) : obavijest ? (
          <Grow in timeout={1200}>
            <Card
              sx={{
                ...responsiveStyles.card,
                borderRadius: 3,
                boxShadow: designTokens.shadows.md,
                overflow: 'hidden',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': { 
                  transform: 'translateY(-4px)',
                  boxShadow: designTokens.shadows.lg,
                },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'neutral.200',
                animation: `${fadeInUp} 0.8s ease-out`
              }}
            >
              {/* Simplified Header with Date and Status */}
              <Box sx={{ 
                p: { xs: 2, md: 3 }, 
                pb: { xs: 1, md: 2 },
                borderBottom: '1px solid',
                borderColor: 'neutral.200',
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 1
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AccessTimeIcon sx={{ color: 'neutral.500', fontSize: 18 }} />
                    <Typography 
                      variant="body2" 
                      color="neutral.600" 
                      fontWeight={500}
                      sx={{ fontSize: '0.85rem' }}
                    >
                      {formatDate(obavijest.datumObjave)}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    {isNewNews(obavijest.datumObjave) && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <NotificationsIcon sx={{ fontSize: 16, color: 'error.main' }} />
                        <Box sx={{ 
                          width: 6, 
                          height: 6, 
                          borderRadius: '50%', 
                          bgcolor: 'error.main' 
                        }} />
                      </Box>
                    )}
                  </Box>
                </Box>
              </Box>

              {/* Title */}
              <Box sx={{ p: { xs: 2, md: 3 }, pt: { xs: 1.5, md: 2 } }}>
                <Typography 
                  variant="h4" 
                  fontWeight={700} 
                  color="neutral.800"
                  sx={{ 
                    mb: { xs: 2, md: 3 },
                    lineHeight: 1.2,
                    fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
                    letterSpacing: '-0.3px',
                  }}
                >
                  {obavijest.imeObavijesti}
                </Typography>
              </Box>

              {/* Image with Enhanced Hover Effects */}
              {obavijest.slika && (
                <Box sx={{ px: { xs: 2, md: 3 }, pb: 2 }}>
                  <Box
                    component="img"
                    src={`data:image/jpeg;base64,${obavijest.slika}`}
                    alt="Slika obavijesti"
                    onMouseEnter={() => setImageHovered(true)}
                    onMouseLeave={() => setImageHovered(false)}
                    sx={{
                      width: '100%',
                      ...responsiveStyles.image,
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: imageHovered ? 'scale(1.02)' : 'scale(1)',
                      filter: imageHovered ? 'brightness(1.05)' : 'brightness(1)',
                      boxShadow: imageHovered ? designTokens.shadows.lg : designTokens.shadows.sm,
                      '&:hover': {
                        transform: 'scale(1.02)',
                        filter: 'brightness(1.05)',
                        boxShadow: designTokens.shadows.lg,
                      }
                    }}
                    onClick={handleImageClick}
                  />
                </Box>
              )}

              {/* Content - Simplified without Paper wrapper */}
              <Box sx={{ p: { xs: 2, md: 3 }, pt: 2 }}>
                <Box
                  sx={{
                    maxHeight: { xs: 400, md: 600 },
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': {
                      width: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                      bgcolor: 'neutral.100',
                      borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'neutral.300',
                      borderRadius: 3,
                      '&:hover': {
                        bgcolor: 'neutral.400',
                      },
                    },
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                      color: 'neutral.800',
                      fontWeight: 600,
                      mb: 2,
                      mt: 3,
                      fontSize: { xs: '1.1rem', md: '1.2rem' }
                    },
                    '& p': {
                      color: 'neutral.700',
                      lineHeight: 1.6,
                      mb: 2,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    },
                    '& ul, & ol': {
                      color: 'neutral.700',
                      lineHeight: 1.6,
                      mb: 2,
                      pl: 3,
                    },
                    '& li': {
                      mb: 1,
                      fontSize: { xs: '1rem', md: '1.1rem' },
                    },
                    '& strong, & b': {
                      fontWeight: 600,
                      color: 'neutral.800',
                    },
                    '& em, & i': {
                      fontStyle: 'italic',
                      color: 'neutral.600',
                    },
                    '& blockquote': {
                      borderLeft: '4px solid',
                      borderColor: 'primary.main',
                      pl: 2,
                      ml: 0,
                      py: 1,
                      bgcolor: 'neutral.50',
                      borderRadius: '0 4px 4px 0',
                      fontStyle: 'italic',
                      color: 'neutral.700',
                    },
                    '& a': {
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 500,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    },
                  }}
                  dangerouslySetInnerHTML={{ __html: obavijest.opis }}
                />
              </Box>
            </Card>
          </Grow>
        ) : (
          <Fade in timeout={800}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center', 
              py: { xs: 8, md: 12 },
              gap: 3
            }}>
              <Typography variant="h5" color="neutral.600" fontWeight={500}>
                Nema dostupnih vijesti
              </Typography>
              <Typography variant="body1" color="neutral.500">
                Trenutno nema aktivnih obavijesti za prikaz
              </Typography>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Enhanced Image Modal */}
      <Dialog 
        open={isImageModalOpen} 
        onClose={handleCloseImageModal} 
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden',
            bgcolor: 'neutral.900',
            maxHeight: '90vh',
            m: 2
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          <IconButton
            onClick={handleCloseImageModal}
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              color: 'white', 
              zIndex: 2,
              bgcolor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              '&:hover': {
                bgcolor: 'rgba(0,0,0,0.8)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.3s ease'
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={`data:image/jpeg;base64,${obavijest?.slika}`}
            alt="Slika obavijesti uvećana"
            sx={{
              display: 'block',
              width: '100%',
              height: 'auto',
              maxHeight: '80vh',
              objectFit: 'contain',
              animation: `${fadeInUp} 0.5s ease-out`
            }}
          />
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ObavijestiPage; 