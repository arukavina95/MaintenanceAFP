import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Close as CloseIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';

interface DocumentViewerModalProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  fileType: string;
  onDownload: () => void;
}

const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  open,
  onClose,
  fileName,
  fileType,
  onDownload
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (open) {
      setError(null);
      setLoading(false);
      setIframeLoaded(false);
    }
  }, [open]);

  const getDocumentUrl = () => {
    const url = `http://localhost:5008/api/izvodaci/download/${fileName}`;
    console.log('Document URL:', url);
    return url;
  };

  const handleIframeLoad = () => {
    console.log('PDF iframe loaded successfully');
    setIframeLoaded(true);
    setLoading(false);
    
    // Check if iframe has content
    if (iframeRef.current) {
      try {
        const iframeDoc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        console.log('Iframe document:', iframeDoc);
        if (iframeDoc && iframeDoc.body) {
          console.log('Iframe body content length:', iframeDoc.body.innerHTML.length);
        }
      } catch (e) {
        console.log('Cannot access iframe content due to CORS:', e);
      }
    }
  };

  const handleIframeError = () => {
    console.error('Error loading PDF iframe');
    setError('Greška pri učitavanju PDF-a');
    setLoading(false);
  };

  const renderContent = () => {
    if (fileType === 'pdf') {
      return (
        <Box sx={{ textAlign: 'center', height: '100%' }}>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          )}
          
          <iframe
            ref={iframeRef}
            src={getDocumentUrl()}
            style={{
              width: '100%',
              height: '70vh',
              border: '1px solid #ccc',
              borderRadius: '4px',
              display: iframeLoaded ? 'block' : 'none'
            }}
            title="PDF Preview"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
          />
          
          {!iframeLoaded && !loading && (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                PDF se učitava...
              </Typography>
              <CircularProgress />
            </Box>
          )}
        </Box>
      );
    }

    if (['jpg', 'jpeg', 'png', 'gif'].includes(fileType)) {
      return (
        <Box sx={{ textAlign: 'center' }}>
          <img
            src={getDocumentUrl()}
            alt={fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '70vh',
              objectFit: 'contain'
            }}
            onLoad={() => {
              console.log('Image loaded successfully');
              setLoading(false);
            }}
            onError={() => {
              console.error('Error loading image');
              setError('Greška pri učitavanju slike');
              setLoading(false);
            }}
          />
        </Box>
      );
    }

    // Za ostale tipove datoteka
    return (
      <Box sx={{ textAlign: 'center', p: 4 }}>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
          Pregled nije dostupan za ovaj tip datoteke
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Datoteka: {fileName}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Koristite "Preuzmi" za preuzimanje datoteke
        </Typography>
      </Box>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#f5f5f5',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            📄 {fileName}
          </Typography>
        </Box>
        
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        {error ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="error" variant="h6">
              {error}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Pokušajte preuzeti dokument umjesto pregleda
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
              Datoteka: {fileName}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              URL: {getDocumentUrl()}
            </Typography>
          </Box>
        ) : (
          renderContent()
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, backgroundColor: '#f5f5f5', borderTop: 1, borderColor: 'divider' }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{ mr: 1 }}
        >
          Zatvori
        </Button>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={onDownload}
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' }
          }}
        >
          Preuzmi
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentViewerModal;
