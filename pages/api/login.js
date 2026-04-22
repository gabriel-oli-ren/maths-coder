export default function handler(req, res) {
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;

  res.redirect(
    `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=repo`
  );
}
