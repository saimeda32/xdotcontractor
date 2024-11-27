import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

const Header = () => (
  <AppBar position="static" style={{ marginBottom: '20px' }}>
    <Toolbar>
      <Typography variant="h6" style={{ flexGrow: 1 }}>
        xdotcontractor Enterprise Dashboard
      </Typography>
    </Toolbar>
  </AppBar>
);

export default Header;