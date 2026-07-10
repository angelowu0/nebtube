function formatDate(iso) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  
  export default function VideoCard({ video }) {
    return (
      <a
        href={video.link}
        target="_blank"
        rel="noreferrer"
        className="video-card"
        style={{
          display: "flex",
          flexDirection: "column",
          textDecoration: "none",
          color: "#ffffff",
          fontFamily: "Roboto, Arial, sans-serif",
          padding: 8,
          margin: -8,
        }}
      >
        {video.thumbnail && (
          <img
            src={video.thumbnail}
            alt={video.title}
            style={{
              width: "100%",
              aspectRatio: "16 / 9",
              objectFit: "cover",
              borderRadius: 12,
            }}
          />
        )}
        <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
          <div style={{ minWidth: 0, textAlign: "left" }}>
            <div
              style={{
                fontSize: 15,
                fontWeight: 500,
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {video.title}
            </div>
            <div style={{ fontSize: 13, color: "#aaaaaa", marginTop: 4 }}>
              {video.channel_name + " • " + formatDate(video.published_at)}
            </div>
          </div>
        </div>
      </a>
    );
  }