import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("currentUser");

    return savedUser ? JSON.parse(savedUser) : null;
  });
  useEffect(() => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [user]);
  const register = (newUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const emailExists = users.some(
      (user) => user.email === newUser.email
    );

    if (emailExists) {
      return { success: false, message: "Email already registered." };
    }

    const updatedUsers = [...users, newUser];

    localStorage.setItem("users", JSON.stringify(updatedUsers));

    return { success: true, message: "Registration successful!" };
  };
  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const foundUser = users.find(
      (user) =>
        user.email === email && user.password === password
    );

    if (!foundUser) {
      return {
        success: false,
        message: "Invalid email or password.",
      };
    }

    setUser(foundUser);

    return {
      success: true,
      message: "Login successful!",
    };
  };
  const logout = () => {
    setUser(null);
  };
  const isAuthenticated = Boolean(user);
  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users")) || [];

    const adminExists = users.some(
      (user) => user.role === "admin"
    );

    if (!adminExists) {
      users.push({
        name: "Admin",
        email: "admin@example.com",
        password: "Admin123",
        role: "admin",
      });

      localStorage.setItem("users", JSON.stringify(users));
    }
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser, register, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;