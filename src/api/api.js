// src/api/api.js
import axios from 'axios';

const API = axios.create({
    baseURL: process.env.REACT_APP_API_URL,
    timeout: 30000, // زيادة المهلة للرفع الكبير
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        
        // معالجة أخطاء duplicate detection
        if (error.response?.status === 409 && error.response?.data?.confidenceScore) {
            // سيتم التعامل معه في المكون
            return Promise.reject({
                ...error,
                isDuplicateError: true,
                duplicateData: error.response.data
            });
        }
        
        return Promise.reject(error);
    }
);

export default API;