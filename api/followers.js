export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://www.instalker.store");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ error: "Username obrigatório" });
  }

  try {

    // Gera seguidores simulados
    const followers = [];

    for (let i = 1; i <= 30; i++) {
      followers.push({
        username: username + "_fan" + i,
        full_name: "Seguidor " + i,
        profile_pic_url: `https://i.pravatar.cc/150?img=${i}`
      });
    }

    return res.status(200).json(followers);

  } catch (err) {
    return res.status(500).json({ error: "Erro ao gerar seguidores" });
  }
}
