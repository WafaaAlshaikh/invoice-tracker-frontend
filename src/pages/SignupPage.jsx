import React, { useState } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const SignupPage = () => {
  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignup = async () => {
  try {
    const response = await api.post("/auth/signup", { userId, username, email, password });
    setSuccess(response.data.message);
    setError("");
    setTimeout(() => navigate("/login"), 1500); 
  } catch (err) {
    setError(err.response?.data?.error || "Signup failed");
    setSuccess("");
  }
};


  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(to right, #667eea 0%, #764ba2)",
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "white",
            boxShadow: 8,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", color: "#667eea " }}>
            Create Account
          </Typography>
          <Typography variant="body1" gutterBottom color="textSecondary">
            Sign up to start
          </Typography>

          {error && (
            <Typography color="error" variant="body2" gutterBottom>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success.main" variant="body2" gutterBottom>
              {success}
            </Typography>
          )}

          <TextField
            label="User ID"
            fullWidth
            margin="normal"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
          />

          <Button
            variant="contained"
            sx={{
              mt: 2,
              background: "#667eea ",
              color: "white",
              fontWeight: "bold",
              "&:hover": { background: "#667eea " },
            }}
            fullWidth
            onClick={handleSignup}
          >
            Sign Up
          </Button>

          <Button
            variant="text"
            sx={{ mt: 1, color: "#667eea ", "&:hover": { textDecoration: "underline" } }}
            fullWidth
            onClick={() => navigate("/login")}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default SignupPage;