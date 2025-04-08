import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Collapse, IconButton } from '@mui/material';
import { invoke } from '@tauri-apps/api/core';
import infoIcon from '../../assets/info.svg';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

const InfoButton = () => {
  const [open, setOpen] = useState(false);
  const isDarkTheme = document.body.classList.contains('dark-theme');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [errorDetails, setErrorDetails] = useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowDetails(false);
  };

  const handleUpdate = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    setUpdateStatus('Checking for updates...');
    try {
        const result = await invoke('check_update');
        setUpdateStatus(result.message);
        setErrorDetails(result.details || '');
    } catch (error) {
        console.error('Update error:', error);
        setUpdateStatus('Failed to check for updates');
        setErrorDetails(error);
    } finally {
        setIsUpdating(false);
    }
  };

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 30,
          left: 10,
          zIndex: 1000,
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        }}
        onClick={handleClickOpen}
      >
        <img 
          src={infoIcon} 
          alt="Info" 
          style={{ 
            width: 24, 
            height: 24,
            filter: 'var(--icon-filter)',
            transition: 'filter 0.2s ease'
          }} 
        />
      </Box>

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="info-dialog-title"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          style: {
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
          },
        }}
      >
        <DialogTitle 
          id="info-dialog-title"
          style={{
            backgroundColor: 'var(--background-color)',
            color: 'var(--text-color)',
          }}
        >
          About Sco-Bro Mail
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom style={{ color: 'var(--text-color)' }}>
            <strong>Application Name:</strong> Sco-Bro Mail (ScoBro Suite)
          </Typography>
          <Typography variant="body1" gutterBottom style={{ color: 'var(--text-color)' }}>
            <strong>Author:</strong> Scott Bruton
          </Typography>
          <Typography variant="body1" gutterBottom style={{ color: 'var(--text-color)' }}>
            <strong>Version:</strong> 1.0.0
          </Typography>
          {updateStatus && (
            <Box>
              <Typography variant="body1" gutterBottom style={{ color: 'var(--text-color)' }}>
                <strong>Update Status:</strong> {updateStatus}
              </Typography>
              {errorDetails && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" style={{ color: 'var(--text-color)' }}>
                      <strong>Error Details:</strong>
                    </Typography>
                    <IconButton size="small" onClick={() => setShowDetails(!showDetails)}>
                      {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </Box>
                  <Collapse in={showDetails}>
                    <Typography variant="body2" style={{ color: 'var(--text-color)', marginTop: 8 }}>
                      {errorDetails}
                    </Typography>
                  </Collapse>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'var(--background-color)' }}>
          <Button onClick={handleUpdate} disabled={isUpdating} style={{ color: 'var(--primary-color)' }}>
            {isUpdating ? 'Checking...' : 'Update'}
          </Button>
          <Button onClick={handleClose} style={{ color: 'var(--primary-color)' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InfoButton; 