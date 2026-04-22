import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [token, setToken] = useState("");
  const [repos, setRepos] = useState([]);
  const [repo, setRepo] = useState("");
  const [path, setPath] = useState("README.md");
  const [code, setCode] = useState("");
  const [sha, setSha] = useState("");

  // Get token after GitHub login redirect
  useEffect(() => {
    const urlToken = new URLSearchParams(window.location.search).get("token");
    if (urlToken) setToken(urlToken);
  }, []);

  // GitHub login
  const login = () => {
    window.location.href = "/api/login";
  };

  // Load repos
  const loadRepos = async () => {
    const res = await fetch("/api/repos", {
      headers: { Authorization: token }
    });

    const data = await res.json();
    setRepos(data);
  };

  // Open file from repo
  const openFile = async () => {
    const res = await fetch(
      `/api/file?repo=${repo}&path=${path}`,
      {
        headers: { Authorization: token }
      }
    );

    const data = await res.json();

    setCode(data.content);
    setSha(data.sha);
  };

  // Save file to GitHub
  const saveFile = async () => {
    await fetch("/api/file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        repo,
        path,
        content: code,
        sha
      })
    });

    alert("Saved to GitHub!");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* Sidebar */}
      <div style={{ width: 280, padding: 10, borderRight: "1px solid #ddd" }}>
        <h2>⚡ Maths Coder</h2>

        <button onClick={login}>Login with GitHub</button>

        <br /><br />

        <button onClick={loadRepos}>Load Repos</button>

        <br /><br />

        <select onChange={(e) => setRepo(e.target.value)}>
          <option>Select Repository</option>
          {repos.map((r) => (
            <option key={r.full_name} value={r.full_name}>
              {r.full_name}
            </option>
          ))}
        </select>

        <br /><br />

        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="file path (e.g. index.js)"
        />

        <br /><br />

        <button onClick={openFile}>Open File</button>
        <button onClick={saveFile}>Save File</button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100vh"
          language="javascript"
          value={code}
          onChange={(value) => setCode(value || "")}
        />
      </div>
    </div>
  );
}
