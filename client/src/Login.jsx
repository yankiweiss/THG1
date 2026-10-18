import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import { API_URL } from "./config";
import logo from "./assets/logo.png";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [role, setRole] = useState("admin");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const { email, password } = Object.fromEntries(new FormData(e.target));

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      login(data);
      navigate("/");
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <img src={logo} alt="The Hamilton Group" className="login-logo" />
        <h3 className="fw600" style={{ color: "#2570C0" }}>
          WELCOME BACK
        </h3>
        <p style={{ color: "#7F9DC9", marginBottom: "20px" }}>
          Sign in to your account
        </p>

        <div className="login-toggle">
          <button
            type="button"
            className={role === "admin" ? "active" : ""}
            onClick={() => setRole("admin")}
          >
            Admin
          </button>
          <button
            type="button"
            className={role === "investor" ? "active" : ""}
            onClick={() => setRole("investor")}
          >
            Investor
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="fw600">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className="login-input"
            autoComplete="username"
            autoFocus
            required
          />

          <label htmlFor="password" className="fw600">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="login-input"
            autoComplete="current-password"
            required
          />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={submitting}>
            {submitting ? "Signing in..." : `Sign in as ${role}`}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;