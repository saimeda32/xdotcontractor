import React from 'react';
import { AppBar, Toolbar, IconButton, Typography, Drawer, List, ListItem, ListItemText } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const DashboardLayout = ({ children, onLogout }) => {
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  return (
    <div>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(!drawerOpen)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" style={{ flexGrow: 1 }}>Dashboard</Typography>
          <button onClick={onLogout} style={{ color: 'white', background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </Toolbar>
      </AppBar>
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <List>
          <ListItem button>
            <ListItemText primary="Projects" />
          </ListItem>
          <ListItem button>
            <ListItemText primary="Upload Files" />
          </ListItem>
        </List>
      </Drawer>
      <main style={{ marginTop: '70px', padding: '20px' }}>{children}</main>
    </div>
  );
};

export default DashboardLayout;