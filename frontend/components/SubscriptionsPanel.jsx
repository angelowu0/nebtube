import { useState } from "react";
import { useAuth } from "../src/AuthContext.js";
import * as api from "../src/api.js";

const inputStyle = {
  padding: "8px 10px",
  borderRadius: 6,
  border: "1px solid #333333",
  background: "#1e1e1e",
  color: "#ffffff",
  fontSize: 13,
};

export default function SubscriptionsPanel({ subscriptions, onChange }) {
  const { token } = useAuth();
  const [platform, setPlatform] = useState("youtube");
  const [identifier, setIdentifier] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleAdd(e) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.addSubscription(token, { platform, identifier, display_name: displayName });
      setIdentifier("");
      setDisplayName("");
      onChange();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRemove(id) {
    try {
      await api.removeSubscription(token, id);
      onChange();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #2a2a2a",
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        fontFamily: "Roboto, Arial, sans-serif",
        color: "#ffffff",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          background: "none",
          border: "none",
          color: "#ffffff",
          fontSize: 15,
          fontWeight: 600,
          cursor: "pointer",
          padding: 0,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        Subscriptions ({subscriptions.length}) {open ? "▲" : "▼"}
      </button>

      {open && (
        <div style={{ marginTop: 16 }}>
          {subscriptions.length === 0 && (
            <p style={{ color: "#aaaaaa", fontSize: 13 }}>
              No subscriptions yet — add a YouTube or Nebula channel below.
            </p>
          )}

          <ul style={{ listStyle: "none", padding: 0, margin: "0 0 16px 0" }}>
            {subscriptions.map((sub) => (
              <li
                key={sub.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "6px 0",
                  fontSize: 14,
                  borderBottom: "1px solid #222222",
                }}
              >
                <span>
                  <strong>{sub.display_name}</strong>{" "}
                  <span style={{ color: "#aaaaaa" }}>
                    ({sub.platform} · {sub.identifier})
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(sub.id)}
                  style={{
                    background: "none",
                    border: "1px solid #444444",
                    borderRadius: 6,
                    color: "#ff6b6b",
                    cursor: "pointer",
                    fontSize: 12,
                    padding: "4px 8px",
                  }}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleAdd}
            style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}
          >
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              style={inputStyle}
            >
              <option value="youtube">YouTube</option>
              <option value="nebula">Nebula</option>
            </select>
            <input
              placeholder={platform === "youtube" ? "Channel ID (UCxxxx...)" : "Channel slug"}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={{ ...inputStyle, flex: "1 1 200px" }}
            />
            <input
              placeholder="Display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              style={{ ...inputStyle, flex: "1 1 160px" }}
            />
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "8px 14px",
                borderRadius: 6,
                border: "none",
                background: "#3ea6ff",
                color: "#0f0f0f",
                fontWeight: 600,
                fontSize: 13,
                cursor: submitting ? "default" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              Add
            </button>
          </form>

          {error && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 10 }}>{error}</div>}
        </div>
      )}
    </div>
  );
}
