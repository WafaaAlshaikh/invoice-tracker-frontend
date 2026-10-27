import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, TextField, IconButton, TablePagination, Chip, Card, CardContent,
  Grid, MenuItem, Select, FormControl, InputLabel, Alert, Snackbar,
  Switch, FormControlLabel, Checkbox, ListItemText
} from "@mui/material";
import { Edit, Delete, Visibility, Add, Lock, LockOpen } from "@mui/icons-material";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const UsersPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const [form, setForm] = useState({
    userId: '',
    username: '',
    email: '',
    password: '',
    roles: ['USER']
  });

  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    roles: [],
    isActive: true
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [tempRoles, setTempRoles] = useState([]);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage]);

  const fetchUsers = async () => {
    try {
      const params = { 
        page, 
        size: rowsPerPage,
        sortBy: 'username', 
        direction: 'ASC' ,
        isActive: true
      };
      
      const res = await api.get('/users', { params });
      setUsers(res.data.content || []);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      console.error('Error fetching users:', err);
      showSnackbar('Failed to fetch users', 'error');
    }
  };

  // دالة تحديد أعلى رول للأولوية في العرض
  const getHighestRoleForDisplay = (roles) => {
    if (!roles || roles.length === 0) return 'USER';
    
    if (roles.includes('SUPERUSER')) return 'SUPERUSER';
    if (roles.includes('USER')) return 'USER';
    if (roles.includes('AUDITOR')) return 'AUDITOR';
    
    
    return roles[0];
  };

  const handleCreateUser = async () => {
    try {
      await api.post('/users', form);
      showSnackbar('User created successfully', 'success');
      setOpen(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      console.error('Error creating user:', err);
      showSnackbar(err.response?.data?.error || 'Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async () => {
  try {
    // تأكد من إرسال البيانات المطلوبة فقط
    const updateData = {
      username: editForm.username,
      email: editForm.email,
      isActive: editForm.isActive
      // لا ترسل roles هنا لأن هناك endpoint منفصل لها
    };

    console.log('Sending update data:', updateData);
    
    const response = await api.put(`/users/${selectedUser.username}`, updateData);
    
    showSnackbar('User updated successfully', 'success');
    setEditOpen(false);
    fetchUsers();
  } catch (err) {
    console.error('Error updating user:', err);
    showSnackbar(err.response?.data?.error || 'Failed to update user', 'error');
  }
};

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user: ${username}?`)) {
      try {
        await api.delete(`/users/${username}`);
        showSnackbar('User deleted successfully', 'success');
        fetchUsers();
      } catch (err) {
        console.error('Error deleting user:', err);
        showSnackbar('Failed to delete user', 'error');
      }
    }
  };

  const handleUpdateRoles = async (username, roles) => {
    try {
      await api.put(`/users/${username}/roles`, roles);
      showSnackbar('User roles updated successfully', 'success');
      setRolesModalOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating roles:', err);
      showSnackbar('Failed to update roles', 'error');
    }
  };

  const handleUpdateStatus = async (username, active) => {
    try {
      await api.put(`/users/${username}/status?active=${active}`);
      showSnackbar(`User ${active ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers();
    } catch (err) {
      console.error('Error updating status:', err);
      showSnackbar('Failed to update status', 'error');
    }
  };

  const resetForm = () => {
    setForm({
      userId: '',
      username: '',
      email: '',
      password: '',
      roles: ['USER']
    });
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditForm({
      username: user.username,
      email: user.email,
      roles: user.roles || [],
      isActive: user.isActive
    });
    setEditOpen(true);
  };

  const handleView = (user) => {
    setSelectedUser(user);
    setViewOpen(true);
  };

  const handleEditRoles = (user) => {
    setSelectedUser(user);
    setTempRoles(user.roles || []);
    setRolesModalOpen(true);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPERUSER': return 'error';
      case 'AUDITOR': return 'warning';
      case 'USER': return 'primary';
      default: return 'default';
    }
  };

  const allRoles = ['USER', 'AUDITOR', 'SUPERUSER'];

  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.userId.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Users Management</Typography>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
        <TextField
          label="Search Users"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 300 }}
        />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
            New User
          </Button>
        </Box>
      </Box>

      {/* Users Table */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User ID</TableCell>
            <TableCell>Username</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Primary Role</TableCell>
            {/* <TableCell>Additional Roles</TableCell> */}
            {/* <TableCell>Status</TableCell> */}
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} align="center">
                <Typography color="textSecondary" sx={{ py: 2 }}>
                  No users found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((user) => {
              const primaryRole = getHighestRoleForDisplay(user.roles);
              const additionalRoles = user.roles?.filter(role => role !== primaryRole) || [];
              
              return (
                <TableRow key={user.userId} hover>
                  <TableCell>{user.userId}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={primaryRole} 
                      color={getRoleColor(primaryRole)}
                      size="small"
                    />
                  </TableCell>
                  {/* <TableCell>
                    {additionalRoles.length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {additionalRoles.map((role, index) => (
                          <Chip 
                            key={index}
                            label={role} 
                            variant="outlined"
                            size="small"
                          />
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        None
                      </Typography>
                    )}
                  </TableCell> */}
                  {/* <TableCell>
                    <Chip 
                      label={user.isActive ? 'Active' : 'Inactive'} 
                      color={user.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell> */}
                  <TableCell>
                    <IconButton 
                      color="primary" 
                      size="small" 
                      title="View Details"
                      onClick={() => handleView(user)}
                    >
                      <Visibility />
                    </IconButton>
                    
                    <IconButton 
                      color="secondary" 
                      size="small" 
                      title="Edit User"
                      onClick={() => handleEdit(user)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton 
                      color="info" 
                      size="small" 
                      title="Edit Roles"
                      onClick={() => handleEditRoles(user)}
                    >
                      <Lock />
                    </IconButton>

                    {/* <IconButton 
                      color={user.isActive ? "warning" : "success"}
                      size="small" 
                      title={user.isActive ? "Deactivate" : "Activate"}
                      onClick={() => handleUpdateStatus(user.username, !user.isActive)}
                    >
                      {user.isActive ? <Lock /> : <LockOpen />}
                    </IconButton> */}

                    <IconButton 
                      color="error" 
                      size="small" 
                      onClick={() => handleDeleteUser(user.username)} 
                      title="Delete"
                    >
                      <Delete />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={filteredUsers.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />

      {/* Create User Modal */}
      <Modal open={open} onClose={() => setOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>Create New User</Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                label="User ID"
                fullWidth
                margin="normal"
                value={form.userId}
                onChange={(e) => setForm({...form, userId: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Username"
                fullWidth
                margin="normal"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Email"
                type="email"
                fullWidth
                margin="normal"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Password"
                type="password"
                fullWidth
                margin="normal"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Roles</InputLabel>
                <Select
                  multiple
                  value={form.roles}
                  label="Roles"
                  onChange={(e) => setForm({...form, roles: e.target.value})}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {allRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={form.roles.indexOf(role) > -1} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
            <Button 
              variant="outlined" 
              fullWidth 
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleCreateUser}
              disabled={!form.userId || !form.username || !form.email || !form.password}
            >
              Create User
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Edit User Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Edit User - {selectedUser?.username}
          </Typography>

          {selectedUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Username"
                    fullWidth
                    margin="normal"
                    value={editForm.username}
                    onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={editForm.isActive}
                        onChange={(e) => setEditForm({...editForm, isActive: e.target.checked})}
                      />
                    }
                    label="Active User"
                  />
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={handleUpdateUser}
                >
                  Update User
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Edit Roles Modal */}
      <Modal open={rolesModalOpen} onClose={() => setRolesModalOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 400,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Edit Roles - {selectedUser?.username}
          </Typography>

          {selectedUser && (
            <Box>
              <FormControl fullWidth margin="normal">
                <InputLabel>Select Roles</InputLabel>
                <Select
                  multiple
                  value={tempRoles}
                  onChange={(e) => setTempRoles(e.target.value)}
                  renderValue={(selected) => selected.join(', ')}
                >
                  {allRoles.map((role) => (
                    <MenuItem key={role} value={role}>
                      <Checkbox checked={tempRoles.indexOf(role) > -1} />
                      <ListItemText primary={role} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                Current primary role: <strong>{getHighestRoleForDisplay(selectedUser.roles)}</strong>
              </Typography>

              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setRolesModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => handleUpdateRoles(selectedUser.username, tempRoles)}
                >
                  Update Roles
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* View User Modal */}
      <Modal open={viewOpen} onClose={() => setViewOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 500,
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            User Details - {selectedUser?.username}
          </Typography>

          {selectedUser && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">User ID</Typography>
                      <Typography variant="body1">{selectedUser.userId}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Username</Typography>
                      <Typography variant="body1">{selectedUser.username}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Email</Typography>
                      <Typography variant="body1">{selectedUser.email}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {/* <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Status</Typography>
                      <Chip 
                        label={selectedUser.isActive ? 'Active' : 'Inactive'} 
                        color={selectedUser.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid> */}
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">Primary Role</Typography>
                      <Chip 
                        label={getHighestRoleForDisplay(selectedUser.roles)} 
                        color={getRoleColor(getHighestRoleForDisplay(selectedUser.roles))}
                        size="small"
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle2" color="textSecondary">All Roles</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                        {selectedUser.roles?.map((role, index) => (
                          <Chip 
                            key={index}
                            label={role} 
                            color={getRoleColor(role)}
                            size="small"
                          />
                        ))}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  onClick={() => setViewOpen(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  onClick={() => {
                    setViewOpen(false);
                    handleEditRoles(selectedUser);
                  }}
                >
                  Edit Roles
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Snackbar */}
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

export default UsersPage;