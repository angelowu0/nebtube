import re
import feedparser
from datetime import datetime, timezone

IMG_SRC_RE = re.compile(r'<img[^>]+src="([^"]+)"')

YOUTUBE_FEED_URL = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"
NEBULA_FEED_URL = "https://rss.nebula.app/video/channels/{channel_slug}.rss"


def _parse_entry_youtube(entry, channel_display_name):
    # YouTube's feed includes a media:thumbnail field; feedparser exposes it
    # as entry.media_thumbnail (a list of dicts).
    thumbnail = None
    if hasattr(entry, "media_thumbnail") and entry.media_thumbnail:
        thumbnail = entry.media_thumbnail[0].get("url")

    return {
        "platform": "youtube",
        "title": entry.title,
        "link": entry.link,
        "thumbnail": thumbnail,
        "published_at": datetime(*entry.published_parsed[:6], tzinfo=timezone.utc),
        "channel_name": channel_display_name,
    }


def _parse_entry_nebula(entry, channel_display_name):
    # Nebula's RSS doesn't provide a structured thumbnail field — it embeds
    # an <img> tag inside the HTML `summary` field instead, so we pull it out
    # with a regex.
    thumbnail = None
    summary = entry.get("summary", "")
    match = IMG_SRC_RE.search(summary)
    if match:
        thumbnail = match.group(1)

    return {
        "platform": "nebula",
        "title": entry.title,
        "link": entry.link,
        "thumbnail": thumbnail,
        "published_at": datetime(*entry.published_parsed[:6], tzinfo=timezone.utc),
        "channel_name": channel_display_name,
    }


def fetch_channel_videos(platform: str, identifier: str, display_name: str):
    """Fetch and normalize videos for a single channel on a given platform."""
    if platform == "youtube":
        url = YOUTUBE_FEED_URL.format(channel_id=identifier)
        parser_fn = _parse_entry_youtube
    elif platform == "nebula":
        url = NEBULA_FEED_URL.format(channel_slug=identifier)
        parser_fn = _parse_entry_nebula
    else:
        raise ValueError(f"Unknown platform: {platform}")

    parsed = feedparser.parse(url)

    videos = []
    for entry in parsed.entries:
        try:
            videos.append(parser_fn(entry, display_name))
        except Exception:
            # Skip entries that don't parse cleanly rather than failing the whole feed
            continue

    return videos