import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Select,
  MenuItem,
  Button,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

const VersionHistory = ({ token }) => {
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState('');
  const [fileContent, setFileContent] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVersions = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/versions', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch versions');
        }

        const data = await response.json();
        console.log('Fetched Versions:', data); // Debugging step
        setVersions(data);
      } catch (err) {
        console.error('Error fetching versions:', err);
        setError('Failed to fetch versions. Please try again.');
      }
    };

    fetchVersions();
  }, [token]);

  const handleVersionSelect = async (versionId) => {
    setSelectedVersion(versionId);
    try {
      const response = await fetch(
        `http://localhost:8000/api/version-content/${versionId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }

      const { content } = await response.json();
      console.log('Fetched File Content:', content); // Debugging step
      setFileContent(content || []);
    } catch (err) {
      console.error('Error fetching file content:', err);
      setError('Failed to fetch file content. Please try again.');
    }
  };

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredContent = fileContent.filter((row) =>
    Object.values(row).some((value) =>
      value.toString().toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const columns = [
    { field: 'ITEMCODE', headerName: 'ITEMCODE', width: 150 },
    { field: 'ITEM DESCRIPTION', headerName: 'ITEM DESCRIPTION', width: 300 },
    { field: 'QUANTITY', headerName: 'QUANTITY', type: 'number', width: 120 },
    { field: 'USE', headerName: 'USE', type: 'number', width: 100 },
    { field: 'UM', headerName: 'UM', width: 80 },
    { field: 'Rate', headerName: 'Rate', type: 'number', width: 150 },
    { field: "Category", headerName: "Category", width: 150 },
  ];

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={3}
      >
        <Typography variant="h4">Version History</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </Box>

      {/* Dropdown for version selection */}
      <Box display="flex" alignItems="center" marginBottom={2}>
        <Typography variant="h6" marginRight={2}>
          Select Version:
        </Typography>
        <Select
          value={selectedVersion}
          onChange={(e) => handleVersionSelect(e.target.value)}
          displayEmpty
          style={{ width: '300px' }}
        >
          <MenuItem value="" disabled>
            Select a version
          </MenuItem>
          {versions.length > 0 ? (
            versions.map((version) => (
              <MenuItem key={version.id} value={version.id}>
                {version.name} - {new Date(version.date).toLocaleString()}
              </MenuItem>
            ))
          ) : (
            <MenuItem value="" disabled>
              No versions available
            </MenuItem>
          )}
        </Select>
      </Box>

      {/* Error message */}
      {error && (
        <Typography color="error" variant="body1" align="center" gutterBottom>
          {error}
        </Typography>
      )}

      {/* Search Box */}
      {selectedVersion && (
        <Box display="flex" justifyContent="space-between" marginBottom={2}>
          <TextField
            label="Search"
            variant="outlined"
            fullWidth
            value={searchQuery}
            onChange={handleSearch}
          />
        </Box>
      )}

      {/* Data Grid for file content */}
      {selectedVersion && fileContent.length > 0 ? (
        <DataGrid
          rows={filteredContent.map((row, index) => ({ id: index, ...row }))}
          columns={columns}
          autoHeight
          pageSize={10}
          rowsPerPageOptions={[10, 20, 50]}
          disableSelectionOnClick
          components={{
            NoRowsOverlay: () => (
              <Typography variant="body1" align="center" style={{ padding: '20px' }}>
                No matching records found.
              </Typography>
            ),
          }}
        />
      ) : (
        selectedVersion && (
          <Typography variant="body1" align="center">
            No content available for this version.
          </Typography>
        )
      )}
    </Container>
  );
};

export default VersionHistory;