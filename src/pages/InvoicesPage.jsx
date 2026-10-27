// src/pages/InvoicesPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, TextField, IconButton, TablePagination, Chip, Card, CardContent,
  Grid, MenuItem, Select, FormControl, InputLabel, Alert, Snackbar,
  Paper, Tabs, Tab, List, ListItem, ListItemText, ListItemSecondaryAction,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Collapse, Divider
} from '@mui/material';
import {
  Edit, Delete, Visibility, Add, Search, Refresh, Remove,
  CloudUpload, Download, Warning, CheckCircle, Error,
  ExpandMore, ExpandLess
} from '@mui/icons-material';
import api from '../api/api';
import { AuthContext } from '../context/AuthContext';

// Duplicate Alert Component (مضمن في نفس الملف)
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
            <React.Fragment key={invoice.invoiceId || index}>
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
                        Invoice #{invoice.invoiceId || `TEMP_${index}`}
                        {invoice.isTemporary && (
                          <Chip 
                            label="TEMP" 
                            size="small" 
                            color="info" 
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Typography>
                      {invoice.similarityScore && (
                        <Chip 
                          label={`${(invoice.similarityScore * 100).toFixed(0)}% match`}
                          color={
                            invoice.similarityScore > 0.9 ? "error" :
                            invoice.similarityScore > 0.7 ? "warning" : "default"
                          }
                          size="small"
                        />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" component="span">
                        📅 Date: {invoice.uploadDate ? new Date(invoice.uploadDate).toLocaleDateString() : 'N/A'} • 
                        💰 Amount: ${invoice.totalAmount?.toFixed(2) || '0.00'}
                      </Typography>
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        🏷️ {invoice.matchReason || 'Similarity detected'} • 
                        {invoice.fileName && ` 📄 ${invoice.fileName}`}
                      </Typography>
                      
                      <Collapse in={expandedInvoice === (invoice.invoiceId || index)}>
                        <Box sx={{ mt: 1, p: 1, bgcolor: 'white', borderRadius: 1 }}>
                          <Typography variant="caption" display="block">
                            Match Details: {invoice.matchReason || 'Multiple factors'}
                          </Typography>
                          {invoice.totalAmount && (
                            <Typography variant="caption" display="block">
                              • Amount: ${invoice.totalAmount?.toFixed(2)}
                            </Typography>
                          )}
                          {invoice.uploadDate && (
                            <Typography variant="caption" display="block">
                              • Date: {new Date(invoice.uploadDate).toLocaleDateString()}
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
                      expandedInvoice === (invoice.invoiceId || index) ? null : (invoice.invoiceId || index)
                    )}
                  >
                    {expandedInvoice === (invoice.invoiceId || index) ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                  {invoice.invoiceId && !invoice.isTemporary && (
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

// Main InvoicesPage Component
const InvoicesPage = () => {
  const { user } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [tabValue, setTabValue] = useState(0);
  const [searchParams, setSearchParams] = useState({
    search: '',
    startDate: '',
    endDate: '',
    fileType: '',
    status: ''
  });

  const [form, setForm] = useState({
    invoiceDate: new Date().toISOString().split('T')[0],
    file: null,
    fileName: '',
    productIds: '',
    productQuantities: '',
    userId: ''
  });

  const [selectedProduct, setSelectedProduct] = useState('');
  const [productQuantity, setProductQuantity] = useState(1);

  // States للـ Preview والـ Edit
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [editOpen, setEditOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [statusUpdateOpen, setStatusUpdateOpen] = useState(false);
  const [selectedStatusInvoice, setSelectedStatusInvoice] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [editForm, setEditForm] = useState({
    invoiceDate: '',
    fileName: '',
    file: null,
    productIds: '',
    productQuantities: ''
  });

  // States for Duplicate Detection
  const [duplicateAlertOpen, setDuplicateAlertOpen] = useState(false);
  const [duplicateData, setDuplicateData] = useState(null);
  const [pendingInvoiceData, setPendingInvoiceData] = useState(null);
  const [isEditDuplicate, setIsEditDuplicate] = useState(false);

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  useEffect(() => {
    fetchInvoices();
    fetchStats();
    fetchProducts();
    if (isSuperUser) {
      fetchUsers();
    }
  }, [page, rowsPerPage, tabValue]);

  // Duplicate Check Function
  const handleDuplicateCheck = async (invoiceData, isEdit = false) => {
    try {
      // Calculate total amount
      const totalAmount = calculateTotalFromForm(invoiceData);
      
      const checkData = {
        invoiceDate: invoiceData.invoiceDate,
        totalAmount: totalAmount,
        vendor: invoiceData.fileName || 'Unknown Vendor',
        username: user.username,
        role: user.roles?.[0] || 'USER',
        fileName: invoiceData.fileName,
        invoiceId: isEdit ? editingInvoice?.invoiceId : null,
        isTemporary: !isEdit // Temporary for new invoices
      };

      // Prepare form data for duplicate check
      const formData = new FormData();
      if (invoiceData.file) {
        formData.append('file', invoiceData.file);
      }
      formData.append('invoiceDate', invoiceData.invoiceDate);
      formData.append('totalAmount', totalAmount.toString());
      formData.append('username', user.username);
      formData.append('role', user.roles?.[0] || 'USER');
      formData.append('vendor', invoiceData.fileName || 'Unknown Vendor');
      if (invoiceData.productIds) {
        formData.append('productIds', invoiceData.productIds);
      }
      if (invoiceData.productQuantities) {
        formData.append('productQuantities', invoiceData.productQuantities);
      }
      
      try {
        // Call duplicate check service
        const response = await api.post('/api/duplicate-check/check', formData, {
          headers: invoiceData.file ? { 'Content-Type': 'multipart/form-data' } : {}
        });
        
        if (response.data.duplicate && response.data.confidenceScore > 0.7) {
          return { isDuplicate: true, data: response.data };
        }
        
        return { isDuplicate: false, data: response.data };
      } catch (checkError) {
        console.warn('Duplicate check service unavailable:', checkError.message);
        // Continue without duplicate check if service fails
        return { isDuplicate: false, error: 'Duplicate check service unavailable' };
      }
    } catch (error) {
      console.error('Duplicate check error:', error);
      return { isDuplicate: false, error: error.message };
    }
  };

  const calculateTotalFromForm = (formData) => {
    if (!formData.productIds || !formData.productQuantities) return 0;
    
    const productIds = formData.productIds.split(',').filter(id => id !== '');
    const quantities = formData.productQuantities.split(',').filter(q => q !== '');
    
    return productIds.reduce((total, productId, index) => {
      const product = products.find(p => p.productId === parseInt(productId));
      const quantity = parseFloat(quantities[index]) || 0;
      return total + (product ? product.unitPrice * quantity : 0);
    }, 0);
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/invoices/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.content || res.data || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.content || res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      let endpoint = '/invoices';
      let params = { 
        page, 
        size: rowsPerPage,
        sortBy: 'createdAt', 
        direction: 'DESC' 
      };
      
      if (tabValue === 0) {
        endpoint = '/invoices';
      } else if (tabValue === 1) {
        endpoint = '/invoices/all';
      } else if (tabValue === 2) {
        endpoint = '/invoices/search';
        if (searchParams.search) params.search = searchParams.search;
        if (searchParams.startDate) params.startDate = searchParams.startDate;
        if (searchParams.endDate) params.endDate = searchParams.endDate;
        if (searchParams.fileType) params.fileType = searchParams.fileType;
        if (searchParams.status) params.status = searchParams.status;
      }
      
      const res = await api.get(endpoint, { params });
      setInvoices(res.data.content || res.data || []);
      setTotalElements(res.data.totalElements || res.data.length || 0);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      showSnackbar('Failed to fetch invoices', 'error');
    }
  };

  const handleViewDetails = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.invoiceId}?includeDetails=true`);
      setSelectedInvoice(response.data);
      setPreviewOpen(true);
      
      try {
        const logsRes = await api.get(`/invoices/${invoice.invoiceId}/audit-logs`);
        setAuditLogs(logsRes.data);
      } catch (err) {
        console.log('Audit logs not available');
        setAuditLogs([]);
      }
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      showSnackbar('Failed to fetch invoice details', 'error');
    }
  };

  const handleEdit = async (invoice) => {
    try {
      const response = await api.get(`/invoices/${invoice.invoiceId}?includeDetails=true`);
      const invoiceDetails = response.data;
      
      setEditingInvoice(invoiceDetails);
      
      let productIds = '';
      let productQuantities = '';
      
      if (invoiceDetails.products && invoiceDetails.products.length > 0) {
        productIds = invoiceDetails.products.map(p => p.productId).join(',');
        productQuantities = invoiceDetails.products.map(p => p.quantity).join(',');
      }
      
      setEditForm({
        invoiceDate: invoiceDetails.invoiceDate,
        fileName: invoiceDetails.fileName,
        file: null,
        productIds: productIds,
        productQuantities: productQuantities
      });
      
      setEditOpen(true);
    } catch (err) {
      console.error('Error in handleEdit:', err);
      showSnackbar('Failed to load invoice details for editing', 'error');
    }
  };

  const handleUpdateInvoice = async () => {
    try {
      // Step 1: Duplicate check for updates
      if (editForm.file || editForm.productIds) {
        const duplicateCheck = await handleDuplicateCheck(editForm, true);
        if (duplicateCheck.isDuplicate) {
          setDuplicateData(duplicateCheck.data);
          setIsEditDuplicate(true);
          setDuplicateAlertOpen(true);
          return;
        }
      }

      // Step 2: Proceed with update
      const formData = new FormData();
      
      if (editForm.file) {
        formData.append('file', editForm.file);
      }
      formData.append('invoiceDate', editForm.invoiceDate);
      if (editForm.productIds) {
        formData.append('productIds', editForm.productIds);
      }
      if (editForm.productQuantities) {
        formData.append('productQuantities', editForm.productQuantities);
      }
      if (editForm.fileName) {
        formData.append('fileName', editForm.fileName);
      }
      
      await api.put(`/invoices/${editingInvoice.invoiceId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      showSnackbar('Invoice updated successfully', 'success');
      setEditOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error('Error updating invoice:', err);
      showSnackbar('Failed to update invoice: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const handleProceedWithDuplicate = async () => {
    try {
      if (isEditDuplicate) {
        // For edit: proceed with update
        const formData = new FormData();
        
        if (editForm.file) {
          formData.append('file', editForm.file);
        }
        formData.append('invoiceDate', editForm.invoiceDate);
        if (editForm.productIds) {
          formData.append('productIds', editForm.productIds);
        }
        if (editForm.productQuantities) {
          formData.append('productQuantities', editForm.productQuantities);
        }
        if (editForm.fileName) {
          formData.append('fileName', editForm.fileName);
        }
        formData.append('forceDuplicate', 'true'); // Flag to bypass duplicate check
        
        await api.put(`/invoices/${editingInvoice.invoiceId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        showSnackbar('Invoice updated (duplicate warning overridden)', 'warning');
        setEditOpen(false);
      } else {
        // For new invoice: proceed with creation
        const formData = new FormData();
        
        if (pendingInvoiceData.file) {
          formData.append('file', pendingInvoiceData.file);
        }
        formData.append('invoiceDate', pendingInvoiceData.invoiceDate);
        formData.append('fileName', pendingInvoiceData.fileName);
        formData.append('forceDuplicate', 'true'); // Flag to bypass duplicate check
        
        if (pendingInvoiceData.productIds) {
          formData.append('productIds', pendingInvoiceData.productIds);
        }
        if (pendingInvoiceData.productQuantities) {
          formData.append('productQuantities', pendingInvoiceData.productQuantities);
        }
        if (pendingInvoiceData.userId) {
          formData.append('userId', pendingInvoiceData.userId);
        }
        
        await api.post('/invoices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        showSnackbar('Invoice created (duplicate warning overridden)', 'warning');
        setOpen(false);
        resetForm();
      }
      
      setDuplicateAlertOpen(false);
      setDuplicateData(null);
      setPendingInvoiceData(null);
      setIsEditDuplicate(false);
      fetchInvoices();
      
    } catch (err) {
      console.error('Error proceeding with duplicate:', err);
      showSnackbar('Failed to process invoice', 'error');
    }
  };

  const handleDownload = async (invoiceId) => {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `invoice_${invoiceId}.pdf`;
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showSnackbar('File downloaded successfully', 'success');
    } catch (err) {
      console.error('Error downloading file:', err);
      showSnackbar('Failed to download file', 'error');
    }
  };

  const handleOpenStatusUpdate = (invoice) => {
    setSelectedStatusInvoice(invoice);
    setNewStatus(invoice.status);
    setStatusUpdateOpen(true);
  };

  const handleUpdateStatus = async () => {
    try {
      const updateData = {
        invoiceDate: selectedStatusInvoice.invoiceDate,
        fileName: selectedStatusInvoice.fileName,
        status: newStatus
      };
      
      await api.put(`/invoices/${selectedStatusInvoice.invoiceId}`, updateData);
      showSnackbar('Invoice status updated successfully', 'success');
      setStatusUpdateOpen(false);
      fetchInvoices();
    } catch (err) {
      console.error('Error updating status:', err);
      showSnackbar('Failed to update status', 'error');
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setForm(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleEditFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setEditForm(prev => ({
        ...prev,
        file: file,
        fileName: file.name
      }));
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct || productQuantity <= 0) {
      showSnackbar('Please select a product and enter quantity', 'warning');
      return;
    }

    const productId = selectedProduct;
    
    const currentProductIds = form.productIds ? form.productIds.split(',').filter(id => id !== '') : [];
    const currentProductQuantities = form.productQuantities ? form.productQuantities.split(',').filter(q => q !== '') : [];
    
    if (currentProductIds.includes(productId)) {
      showSnackbar('Product already added to invoice', 'warning');
      return;
    }

    const newProductIds = [...currentProductIds, productId].join(',');
    const newProductQuantities = [...currentProductQuantities, productQuantity.toString()].join(',');

    setForm(prev => ({
      ...prev,
      productIds: newProductIds,
      productQuantities: newProductQuantities
    }));

    setSelectedProduct('');
    setProductQuantity(1);
    showSnackbar('Product added to invoice', 'success');
  };

  const handleRemoveProduct = (productIdToRemove) => {
    const currentProductIds = form.productIds ? form.productIds.split(',').filter(id => id !== '') : [];
    const currentProductQuantities = form.productQuantities ? form.productQuantities.split(',').filter(q => q !== '') : [];
    
    const index = currentProductIds.indexOf(productIdToRemove.toString());
    if (index > -1) {
      currentProductIds.splice(index, 1);
      currentProductQuantities.splice(index, 1);
    }

    setForm(prev => ({
      ...prev,
      productIds: currentProductIds.join(','),
      productQuantities: currentProductQuantities.join(',')
    }));
    
    showSnackbar('Product removed from invoice', 'info');
  };

  const calculateTotal = () => {
    return calculateTotalFromForm(form);
  };

  const handleCreateInvoice = async () => {
    try {
      // Step 1: Duplicate Check
      const duplicateCheck = await handleDuplicateCheck(form, false);
      if (duplicateCheck.isDuplicate) {
        setDuplicateData(duplicateCheck.data);
        setPendingInvoiceData({...form});
        setIsEditDuplicate(false);
        setDuplicateAlertOpen(true);
        return;
      }

      // Step 2: Proceed with upload
      if (form.file) {
        const formData = new FormData();
        formData.append('file', form.file);
        formData.append('invoiceDate', form.invoiceDate);
        formData.append('fileName', form.fileName);
        
        if (form.productIds) {
          formData.append('productIds', form.productIds);
        }
        if (form.productQuantities) {
          formData.append('productQuantities', form.productQuantities);
        }
        if (form.userId) {
          formData.append('userId', form.userId);
        }
        
        await api.post('/invoices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        const invoiceData = {
          invoiceDate: form.invoiceDate,
          fileName: form.fileName,
          productIds: form.productIds ? form.productIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)) : [],
          productQuantities: form.productQuantities ? form.productQuantities.split(',').reduce((acc, qty, index) => {
            const productId = form.productIds.split(',')[index]?.trim();
            if (productId) {
              acc[productId] = parseFloat(qty.trim());
            }
            return acc;
          }, {}) : {},
          userId: form.userId || undefined
        };
        
        await api.post('/invoices', invoiceData, {
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      fetchInvoices();
      setOpen(false);
      resetForm();
      showSnackbar('Invoice created successfully', 'success');
    } catch (err) {
      console.error('Error creating invoice:', err);
      showSnackbar('Failed to create invoice: ' + (err.response?.data?.error || err.message), 'error');
    }
  };

  const resetForm = () => {
    setForm({
      invoiceDate: new Date().toISOString().split('T')[0],
      file: null,
      fileName: '',
      productIds: '',
      productQuantities: '',
      userId: ''
    });
    setSelectedProduct('');
    setProductQuantity(1);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await api.delete(`/invoices/${id}`);
        fetchInvoices();
        showSnackbar('Invoice deleted successfully', 'success');
      } catch (err) {
        console.error('Error deleting invoice:', err);
        showSnackbar('Failed to delete invoice', 'error');
      }
    }
  };

  const handleSearch = () => {
    setPage(0);
    setTimeout(() => {
      fetchInvoices();
    }, 100);
  };

  const handleResetSearch = () => {
    setSearchParams({
      search: '',
      startDate: '',
      endDate: '',
      fileType: '',
      status: ''
    });
    setPage(0);
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

  const canEditDelete = (invoice) => {
    const isSuperUser = user?.roles?.some(role => 
      role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
    );
    return isSuperUser || invoice.uploadedByUser === user?.username;
  };

  const canCreateInvoice = user?.roles?.some(role => 
    role === "USER" || role === "ROLE_USER" || role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("USER")
  );

  const canViewAllInvoices = user?.roles?.some(role => 
    role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role === "AUDITOR" || role === "ROLE_AUDITOR" || role?.includes("SUPERUSER") || role?.includes("AUDITOR")
  );

  const isSuperUser = user?.roles?.some(role => 
    role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
  );

  // الحصول على المنتجات المضافة حالياً
  const getCurrentProducts = () => {
    if (!form.productIds || !form.productQuantities) return [];
    
    const productIds = form.productIds.split(',').filter(id => id !== '');
    const quantities = form.productQuantities.split(',').filter(q => q !== '');
    
    return productIds.map((productId, index) => {
      const product = products.find(p => p.productId === parseInt(productId));
      const quantity = parseFloat(quantities[index]) || 0;
      return { product, quantity };
    }).filter(item => item.product);
  };

  const currentProducts = getCurrentProducts();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        📄 Invoices Management
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography color="textSecondary" variant="body2" gutterBottom>Total Invoices</Typography>
              <Typography variant="h6">{stats.totalInvoices || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
              <Typography color="textSecondary" variant="body2" gutterBottom>Total Amount</Typography>
              <Typography variant="h6">${(stats.totalAmount || 0).toFixed(2)}</Typography>
            </CardContent>
          </Card>
        </Grid>
        {isSuperUser && (
          <>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography color="textSecondary" variant="body2" gutterBottom>Total Users</Typography>
                  <Typography variant="h6">{stats.totalUsers || 0}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                  <Typography color="textSecondary" variant="body2" gutterBottom>Duplicate Checks</Typography>
                  <Typography variant="h6">{stats.duplicateChecks || 0}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {stats.duplicatesBlocked || 0} blocked
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </>
        )}
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs 
          value={tabValue} 
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{ minHeight: '48px' }}
        >
          <Tab label="My Invoices" sx={{ minHeight: '48px', py: 1 }} />
          {canViewAllInvoices && (
            <Tab label="All Invoices" sx={{ minHeight: '48px', py: 1 }} />
          )}
          <Tab label="Advanced Search" sx={{ minHeight: '48px', py: 1 }} />
        </Tabs>
      </Paper>

      {/* Search and Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
        {tabValue === 2 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flexGrow: 1 }}>
            <TextField
              label="Search"
              size="small"
              sx={{ minWidth: 120 }}
              value={searchParams.search}
              onChange={(e) => setSearchParams({...searchParams, search: e.target.value})}
              placeholder="Search..."
            />
            <TextField
              label="Start Date"
              type="date"
              size="small"
              sx={{ minWidth: 130 }}
              InputLabelProps={{ shrink: true }}
              value={searchParams.startDate}
              onChange={(e) => setSearchParams({...searchParams, startDate: e.target.value})}
            />
            <TextField
              label="End Date"
              type="date"
              size="small"
              sx={{ minWidth: 130 }}
              InputLabelProps={{ shrink: true }}
              value={searchParams.endDate}
              onChange={(e) => setSearchParams({...searchParams, endDate: e.target.value})}
            />
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>File Type</InputLabel>
              <Select
                value={searchParams.fileType}
                label="File Type"
                onChange={(e) => setSearchParams({...searchParams, fileType: e.target.value})}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="PDF">PDF</MenuItem>
                <MenuItem value="IMAGE">Image</MenuItem>
                <MenuItem value="WEB_FORM">Web Form</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 100 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={searchParams.status}
                label="Status"
                onChange={(e) => setSearchParams({...searchParams, status: e.target.value})}
              >
                <MenuItem value=""><em>All</em></MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="COMPLETED">Completed</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" size="small" onClick={handleSearch}>
              <Search sx={{ mr: 0.5, fontSize: 18 }} />
              Search
            </Button>
            <Button variant="outlined" color="secondary" size="small" onClick={handleResetSearch}>
              Reset
            </Button>
          </Box>
        )}
        
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Button 
            variant="outlined" 
            size="small" 
            onClick={fetchInvoices}
            startIcon={<Refresh />}
          >
            Refresh
          </Button>
          
          {canCreateInvoice && (
            <Button variant="contained" size="small" startIcon={<Add />} onClick={() => setOpen(true)}>
              New Invoice
            </Button>
          )}
        </Box>
      </Box>

      {/* Invoices Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>ID</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Date</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>File Name</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Amount</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Uploaded By</TableCell>
            <TableCell sx={{ fontWeight: 'bold', py: 1 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} align="center" sx={{ py: 3 }}>
                <Typography color="textSecondary">
                  No invoices found
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            invoices.map((invoice) => (
              <TableRow key={invoice.invoiceId} hover sx={{ '&:last-child td': { border: 0 } }}>
                <TableCell sx={{ py: 1 }}>{invoice.invoiceId}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  {invoice.invoiceDate ? new Date(invoice.invoiceDate).toLocaleDateString() : 'N/A'}
                </TableCell>
                <TableCell sx={{ py: 1 }}>{invoice.fileName}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip label={invoice.fileType} variant="outlined" size="small" />
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Typography fontWeight="bold" variant="body2">
                    ${invoice.totalAmount?.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell sx={{ py: 1 }}>
                  <Chip 
                    label={invoice.status} 
                    color={getStatusColor(invoice.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell sx={{ py: 1 }}>{invoice.uploadedByUser}</TableCell>
                <TableCell sx={{ py: 1 }}>
                  <IconButton 
                    color="primary" 
                    size="small" 
                    title="View Details"
                    onClick={() => handleViewDetails(invoice)}
                  >
                    <Visibility fontSize="small" />
                  </IconButton>
                  
                  {invoice.fileType !== 'WEB_FORM' && (
                    <IconButton 
                      color="info" 
                      size="small" 
                      title="Download File"
                      onClick={() => handleDownload(invoice.invoiceId)}
                    >
                      <Download fontSize="small" />
                    </IconButton>
                  )}
                  
                  {canEditDelete(invoice) && (
                    <>
                      <IconButton 
                        color="secondary" 
                        size="small" 
                        title="Edit"
                        onClick={() => handleEdit(invoice)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      
                      <IconButton 
                        color="error" 
                        size="small" 
                        onClick={() => handleDelete(invoice.invoiceId)} 
                        title="Delete"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </>
                  )}
                  
                  {isSuperUser && (
                    <IconButton 
                      color="warning" 
                      size="small" 
                      title="Update Status"
                      onClick={() => handleOpenStatusUpdate(invoice)}
                    >
                      <Refresh fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalElements}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{ '.MuiTablePagination-toolbar': { minHeight: '52px' } }}
      />

      {/* Create Invoice Modal */}
      {canCreateInvoice && (
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 500,
            maxHeight: '90vh',
            overflow: 'auto',
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom>Create New Invoice</Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Invoice Date"
                  type="date"
                  fullWidth
                  size="small"
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  value={form.invoiceDate}
                  onChange={(e) => setForm({...form, invoiceDate: e.target.value})}
                  required
                />
              </Grid>
            </Grid>

            {/* User Selection for SUPERUSER */}
            {isSuperUser && (
              <FormControl fullWidth size="small" margin="normal">
                <InputLabel>Assign to User (Optional)</InputLabel>
                <Select
                  value={form.userId}
                  label="Assign to User (Optional)"
                  onChange={(e) => setForm({...form, userId: e.target.value})}
                >
                  <MenuItem value="">
                    <em>Current User ({user.username})</em>
                  </MenuItem>
                  {users
                    .filter(u => u.isActive && u.username !== user.username)
                    .map(userItem => (
                      <MenuItem key={userItem.userId} value={userItem.userId}>
                        {userItem.username} ({userItem.email})
                      </MenuItem>
                    ))}
                </Select>
                <Typography variant="caption" color="textSecondary">
                  Leave empty to assign to yourself
                </Typography>
              </FormControl>
            )}

            {/* File Upload Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Upload Invoice File (Optional)</Typography>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                size="small"
                startIcon={<CloudUpload />}
                sx={{ py: 1 }}
              >
                {form.file ? form.file.name : 'Choose File (PDF or Image)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileChange}
                />
              </Button>
              {form.file && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                  Selected: {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
              <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5 }}>
                You can create an invoice with only products (no file) or only a file (no products) or both.
              </Typography>
            </Box>

            {/* File Name Input */}
            <TextField
              label="File Name *"
              fullWidth
              size="small"
              margin="normal"
              value={form.fileName}
              onChange={(e) => setForm({...form, fileName: e.target.value})}
              placeholder="e.g., january_invoice"
              required
              error={!form.fileName}
              helperText={!form.fileName ? "File name is required" : "This will be the display name of your invoice"}
            />

            {/* Products Section */}
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Add Products (Optional)</Typography>
              
              <Grid container spacing={1} alignItems="center">
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Product</InputLabel>
                    <Select
                      value={selectedProduct}
                      label="Select Product"
                      onChange={(e) => setSelectedProduct(e.target.value)}
                    >
                      {products
                        .filter(p => p.isActive)
                        .filter(p => !form.productIds?.includes(p.productId.toString()))
                        .map(product => (
                          <MenuItem key={product.productId} value={product.productId}>
                            {product.productName} - ${product.unitPrice}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <TextField
                    label="Quantity"
                    type="number"
                    fullWidth
                    size="small"
                    value={productQuantity}
                    onChange={(e) => setProductQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                    inputProps={{ min: 0.1, step: 0.1 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    size="small"
                    onClick={handleAddProduct}
                    startIcon={<Add />}
                  >
                    Add Product
                  </Button>
                </Grid>
              </Grid>

              {/* Display Added Products */}
              {currentProducts.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Added Products ({currentProducts.length})
                  </Typography>
                  <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                    {currentProducts.map(({ product, quantity }, index) => {
                      const subtotal = product ? product.unitPrice * quantity : 0;
                      
                      return (
                        <ListItem key={product.productId} divider sx={{ py: 0.5 }}>
                          <ListItemText 
                            primary={product.productName}
                            secondary={`Qty: ${quantity} | Price: $${product.unitPrice} | Subtotal: $${subtotal.toFixed(2)}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              onClick={() => handleRemoveProduct(product.productId)}
                              color="error"
                              size="small"
                            >
                              <Remove fontSize="small" />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      );
                    })}
                  </List>
                  
                  <Box sx={{ mt: 1, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="subtitle1" align="right">
                      Total: ${calculateTotal().toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
              <Button 
                variant="outlined" 
                fullWidth 
                size="small"
                onClick={() => {
                  setOpen(false);
                  resetForm();
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                fullWidth 
                size="small"
                onClick={handleCreateInvoice}
                disabled={!form.fileName}
              >
                Create Invoice
              </Button>
            </Box>
          </Box>
        </Modal>
      )}

      {/* Invoice Details Modal */}
      <Modal open={previewOpen} onClose={() => setPreviewOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxHeight: '80vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Invoice Details - #{selectedInvoice?.invoiceId}
          </Typography>

          {selectedInvoice && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle1" gutterBottom>Invoice Information</Typography>
                      <Typography variant="body2"><strong>ID:</strong> {selectedInvoice.invoiceId}</Typography>
                      <Typography variant="body2"><strong>Date:</strong> {selectedInvoice.invoiceDate}</Typography>
                      <Typography variant="body2"><strong>File Name:</strong> {selectedInvoice.fileName}</Typography>
                      <Typography variant="body2"><strong>File Type:</strong> 
                        <Chip label={selectedInvoice.fileType} size="small" sx={{ ml: 1 }} />
                      </Typography>
                      <Typography variant="body2"><strong>Status:</strong> 
                        <Chip 
                          label={selectedInvoice.status} 
                          color={getStatusColor(selectedInvoice.status)}
                          size="small"
                          sx={{ ml: 1 }}
                        />
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                      <Typography variant="subtitle1" gutterBottom>Financial Information</Typography>
                      <Typography variant="body2"><strong>Total Amount:</strong> 
                        <Typography variant="h6" color="primary" component="span" sx={{ ml: 1 }}>
                          ${selectedInvoice.totalAmount?.toFixed(2)}
                        </Typography>
                      </Typography>
                      <Typography variant="body2"><strong>Uploaded By:</strong> {selectedInvoice.uploadedByUser}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Products in Invoice */}
              {selectedInvoice.products && selectedInvoice.products.length > 0 && (
                <Card variant="outlined" sx={{ mb: 2 }}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle1" gutterBottom>Products</Typography>
                    <List dense>
                      {selectedInvoice.products.map((product, index) => (
                        <ListItem key={index} divider sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={product.productName}
                            secondary={`Category: ${product.category} | Qty: ${product.quantity} | Unit Price: $${product.unitPrice} | Subtotal: $${product.subtotal?.toFixed(2)}`}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Audit Logs */}
              {auditLogs.length > 0 && (
                <Card variant="outlined">
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Typography variant="subtitle1" gutterBottom>Audit History</Typography>
                    <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                      {auditLogs.map((log) => (
                        <ListItem key={log.logId} divider sx={{ py: 0.5 }}>
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="body2">
                                  {log.description || `${log.performedBy} ${log.actionType}`}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {new Date(log.timestamp).toLocaleString()}
                                </Typography>
                              </Box>
                            }
                            primaryTypographyProps={{ variant: 'body2' }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Button variant="outlined" fullWidth size="small" onClick={() => setPreviewOpen(false)}>
              Close
            </Button>
            {selectedInvoice && canEditDelete(selectedInvoice) && (
              <Button 
                variant="contained" 
                fullWidth 
                size="small"
                onClick={() => {
                  setPreviewOpen(false);
                  handleEdit(selectedInvoice);
                }}
              >
                Edit Invoice
              </Button>
            )}
          </Box>
        </Box>
      </Modal>

      {/* Status Update Modal */}
      {isSuperUser && (
        <Modal open={statusUpdateOpen} onClose={() => setStatusUpdateOpen(false)}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 350,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 3,
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom>
              Update Status - #{selectedStatusInvoice?.invoiceId}
            </Typography>

            {selectedStatusInvoice && (
              <Box>
                <Typography variant="body2" gutterBottom>
                  Current Status: 
                  <Chip 
                    label={selectedStatusInvoice.status} 
                    color={getStatusColor(selectedStatusInvoice.status)}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Typography>

                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel>New Status</InputLabel>
                  <Select
                    value={newStatus}
                    label="New Status"
                    onChange={(e) => setNewStatus(e.target.value)}
                  >
                    <MenuItem value="PENDING">Pending</MenuItem>
                    <MenuItem value="APPROVED">Approved</MenuItem>
                    <MenuItem value="REJECTED">Rejected</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    fullWidth 
                    size="small"
                    onClick={() => setStatusUpdateOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="contained" 
                    fullWidth 
                    size="small"
                    onClick={handleUpdateStatus}
                    disabled={!newStatus || newStatus === selectedStatusInvoice.status}
                  >
                    Update Status
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </Modal>
      )}

      {/* Edit Invoice Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 600,
          maxHeight: '90vh',
          overflow: 'auto',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 3,
          borderRadius: 2
        }}>
          <Typography variant="h6" gutterBottom>
            Edit Invoice - #{editingInvoice?.invoiceId}
          </Typography>

          {editingInvoice && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    label="Invoice Date"
                    type="date"
                    fullWidth
                    size="small"
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    value={editForm.invoiceDate}
                    onChange={(e) => setEditForm({...editForm, invoiceDate: e.target.value})}
                  />
                </Grid>
              </Grid>

              {/* File Upload for Edit */}
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>Update File (Optional)</Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  size="small"
                  startIcon={<CloudUpload />}
                  sx={{ py: 1 }}
                >
                  {editForm.file ? editForm.file.name : 'Choose New File (PDF or Image)'}
                  <input
                    type="file"
                    hidden
                    accept=".pdf,.jpg,.jpeg,.png,.gif"
                    onChange={handleEditFileChange}
                  />
                </Button>
                {!editForm.file && editingInvoice.originalFileName && (
                  <Typography variant="caption" color="textSecondary" sx={{ mt: 0.5 }}>
                    Current: {editingInvoice.originalFileName}
                  </Typography>
                )}
              </Box>

              <TextField
                label="File Name"
                fullWidth
                size="small"
                margin="normal"
                value={editForm.fileName}
                onChange={(e) => setEditForm({...editForm, fileName: e.target.value})}
                required
              />

              {/* Products Section for Edit */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" gutterBottom>Manage Products</Typography>
                
                {/* Add Product Section */}
                <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>Add New Product</Typography>
                  <Grid container spacing={1} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Select Product</InputLabel>
                        <Select
                          value={selectedProduct}
                          label="Select Product"
                          onChange={(e) => setSelectedProduct(e.target.value)}
                        >
                          {products
                            .filter(p => p.isActive)
                            .filter(p => {
                              const currentIds = editForm.productIds ? editForm.productIds.split(',').filter(id => id !== '') : [];
                              return !currentIds.includes(p.productId.toString());
                            })
                            .map(product => (
                              <MenuItem key={product.productId} value={product.productId}>
                                {product.productName} - ${product.unitPrice}
                              </MenuItem>
                            ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <TextField
                        label="Quantity"
                        type="number"
                        fullWidth
                        size="small"
                        value={productQuantity}
                        onChange={(e) => setProductQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        inputProps={{ min: 0.1, step: 0.1 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Button 
                        variant="outlined" 
                        fullWidth 
                        size="small"
                        onClick={() => {
                          if (!selectedProduct || productQuantity <= 0) {
                            showSnackbar('Please select a product and enter quantity', 'warning');
                            return;
                          }

                          const currentProductIds = editForm.productIds ? editForm.productIds.split(',').filter(id => id !== '') : [];
                          const currentProductQuantities = editForm.productQuantities ? editForm.productQuantities.split(',').filter(q => q !== '') : [];
                          
                          if (currentProductIds.includes(selectedProduct)) {
                            showSnackbar('Product already added to invoice', 'warning');
                            return;
                          }

                          const newProductIds = [...currentProductIds, selectedProduct].join(',');
                          const newProductQuantities = [...currentProductQuantities, productQuantity.toString()].join(',');

                          setEditForm(prev => ({
                            ...prev,
                            productIds: newProductIds,
                            productQuantities: newProductQuantities
                          }));

                          setSelectedProduct('');
                          setProductQuantity(1);
                          showSnackbar('Product added to invoice', 'success');
                        }}
                        startIcon={<Add />}
                      >
                        Add Product
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Display Current Products in Edit Form */}
                {editForm.productIds && editForm.productIds.split(',').filter(id => id !== '').length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Products ({editForm.productIds.split(',').filter(id => id !== '').length})
                    </Typography>
                    <List dense>
                      {editForm.productIds.split(',').filter(id => id !== '').map((productId, index) => {
                        const product = products.find(p => p.productId === parseInt(productId));
                        const quantities = editForm.productQuantities ? editForm.productQuantities.split(',').filter(q => q !== '') : [];
                        const quantity = parseFloat(quantities[index]) || 0;
                        
                        if (!product) return null;
                        
                        const subtotal = product.unitPrice * quantity;
                        
                        return (
                          <ListItem key={product.productId} divider sx={{ py: 1 }}>
                            <ListItemText 
                              primary={product.productName}
                              secondary={`Category: ${product.category} | Qty: ${quantity} | Unit Price: $${product.unitPrice} | Subtotal: $${subtotal.toFixed(2)}`}
                              primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                              secondaryTypographyProps={{ variant: 'caption' }}
                            />
                            <ListItemSecondaryAction>
                              <IconButton 
                                edge="end" 
                                onClick={() => {
                                  const currentProductIds = editForm.productIds.split(',').filter(id => id !== '');
                                  const currentProductQuantities = editForm.productQuantities.split(',').filter(q => q !== '');
                                  
                                  const productIndex = currentProductIds.indexOf(productId);
                                  if (productIndex > -1) {
                                    currentProductIds.splice(productIndex, 1);
                                    currentProductQuantities.splice(productIndex, 1);
                                  }

                                  setEditForm(prev => ({
                                    ...prev,
                                    productIds: currentProductIds.join(','),
                                    productQuantities: currentProductQuantities.join(',')
                                  }));
                                  
                                  showSnackbar('Product removed from invoice', 'info');
                                }}
                                color="error"
                                size="small"
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        );
                      })}
                    </List>
                    
                    {/* Calculate and display total */}
                    {(() => {
                      const productIds = editForm.productIds.split(',').filter(id => id !== '');
                      const quantities = editForm.productQuantities.split(',').filter(q => q !== '');
                      
                      const total = productIds.reduce((sum, productId, index) => {
                        const product = products.find(p => p.productId === parseInt(productId));
                        const quantity = parseFloat(quantities[index]) || 0;
                        return sum + (product ? product.unitPrice * quantity : 0);
                      }, 0);
                      
                      return (
                        <Box sx={{ mt: 2, p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="subtitle1" align="right" fontWeight="bold">
                            Total: ${total.toFixed(2)}
                          </Typography>
                        </Box>
                      );
                    })()}
                  </Paper>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
                <Button 
                  variant="outlined" 
                  fullWidth 
                  size="small"
                  onClick={() => setEditOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant="contained" 
                  fullWidth 
                  size="small"
                  onClick={handleUpdateInvoice}
                  disabled={!editForm.fileName}
                >
                  Update Invoice
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </Modal>

      {/* Duplicate Alert Modal */}
      <DuplicateAlert
        open={duplicateAlertOpen}
        onClose={() => {
          setDuplicateAlertOpen(false);
          setDuplicateData(null);
          setPendingInvoiceData(null);
          setIsEditDuplicate(false);
        }}
        duplicateData={duplicateData}
        onProceed={handleProceedWithDuplicate}
        invoiceId={isEditDuplicate ? editingInvoice?.invoiceId : null}
      />

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default InvoicesPage;