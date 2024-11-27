import React, { useEffect, useState } from "react";
import axios from "axios";

const FileList = ({ projectId, token, selectedFileName, setSelectedFileName }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFileNames = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(
          `http://localhost:8000/api/projects/${projectId}/files`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFiles(response.data);
      } catch {
        setError("Failed to fetch file names.");
      } finally {
        setLoading(false);
      }
    };

    fetchFileNames();
  }, [projectId, token]);

  return (
    <div style={{ width: "30%", borderRight: "1px solid #ccc", padding: "10px" }}>
      <h3>Files</h3>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {files.map((file) => (
          <li
            key={file.file_name}
            onClick={() => setSelectedFileName(file.file_name)}
            style={{
              cursor: "pointer",
              padding: "8px",
              border: selectedFileName === file.file_name ? "2px solid #007bff" : "1px solid #ccc",
              borderRadius: "5px",
              backgroundColor: selectedFileName === file.file_name ? "#f0f8ff" : "#f9f9f9",
              marginBottom: "5px",
            }}
          >
            {file.file_name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileList;