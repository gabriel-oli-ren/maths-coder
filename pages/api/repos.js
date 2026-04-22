import axios from "axios";

export default async function handler(req, res) {
  const token = req.headers.authorization;

  const result = await axios.get("https://api.github.com/user/repos", {
    headers: { Authorization: `Bearer ${token}` }
  });

  res.json(result.data);
}
