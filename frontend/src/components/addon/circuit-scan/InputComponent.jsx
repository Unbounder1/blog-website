import { useState } from "react";
import { ReactSketchCanvas } from "react-sketch-canvas";
import "../../../styles/full-site/circuitscan.css";
import ToggleSwitch from "../../ToggleSwitch";

const InputComponent = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processOutput, setProcessOutput] = useState({});
  const [processInput, setProcessInput] = useState("");
  const [isUpload, setIsUpload] = useState(true);

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

    const fetchData = async () => {
      try {
        const base64String = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFiles[0]);

          reader.onload = () => {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          };

          reader.onerror = (error) => reject(error);
        });

        const payload = {
          path_specs: "",
          input: base64String,
        };

        const response = await fetch("/api/addon-circuit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const output = await response.json();
        setProcessOutput(output);
      } catch (error) {
        console.error("Error querying circuit-scan addon", error);
      }
    };

    fetchData();
  };

  return (
    <div className="input-container">
        <ToggleSwitch isOn={isUpload} setIsOn={setIsUpload}/>
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
            className="canvas-style"
            strokeWidth={4}
            strokeColor="red"
          />
        </div>

        }

        <div style={{ marginBottom: "1rem" }}>
          <button type="submit" disabled={isProcessing || selectedFiles.length === 0}>
            {isProcessing ? "Processing..." : "Submit"}
          </button>
        </div>
      </form>

      {processOutput && Object.keys(processOutput).length > 0 && (
        <div className="output-section">
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
                src={`data:image/png;base64,${processOutput["mlplot"]}`}
                alt="ML Plot"
              />
            </div>
          )}

          {processOutput["graph"] && (
            <div>
              <h3>Graph Output</h3>
              <img
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