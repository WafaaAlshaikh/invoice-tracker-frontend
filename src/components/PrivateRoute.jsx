import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { user } = useContext(AuthContext);
  
  if (!user) {
    return <Navigate to="/login" />;
  }

  // ✅ تحسين التحقق من الصلاحيات
  const hasRequiredRole = requiredRoles.length === 0 || 
    requiredRoles.some(requiredRole => 
      user.roles?.some(userRole => 
        userRole === requiredRole || 
        userRole === `ROLE_${requiredRole}` ||
        userRole.includes(requiredRole)
      )
    );

  if (!hasRequiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;