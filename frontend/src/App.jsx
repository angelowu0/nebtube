import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function App() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/feed`, { cache: "no-store" })
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

  if (loading) return <div style={{ padding: 24, color: "#ffffff" }}>Loading feed...</div>;
  if (error) return <div style={{ padding: 24, color: "#ff6b6b" }}>Error: {error}</div>;

  return (
    <div style={{ maxWidth: 1500, margin: "0 auto", padding: 24, fontFamily: "sans-serif" }}>
      {videos.length === 0 && <p>No videos yet — check your backend's SEED_CHANNELS.</p>}
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