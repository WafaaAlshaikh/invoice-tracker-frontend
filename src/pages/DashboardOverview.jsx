import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Paper,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, LinearProgress, Alert, Button, alpha
} from '@mui/material';
import {
  Receipt, People, AttachMoney, TrendingUp,
  ArrowUpward, ArrowDownward, Equalizer
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const DashboardOverview = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({});
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isSuperUser = user?.roles?.some(role => 
    role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
  );

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const statsRes = await api.get('/invoices/stats');
      console.log("Stats response:", statsRes.data);
      setStats(statsRes.data);

      let invoicesEndpoint = '/invoices';
      if (isSuperUser || user?.roles?.includes('AUDITOR')) {
        invoicesEndpoint = '/invoices/all';
      }
      
      const invoicesRes = await api.get(invoicesEndpoint, {
        params: {
          page: 0,
          size: 5,
          sortBy: 'createdAt',
          direction: 'DESC'
        }
      });
      
      console.log("Invoices response:", invoicesRes.data);
      
      const invoicesData = invoicesRes.data.content || invoicesRes.data || [];
      setRecentInvoices(Array.isArray(invoicesData) ? invoicesData : []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', err.response?.data);
      setError('Failed to load dashboard data: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'APPROVED': return 'success';
      case 'PENDING': return 'warning';
      case 'REJECTED': return 'error';
      case 'COMPLETED': return 'info';
      default: return 'default';
    }
  };

  const StatCard = ({ title, value, icon, subtitle, trend, trendValue }) => (
    <Card 
      sx={{ 
        height: '100%',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
        }
      }}
    >
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography 
              color="text.secondary" 
              variant="overline" 
              sx={{ 
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: 0.5,
                mb: 0.5,
                display: 'block'
              }}
            >
              {title}
            </Typography>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: '700',
                background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                mb: 0.5
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                {trend === 'up' && <ArrowUpward sx={{ fontSize: 14, color: 'success.main' }} />}
                {trend === 'down' && <ArrowDownward sx={{ fontSize: 14, color: 'error.main' }} />}
                {trend === 'neutral' && <Equalizer sx={{ fontSize: 14, color: 'info.main' }} />}
                <Typography 
                  variant="caption" 
                  color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}
                  sx={{ fontWeight: 600, fontSize: '0.75rem' }}
                >
                  {subtitle}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              ml: 1,
              flexShrink: 0
            }}
          >
            {React.cloneElement(icon, { sx: { fontSize: 20 } })}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <LinearProgress 
          sx={{ 
            height: 4, 
            borderRadius: 2,
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            '& .MuiLinearProgress-bar': {
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
            }
          }} 
        />
        <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary', fontSize: '1rem' }}>
          Loading dashboard data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ 
          mb: 2,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #fed7d7 0%, #feb2b2 100%)',
          color: '#9b2c2c',
          fontWeight: 600
        }}
        action={
          <Button 
            onClick={fetchDashboardData} 
            size="small"
            sx={{ 
              fontWeight: 'bold',
              color: '#9b2c2c',
              '&:hover': {
                background: alpha('#9b2c2c', 0.1)
              }
            }}
          >
            Retry
          </Button>
        }
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ mb: 3 }}>
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            mb: 0.5,
            fontSize: { xs: '1.75rem', md: '2rem' }
          }}
        >
          Welcome back, {user?.username}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 400 }}>
          Here's what's happening with your invoices today
        </Typography>
      </Box>

      {/* إحصائيات مصغرة */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="TOTAL INVOICES"
            value={stats.totalInvoices || 0}
            icon={<Receipt />}
            subtitle="All time records"
            trend="up"
          />
        </Grid>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="TOTAL AMOUNT"
            value={`$${(stats.totalAmount || 0).toLocaleString()}`}
            icon={<AttachMoney />}
            subtitle="Total value"
            trend="up"
          />
        </Grid>
        {isSuperUser && (
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="ACTIVE USERS"
              value={stats.totalUsers || 0}
              icon={<People />}
              subtitle="Registered users"
              trend="neutral"
            />
          </Grid>
        )}
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="AVERAGE AMOUNT"
            value={`$${(stats.averageAmount || 0).toFixed(2)}`}
            icon={<TrendingUp />}
            subtitle="Per invoice"
            trend="up"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        {/* الفواتير الحديثة - تصميم مصغر */}
        <Grid item xs={12} lg={8}>
          <Card 
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'white',
                    fontWeight: 600,
                    m: 0,
                    fontSize: '1.1rem'
                  }}
                >
                  <Receipt sx={{ fontSize: 20 }} />
                  Recent Invoices
                </Typography>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5, fontSize: '0.875rem' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5, fontSize: '0.875rem' }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5, fontSize: '0.875rem' }}>File Name</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5, fontSize: '0.875rem' }}>Amount</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5, fontSize: '0.875rem' }}>Status</TableCell>
                      {isSuperUser && (
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary', py: 1.5, fontSize: '0.875rem' }}>Uploaded By</TableCell>
                      )}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={isSuperUser ? 6 : 5} align="center" sx={{ py: 3 }}>
                          <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                            <Receipt sx={{ fontSize: 36, mb: 1, opacity: 0.5 }} />
                            <Typography variant="body1" gutterBottom sx={{ fontWeight: 600 }}>
                              No invoices found
                            </Typography>
                            <Typography variant="caption">
                              Start by uploading your first invoice
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ) : (
                      recentInvoices.map((invoice) => (
                        <TableRow 
                          key={invoice.invoiceId} 
                          hover
                          sx={{ 
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              backgroundColor: alpha('#667eea', 0.04),
                            }
                          }}
                        >
                          <TableCell sx={{ py: 1.5, fontWeight: 'medium', fontSize: '0.875rem' }}>
                            #{invoice.invoiceId}
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>
                            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                              {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                maxWidth: 150,
                                fontWeight: 'medium'
                              }}
                            >
                              {invoice.fileName}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>
                            <Typography 
                              fontWeight="bold" 
                              sx={{ 
                                color: 'success.main',
                                fontSize: '0.9rem'
                              }}
                            >
                              ${invoice.totalAmount?.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>
                            <Chip 
                              label={invoice.status} 
                              color={getStatusColor(invoice.status)}
                              size="small"
                              sx={{ 
                                fontWeight: 600,
                                minWidth: 80,
                                height: 24,
                                fontSize: '0.7rem'
                              }}
                            />
                          </TableCell>
                          {isSuperUser && (
                            <TableCell sx={{ py: 1.5, fontSize: '0.875rem' }}>
                              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                                {invoice.uploadedByUser}
                              </Typography>
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* معلومات المستخدم - تصميم مصغر */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{ 
              borderRadius: 2,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    color: 'white',
                    fontWeight: 600,
                    m: 0,
                    fontSize: '1.1rem'
                  }}
                >
                  <People sx={{ fontSize: 20 }} />
                  User Profile
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, fontWeight: 600, display: 'block' }}>
                    Username
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                    {user?.username}
                  </Typography>
                </Box>
                
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1, fontWeight: 600, display: 'block' }}>
                    Roles & Permissions
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {user?.roles?.map((role, index) => (
                      <Chip 
                        key={index}
                        label={role.replace('ROLE_', '')} 
                        color={
                          role.includes('SUPERUSER') ? 'error' :
                          role.includes('AUDITOR') ? 'warning' : 
                          role.includes('ADMIN') ? 'secondary' : 'primary'
                        }
                        size="small"
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 22
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardOverview;