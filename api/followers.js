import axios from "axios";

export default async function handler(req, res) {

  // 🔥 CORS
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
    console.log("👤 Buscando perfil base:", username);

    // 🔥 Busca dados reais do perfil
    const response = await axios.post(
      `https://api.apify.com/v2/acts/apify~instagram-api-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_API_KEY}`,
      {
        directUrls: [`https://www.instagram.com/${username}/`],
        resultsType: "details",
        resultsLimit: 1,
        proxyConfiguration: {
          useApifyProxy: true,
        },
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000,
      }
    );

    const data = Array.isArray(response.data)
      ? response.data
      : response.data?.items || response.data?.data || [];

    if (!data.length) {
      return res.status(404).json({ error: "Perfil não encontrado" });
    }

    const user = data[0];

    // 🔥 Gera seguidores simulados baseados no perfil real
    const followers = Array.from({ length: 30 }, (_, i) => ({
      username: `${user.username}_fan${i + 1}`,
      full_name: `Seguidor ${i + 1}`,
      profile_pic_url: user.profilePicUrl,
      verified: false,
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
