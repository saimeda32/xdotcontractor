import React, { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import FileList from "./FileList";
import FileViewer from "./FileViewer";
import ProposalUpload from "./ProposalUpload";
import DownloadOptions from "./DownloadOptions";

const ProjectDetails = ({ token }) => {
  const { projectId } = useParams();
  const [selectedFileName, setSelectedFileName] = useState(null);
  const [fileContents, setFileContents] = useState([]);
  const [editedFileContents, setEditedFileContents] = useState([]);
  const [totalCost, setTotalCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Function to calculate total cost
  const calculateTotalCost = (contents) => {
    const total = contents.reduce(
      (acc, entry) => acc + (parseFloat(entry.price) || 0),
      0
    );
    setTotalCost(total);
  };

  // Function to fetch file contents from the backend
  const handleFileSelect = async (fileName) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `http://localhost:8000/api/files/contents/${fileName}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("File Data Fetched:", response.data); // Debugging
      setSelectedFileName(fileName);
      setFileContents(response.data); // Update file contents
      setEditedFileContents(response.data); // Initialize editable contents
      calculateTotalCost(response.data); // Calculate total cost
    } catch (err) {
      console.error("Error fetching file content:", err);
      setError("Failed to fetch file content. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{ display: "flex" }}>
        {/* File List Component */}
        <FileList
          projectId={projectId}
          token={token}
          selectedFileName={selectedFileName}
          setSelectedFileName={(fileName) => {
            setSelectedFileName(fileName);
            handleFileSelect(fileName); // Fetch file contents when a file is selected
          }}
        />

        {/* File Viewer Component */}
        <FileViewer
          selectedFileName={selectedFileName}
          fileContents={fileContents}
          setFileContents={setFileContents}
          editedFileContents={editedFileContents}
          setEditedFileContents={setEditedFileContents}
          totalCost={totalCost}
          setTotalCost={setTotalCost}
          token={token}
        />
      </div>

      {/* Proposal Upload Component */}
      <ProposalUpload projectId={projectId} token={token} />

      {/* Download Options Component */}
      <DownloadOptions
        selectedFileName={selectedFileName}
        editedFileContents={editedFileContents}
        totalCost={totalCost}
      />

      {/* Error Handling */}
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default ProjectDetails;


// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import { jsPDF } from "jspdf";
// import "jspdf-autotable";

// const ProjectDetails = ({ token }) => {
//   const { projectId } = useParams(); // Gets project ID from URL params
//   const [files, setFiles] = useState([]); // List of file names
//   const [selectedFileName, setSelectedFileName] = useState(null); // Currently selected file name
//   const [fileContents, setFileContents] = useState([]); // Contents of the selected file
//   const [editedFileContents, setEditedFileContents] = useState([]); // To track changes
//   const [loading, setLoading] = useState(false); // Loading state
//   const [error, setError] = useState(null); // Error state
//   const [totalCost, setTotalCost] = useState(0); // Total cost of the project
//   const [selectedProposalFile, setSelectedProposalFile] = useState(null); // Proposal file state
//   const [uploadMessage, setUploadMessage] = useState(""); // Proposal upload status

//   // Fetch file names for the selected project
//   useEffect(() => {
//     const fetchFileNames = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         const response = await axios.get(
//           `http://localhost:8000/api/projects/${projectId}/files`,
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );
//         setFiles(response.data); // Assuming API returns a list of file names
//       } catch (err) {
//         setError("Failed to fetch file names. Please try again.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchFileNames();
//   }, [projectId, token]);

//   // Fetch the contents of the selected file
//   const handleFileSelect = async (fileName) => {
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.get(
//         `http://localhost:8000/api/files/contents/${fileName}`,
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setSelectedFileName(fileName);
//       setFileContents(response.data); // Assuming API returns an array of file content
//       setEditedFileContents(response.data); // Initialize edited content
//       calculateTotalCost(response.data); // Calculate total cost
//     } catch (err) {
//       setError("Failed to fetch file contents. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Populate the Rate column in the Proposal File
//   const handlePopulate = async () => {
//     if (!selectedFileName) {
//       setError("Please select a file to populate.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       const response = await axios.post(
//         `http://localhost:8000/api/files/populate/${selectedFileName}`,
//         {},
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setFileContents(response.data); // Updated Proposal File content
//       setEditedFileContents(response.data); // Update edited content
//       calculateTotalCost(response.data); // Recalculate total cost
//     } catch (err) {
//       setError("Failed to populate the file. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Update edited content
//   const handleEdit = (index, newValue) => {
//     const updatedContents = [...editedFileContents];
//     updatedContents[index].price = parseFloat(newValue) || 0; // Update the price field
//     setEditedFileContents(updatedContents);
//     calculateTotalCost(updatedContents); // Recalculate total cost
//   };

//   // Save changes to the backend
//   const handleSaveChanges = async () => {
//     if (!selectedFileName) {
//       setError("Please select a file to save changes.");
//       return;
//     }
//     setLoading(true);
//     setError(null);
//     try {
//       await axios.put(
//         `http://localhost:8000/api/files/update-line-items`,
//         { file_name: selectedFileName, updated_entries: editedFileContents },
//         {
//           headers: { Authorization: `Bearer ${token}` },
//         }
//       );
//       setFileContents(editedFileContents); // Save edits as the current state
//     } catch (err) {
//       setError("Failed to save changes. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Calculate total cost
//   const calculateTotalCost = (contents) => {
//     const total = contents.reduce(
//       (acc, entry) => acc + (parseFloat(entry.price) || 0),
//       0
//     );
//     setTotalCost(total);
//   };

//   // Handle Proposal File Upload
//   const handleProposalFileUpload = async () => {
//     if (!selectedProposalFile) {
//       setUploadMessage("Please select a proposal file to upload.");
//       return;
//     }

//     const formData = new FormData();
//     formData.append("file", selectedProposalFile);

//     try {
//       await axios.post(
//         `http://localhost:8000/api/projects/${projectId}/upload-proposal`,
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setUploadMessage("Proposal file uploaded successfully!");
//       setSelectedProposalFile(null); // Reset file input
//     } catch (err) {
//       setUploadMessage("Failed to upload proposal file. Please try again.");
//     }
//   };

//   // Download CSV
//   const handleDownloadCSV = () => {
//     if (!selectedFileName || !editedFileContents.length) {
//       setError("No file selected or no content to download.");
//       return;
//     }

//     const csvRows = [
//       ["Line", "Item", "Quantity", "Unit", "Description", "Price"], // Header
//       ...editedFileContents.map((entry) => [
//         entry.line,
//         entry.item,
//         entry.quantity,
//         entry.unit,
//         entry.description,
//         entry.price,
//       ]),
//       ["", "", "", "", "Total Cost", totalCost.toFixed(2)], // Total row
//     ];

//     const csvContent = csvRows.map((row) => row.join(",")).join("\n");

//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.setAttribute("href", url);
//     a.setAttribute("download", `${selectedFileName}.csv`);
//     a.click();
//     window.URL.revokeObjectURL(url);
//   };

//   // Download PDF
//   const handleDownloadPDF = () => {
//     if (!selectedFileName || !editedFileContents.length) {
//       setError("No file selected or no content to download.");
//       return;
//     }

//     const doc = new jsPDF();
//     doc.text(`${selectedFileName} - Proposal`, 20, 10);
//     doc.autoTable({
//       head: [["Line", "Item", "Quantity", "Unit", "Description", "Price"]],
//       body: editedFileContents.map((entry) => [
//         entry.line,
//         entry.item,
//         entry.quantity,
//         entry.unit,
//         entry.description,
//         entry.price.toFixed(2),
//       ]),
//     });

//     doc.text(`Total Cost: $${totalCost.toFixed(2)}`, 20, doc.lastAutoTable.finalY + 10);
//     doc.save(`${selectedFileName}.pdf`);
//   };

//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
//       <div style={{ display: "flex" }}>
//         {/* Sidebar for file names */}
//         <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}>
//           <h3>Files</h3>
//           {loading && <p>Loading...</p>}
//           {error && <p style={{ color: "red" }}>{error}</p>}
//           <ul style={{ listStyle: "none", padding: 0 }}>
//             {files.map((file) => (
//               <li
//                 key={file.file_name}
//                 onClick={() => handleFileSelect(file.file_name)}
//                 style={{
//                   cursor: "pointer",
//                   padding: "8px",
//                   border: selectedFileName === file.file_name ? "2px solid #007bff" : "1px solid #ccc",
//                   borderRadius: "5px",
//                   backgroundColor: selectedFileName === file.file_name ? "#f0f8ff" : "#f9f9f9",
//                   marginBottom: "5px",
//                 }}
//               >
//                 {file.file_name}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {/* Content area for selected file */}
//         <div style={{ width: "70%", padding: "10px" }}>
//           <h3>File Content</h3>
//           {selectedFileName && <p>File: {selectedFileName}</p>}
//           <button
//             onClick={handlePopulate}
//             style={{
//               padding: "10px 20px",
//               backgroundColor: "#007bff",
//               color: "#fff",
//               border: "              none",
//               borderRadius: "5px",
//               cursor: "pointer",
//               marginBottom: "10px",
//             }}
//           >
//             Populate
//           </button>
//           {loading ? (
//             <p>Loading...</p>
//           ) : fileContents.length > 0 ? (
//             <table
//               style={{
//                 width: "100%",
//                 borderCollapse: "collapse",
//                 marginTop: "10px",
//               }}
//             >
//               <thead>
//                 <tr>
//                   <th style={{ border: "1px solid #ccc", padding: "8px" }}>Line</th>
//                   <th style={{ border: "1px solid #ccc", padding: "8px" }}>Item</th>
//                   <th style={{ border: "1px solid #ccc", padding: "8px" }}>Quantity</th>
//                   <th style={{ border: "1px solid #ccc", padding: "8px" }}>Unit</th>
//                   <th style={{ border: "1px solid #ccc", padding: "8px" }}>Description</th>
//                   <th style={{ border: "1px solid #ccc", padding: "8px" }}>Price</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {editedFileContents.map((entry, index) => (
//                   <tr key={index}>
//                     <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.line}</td>
//                     <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.item}</td>
//                     <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.quantity}</td>
//                     <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.unit}</td>
//                     <td style={{ border: "1px solid #ccc", padding: "8px" }}>{entry.description}</td>
//                     <td style={{ border: "1px solid #ccc", padding: "8px" }}>
//                       <input
//                         type="number"
//                         value={entry.price}
//                         onChange={(e) => handleEdit(index, e.target.value)}
//                         style={{
//                           width: "100%",
//                           padding: "5px",
//                           border: "1px solid #ccc",
//                           borderRadius: "5px",
//                         }}
//                       />
//                     </td>
//                   </tr>
//                 ))}
//                 {/* Add Total Cost Row */}
//                 <tr>
//                   <td
//                     colSpan="6"
//                     style={{
//                       border: "1px solid #ccc",
//                       padding: "8px",
//                       fontWeight: "bold",
//                       textAlign: "right",
//                     }}
//                   >
//                     Total Cost
//                   </td>
//                   <td
//                     style={{
//                       border: "1px solid #ccc",
//                       padding: "8px",
//                       fontWeight: "bold",
//                     }}
//                   >
//                     ${totalCost.toFixed(2)}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           ) : (
//             <p>Select a file to view its content</p>
//           )}
//         </div>
//       </div>

//       {/* Upload Proposal File Section */}
//       <div style={{ textAlign: "center", marginTop: "20px" }}>
//         <h3>Upload Proposal File</h3>
//         <input
//           type="file"
//           accept=".csv, .xlsx"
//           onChange={(e) => setSelectedProposalFile(e.target.files[0])}
//           style={{ marginBottom: "10px" }}
//         />
//         <button
//           onClick={handleProposalFileUpload}
//           style={{
//             padding: "10px 20px",
//             backgroundColor: "#007bff",
//             color: "#fff",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//           }}
//         >
//           Upload Proposal File
//         </button>
//         {uploadMessage && (
//           <p
//             style={{
//               color: uploadMessage.includes("successfully") ? "green" : "red",
//               marginTop: "10px",
//             }}
//           >
//             {uploadMessage}
//           </p>
//         )}
//       </div>

//       {/* Download options */}
//       <div style={{ textAlign: "center", marginTop: "20px" }}>
//         <button
//           onClick={handleDownloadCSV}
//           style={{
//             padding: "10px 20px",
//             backgroundColor: "#007bff",
//             color: "#fff",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//             marginRight: "10px",
//           }}
//         >
//           Download CSV
//         </button>
//         <button
//           onClick={handleDownloadPDF}
//           style={{
//             padding: "10px 20px",
//             backgroundColor: "#007bff",
//             color: "#fff",
//             border: "none",
//             borderRadius: "5px",
//             cursor: "pointer",
//           }}
//         >
//           Download PDF
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ProjectDetails;