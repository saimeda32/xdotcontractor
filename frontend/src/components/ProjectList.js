import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField,
  Box,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axios from 'axios';

const ProjectList = ({ token }) => {
  const [projects, setProjects] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/projects', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProjects(response.data);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, [token]);

  const filteredProjects = projects.filter((project) =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={3}
      >
        <Typography variant="h4" color="primary">
          Projects
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          component={Link}
          to="/create-project"
        >
          Create Project
        </Button>
      </Box>

      {/* Search Bar */}
      <Box marginBottom={3}>
        <TextField
          label="Search Projects"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Box>

      {/* Project Cards */}
      <Grid container spacing={3}>
        {filteredProjects.map((project) => (
          <Grid item xs={12} sm={6} md={4} key={project.id}>
            <Card elevation={3}>
              <CardContent>
                <Typography variant="h6" color="textPrimary" gutterBottom>
                  {project.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {project.description}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  component={Link}
                  to={`/projects/${project.id}`}
                >
                  View Details
                </Button>
                <Button
                  size="small"
                  color="secondary"
                  onClick={() => alert('Edit functionality coming soon!')}
                >
                  Edit
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ProjectList;