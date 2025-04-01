import React, { useState } from 'react';
import { 
  Select, 
  MenuItem, 
  IconButton, 
  Box, 
  FormControl,
  InputLabel,
  OutlinedInput,
  ListItemText
} from '@mui/material';
import deleteIcon from '../../assets/delete.svg';
import addIcon from '../../assets/addPreset.svg';

const PresetSelector = ({ 
  presets, 
  customPresets, 
  selectedPreset, 
  onPresetChange, 
  onDeletePreset,
  onAddPreset,
  onSaveSettings,
  onRevertSettings,
  onClearSettings,
  isSaving,
  lastSavedSettings,
  styles,
  enabledCategories
}) => {
  const [isAddPresetOpen, setIsAddPresetOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleAddPreset = async () => {
    if (newPresetName.trim()) {
      // Create new preset with current settings
      const newPreset = {
        label: newPresetName.trim(),
        settings: {
          styles: { ...styles },
          enabledCategories: { ...enabledCategories }
        }
      };

      // Update UI through parent component
      onAddPreset(newPresetName.trim(), newPreset);
      setNewPresetName('');
      setIsAddPresetOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <IconButton 
          size="small" 
          onClick={() => setIsAddPresetOpen(true)}
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <img 
            src={addIcon} 
            alt="Add" 
            style={{ 
              width: '14px', 
              height: '14px',
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }} 
          />
        </IconButton>

        <IconButton 
          size="small"
          onClick={onSaveSettings}
          disabled={isSaving}
          title="Save current settings"
          aria-label="Save settings"
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
            <polyline points="17 21 17 13 7 13 7 21"></polyline>
            <polyline points="7 3 7 8 15 8"></polyline>
          </svg>
        </IconButton>

        <IconButton 
          size="small"
          onClick={onRevertSettings}
          disabled={!lastSavedSettings}
          title="Revert to last saved settings"
          aria-label="Revert to saved settings"
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
          >
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
            <path d="M3 3v5h5"></path>
          </svg>
        </IconButton>

        <IconButton 
          size="small"
          onClick={onClearSettings}
          title="Reset all settings to default"
          aria-label="Clear all settings"
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            padding: '4px',
            '&:hover': {
              backgroundColor: 'action.hover'
            }
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            style={{
              opacity: 0.7,
              transition: 'opacity 0.2s'
            }}
          >
            <path d="M3 6h18"></path>
            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            <line x1="10" y1="11" x2="10" y2="17"></line>
            <line x1="14" y1="11" x2="14" y2="17"></line>
          </svg>
        </IconButton>
      </Box>

      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel size="small">Presets</InputLabel>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Select
            value={selectedPreset}
            onChange={(e) => onPresetChange(e.target.value)}
            label="Presets"
            size="small"
            input={<OutlinedInput label="Presets" />}
            renderValue={(selected) => {
              // When displaying the selected value, just show the label
              const preset = customPresets[selected] || presets[selected];
              return preset?.label || '';
            }}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    py: 0.5,
                    px: 2,
                    minHeight: 'unset'
                  }
                }
              }
            }}
            sx={{ minWidth: 180 }}
          >
            {Object.entries(customPresets).map(([key, preset]) => (
              <MenuItem key={key} value={key} sx={{ pr: 6, display: 'flex', justifyContent: 'space-between' }}>
                <ListItemText 
                  primary={preset.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: selectedPreset === key ? 500 : 400
                  }}
                />
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeletePreset(key);
                  }}
                  sx={{ 
                    position: 'absolute',
                    right: 4,
                    padding: '2px',
                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <img 
                    src={deleteIcon} 
                    alt="Delete" 
                    style={{ 
                      width: '14px', 
                      height: '14px',
                      opacity: 0.7,
                      transition: 'opacity 0.2s'
                    }} 
                  />
                </IconButton>
              </MenuItem>
            ))}
            {Object.entries(presets).map(([key, preset]) => (
              <MenuItem key={key} value={key} sx={{ pr: 6 }}>
                <ListItemText 
                  primary={preset.label}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: selectedPreset === key ? 500 : 400
                  }}
                />
              </MenuItem>
            ))}
          </Select>
          {selectedPreset in customPresets && (
            <IconButton 
              size="small"
              onClick={() => onDeletePreset(selectedPreset)}
              sx={{ 
                border: '1px solid',
                borderColor: 'divider',
                padding: '4px',
                '&:hover': {
                  backgroundColor: 'action.hover'
                }
              }}
            >
              <img 
                src={deleteIcon} 
                alt="Delete" 
                style={{ 
                  width: '14px', 
                  height: '14px',
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }} 
              />
            </IconButton>
          )}
        </Box>
      </FormControl>

      {isAddPresetOpen && (
        <Box sx={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0,
          width: '180px',
          backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#2d2d2d' : 'background.paper',
          border: '1px solid',
          borderColor: (theme) => theme.palette.mode === 'dark' ? '#404040' : 'divider',
          borderRadius: 1,
          p: 1.5,
          zIndex: 1000,
          boxShadow: (theme) => theme.palette.mode === 'dark' ? '0 4px 8px rgba(0, 0, 0, 0.4)' : 3,
          display: 'flex',
          flexDirection: 'column',
          gap: 1
        }}>
          <OutlinedInput
            fullWidth
            size="small"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Enter preset name..."
            onKeyPress={(e) => {
              if (e.key === 'Enter' && newPresetName.trim()) {
                handleAddPreset();
              }
            }}
            autoFocus
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#404040' : 'divider',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#606060' : 'divider',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#48a3ff' : 'primary.main',
              },
              '& input': {
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
              },
              '& input::placeholder': {
                color: (theme) => theme.palette.mode === 'dark' ? '#888888' : 'inherit',
                opacity: 1,
              },
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 0.5 }}>
            <IconButton
              size="small"
              onClick={() => {
                setNewPresetName('');
                setIsAddPresetOpen(false);
              }}
              sx={{
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#404040' : 'divider',
                padding: '4px',
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'action.hover'
                }
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </IconButton>
            <IconButton
              size="small"
              onClick={() => {
                if (newPresetName.trim()) {
                  handleAddPreset();
                }
              }}
              disabled={!newPresetName.trim()}
              sx={{
                border: '1px solid',
                borderColor: (theme) => theme.palette.mode === 'dark' ? '#404040' : 'divider',
                padding: '4px',
                color: (theme) => theme.palette.mode === 'dark' ? '#ffffff' : 'inherit',
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'action.hover'
                },
                '&.Mui-disabled': {
                  opacity: 0.5,
                  cursor: 'not-allowed',
                  color: (theme) => theme.palette.mode === 'dark' ? '#666666' : 'inherit'
                }
              }}
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{
                  opacity: 0.7,
                  transition: 'opacity 0.2s'
                }}
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PresetSelector; 