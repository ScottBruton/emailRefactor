import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import infoIcon from '../../assets/info.svg';
import { check } from '@tauri-apps/plugin-updater';
import { ask, message } from '@tauri-apps/plugin-dialog';
import { getVersion } from '@tauri-apps/api/app';
import { invoke } from '@tauri-apps/api/tauri';

const InfoButton = () => {
  const [open, setOpen] = useState(false);
  const [appVersion, setAppVersion] = useState('1.0.0');
  const isDarkTheme = document.body.classList.contains('dark-theme');

  useEffect(() => {
    getVersion().then(version => {
      console.log('Current app version:', version);
      setAppVersion(version);
    }).catch(err => {
      console.error('Failed to get app version:', err);
      logError('getVersion', err);
    });
  }, []);

  const logError = async (context, error) => {
    const errorDetails = {
      context,
      message: error.message,
      stack: error.stack,
      cause: error.cause,
      timestamp: new Date().toISOString()
    };
    console.error('Error details:', errorDetails);
    try {
      // Log to Rust side
      await invoke('plugin:log|error', { 
        message: `Frontend error in ${context}: ${error.message}`,
        details: JSON.stringify(errorDetails, null, 2)
      });
    } catch (e) {
      console.error('Failed to log to backend:', e);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleUpdate = async () => {
    try {
      console.log('Starting update check...');
      console.log('Current version:', appVersion);

      const update = await check();
      console.log('Update check response:', update);

      if (!update) {
        console.log('Update check returned null/undefined');
        await message('Unable to check for updates.', { 
          title: 'Error',
          type: 'error'
        });
        return;
      }

      if (update.available) {
        console.log('Update available:', {
          currentVersion: appVersion,
          newVersion: update.version,
          downloadUrl: update.url,
          releaseNotes: update.notes
        });

        const shouldUpdate = await ask(
          `Version ${update.version} is available.\n\nRelease Notes:\n${update.notes || 'No release notes available'}\n\nWould you like to update now?`,
          { 
            title: 'Update Available',
            type: 'info'
          }
        );

        if (shouldUpdate) {
          console.log('Starting update installation...');
          await update.downloadAndInstall();
          console.log('Update downloaded and installed');
          await message('Update installed. The application will restart.', {
            title: 'Success',
            type: 'info'
          });
        } else {
          console.log('User declined update');
        }
      } else {
        console.log('No update available');
        await message('You are on the latest version.', {
          title: 'Up to Date',
          type: 'info'
        });
      }
    } catch (error) {
      console.error('Update error:', error);
      await logError('handleUpdate', error);

      let errorMessage = 'Failed to check for updates. ';
      if (error.message.includes('network')) {
        errorMessage += 'Please check your internet connection.';
      } else if (error.message.includes('signature')) {
        errorMessage += 'Update signature verification failed.';
      } else if (error.message.includes('download')) {
        errorMessage += 'Failed to download the update.';
      } else {
        errorMessage += error.message || 'Unknown error occurred.';
      }

      await message(errorMessage, { 
        title: 'Update Error',
        type: 'error'
      });
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
            <strong>Version:</strong> {appVersion}
          </Typography>
        </DialogContent>
        <DialogActions style={{ backgroundColor: 'var(--background-color)' }}>
          <Button onClick={handleUpdate} style={{ color: 'var(--primary-color)' }}>
            Check for Updates
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