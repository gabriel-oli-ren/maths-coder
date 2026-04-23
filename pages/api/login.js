// pages/api/login.js
// Redirects the user to GitHub's OAuth authorization page.
// GITHUB_CLIENT_ID must be set in Vercel environment variables.

export default function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: "GITHUB_CLIENT_ID env var not set" });
  }

  // repo scope lets us read/write private repos; read:user lets us fetch the avatar
  const scope = "repo read:user";
  const params = new URLSearchParams({
    client_id: clientId,
    scope,
    // GitHub will redirect back to /api/callback after the user approves
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
}
