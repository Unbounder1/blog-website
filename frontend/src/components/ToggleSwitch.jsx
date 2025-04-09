import "../styles/toggleswitch.css";

const ToggleSwitch = ( {isOn, setIsOn, onString, offString} ) => {

  const handleToggle = () => {
    setIsOn(prev => !prev);
  };

  return (
    <div className="toggle-container">
      <label className="switch">
        <input type="checkbox" checked={isOn} onChange={handleToggle} />
        <span className="slider"></span>
      </label>
      <span style={{ marginLeft: "10px" }}>{isOn ? onString : offString}</span>
    </div>
  );
};

export default ToggleSwitch;