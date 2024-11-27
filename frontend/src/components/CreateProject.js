import React, { useState } from "react";
import { TextField, Button, Container, Typography, Paper } from "@mui/material";
import axios from "axios";

const CreateProject = ({ token }) => {
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(
      "http://localhost:8000/api/projects",
      { name: projectName, description: projectDescription },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    alert("Project created successfully!");
    setProjectName("");
    setProjectDescription("");
  };

  return (
    <Container maxWidth="sm">
      <Paper style={{ padding: "20px", marginTop: "30px" }}>
        <Typography variant="h5">Create a New Project</Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Project Name"
            fullWidth
            margin="normal"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <TextField
            label="Project Description"
            fullWidth
            margin="normal"
            multiline
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Create Project
          </Button>
        </form>
      </Paper>
    </Container>
  );
};

export default CreateProject;