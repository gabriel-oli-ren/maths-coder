import { useEffect, useState } from "react";
    setCode(data.content);
    setSha(data.sha);
  };

  const saveFile = async () => {
    await fetch("/api/file", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ repo, path, content: code, sha })
    });

    alert("Saved to GitHub!");
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      {/* Sidebar */}
      <div style={{ width: 280, padding: 10 }}>
        <button onClick={login}>Login GitHub</button>

        <button onClick={loadRepos}>Load Repos</button>

        <select onChange={(e) => setRepo(e.target.value)}>
          <option>Select Repo</option>
          {repos.map(r => (
            <option key={r.full_name}>{r.full_name}</option>
          ))}
        </select>

        <input
          value={path}
          onChange={(e) => setPath(e.target.value)}
          placeholder="file path"
        />

        <button onClick={openFile}>Open File</button>
        <button onClick={saveFile}>Save</button>
      </div>

      {/* Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100vh"
          language="javascript"
          value={code}
          onChange={(v) => setCode(v || "")}
        />
      </div>
    </div>
  );
}
