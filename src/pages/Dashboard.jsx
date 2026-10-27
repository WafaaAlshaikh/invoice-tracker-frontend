import React, { useState, useContext } from "react";
import { 
  Box, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, 
  AppBar, Toolbar, Typography, Avatar, IconButton, Tooltip
} from "@mui/material";
import {
  Receipt, Inventory, Category, Logout, 
  Menu as MenuIcon, ChevronLeft, // إزالة ChevronRight
  People, Person, Dashboard as DashboardIcon,
  SmartToy // ✅ إضافة هذا الاستيراد
} from "@mui/icons-material";
import ProductsPage from "./ProductsPage";
import CategoriesPage from "./CategoriesPage";
import InvoicesPage from "./InvoicesPage";
import UsersPage from "./UsersPage";
import ProfilePage from "./ProfilePage";
import DashboardOverview from "./DashboardOverview";
import AIDashboard from "./AIDashboard"; // ✅ تأكد من استيراد AIDashboard
import { AuthContext } from "../context/AuthContext";

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [selectedMenu, setSelectedMenu] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isSuperUser = user?.roles?.some(role => 
    role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
  );

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon />, roles: ["USER", "SUPERUSER", "AUDITOR"] },
    { id: "invoices", label: "Invoices", icon: <Receipt />, roles: ["USER", "SUPERUSER", "AUDITOR"] },
    { id: "ai-dashboard", label: "AI Analytics", icon: <SmartToy />, roles: ["USER", "SUPERUSER", "AUDITOR"] }, // ✅ استخدام SmartToy
    { id: "products", label: "Products", icon: <Inventory />, roles: ["SUPERUSER", "AUDITOR"] },
    { id: "categories", label: "Categories", icon: <Category />, roles: ["SUPERUSER", "AUDITOR"] },
    ...(isSuperUser ? [{ id: "users", label: "Users", icon: <People />, roles: ["SUPERUSER"] }] : []),
    { id: "profile", label: "My Profile", icon: <Person />, roles: ["USER", "SUPERUSER", "AUDITOR"] },
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.some(role => user?.roles?.includes(role))
  );

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const drawerWidth = sidebarOpen ? 240 : 70;

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const getPageTitle = () => {
    const currentItem = filteredMenuItems.find(item => item.id === selectedMenu);
    return currentItem?.label || 'Dashboard';
  };

  const renderPageContent = () => {
    switch (selectedMenu) {
      case "dashboard":
        return <DashboardOverview />;
      case "invoices":
        return <InvoicesPage />;
      case "ai-dashboard": // ✅ إضافة حالة AI Dashboard
        return <AIDashboard />;
      case "products":
        return <ProductsPage />;
      case "categories":
        return <CategoriesPage />;
      case "users":
        return isSuperUser ? <UsersPage /> : null;
      case "profile":
        return <ProfilePage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          backgroundColor: 'white',
          color: 'text.primary',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
          transition: 'all 0.3s ease',
          zIndex: (theme) => theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            onClick={toggleSidebar}
            sx={{ mr: 2, color: '#64748b' }}
          >
            {sidebarOpen ? <ChevronLeft /> : <MenuIcon />}
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: '#1e293b' }}>
            {getPageTitle()}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ color: '#64748b', display: { xs: 'none', sm: 'block' } }}>
              Welcome, {user?.username}
            </Typography>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 8px',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                backgroundColor: 
                  user?.roles?.includes('SUPERUSER') ? '#ef4444' :
                  user?.roles?.includes('AUDITOR') ? '#f59e0b' : '#3b82f6',
                color: 'white',
              }}
            >
              {user?.roles?.[0] || 'USER'}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            backgroundColor: '#1e293b',
            color: 'white',
            border: 'none',
            transition: 'all 0.3s ease',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Header */}
        <Toolbar sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          minHeight: '64px !important',
          px: sidebarOpen ? 2 : 1,
          borderBottom: '1px solid #334155'
        }}>
          {sidebarOpen && (
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white', fontSize: '1.25rem' }}>
              InvoiceApp
            </Typography>
          )}
        </Toolbar>

        {/* User Info */}
        {sidebarOpen && (
          <Box sx={{ p: 2, textAlign: 'center', borderBottom: '1px solid #334155' }}>
            <Avatar sx={{ 
              width: 60, 
              height: 60, 
              mx: 'auto', 
              mb: 1, 
              bgcolor: '#3b82f6',
              fontSize: '1.25rem',
              fontWeight: 'bold'
            }}>
              {user?.username?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'medium' }}>
              {user?.username}
            </Typography>
            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
              {user?.roles?.[0]}
            </Typography>
          </Box>
        )}

        {/* Navigation Menu */}
        <List sx={{ mt: 2, px: 1, flexGrow: 1 }}>
          {filteredMenuItems.map((item) => (
            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
              <Tooltip title={sidebarOpen ? "" : item.label} placement="right">
                <ListItemButton
                  selected={selectedMenu === item.id}
                  onClick={() => setSelectedMenu(item.id)}
                  sx={{
                    borderRadius: 2,
                    minHeight: 48,
                    justifyContent: sidebarOpen ? 'initial' : 'center',
                    px: sidebarOpen ? 2 : 1.5,
                    '&.Mui-selected': {
                      backgroundColor: '#3b82f6',
                      '&:hover': {
                        backgroundColor: '#2563eb',
                      }
                    },
                    '&:hover': {
                      backgroundColor: '#334155',
                    }
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: sidebarOpen ? 2 : 'auto',
                      justifyContent: 'center',
                      color: 'inherit'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {sidebarOpen && (
                    <ListItemText 
                      primary={item.label} 
                      primaryTypographyProps={{ 
                        sx: { 
                          fontSize: '0.9rem',
                          fontWeight: selectedMenu === item.id ? 'bold' : 'normal' 
                        } 
                      }} 
                    />
                  )}
                </ListItemButton>
              </Tooltip>
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Box sx={{ p: 1 }}>
          <Tooltip title={sidebarOpen ? "" : "Logout"} placement="right">
            <ListItemButton
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                justifyContent: sidebarOpen ? 'initial' : 'center',
                px: sidebarOpen ? 2 : 1.5,
                color: '#ef4444',
                '&:hover': {
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                }
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 0,
                  mr: sidebarOpen ? 2 : 'auto',
                  justifyContent: 'center',
                  color: 'inherit'
                }}
              >
                <Logout />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="Logout" />}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: `calc(100% - ${drawerWidth}px)`,
          minHeight: '100vh',
          transition: 'all 0.3s ease',
          backgroundColor: '#f8fafc'
        }}
      >
        <Toolbar />
        
        {/* Page Content */}
        <Box sx={{ 
          maxWidth: 1400, 
          mx: 'auto',
        }}>
          {renderPageContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;