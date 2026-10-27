import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, TextField, IconButton, TablePagination, MenuItem, Select, FormControl, InputLabel
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const ProductsPage = () => {
  const { user } = useContext(AuthContext);
  const isSuperUser = user?.roles?.some(role => 
    role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
  );

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]); // ✅ جديد: قائمة الـ Categories
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ 
    productId: null, 
    productCode: "", 
    productName: "", 
    unitPrice: 0, 
    categoryId: "" 
  });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // جلب البيانات
  useEffect(() => { 
    fetchProducts();
    fetchCategories(); // ✅ جديد: جلب الـ Categories
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data.content || res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
      setProducts([]);
    }
  };

  // ✅ جديد: دالة جلب الـ Categories
  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.content || res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setCategories([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ 
      ...form, 
      [name]: name === "unitPrice" ? parseFloat(value) || 0 : value 
    });
  };

  const handleSubmit = async () => {
    if (!isSuperUser) return;
    
    // ✅ التحقق من البيانات
    if (!form.productCode || !form.productName || !form.categoryId || form.unitPrice <= 0) {
      alert("Please fill all required fields with valid data");
      return;
    }

    try {
      if (form.productId) {
        await api.put(`/products/${form.productId}`, form);
      } else {
        await api.post("/products", form);
      }
      fetchProducts();
      setOpen(false);
      resetForm();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Error saving product: " + (err.response?.data?.message || err.message));
    }
  };

  const resetForm = () => {
    setForm({ 
      productId: null, 
      productCode: "", 
      productName: "", 
      unitPrice: 0, 
      categoryId: "" 
    });
  };

  const handleEdit = (product) => {
    if (!isSuperUser) return;
    setForm({ 
      productId: product.productId,
      productCode: product.productCode,
      productName: product.productName,
      unitPrice: product.unitPrice,
      categoryId: product.categoryId.toString() // ✅ تحويل إلى string للـ Select
    });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (!isSuperUser) return;
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await api.delete(`/products/${id}`);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("Error deleting product: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // ✅ البحث في المنتجات
  const filteredProducts = products.filter(p => 
    p.productName.toLowerCase().includes(search.toLowerCase()) ||
    p.productCode.toLowerCase().includes(search.toLowerCase()) ||
    (p.categoryName && p.categoryName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Products Management</Typography>

      {/* شريط البحث والإضافة */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, gap: 2 }}>
        <TextField 
          label="Search by name, code, or category" 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          sx={{ flexGrow: 1 }}
        />
        {isSuperUser && (
          <Button variant="contained" onClick={() => setOpen(true)}>
            Add Product
          </Button>
        )}
      </Box>

      {/* جدول المنتجات */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Price</TableCell>
            <TableCell>Category</TableCell>
            {isSuperUser && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredProducts
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map(product => (
              <TableRow key={product.productId} hover>
                <TableCell>{product.productCode}</TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>${product.unitPrice?.toFixed(2)}</TableCell>
                <TableCell>{product.categoryName || "N/A"}</TableCell>
                {isSuperUser && (
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleEdit(product)}>
                      <Edit />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(product.productId)}>
                      <Delete />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* الترقيم */}
      <TablePagination
        component="div"
        count={filteredProducts.length}
        page={page}
        onPageChange={(e, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => { 
          setRowsPerPage(parseInt(e.target.value, 10)); 
          setPage(0); 
        }}
        rowsPerPageOptions={[5, 10, 25]}
      />

      {/* Modal إضافة/تعديل منتج */}
      {isSuperUser && (
        <Modal open={open} onClose={() => { setOpen(false); resetForm(); }}>
          <Box sx={{ 
            position: "absolute", 
            top: "50%", 
            left: "50%", 
            transform: "translate(-50%, -50%)", 
            width: 500, 
            bgcolor: "background.paper", 
            p: 4, 
            borderRadius: 2,
            maxHeight: "80vh",
            overflowY: "auto"
          }}>
            <Typography variant="h6" gutterBottom>
              {form.productId ? "Edit Product" : "Add New Product"}
            </Typography>
            
            {/* حقل كود المنتج */}
            <TextField 
              label="Product Code *" 
              name="productCode" 
              fullWidth 
              margin="normal" 
              value={form.productCode} 
              onChange={handleChange}
              required
            />
            
            {/* حقل اسم المنتج */}
            <TextField 
              label="Product Name *" 
              name="productName" 
              fullWidth 
              margin="normal" 
              value={form.productName} 
              onChange={handleChange}
              required
            />
            
            {/* حقل السعر */}
            <TextField 
              label="Unit Price *" 
              name="unitPrice" 
              type="number"
              inputProps={{ min: 0, step: 0.01 }}
              fullWidth 
              margin="normal" 
              value={form.unitPrice} 
              onChange={handleChange}
              required
            />
            
            {/* ✅ جديد: قائمة اختيار الـ Category */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel>Category *</InputLabel>
              <Select
                name="categoryId"
                value={form.categoryId}
                label="Category *"
                onChange={handleChange}
              >
                <MenuItem value="">
                  <em>Select a category</em>
                </MenuItem>
                {categories
                  .filter(cat => cat.isActive !== false) // ✅ عرض الـ Active categories فقط
                  .map(category => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.categoryName} ({category.categoryCode})
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>

            {/* معلومات إضافية */}
            {categories.length === 0 && (
              <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                No categories available. Please add categories first.
              </Typography>
            )}

            {/* أزرار الحفظ والإلغاء */}
            <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
              <Button 
                variant="contained" 
                onClick={handleSubmit}
                disabled={!form.productCode || !form.productName || !form.categoryId || form.unitPrice <= 0}
              >
                {form.productId ? "Update" : "Create"} Product
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => { setOpen(false); resetForm(); }}
              >
                Cancel
              </Button>
            </Box>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default ProductsPage;