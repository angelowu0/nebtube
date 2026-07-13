import { useState } from "react";
import { useAuth } from "../src/AuthContext.js";

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  borderRadius: 8,
  border: "1px solid #333333",
  background: "#1e1e1e",
  color: "#ffffff",
  fontSize: 14,
  marginTop: 6,
};

export default function AuthForm() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      style={{
        maxWidth: 380,
        margin: "80px auto",
        padding: 24,
        fontFamily: "Roboto, Arial, sans-serif",
        color: "#ffffff",
      }}
    >
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>Nebtube</h1>
      <p style={{ color: "#aaaaaa", marginTop: 0, marginBottom: 24 }}>
        {mode === "login" ? "Log in to see your feed." : "Create an account to start subscribing."}
      </p>

      <form onSubmit={handleSubmit}>
        <label style={{ display: "block", fontSize: 13, color: "#aaaaaa" }}>
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "block", fontSize: 13, color: "#aaaaaa", marginTop: 16 }}>
          Password
          <input
            type="password"
            required
            minLength={mode === "register" ? 8 : undefined}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />
        </label>

        {error && (
          <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 12 }}>{error}</div>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: "100%",
            marginTop: 20,
            padding: "10px 12px",
            borderRadius: 8,
            border: "none",
            background: "#3ea6ff",
            color: "#0f0f0f",
            fontWeight: 600,
            fontSize: 14,
            cursor: submitting ? "default" : "pointer",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {mode === "login" ? "Log in" : "Sign up"}
        </button>
      </form>

      <p style={{ fontSize: 13, color: "#aaaaaa", marginTop: 20 }}>
        {mode === "login" ? "Need an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setMode(mode === "login" ? "register" : "login");
          }}
          style={{
            background: "none",
            border: "none",
            color: "#3ea6ff",
            cursor: "pointer",
            fontSize: 13,
            padding: 0,
          }}
        >
          {mode === "login" ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
