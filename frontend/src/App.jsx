import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import AuthForm from "../components/AuthForm";
import SubscriptionsPanel from "../components/SubscriptionsPanel";
import { AuthProvider } from "./auth.jsx";
import { useAuth } from "./AuthContext.js";
import * as api from "./api.js";

function Feed() {
  const { token, user, logout } = useAuth();
  const [videos, setVideos] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api.fetchFeed(token), api.fetchSubscriptions(token)])
      .then(([feedData, subsData]) => {
        if (cancelled) return;
        setVideos(feedData);
        setSubscriptions(subsData);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, refreshCount]);

  function refresh() {
    setLoading(true);
    setRefreshCount((c) => c + 1);
  }

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          color: "#ffffff",
        }}
      >
        <h1 style={{ fontSize: 20, margin: 0 }}>Nebtube</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 13 }}>
          <span style={{ color: "#aaaaaa" }}>{user?.email}</span>
          <button
            type="button"
            onClick={logout}
            style={{
              background: "none",
              border: "1px solid #444444",
              borderRadius: 6,
              color: "#ffffff",
              cursor: "pointer",
              padding: "6px 12px",
            }}
          >
            Log out
          </button>
        </div>
      </div>

      <SubscriptionsPanel subscriptions={subscriptions} onChange={refresh} />

      {error && <p style={{ color: "#ff6b6b" }}>Error: {error}</p>}
      {loading && <p style={{ color: "#ffffff" }}>Loading feed...</p>}
      {!loading && !error && videos.length === 0 && (
        <p style={{ color: "#ffffff" }}>
          No videos yet — add a subscription above to start seeing videos.
        </p>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(400px, 1fr))",
          gap: 16,
        }}
      >
        {videos.map((v) => (
          <VideoCard key={v.id} video={v} />
        ))}
      </div>
    </div>
  );
}

function AppShell() {
  const { token, ready } = useAuth();

  if (!ready) return <div style={{ padding: 24, color: "#ffffff" }}>Loading...</div>;
  if (!token) return <AuthForm />;
  return <Feed />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
