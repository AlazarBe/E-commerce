import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../contexts/authContext";

function AdminRoute() {
    const { user } = useContext(AuthContext);

    return user?.role === "admin" ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
}

export default AdminRoute;