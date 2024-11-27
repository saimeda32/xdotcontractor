import React, { useState } from 'react';
import axios from 'axios';
import { Box, Typography, Button, CircularProgress, TextField } from '@mui/material';

const UploadGDOTFile = ({ token }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
    setError('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const response = await axios.post(
        `http://localhost:8000/upload-gdot`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setMessage('GDOT Master File uploaded successfully!');
      setError('');
      setFile(null);
    } catch (err) {
      setError('Failed to upload the GDOT Master File. Please try again.');
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ padding: 3, textAlign: 'center' }}>
      <Typography variant="h4" gutterBottom>
        Upload GDOT Master File
      </Typography>
      <Box marginBottom={2}>
        <Typography variant="body1">
          Select a GDOT Master File in CSV or XLSX format to upload to the system.
        </Typography>
      </Box>
      <Box marginBottom={2}>
        <TextField
          type="file"
          inputProps={{ accept: '.csv, .xlsx' }}
          onChange={handleFileChange}
          fullWidth
          sx={{ marginBottom: 2 }}
        />
      </Box>
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={loading}
      >
        {loading ? <CircularProgress size={24} /> : 'Upload GDOT Master File'}
      </Button>
      {message && (
        <Typography variant="body1" color="success.main" sx={{ marginTop: 2 }}>
          {message}
        </Typography>
      )}
      {error && (
        <Typography variant="body1" color="error" sx={{ marginTop: 2 }}>
          {error}
        </Typography>
      )}
    </Box>
  );
};

export default UploadGDOTFile;