import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import ProjectList from './components/ProjectList';
import CreateProject from './components/CreateProject';
import UploadFile from './components/UploadGDOTFile';
import VersionHistory from './components/VersionHistory';
import ProjectDetails from './components/ProjectDetails';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';

const App = () => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) setToken(storedToken);
  }, []);

  const handleLogin = (token) => {
    setToken(token);
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  if (!token) {
    return (
      <Router>
        <Routes>
          <Route path="/login" element={<Login setToken={handleLogin} />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar handleLogout={handleLogout} />
        <div style={{ flexGrow: 1 }}>
          <Header />
          <main style={{ padding: '20px' }}>
            <Routes>
              <Route path="/" element={<ProjectList token={token} />} />
              <Route path="/create-project" element={<CreateProject token={token} />} />
              <Route path="/upload-file" element={<UploadFile token={token} />} />
              <Route path="/version-history" element={<VersionHistory token={token} />} />
              <Route path="/projects/:projectId" element={<ProjectDetails token={token} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </div>
    </Router>
  );
};

export default App;