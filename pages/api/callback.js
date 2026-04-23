// pages/api/callback.js
// GitHub redirects here with ?code=... after the user authorises.
// We exchange it for an access token server-side (so the client secret
// never leaves this function), store it in localStorage via a tiny HTML
// page, and redirect back to the app.
//
// Required Vercel environment variables:
//   GITHUB_CLIENT_ID     — e.g. Ov23li04TAhM9kZFepEk
//   GITHUB_CLIENT_SECRET — your client secret (keep this private!)

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.status(400).send("Missing OAuth code");
  }

  const clientId     = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return res.status(500).send("GitHub OAuth env vars not configured");
  }

  try {
    // Exchange the temporary code for a real access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id:     clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const data = await tokenRes.json();

    if (data.error || !data.access_token) {
      console.error("GitHub token exchange error:", data);
      return res.status(400).send(`GitHub OAuth error: ${data.error_description || data.error || "unknown"}`);
    }

    const token = data.access_token;

    // Store the token client-side via a tiny self-redirecting HTML page.
    // Using localStorage keeps things simple and avoids cookie/SameSite issues.
    const html = `<!DOCTYPE html>
<html>
<head><title>Signing in…</title></head>
<body>
  <script>
    try { localStorage.setItem('gh_token', ${JSON.stringify(token)}); } catch(e) {}
    window.location.replace('/');
  </script>
  <p>Redirecting…</p>
</body>
</html>`;

    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(html);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.status(500).send("Internal error during OAuth callback");
  }
}
