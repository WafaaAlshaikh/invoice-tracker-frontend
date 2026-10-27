import React, { useState, useContext } from "react";
import { TextField, Button, Typography, Container, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { username, password });
      login(response.data.token, response.data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        position: "relative",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, transparent 50%)",
        }
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1), 0 15px 15px rgba(0, 0, 0, 0.05)",
            backdropFilter: "blur(10px)",
            textAlign: "center",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            transform: "translateY(0)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "translateY(-5px)",
              boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15), 0 20px 20px rgba(0, 0, 0, 0.1)",
            }
          }}
        >
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h4" 
              gutterBottom 
              sx={{ 
                fontWeight: "800",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                color: "transparent",
                fontSize: { xs: "1.75rem", sm: "2.125rem" }
              }}
            >
              Welcome Back
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ fontSize: "1rem", opacity: 0.8 }}
            >
              Sign in to continue your journey
            </Typography>
          </Box>

          {error && (
            <Box
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "error.light",
                border: "1px solid",
                borderColor: "error.main",
              }}
            >
              <Typography color="error.main" variant="body2" sx={{ fontWeight: 500 }}>
                {error}
              </Typography>
            </Box>
          )}

          <TextField
            label="Username"
            fullWidth
            margin="normal"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#667eea",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#667eea",
              }
            }}
          />
          <TextField
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&:hover fieldset": {
                  borderColor: "#667eea",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#667eea",
                  borderWidth: 2,
                },
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#667eea",
              }
            }}
          />

          <Button
            variant="contained"
            sx={{
              mt: 3,
              mb: 2,
              py: 1.5,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "700",
              fontSize: "1rem",
              borderRadius: 2,
              boxShadow: "0 4px 15px 0 rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)",
                boxShadow: "0 6px 20px 0 rgba(102, 126, 234, 0.6)",
                transform: "translateY(-1px)",
              },
              "&:disabled": {
                background: "grey.300",
                boxShadow: "none",
                transform: "none",
              },
              transition: "all 0.3s ease",
            }}
            fullWidth
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? "Signing In..." : "Sign In"}
          </Button>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary" sx={{ display: "inline" }}>
              New here?{" "}
            </Typography>
            <Button
              variant="text"
              sx={{
                color: "#667eea",
                fontWeight: "600",
                textTransform: "none",
                fontSize: "0.875rem",
                p: 0,
                minWidth: "auto",
                "&:hover": {
                  background: "transparent",
                  color: "#764ba2",
                  textDecoration: "underline",
                },
              }}
              onClick={() => navigate("/signup")}
            >
              Create an account
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default LoginPage;