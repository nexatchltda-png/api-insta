import axios from "axios";

export default async function handler(req, res) {

  res.setHeader("Access-Control-Allow-Origin", "https://www.instalker.store");

  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: "URL obrigatória" });
  }

  try {
    const response = await axios.get(url, {
      responseType: "arraybuffer",
    });

    res.setHeader("Content-Type", response.headers["content-type"]);
    res.send(response.data);

  } catch (err) {
    res.status(500).json({ error: "Erro ao carregar imagem" });
  }
}
