import React, { useEffect, useState, useContext } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { AuthContext } from "../context/AuthContext";
import API from "../api/api";

const ProductsByCategoryChart = () => {
    const { user } = useContext(AuthContext);
    const [chartUrl, setChartUrl] = useState(null);
    const [loading, setLoading] = useState(true);

    const isSuperUser = user?.roles?.some(role => 
  role === "SUPERUSER" || role === "ROLE_SUPERUSER" || role?.includes("SUPERUSER")
);

    useEffect(() => {
        if (!isSuperUser) return;

        API.get("/charts/products-by-category", { responseType: "blob" }) // important: blob
            .then(res => {
                const url = URL.createObjectURL(res.data);
                setChartUrl(url);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });

        return () => {
            if (chartUrl) URL.revokeObjectURL(chartUrl);
        };
    }, [user]);

    if (!isSuperUser) return null; 

    return (
        <Box>
            <Typography variant="h5" gutterBottom>Products by Category</Typography>
            {loading ? <CircularProgress /> : <img src={chartUrl} alt="Products by Category" style={{ maxWidth: "100%" }} />}
        </Box>
    );
};

export default ProductsByCategoryChart;