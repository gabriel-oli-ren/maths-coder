import { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";

export default function Home() {
  const [token, setToken] = useState("");

  const [repo, setRepo] = useState("");
  const [repos, setRepos] = useState([]);

  const [files, setFiles] = useState([
    "README.md",
    "index.js",
    "app.js"
  ]);

  const [openTabs, setOpenTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);

  const [contentMap, setContentMap] = useState({});
  const [shaMap, setShaMap] = useState({});

  const [currentFile, setCurrentFile] = useState("");

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (t) setToken(t);
  }, []);

  const login = () => {
    window.location.href = "/api/login";
  };

  const loadRepos = async () => {
    const res = await fetch("/api/repos", {
      headers: { Authorization: token }
    });
    setRepos(await res.json());
  };

  // Open file into tab (Cursor-style behavior)
  const openFile = async (file) => {
    setCurrentFile(file);

    // if already open → just switch tab
    if (openTabs.includes(file)) {
      setActiveTab(file);
      return;
    }

    const res = await fetch(`/api/file?repo=${repo}&path=${file}`, {
      headers: { Authorization: token }
    });

    const data = await res.json();

    setContentMap((prev) => ({
      ...prev,
      [file]: data.content
    }));

    setShaMap((prev) => ({
      ...prev,
      [file]: data.sha
    }));

    setOpenTabs((prev) => [...prev, file]);
    setActiveTab(file);
  };

  const updateContent = (value) => {
    setContentMap((prev) => ({
      ...prev,
      [activeTab]: value
    }));
  };

  const saveFile = async () => {
    if (!activeTab) return;

    await fetch("/api/file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({
        repo,
        path: activeTab,
        content: contentMap[activeTab],
        sha: shaMap[activeTab]
      })
    });

    alert("Saved to GitHub!");
  };

  const closeTab = (file) => {
    setOpenTabs((tabs) => tabs.filter((t) => t !== file));

    if (activeTab === file) {
      setActiveTab(null);
    }
  };

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.logo}>⚡ Maths Coder</div>

        <button style={styles.button} onClick={login}>
          GitHub Login
        </button>

        <button style={styles.button} onClick={loadRepos}>
          Load Repos
        </button>

        <select
          style={styles.select}
          onChange={(e) => setRepo(e.target.value)}
        >
          <option>Select Repo</option>
          {repos.map((r) => (
            <option key={r.full_name} value={r.full_name}>
              {r.full_name}
            </option>
          ))}
        </select>

        <div style={styles.sectionTitle}>FILES</div>

        {files.map((f) => (
          <div
            key={f}
            onClick={() => openFile(f)}
            style={styles.file}
          >
            📄 {f}
          </div>
        ))}
      </div>

      {/* Main area */}
      <div style={styles.main}>

        {/* Tabs */}
        <div style={styles.tabs}>
          {openTabs.map((tab) => (
            <div
              key={tab}
              style={{
                ...styles.tab,
                backgroundColor:
                  tab === activeTab ? "#1f6feb" : "#161b22"
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
              <span
                style={styles.close}
                onClick={(e) => {
                  e.stopPropagation();
                  closeTab(tab);
                }}
              >
                ✕
              </span>
            </div>
          ))}

          <button style={styles.save} onClick={saveFile}>
            💾 Save
          </button>
        </div>

        {/* Editor */}
        <div style={styles.editor}>
          <Editor
            height="100%"
            theme="vs-dark"
            language="javascript"
            value={contentMap[activeTab] || ""}
            onChange={updateContent}
          />
        </div>
      </div>
    </div>
  );
}

/* 🎨 CURSOR-STYLE UI */
const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0d1117",
    color: "white",
    fontFamily: "Arial"
  },

  sidebar: {
    width: 260,
    background: "#161b22",
    padding: 12,
    borderRight: "1px solid #30363d"
  },

  logo: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10
  },

  button: {
    width: "100%",
    padding: 8,
    marginBottom: 8,
    background: "#238636",
    color: "white",
    border: "none",
    borderRadius: 6,
    cursor: "pointer"
  },

  select: {
    width: "100%",
    padding: 8,
    background: "#0d1117",
    color: "white",
    border: "1px solid #30363d",
    borderRadius: 6,
    marginBottom: 10
  },

  sectionTitle: {
    marginTop: 10,
    marginBottom: 5,
    fontSize: 12,
    color: "#8b949e"
  },

  file: {
    padding: 6,
    cursor: "pointer",
    borderRadius: 4
  },

  main: {
    flex: 1,
    display: "flex",
    flexDirection: "column"
  },

  tabs: {
    display: "flex",
    alignItems: "center",
    background: "#161b22",
    borderBottom: "1px solid #30363d"
  },

  tab: {
    padding: "8px 12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 8
  },

  close: {
    marginLeft: 8,
    cursor: "pointer"
  },

  save: {
    marginLeft: "auto",
    marginRight: 10,
    padding: "6px 10px",
    background: "#1f6feb",
    border: "none",
    borderRadius: 6,
    color: "white",
    cursor: "pointer"
  },

  editor: {
    flex: 1
  }
};
