import React from 'react';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

// Slider component with default min 0, max 100
// input states [value, setValue] PARAM
const SliderComponent = ({ value, setValue, title="Parameter Name", minVal=0, maxVal=100 }) => { 
  const handleChange = (event, newValue) => {
    setValue(newValue); 
  };

  return (
    <div style={{ width: 300, padding: 20 }}>
      <Typography variant="h6">{title}</Typography>
      <Slider
        value={value}
        onChange={handleChange}
        min={minVal}
        max={maxVal}
        step={1}
        valueLabelDisplay="auto"
      />
    </div>
  );
};

export default SliderComponent;