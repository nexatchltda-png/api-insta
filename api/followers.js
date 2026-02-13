import axios from "axios";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://www.instalker.store");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username obrigatório" });
  }

  try {

    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-api-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}`,
      {
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: "followers",
        resultsLimit: 50, // quantidade real de seguidores
        proxyConfiguration: {
          useApifyProxy: true,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 60000,
      }
    );

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.items || [];

    if (!data.length) {
      return res.status(404).json({ error: "Nenhum seguidor encontrado" });
    }

    const followers = data.map(follower => ({
      username: follower.username,
      full_name: follower.fullName,
      profile_pic_url: follower.profilePicUrl,
      verified: follower.verified
    }));

    return res.status(200).json(followers);

  } catch (err) {

    console.error("Erro:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Erro ao buscar seguidores reais",
      details: err.response?.data || err.message,
    });
  }
}
