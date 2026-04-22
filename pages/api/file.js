import axios from "axios";

export default async function handler(req, res) {
  const token = req.headers.authorization;

  if (req.method === "GET") {
    const { repo, path } = req.query;

    const file = await axios.get(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const content = Buffer.from(file.data.content, "base64").toString();

    return res.json({ content, sha: file.data.sha });
  }

  if (req.method === "POST") {
    const { repo, path, content, sha } = req.body;

    await axios.put(
      `https://api.github.com/repos/${repo}/contents/${path}`,
      {
        message: "Update from web editor",
        content: Buffer.from(content).toString("base64"),
        sha
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.json({ success: true });
  }
}
