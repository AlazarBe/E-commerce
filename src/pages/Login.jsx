import { useState, useContext } from "react";
import { AuthContext } from "../contexts/authContext";
import { useNavigate, useLocation } from "react-router-dom";
function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password) {
      setMessage("Please fill in all fields.");
      return;
    }

    const result = login(
      formData.email.trim().toLowerCase(),
      formData.password
    );

    setMessage(result.message);

    if (result.success) {
      navigate(location.state?.from || "/");
    }
  };


  return (
    <div className="login-page">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={(e) =>
            setFormData({ ...formData, email: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
        />

        <button type="submit">Login</button>
        <p>{message}</p>
      </form>
    </div>
  );
}

export default Login;