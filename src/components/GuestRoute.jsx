import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

function GuestRoute({ children }) {
    const location = useLocation()
    const { isAuthenticated } = useContext(AuthContext);
    return isAuthenticated ? (
        <Navigate to={location.state?.from || "/"} replace />
    ) : children;

}

export default GuestRoute;