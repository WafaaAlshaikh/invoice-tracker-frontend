// src/components/InvoiceExtractor.jsx
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { CloudUpload, Description, Image } from '@mui/icons-material';
import api from '../api/api';

const InvoiceExtractor = () => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
      if (!validTypes.includes(selectedFile.type)) {
        setError('Please select a PDF or image file (JPEG, PNG, GIF)');
        return;
      }
      
      // Validate file size (10MB)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      setFile(selectedFile);
      setError('');
      setResult(null);
    }
  };

  const handleExtract = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post('/ai/invoices/extract', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setResult(response.data);
    } catch (err) {
      console.error('Extraction error:', err);
      setError(err.response?.data?.error || 'Failed to extract invoice data');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <CloudUpload sx={{ fontSize: 48 }} />;
    
    if (file.type === 'application/pdf') {
      return <Description sx={{ fontSize: 48, color: 'primary.main' }} />;
    } else {
      return <Image sx={{ fontSize: 48, color: 'primary.main' }} />;
    }
  };

  return (
    <Box sx={{ p: 2 }}>
<Typography variant="h4" gutterBottom sx={{ 
  fontWeight: 'bold',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  backgroundClip: 'text',
  WebkitBackgroundClip: 'text',
  color: 'transparent',
  mb: 1
}}>
  Smart Invoice Extraction
</Typography>
<Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontSize: '1.1rem' }}>
  Upload invoices and let AI automatically extract data with 95%+ accuracy
</Typography>

      {/* Upload Area */}
      <Paper
        sx={{
          p: 4,
          textAlign: 'center',
          border: '2px dashed',
          borderColor: file ? 'primary.main' : 'grey.300',
          bgcolor: file ? 'primary.50' : 'grey.50',
          cursor: 'pointer',
          mb: 3
        }}
        onClick={() => document.getElementById('file-input').click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.gif"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        {getFileIcon()}
        
        <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
          {file ? file.name : 'Click to upload invoice'}
        </Typography>
        
        <Typography variant="body2" color="text.secondary">
          {file ? 
            `File type: ${file.type} | Size: ${(file.size / 1024 / 1024).toFixed(2)} MB` : 
            'Supports PDF, JPEG, PNG, GIF (max 10MB)'
          }
        </Typography>
      </Paper>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        onClick={handleExtract}
        disabled={!file || loading}
        fullWidth
        sx={{ mb: 3 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Extract Invoice Data'}
      </Button>

      {/* Results */}
      {result && (
        <Box>
          {result.success ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom color="success.main">
                  ✅ Data Extracted Successfully!
                </Typography>
                
                <Grid container spacing={2}>
                  {result.invoiceDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Invoice Date</Typography>
                      <Typography variant="body1">
                        {new Date(result.invoiceDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                  
                  {result.totalAmount && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Total Amount</Typography>
                      <Typography variant="h6" color="primary.main">
                        ${result.totalAmount.toFixed(2)}
                      </Typography>
                    </Grid>
                  )}
                  
                  {result.vendor && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2">Vendor</Typography>
                      <Typography variant="body1">{result.vendor}</Typography>
                    </Grid>
                  )}
                  
                  {result.extractedItems && result.extractedItems.length > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" gutterBottom>
                        Extracted Items ({result.extractedItems.length})
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {result.extractedItems.map((item, index) => (
                          <Chip
                            key={index}
                            label={`${item.name} (Qty: ${item.quantity})`}
                            variant="outlined"
                          />
                        ))}
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Alert severity="warning">
              {result.errorMessage || 'Failed to extract data from the invoice'}
            </Alert>
          )}
          
          {/* Raw Response for debugging */}
          <details style={{ marginTop: '16px' }}>
            <summary style={{ cursor: 'pointer', color: '#666' }}>
              Raw AI Response
            </summary>
            <Paper sx={{ p: 2, mt: 1, bgcolor: 'grey.100', fontFamily: 'monospace', fontSize: '12px' }}>
              {result.rawResponse}
            </Paper>
          </details>
        </Box>
      )}
    </Box>
  );
};

export default InvoiceExtractor;