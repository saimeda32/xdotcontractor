import React, { useState } from 'react';
import { TextField, Button, Typography, Paper, Container } from '@mui/material';
import axios from 'axios';

const Login = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8000/login', { username, password });
      setToken(response.data.access_token);
      localStorage.setItem('token', response.data.access_token);
    } catch (error) {
      alert('Invalid credentials. Please try again.');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} style={{ padding: '20px', marginTop: '100px' }}>
        <Typography variant="h5" align="center" gutterBottom>Log In</Typography>
        <form onSubmit={handleLogin}>
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
          <Button type="submit" fullWidth variant="contained" color="primary">Log In</Button>
        </form>
        <Typography variant="body2" align="center" style={{ marginTop: '10px' }}>
          Don't have an account? <a href="/signup">Sign up</a>
        </Typography>
      </Paper>
    </Container>
  );
};

export default Login;