import React, { useState, useContext } from "react";
import {
  Box, Typography, TextField, Button, Card, CardContent,
  Grid, Alert, Snackbar, Chip, Divider
} from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import api from "../api/api";

const ProfilePage = () => {
  const { user } = useContext(AuthContext);
  const [form, setForm] = useState({
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleUpdateProfile = async () => {
    try {
      await api.put(`/users/${user.username}`, {
        username: form.username,
        email: form.email
      });
      showSnackbar('Profile updated successfully', 'success');
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to update profile', 'error');
    }
  };

  const handleChangePassword = async () => {
    if (form.newPassword !== form.confirmPassword) {
      showSnackbar('New passwords do not match', 'error');
      return;
    }

    if (form.newPassword.length < 8) {
      showSnackbar('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      await api.put(`/users/${user.username}/password`, {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword
      });
      showSnackbar('Password changed successfully', 'success');
      setForm({ ...form, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      showSnackbar(err.response?.data?.error || 'Failed to change password', 'error');
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>My Profile</Typography>
      
      <Grid container spacing={3}>
        {}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Account Information</Typography>
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    backgroundColor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2rem',
                    fontWeight: 'bold',
                    mx: 'auto',
                    mb: 2
                  }}
                >
                  {user?.username?.charAt(0)?.toUpperCase()}
                </Box>
                <Typography variant="h6">{user?.username}</Typography>
                <Typography variant="body2" color="textSecondary">{user?.email}</Typography>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                  {user?.roles?.map((role, index) => (
                    <Chip 
                      key={index}
                      label={role} 
                      size="small"
                      color={
                        role === 'SUPERUSER' ? 'error' :
                        role === 'AUDITOR' ? 'warning' : 'primary'
                      }
                    />
                  ))}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Edit Profile</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    fullWidth
                    value={form.username}
                    onChange={(e) => setForm({...form, username: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    value={form.email}
                    onChange={(e) => setForm({...form, email: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    onClick={handleUpdateProfile}
                    disabled={!form.username || !form.email}
                  >
                    Update Profile
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Divider sx={{ my: 3 }} />

          {}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Change Password</Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Current Password"
                    type="password"
                    fullWidth
                    value={form.currentPassword}
                    onChange={(e) => setForm({...form, currentPassword: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    value={form.newPassword}
                    onChange={(e) => setForm({...form, newPassword: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    value={form.confirmPassword}
                    onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button 
                    variant="contained" 
                    color="warning"
                    onClick={handleChangePassword}
                    disabled={!form.currentPassword || !form.newPassword || !form.confirmPassword}
                  >
                    Change Password
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProfilePage;