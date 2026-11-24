import { NavLink, Outlet } from "react-router-dom";
import "./Admin.css";

function AdminLayout() {
    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <h2>MyStore Admin</h2>

                <nav>
                    <NavLink to="/admin" end>Dashboard</NavLink>
                    <NavLink to="/admin/products">Products</NavLink>
                    <NavLink to="/admin/orders">Orders</NavLink>
                    <NavLink to="/admin/questions">Questions</NavLink>
                </nav>
            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <h2>Admin Panel</h2>
                    <span>Administrator</span>
                </header>

                <section className="admin-content">
                    <Outlet />
                </section>
            </main>
        </div>
    );
}

export default AdminLayout;