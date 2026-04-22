import axios from "axios";

export default async function handler(req, res) {
  const code = req.query.code;

  const response = await axios.post(
    "https://github.com/login/oauth/access_token",
    {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code
    },
    { headers: { Accept: "application/json" } }
  );

  const token = response.data.access_token;

  res.redirect(`/?token=${token}`);
}
