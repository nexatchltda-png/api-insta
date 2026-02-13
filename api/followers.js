import axios from "axios";

export default async function handler(req, res) {

  // 🔥 HEADERS CORS
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

  const usernameRegex = /^[a-zA-Z0-9._]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({ error: "Username inválido" });
  }

  try {
    console.log("👥 Buscando seguidores de:", username);

    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-api-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}`,
      {
        directUrls: [`https://www.instagram.com/${username}/followers/`],
        resultsType: "followers", // 🔥 aqui muda
        resultsLimit: 30, // limite controlado para custo
        proxyConfiguration: {
          useApifyProxy: true,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000,
      }
    );

    let items = [];

    if (Array.isArray(response.data)) {
      items = response.data;
    } else if (Array.isArray(response.data?.data)) {
      items = response.data.data;
    } else if (Array.isArray(response.data?.items)) {
      items = response.data.items;
    }

    if (!items.length) {
      return res.status(404).json({
        error: "Nenhum seguidor encontrado",
      });
    }

    // 🔥 Normaliza resposta para seu front continuar funcionando
    const followers = items.map(follower => ({
      username: follower.username,
      full_name: follower.fullName,
      profile_pic_url: follower.profilePicUrl,
      verified: follower.verified,
    }));

    return res.status(200).json(followers);

  } catch (err) {
    console.error("❌ Erro followers:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Erro ao consultar seguidores",
      details: err.response?.data || err.message,
    });
  }
}
