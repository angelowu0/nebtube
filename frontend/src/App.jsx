import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/feed`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setVideos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading feed...</div>;
  if (error) return <div style={{ padding: 24, color: "red" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      <h1>Video Feed</h1>
      {videos.length === 0 && <p>No videos yet — check your backend's SEED_CHANNELS.</p>}
      <div style={{ display: "grid", gap: 16 }}>
        {videos.map((v) => (
          <a
            key={v.id}
            href={v.link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "flex",
              gap: 16,
              textDecoration: "none",
              color: "inherit",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: 12,
            }}
          >
            {v.thumbnail && (
              <img
                src={v.thumbnail}
                alt={v.title}
                style={{ width: 160, height: 90, objectFit: "cover", borderRadius: 4 }}
              />
            )}
            <div>
              <div style={{ fontSize: 12, textTransform: "uppercase", opacity: 0.6 }}>
                {v.platform} · {v.channel_name}
              </div>
              <div style={{ fontWeight: 600 }}>{v.title}</div>
              <div style={{ fontSize: 12, opacity: 0.6 }}>{formatDate(v.published_at)}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
