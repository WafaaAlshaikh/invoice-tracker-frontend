import React, { createContext, useState, useEffect } from 'react';
import API from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        
        if (token) {
            verifyToken(token);
        } else {
            setLoading(false);
        }
    }, []);

const verifyToken = async (token) => {
    try {
        const res = await API.get('/auth/verify');
        console.log("Verify response:", res.data);
        
        if (res.data.valid) {
            const roles = Array.isArray(res.data.roles) ? res.data.roles : 
                         typeof res.data.roles === 'string' ? [res.data.roles] : [];
            
            const cleanedRoles = roles.map(role => 
                role.replace('ROLE_', '').toUpperCase()
            );
            
            const userObj = { 
                username: res.data.username, 
                roles: cleanedRoles,
                userId: res.data.userId || res.data.username
            };
            setUser(userObj);
            console.log("User set:", userObj);
        } else {
            localStorage.removeItem('token');
            setUser(null);
        }
    } catch (error) {
        console.error("Token verification failed:", error);
        localStorage.removeItem('token');
        setUser(null);
    } finally {
        setLoading(false);
    }
};

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        const roles = Array.isArray(userData.roles) ? userData.roles : [];
        setUser({ 
            ...userData, 
            roles 
        });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};