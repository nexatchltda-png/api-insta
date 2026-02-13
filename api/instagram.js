import axios from "axios";

export default async function handler(req, res) {

    // 🔥 HEADERS CORS MANUAL (garante funcionamento)
  res.setHeader("Access-Control-Allow-Origin", "https://www.instalker.store");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Responde preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  // Permitir apenas GET
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({
      error: "Username obrigatório",
    });
  }

  // Validação básica de segurança
  const usernameRegex = /^[a-zA-Z0-9._]+$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      error: "Username inválido",
    });
  }

  try {
    console.log("🔍 Buscando:", username);

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
        timeout: 15000, // importante para Vercel
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
        error: "Nenhum dado retornado",
      });
    }

    const user = items[0];

    if (!user?.username) {
      return res.status(404).json({
        error: "Perfil indisponível",
      });
    }

    return res.status(200).json({
      username: user.username,
      name: user.fullName,
      avatar: user.profilePicUrl,
      followers: user.followersCount,
      following: user.followsCount,
      posts: user.postsCount,
      private: user.private,
      verified: user.verified,
      biography: user.biography,
    });

  } catch (err) {
    console.error("❌ Erro:", err.response?.data || err.message);

    return res.status(500).json({
      error: "Erro ao consultar Instagram",
      details: err.response?.data || err.message,
    });
  }
}

