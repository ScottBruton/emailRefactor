import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import infoIcon from '../../assets/info.svg';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { invoke } from '@tauri-apps/api/core';
import { getVersion } from '@tauri-apps/api/app';

const InfoButton = () => {
  const [open, setOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('');
  const isDarkTheme = document.body.classList.contains('dark-theme');

  useEffect(() => {
    // Get the current app version
    getVersion().then(version => {
      setAppVersion(version);
    }).catch(err => {
      console.error('Failed to get app version:', err);
      setAppVersion('Unknown');
    });
  }, []);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  async function handleUpdate() {
    try {
      const update = await check();
      console.log('📦 Update check response:', update);
      
      if (!update) {
        await message('Failed to check for updates.', {
          title: 'Error',
          kind: 'error'
        });
        return;
      }

      if (update.available) {
        const confirm = await ask(
          `A new version (${update.version}) is available.\n\n${update.body || ''}\n\nDownload and install now?`,
          {
            title: 'Update Available',
            kind: 'info',
            okLabel: 'Yes',
            cancelLabel: 'No'
          }
        );
        if (!confirm) return;
  
        try {
          await update.downloadAndInstall();
          await message('Update downloaded. The application will restart now.', {
            title: 'Update Ready',
            kind: 'info'
          });
          await invoke('graceful_restart');
        } catch (err) {
          console.error('Download/Install error:', err);
          await message(`Failed to download/install update: ${err}`, {
            title: 'Update Failed',
            kind: 'error'
          });
        }
      } else {
        await message('You are already on the latest version.', {
          title: 'Up to Date',
          kind: 'info'
        });
      }
    } catch (err) {
      console.error('Update check error:', err);
      await message(`Error checking updates: ${err}`, {
        title: 'Update Failed',
        kind: 'error'
      });
    }
  }

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
            <strong>Version:</strong> {appVersion}
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