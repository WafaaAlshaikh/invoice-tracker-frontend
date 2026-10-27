import React, { useState, useEffect, useContext } from "react";
import {
  Box, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell,
  Modal, TextField, IconButton, TablePagination
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import api from "../api/api";
import { AuthContext } from "../context/AuthContext";

const CategoriesPage = () => {
  const { user } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ categoryId: null, categoryCode: "", categoryName: "", description: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.content || res.data || []);
    } catch (err) {
      console.error(err);
      setCategories([]);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async () => {
    try {
      if (form.categoryId) {
        await api.put(`/categories/${form.categoryId}`, form);
      } else {
        await api.post("/categories", form);
      }
      fetchCategories();
      setOpen(false);
      setForm({ categoryId: null, categoryCode: "", categoryName: "", description: "" });
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (c) => {
    setForm({ categoryId: c.categoryId, categoryCode: c.categoryCode, categoryName: c.categoryName, description: c.description });
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/categories/${id}`);
        fetchCategories();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSearch = (e) => setSearch(e.target.value);
  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); };

  const filteredCategories = categories.filter((c) =>
  c.categoryName.toLowerCase().includes(search.toLowerCase()) ||
  c.categoryCode.toLowerCase().includes(search.toLowerCase())
);



  const isSuperUser = user?.roles?.some(role => 
  role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Categories</Typography>

      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <TextField label="Search" value={search} onChange={handleSearch} />
        {isSuperUser && (
          <Button variant="contained" onClick={() => setOpen(true)}>Add Category</Button>
        )}
      </Box>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Code</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Description</TableCell>
            {isSuperUser && <TableCell>Actions</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredCategories.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c) => (
            <TableRow key={c.categoryId}>
              <TableCell>{c.categoryCode}</TableCell>
              <TableCell>{c.categoryName}</TableCell>
              <TableCell>{c.description}</TableCell>
              {isSuperUser && (
                <TableCell>
                  <IconButton color="primary" onClick={() => handleEdit(c)}><Edit /></IconButton>
                  <IconButton color="error" onClick={() => handleDelete(c.categoryId)}><Delete /></IconButton>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        component="div"
        count={filteredCategories.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      {/* Modal Add/Edit */}
      {isSuperUser && (
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box sx={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 400, bgcolor: "background.paper", p: 4, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>{form.categoryId ? "Edit Category" : "Add Category"}</Typography>
            <TextField label="Category Code" name="categoryCode" fullWidth margin="normal" value={form.categoryCode} onChange={handleChange} />
            <TextField label="Category Name" name="categoryName" fullWidth margin="normal" value={form.categoryName} onChange={handleChange} />
            <TextField label="Description" name="description" fullWidth margin="normal" value={form.description} onChange={handleChange} />
            <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>Save</Button>
          </Box>
        </Modal>
      )}
    </Box>
  );
};

export default CategoriesPage;