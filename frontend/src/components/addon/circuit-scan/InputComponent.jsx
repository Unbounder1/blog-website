import React, { useState } from "react";

const InputComponent = () => {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [processOutput, setProcessOutput] = useState({});

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles(files);
        setProcessOutput({});

        console.log("Selected files:", files);
    };

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent default form submission if inside a form

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
                    path_specs: "", // Fetch Format ->  http://path_ip:path_port/path_specs
                    input: base64String // Base64 Input Image
                };

                const response = await fetch("/api/addon-circuit", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                const output = await response.json();
                console.log(output);
                setProcessOutput(output);

            } catch (error) {
                console.error("Error querying circuit-scan addon", error);
            }
        };

        fetchData();
    };

    return (
    <div>
        <form method="post" encType="multipart/form-data">
            <div>
                <label htmlFor="image_uploads">Choose images to upload (PNG, JPG)</label>
                <input
                    type="file"
                    id="image_uploads"
                    name="image_uploads"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleFileChange}
                    multiple 
                />
            </div>

            <div className="preview">
                {selectedFiles.length > 0 ? (
                    <ul>
                        {selectedFiles.map((file, index) => (
                            <li key={index}>{file.name}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No files currently selected for upload</p>
                )}
            </div>

            <div>
                <button 
                type="submit"
                onClick={handleSubmit}>Submit</button>
            </div>

        </form>

        {processOutput && (
                <div style={{ marginTop: "20px" }}>
                    {processOutput["ltspice"] && (
                        <div>
                            <h3>LTSpice Schematic (.asc)</h3>
                            <a
                                href={`data:text/plain;charset=utf-8,${encodeURIComponent(processOutput["ltspice"])}`}
                                download="circuit.asc"
                                style={{ display: "inline-block", marginBottom: "20px" }}
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
                                style={{ width: "100%", maxWidth: "800px", marginBottom: "20px" }}
                            />
                        </div>
                    )}

                    {processOutput["graph"] && (
                        <div>
                            <h3>Graph Output</h3>
                            <img
                                src={`data:image/png;base64,${processOutput["graph"]}`}
                                alt="Graph Output"
                                style={{ width: "100%", maxWidth: "800px", marginBottom: "20px" }}
                            />
                        </div>
                    )}
                </div>
            )}
    </div>
    );
};

export default InputComponent;

// <script>
// document.addEventListener("DOMContentLoaded", function () {
//     const input = document.querySelector("input");
//     const preview = document.querySelector(".preview");
//     const submit = document.querySelector("button");

//     if (!input || !preview) {
//       console.error("Input or preview element not found!");
//       return;
//     }

//     // On upload files
//     input.addEventListener("change", function (event) {
//       base64_files = [];
//       console.log(event.target.files); 
//       preview.innerHTML = ""; // Clear previous preview

//       const files = Array.from(event.target.files);
//       if (files.length === 0) {
//         preview.textContent = "No files currently selected for upload";
//       } else {
//         files.forEach((file) => {
//           const reader = new FileReader();
//           reader.readAsDataURL(file); // Convert file to a data URL

//           reader.onload = function () {

//               // Display image
//               const img = document.createElement("img");
//               img.src = reader.result; // Set the image source to the data URL
//               img.style.width = "1000px"; // Adjust size
//               img.style.marginRight = "10px";
//               preview.appendChild(img);

//               // Extract base64
//               base64_files.push(reader.result.split(",")[1]);

//           };


//         });
//       }
//     });

//     submit.addEventListener("change", )

//     console.log(preview); 
//   });
// </script>