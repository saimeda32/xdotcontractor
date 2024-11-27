import React from 'react';
import { Drawer, List, ListItem, ListItemText, Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Sidebar = ({ handleLogout }) => (
  <Drawer
    variant="permanent"
    style={{ width: '240px', flexShrink: 0 }}
    PaperProps={{ style: { width: '240px' } }}
  >
    <List>
      <ListItem button component={Link} to="/">
        <ListItemText primary="Projects" />
      </ListItem>
      <ListItem button component={Link} to="/create-project">
        <ListItemText primary="Create Project" />
      </ListItem>
      <ListItem button component={Link} to="/upload-file">
        <ListItemText primary="Upload File" />
      </ListItem>
      <ListItem button component={Link} to="/version-history">
        <ListItemText primary="Version History" />
      </ListItem>
      <ListItem>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </ListItem>
    </List>
  </Drawer>
);

export default Sidebar;