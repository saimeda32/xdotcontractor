import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Container } from '@mui/material';
import axios from 'axios';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/signup', { username, password });
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Signup failed. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '100px' }}>
        <Typography variant="h5" align="center" gutterBottom>Sign Up</Typography>
        <form onSubmit={handleSignup}>
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" fullWidth variant="contained" color="primary">Sign Up</Button>
        </form>
        {message && <Typography variant="body2" align="center" style={{ marginTop: '10px', color: 'green' }}>{message}</Typography>}
      </Paper>
    </Container>
  );
};

export default Signup;