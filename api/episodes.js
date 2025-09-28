// api/episodes.js - Vercel API Route (CORS proxy)
export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "Missing podcast ID parameter" });
  }

  try {
    // Proxy directo a iTunes API (server-side, sin CORS)
    const itunesUrl = `https://itunes.apple.com/lookup?id=${id}&media=podcast&entity=podcastEpisode&limit=20`;

    const response = await fetch(itunesUrl);

    if (!response.ok) {
      throw new Error(`iTunes API error: ${response.status}`);
    }

    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    console.error("Episodes API error:", error);
    res.status(500).json({ error: "Failed to fetch episodes" });
  }
}
