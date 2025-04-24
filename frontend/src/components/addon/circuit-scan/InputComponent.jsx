import { useState, useRef, useEffect } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import "../../../styles/full-site/circuitscan.css";
import ToggleSwitch from "../../ToggleSwitch";
import SliderComponent from "../../SliderComponent";
import { Slide } from "@mui/material";

const InputComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processOutput, setProcessOutput] = useState({});
  const [processInput, setProcessInput] = useState("");
  const [isUpload, setIsUpload] = useState(true);

  const [confidenceThreshold, setConfidenceThreshold] = useState(0.5); // object detection accuracy threshold
  const [resizeImageMax, setResizeImageMax] = useState(1000); // resize image size
  const [normalizeX, setNormalizeX] = useState(80); // default goal resistor size-x
  const [normalizeY, setNormalizeY] = useState(80); // default goal resistor size-y
  const [binaryThresholdMin, setBinaryThresholdMin] = useState(160); // min threshold for binary conversion
  const [binaryThresholdMax, setBinaryThresholdMax] = useState(255); // max threshold for binary conversion
  const [kdTreeBoundingThreshold, setKdTreeBoundingThreshold] = useState(1); // bounding box threshold for KD-tree
  const [gridSize, setGridSize] = useState(128); // LTSpice grid snapping size
  const [textSearchSize, setTextSearchSize] = useState(2); // number of OCR text guesses per component
  const [textSearchRadius, setTextSearchRadius] = useState(300); // radius for OCR text search around components

  useEffect(() => {
    setIsProcessing(false);

  }, [isUpload]);

  // Handling canvas refs
  const canvasRef = useRef(null);

  const handleUndo = () => {
    setProcessOutput({});
    canvasRef.current?.undo();
  };

  const handleRedo = () => {
    canvasRef.current?.redo(); 
  };

  // Handling upload files
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setProcessOutput({});

    const reader = new FileReader();
    reader.readAsDataURL(files[0]);

    reader.onload = () => {
      const base64 = reader.result.split(",")[1];
      setProcessInput(base64);
    };

    setIsProcessing(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setProcessOutput({});

    const fetchData = async () => {
        try {
          let base64String = "";
      
          if (isUpload) {
            // Handle image upload
            base64String = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(selectedFiles[0]);
      
              reader.onload = () => {
                const result = reader.result.split(",")[1];
                resolve(result);
              };
      
              reader.onerror = (error) => reject(error);
            });
          } else {
            // Handle drawing
            const dataUrl = await canvasRef.current?.exportImage("png");
            if (dataUrl) {
              base64String = dataUrl.split(",")[1];
            } else {
              throw new Error("Failed to export canvas image.");
            }
          }
      
          const payload = {
            path_specs: "", // Add if needed
            input: base64String,
          };
      
          const response = await fetch("/api/addon-circuit", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            const errorText = await response.text();
            setIsProcessing(false);
            setProcessOutput({ error: errorText });
          }
          else {
          const output = await response.json();
          setProcessOutput(output);
        }
        } catch (error) {
          console.error("Error querying circuit-scan addon", error);
        } finally {
            setIsProcessing(false);
        }
      };

    fetchData();
  };

  return (
    <div className="input-container">
        <ToggleSwitch isOn={isUpload} setIsOn={setIsUpload} onString={"Upload Image"} offString={"Draw Input"}/>
        <form onSubmit={handleSubmit} encType="multipart/form-data">

        { isUpload ? 
        // If uploading option
        <div className="upload-section">
          <label htmlFor="image_uploads">Choose images to upload (PNG, JPG)</label>
          <input
            type="file"
            id="image_uploads"
            name="image_uploads"
            accept=".jpg, .jpeg, .png, .webp"
            onChange={handleFileChange}
            multiple
            className="upload-input"
          />

        <div className="preview">
          {selectedFiles.length > 0 ? (
            processInput !== "" && (
              <div>
                <img
                  className="output-images"
                  src={`data:image/png;base64,${processInput}`}
                  alt="Input Preview"
                />
              </div>
            )
          ) : (
            <p>No files currently selected for upload</p>
          )}
        </div>
        </div>
        :
        // If drawing input
        <div className="canvas-wrapper">
          <ReactSketchCanvas
            ref={canvasRef}
            className="canvas-style"
            strokeWidth={4}
            strokeColor="black"
            
          />
          <div className="canvas-buttons">
          <button type="button" className="undo-stroke" onClick={handleUndo}>← Undo</button>
          <button type="button" className="redo-stroke" onClick={handleRedo}>Redo →</button>
          </div>
        </div>

        }

        <div style={{ marginBottom: "1rem" }}>
          <button type="submit" disabled={(isUpload || isProcessing) && (isProcessing || selectedFiles.length === 0) }>
            {isProcessing ? "Processing..." : "Submit"}
          </button>
        </div>

        {/* SLIDER COMPONENTS --------------------- */}
        <div className="slider-section">
          <SliderComponent setValue={setConfidenceThreshold} value={confidenceThreshold} title="Confidence Threshold" maxVal={1} minVal={0} step={0.01} />
          <SliderComponent setValue={setResizeImageMax} value={resizeImageMax} title="Resize Image Max" maxVal={5000} minVal={100} step={10} />
          <SliderComponent setValue={setNormalizeX} value={normalizeX} title="Normalize X (Resistor Width)" maxVal={200} minVal={10} step={1} />
          <SliderComponent setValue={setNormalizeY} value={normalizeY} title="Normalize Y (Resistor Height)" maxVal={200} minVal={10} step={1} />
          <SliderComponent setValue={setBinaryThresholdMin} value={binaryThresholdMin} title="Binary Threshold Min" maxVal={255} minVal={0} step={1} />
          <SliderComponent setValue={setBinaryThresholdMax} value={binaryThresholdMax} title="Binary Threshold Max" maxVal={255} minVal={0} step={1} />
          <SliderComponent setValue={setKdTreeBoundingThreshold} value={kdTreeBoundingThreshold} title="KDTree Bounding Threshold" maxVal={10} minVal={0} step={1} />
          <SliderComponent setValue={setGridSize} value={gridSize} title="LTSpice Grid Size" maxVal={512} minVal={8} step={8} />
          <SliderComponent setValue={setTextSearchSize} value={textSearchSize} title="Text Search Tries per Component" maxVal={10} minVal={1} step={1} />
          <SliderComponent setValue={setTextSearchRadius} value={textSearchRadius} title="Text Search Radius" maxVal={1000} minVal={50} step={10} />
        </div>
      </form>

      {processOutput && Object.keys(processOutput).length > 0 && (
        <div className="output-section">

            {processOutput["error"] && (
            <div>Something went wrong, please try again</div>
          )}

          {processOutput["ltspice"] && (
            <div>
              <h3>LTSpice Schematic (.asc)</h3>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(processOutput["ltspice"])}`}
                download="circuit.asc"
              >
                <button>Download LTSpice File</button>
              </a>
            </div>
          )}

          {processOutput["mlplot"] && (
            <div>
              <h3>ML Plot</h3>
              <img
                className="output-images"
                src={`data:image/png;base64,${processOutput["mlplot"]}`}
                alt="ML Plot"
              />
            </div>
          )}

          {processOutput["graph"] && (
            <div>
              <h3>Graph Output</h3>
              <img
                className="output-images"
                src={`data:image/png;base64,${processOutput["graph"]}`}
                alt="Graph Output"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InputComponent;