// src/components/DuplicateAlert.jsx
import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Box, Alert, List, ListItem,
  ListItemText, Chip, Divider, IconButton, Collapse
} from '@mui/material';
import {
  Warning, CheckCircle, Error, ExpandMore, ExpandLess,
  Visibility, Download, Refresh
} from '@mui/icons-material';
import api from '../api/api';

const DuplicateAlert = ({ open, onClose, duplicateData, invoiceId, onProceed }) => {
  const [expandedInvoice, setExpandedInvoice] = useState(null);
  const [proceeding, setProceeding] = useState(false);

  if (!duplicateData || !duplicateData.similarInvoices) {
    return null;
  }

  const confidencePercentage = duplicateData.confidenceScore 
    ? (duplicateData.confidenceScore * 100).toFixed(0) 
    : 0;

  const handleProceedAnyway = async () => {
    setProceeding(true);
    try {
      await onProceed();
      onClose();
    } catch (error) {
      console.error('Error proceeding with duplicate:', error);
    } finally {
      setProceeding(false);
    }
  };

  const handleViewSimilar = (invoiceId) => {
    window.open(`/invoices/${invoiceId}`, '_blank');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ bgcolor: 'warning.light', color: 'warning.contrastText' }}>
        <Box display="flex" alignItems="center" gap={1}>
          <Warning />
          <Typography variant="h6">
            ⚠️ Duplicate Invoice Detected
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Summary Section */}
        <Alert 
          severity={confidencePercentage > 90 ? "error" : "warning"} 
          sx={{ mb: 2 }}
          icon={confidencePercentage > 90 ? <Error /> : <Warning />}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            {confidencePercentage > 90 
              ? "🚨 HIGH-RISK DUPLICATE" 
              : "⚠️ POTENTIAL DUPLICATE"}
          </Typography>
          <Typography variant="body2">
            Confidence: <strong>{confidencePercentage}%</strong> • 
            Similar Invoices Found: <strong>{duplicateData.similarInvoices.length}</strong>
          </Typography>
        </Alert>

        {/* Recommendation */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            📋 RECOMMENDATION:
          </Typography>
          <Typography variant="body1">
            {duplicateData.recommendation || 
              (confidencePercentage > 80 
                ? "This appears to be a duplicate. Please verify before proceeding." 
                : "Potential duplicate found. Review carefully before proceeding.")}
          </Typography>
        </Box>

        {/* Similar Invoices */}
        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          📄 Similar Invoices Found:
        </Typography>

        <List sx={{ maxHeight: 300, overflow: 'auto' }}>
          {duplicateData.similarInvoices.map((invoice, index) => (
            <React.Fragment key={invoice.invoiceId}>
              <ListItem 
                alignItems="flex-start"
                sx={{
                  bgcolor: invoice.similarityScore > 0.9 ? 'error.50' : 
                          invoice.similarityScore > 0.7 ? 'warning.50' : 'grey.50',
                  borderRadius: 1,
                  mb: 1
                }}
              >
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" fontWeight="medium">
                        Invoice #{invoice.invoiceId}
                        {invoice.isTemporary && (
                          <Chip 
                            label="TEMP" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      <Chip 
                        label={`${(invoice.similarityScore * 100).toFixed(0)}% match`}
                        color={
                          invoice.similarityScore > 0.9 ? "error" :
                          invoice.similarityScore > 0.7 ? "warning" : "default"
                        }
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        📅 Date: {new Date(invoice.uploadDate).toLocaleDateString()} • 
                        💰 Amount: ${invoice.totalAmount?.toFixed(2)}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        🏷️ {invoice.matchReason} • 
                        {invoice.fileName && ` 📄 ${invoice.fileName}`}
                      </Typography>
                      
                      <Collapse in={expandedInvoice === invoice.invoiceId}>
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="caption" display="block">
                            Match Details: {invoice.matchReason}
                          </Typography>
                          {invoice.matchReason.includes("AMOUNT") && (
                            <Typography variant="caption" display="block">
                              • Amount match: ${invoice.totalAmount?.toFixed(2)}
                            </Typography>
                          )}
                          {invoice.matchReason.includes("DATE") && (
                            <Typography variant="caption" display="block">
                              • Date match: {new Date(invoice.uploadDate).toLocaleDateString()}
                            </Typography>
                          )}
                        </Box>
                      </Collapse>
                    </>
                  }
                />
                <Box display="flex" flexDirection="column" gap={0.5}>
                  <IconButton 
                    size="small"
                    onClick={() => setExpandedInvoice(
                      expandedInvoice === invoice.invoiceId ? null : invoice.invoiceId
                    )}
                  >
                    {expandedInvoice === invoice.invoiceId ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  {!invoice.isTemporary && (
                    <IconButton 
                      size="small"
                      onClick={() => handleViewSimilar(invoice.invoiceId)}
                      title="View Invoice"
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </ListItem>
              <Divider variant="middle" component="li" />
            </React.Fragment>
          ))}
        </List>

        {/* Risk Assessment */}
        <Box sx={{ mt: 3, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            🚦 Risk Assessment
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {confidencePercentage > 90 ? 
              "🔴 High Risk: Very likely a duplicate invoice. Proceed with extreme caution." :
              confidencePercentage > 70 ? 
              "🟡 Medium Risk: Potential duplicate. Review carefully before proceeding." :
              "🟢 Low Risk: Some similarities found but likely not a duplicate."
            }
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
          <Button 
            onClick={onClose}
            color="primary"
            startIcon={<CheckCircle />}
          >
            Cancel Upload
          </Button>
        </Box>
        <Box display="flex" gap={1}>
          <Button 
            variant="outlined"
            onClick={() => window.open('/ai/chat?query=Help+me+check+duplicate+invoices', '_blank')}
            startIcon={<Refresh />}
          >
            Ask AI Assistant
          </Button>
          <Button 
            variant="contained"
            color={confidencePercentage > 90 ? "error" : "warning"}
            onClick={handleProceedAnyway}
            disabled={proceeding}
            startIcon={proceeding ? <Refresh /> : <Warning />}
          >
            {proceeding ? 'Processing...' : 'Proceed Anyway'}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default DuplicateAlert;