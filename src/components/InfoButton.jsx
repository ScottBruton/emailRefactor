import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import infoIcon from '../../assets/info.svg';

const InfoButton = () => {
  const [open, setOpen] = useState(false);
  const isDarkTheme = document.body.classList.contains('dark-theme');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdate = () => {
    // TODO: Implement update functionality
    handleClose();
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
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'var(--background-color)' }}>
          <Button onClick={handleUpdate} style={{ color: 'var(--primary-color)' }}>
            Update
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