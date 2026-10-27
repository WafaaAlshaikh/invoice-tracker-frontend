// src/pages/AIDashboard.jsx
import React, { useState, useContext } from 'react';
import {
  Box,
  Grid,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Button,
  Alert,
  alpha,
  useTheme
} from '@mui/material';
import { 
  SmartToy, 
  Description, 
  Chat
} from '@mui/icons-material';
import AIChatbot from '../components/AIChatbot';
import InvoiceExtractor from '../components/InvoiceExtractor';
import { AuthContext } from '../context/AuthContext';
import api from '../api/api';

const AIDashboard = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [apiStatus, setApiStatus] = useState(null);
  const [testing, setTesting] = useState(false);

  const testApiConnection = async () => {
    try {
      setTesting(true);
      setApiStatus({ loading: true, message: 'Testing connection...' });
      
      const response = await api.get('/ai/debug/test-api');
      
      setApiStatus({ 
        success: true, 
        message: 'AI Services Connected',
        details: response.data.response
      });
    } catch (error) {
      setApiStatus({ 
        success: false, 
        message: 'AI Service Unavailable',
        details: error.response?.data?.message || error.message
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Simple Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <SmartToy />
          AI Assistant
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Analyze and extract data from your invoices using AI
        </Typography>
      </Box>

      {/* Simple Status Check */}
      <Card sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">AI Status</Typography>
            <Typography variant="body2" color="text.secondary">
              Check if AI services are ready
            </Typography>
          </Box>
          <Button 
            variant="outlined" 
            onClick={testApiConnection}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Test Connection'}
          </Button>
        </Box>
        
        {apiStatus && (
          <Alert 
            severity={apiStatus.success ? 'success' : 'error'} 
            sx={{ mt: 2 }}
          >
            {apiStatus.message}
          </Alert>
        )}
      </Card>

      {/* Clean Tabs */}
      <Card>
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          variant="fullWidth"
        >
          <Tab 
            icon={<Chat />} 
            label="Chat Assistant" 
            iconPosition="start"
          />
          <Tab 
            icon={<Description />} 
            label="Extract Data" 
            iconPosition="start"
          />
        </Tabs>

        <Box sx={{ p: 0 }}>
          {tabValue === 0 && (
            <Box sx={{ height: '500px' }}>
              <AIChatbot />
            </Box>
          )}
          
          {tabValue === 1 && (
            <InvoiceExtractor />
          )}
        </Box>
      </Card>
    </Box>
  );
};

export default AIDashboard;