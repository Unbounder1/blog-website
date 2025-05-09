import React from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';

// Slider component with a linked text input
const SliderComponent = ({
  value,
  setValue,
  title = "Parameter Name",
  minVal = 0,
  maxVal = 100,
  step = 1,
  disabled = false
}) => {
  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    const newValue = event.target.value === '' ? '' : Number(event.target.value);
    if (newValue === '' || (!isNaN(newValue) && newValue >= minVal && newValue <= maxVal)) {
      setValue(newValue);
    }
  };

  const handleBlur = () => {
    if (value < minVal) {
      setValue(minVal);
    } else if (value > maxVal) {
      setValue(maxVal);
    }
  };

  return (
    <Box display="flex" alignItems="center" gap={2} padding={2} width={100}>
      <Box flex={1}>
        <Typography variant="h6" style={{fontSize: '1rem'}}>{title}</Typography>
        <Slider
          value={typeof value === 'number' ? value : 0}
          onChange={handleSliderChange}
          min={minVal}
          max={maxVal}
          step={step}
          disabled={disabled}
          valueLabelDisplay="auto"
          sx={{
            width: 150,
            fontSize: '0.8rem'
          }}
        />
      </Box>
      <TextField
        label="Value"
        variant="outlined"
        size="small"
        value={value}
        onChange={handleInputChange}
        onBlur={handleBlur}
        disabled={!disabled}
        slotProps={{
            input: { 
                step: step,
                min: minVal,
                max: maxVal,
                type: 'number',
                sx: {
                  color: 'white',
                  width: '10vh',
                  fontSize: '0.8rem'
                }
             }
          }}
      />
    </Box>
  );
};

export default SliderComponent;