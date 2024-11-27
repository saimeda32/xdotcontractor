import React, { useState } from "react";
import axios from "axios";

const ProposalUpload = ({ projectId, token }) => {
  const [selectedProposalFile, setSelectedProposalFile] = useState(null);
  const [uploadMessage, setUploadMessage] = useState("");

  const handleProposalFileUpload = async () => {
    if (!selectedProposalFile) {
      setUploadMessage("Please select a proposal file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedProposalFile);

    try {
      await axios.post(
        `http://localhost:8000/api/projects/${projectId}/upload-proposal`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setUploadMessage("Proposal file uploaded successfully!");
      setSelectedProposalFile(null);
    } catch (err) {
      setUploadMessage("Failed to upload proposal file. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "20px" }}>
      <h3>Upload Proposal File</h3>
      <input
        type="file"
        accept=".csv, .xlsx"
        onChange={(e) => setSelectedProposalFile(e.target.files[0])}
        style={{ marginBottom: "10px" }}
      />
      <button
        onClick={handleProposalFileUpload}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Upload Proposal File
      </button>
      {uploadMessage && (
        <p
          style={{
            color: uploadMessage.includes("successfully") ? "green" : "red",
            marginTop: "10px",
          }}
        >
          {uploadMessage}
        </p>
      )}
    </div>
  );
};

export default ProposalUpload;
