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
  onAddPreset
}) => {
  const [isAddPresetOpen, setIsAddPresetOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState('');

  const handleAddPreset = () => {
    if (newPresetName.trim()) {
      onAddPreset(newPresetName.trim());
      setNewPresetName('');
      setIsAddPresetOpen(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <FormControl sx={{ minWidth: 180 }}>
        <InputLabel size="small">Presets</InputLabel>
        <Select
          value={selectedPreset}
          onChange={(e) => onPresetChange(e.target.value)}
          label="Presets"
          size="small"
          input={<OutlinedInput label="Presets" />}
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
        >
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
        </Select>
      </FormControl>
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

      {isAddPresetOpen && (
        <Box sx={{ 
          position: 'absolute', 
          top: '100%', 
          left: 0,
          width: '180px',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          p: 1,
          zIndex: 1000,
          boxShadow: 3
        }}>
          <OutlinedInput
            fullWidth
            size="small"
            value={newPresetName}
            onChange={(e) => setNewPresetName(e.target.value)}
            placeholder="Enter preset name..."
            onKeyPress={(e) => e.key === 'Enter' && handleAddPreset()}
            autoFocus
          />
        </Box>
      )}
    </Box>
  );
};

export default PresetSelector; 