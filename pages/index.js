import { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";

// ─── Icons (inline SVG components) ───────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d={d} />
  </svg>
);
const IconGitHub    = () => <Icon d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />;
const IconFolder    = () => <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />;
const IconFile      = () => <Icon d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7" />;
const IconSearch    = () => <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" />;
const IconSave      = () => <Icon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" />;
const IconChevron   = ({ right }) => <Icon d={right ? "M9 18l6-6-6-6" : "M6 9l6 6 6-6"} size={12} />;
const IconDot       = () => <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#e5c07b", marginRight:4 }} />;
const IconBranch    = () => <Icon d="M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9" size={13} />;
const IconError     = () => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6" size={13} />;

// ─── File extension → language map ───────────────────────────────────────────
const langMap = { js:"javascript", jsx:"javascript", ts:"typescript", tsx:"typescript", py:"python", md:"markdown", json:"json", css:"css", html:"html", sh:"shell", yml:"yaml", yaml:"yaml" };
const getLang = (name) => langMap[(name||"").split(".").pop()] || "plaintext";

// ─── File icon colors ─────────────────────────────────────────────────────────
const fileColor = (name) => {
  const ext = (name||"").split(".").pop();
  const map = { js:"#f0db4f", jsx:"#61dafb", ts:"#3178c6", tsx:"#61dafb", py:"#4b8bbe", md:"#9ecbff", json:"#e5c07b", css:"#2196f3", html:"#e34c26", sh:"#89d185" };
  return map[ext] || "#abb2bf";
};

// ─── Fake file tree data ──────────────────────────────────────────────────────
const defaultTree = [
  { type:"folder", name:"src", open:true, children:[
    { type:"file", name:"index.js" },
    { type:"file", name:"App.jsx" },
    { type:"file", name:"styles.css" },
  ]},
  { type:"folder", name:"public", open:false, children:[
    { type:"file", name:"index.html" },
  ]},
  { type:"file", name:"package.json" },
  { type:"file", name:"README.md" },
];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Home() {
  const [token, setToken]           = useState("");
  const [repo, setRepo]             = useState("");
  const [repos, setRepos]           = useState([]);
  const [tree, setTree]             = useState(defaultTree);
  const [openTabs, setOpenTabs]     = useState([]);
  const [activeTab, setActiveTab]   = useState(null);
  const [contentMap, setContentMap] = useState({});
  const [shaMap, setShaMap]         = useState({});
  const [dirty, setDirty]           = useState({});          // unsaved indicator
  const [panel, setPanel]           = useState("explorer");  // explorer | search | git
  const [searchQ, setSearchQ]       = useState("");
  const [status, setStatus]         = useState("Ready");
  const [savedFlash, setSavedFlash] = useState(false);
  const [repoOpen, setRepoOpen]     = useState(false);
  const editorRef                   = useRef(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (t) setToken(t);
  }, []);

  const login = () => { window.location.href = "/api/login"; };

  const loadRepos = async () => {
    setStatus("Loading repos…");
    try {
      const res = await fetch("/api/repos", { headers: { Authorization: token } });
      setRepos(await res.json());
      setStatus("Repos loaded");
    } catch { setStatus("Error loading repos"); }
  };

  const openFile = async (fileName) => {
    if (openTabs.includes(fileName)) { setActiveTab(fileName); return; }
    setStatus(`Opening ${fileName}…`);
    try {
      const res  = await fetch(`/api/file?repo=${repo}&path=${fileName}`, { headers: { Authorization: token } });
      const data = await res.json();
      setContentMap(p => ({ ...p, [fileName]: data.content }));
      setShaMap(p    => ({ ...p, [fileName]: data.sha }));
      setOpenTabs(p  => [...p, fileName]);
      setActiveTab(fileName);
      setStatus(`Opened ${fileName}`);
    } catch {
      // fallback placeholder content
      const placeholder = `// ${fileName}\n// Connect to GitHub to load real content\n`;
      setContentMap(p => ({ ...p, [fileName]: placeholder }));
      setOpenTabs(p  => [...p, fileName]);
      setActiveTab(fileName);
      setStatus(fileName);
    }
  };

  const updateContent = (value) => {
    setContentMap(p => ({ ...p, [activeTab]: value }));
    setDirty(p => ({ ...p, [activeTab]: true }));
  };

  const saveFile = async () => {
    if (!activeTab) return;
    setStatus("Saving…");
    try {
      await fetch("/api/file", {
        method:"POST",
        headers: { "Content-Type":"application/json", Authorization: token },
        body: JSON.stringify({ repo, path: activeTab, content: contentMap[activeTab], sha: shaMap[activeTab] })
      });
      setDirty(p => ({ ...p, [activeTab]: false }));
      setStatus(`Saved ${activeTab}`);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    } catch { setStatus("Save failed"); }
  };

  // Ctrl+S
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveFile(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [activeTab, contentMap, shaMap]);

  const closeTab = (file, e) => {
    e?.stopPropagation();
    const idx  = openTabs.indexOf(file);
    const next = openTabs.filter(t => t !== file);
    setOpenTabs(next);
    setDirty(p => { const d = {...p}; delete d[file]; return d; });
    if (activeTab === file) setActiveTab(next[Math.max(0, idx-1)] || null);
  };

  const toggleFolder = (path) => {
    setTree(prev => toggleNode(prev, path));
  };

  const toggleNode = (nodes, target) =>
    nodes.map(n => n.name === target
      ? { ...n, open: !n.open }
      : n.children ? { ...n, children: toggleNode(n.children, target) } : n
    );

  // ── Render file tree recursively ──
  const renderTree = (nodes, depth=0) =>
    nodes.map(node => (
      <div key={node.name}>
        <div
          style={{ ...S.treeRow, paddingLeft: 10 + depth*14 }}
          onClick={() => node.type==="folder" ? toggleFolder(node.name) : openFile(node.name)}
          className="tree-row"
        >
          {node.type === "folder"
            ? <><span style={S.chevron}><IconChevron right={!node.open}/></span><span style={S.folderIcon}>📁</span><span style={S.treeName}>{node.name}</span></>
            : <><span style={{...S.fileIcon, color: fileColor(node.name)}}><IconFile/></span><span style={S.treeName}>{node.name}</span></>
          }
        </div>
        {node.type==="folder" && node.open && node.children && renderTree(node.children, depth+1)}
      </div>
    ));

  const filteredFiles = ["README.md","index.js","App.jsx","styles.css","package.json"].filter(f => f.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ── Activity Bar ── */}
      <div style={S.activityBar}>
        <div style={S.activityTop}>
          <ActivityBtn active={panel==="explorer"} onClick={() => setPanel(panel==="explorer"?null:"explorer")} title="Explorer">
            <IconFolder/>
          </ActivityBtn>
          <ActivityBtn active={panel==="search"} onClick={() => setPanel(panel==="search"?null:"search")} title="Search">
            <IconSearch/>
          </ActivityBtn>
          <ActivityBtn active={panel==="git"} onClick={() => setPanel(panel==="git"?null:"git")} title="Source Control">
            <IconBranch/>
          </ActivityBtn>
        </div>
        <div style={S.activityBottom}>
          <ActivityBtn onClick={login} title="GitHub Login">
            <IconGitHub/>
          </ActivityBtn>
        </div>
      </div>

      {/* ── Sidebar ── */}
      {panel && (
        <div style={S.sidebar}>
          {panel === "explorer" && (
            <>
              <div style={S.sidebarHeader}>
                <span style={S.sidebarTitle}>EXPLORER</span>
              </div>

              {/* Repo selector */}
              <div style={S.repoSection}>
                <div style={S.repoHeader} onClick={() => setRepoOpen(o=>!o)}>
                  <IconChevron right={!repoOpen}/>
                  <span style={{marginLeft:4, fontSize:11, color:"#8b949e", letterSpacing:"0.08em"}}>REPOSITORY</span>
                </div>
                {repoOpen && (
                  <div style={{padding:"6px 8px", display:"flex", flexDirection:"column", gap:4}}>
                    <input
                      style={S.input}
                      placeholder="GitHub token…"
                      type="password"
                      value={token}
                      onChange={e => setToken(e.target.value)}
                    />
                    <button style={S.smallBtn} onClick={loadRepos}>Load repos</button>
                    {repos.length > 0 && (
                      <select style={S.select} onChange={e => setRepo(e.target.value)}>
                        <option>Select repo…</option>
                        {repos.map(r => <option key={r.full_name} value={r.full_name}>{r.full_name}</option>)}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* File tree */}
              <div style={S.sidebarHeader}>
                <span style={S.sidebarTitle}>PROJECT</span>
              </div>
              <div style={S.fileTree}>
                {renderTree(tree)}
              </div>
            </>
          )}

          {panel === "search" && (
            <>
              <div style={S.sidebarHeader}><span style={S.sidebarTitle}>SEARCH</span></div>
              <div style={{padding:"8px"}}>
                <div style={S.searchBox}>
                  <span style={{opacity:.5, flexShrink:0}}><IconSearch/></span>
                  <input
                    autoFocus
                    style={S.searchInput}
                    placeholder="Search files…"
                    value={searchQ}
                    onChange={e => setSearchQ(e.target.value)}
                  />
                </div>
                <div style={{marginTop:8}}>
                  {filteredFiles.map(f => (
                    <div key={f} style={S.searchResult} onClick={() => openFile(f)} className="tree-row">
                      <span style={{color: fileColor(f), marginRight:6, flexShrink:0}}><IconFile/></span>
                      <span style={{fontSize:12.5, color:"#cdd6f4"}}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {panel === "git" && (
            <>
              <div style={S.sidebarHeader}><span style={S.sidebarTitle}>SOURCE CONTROL</span></div>
              <div style={{padding:"8px", color:"#8b949e", fontSize:12}}>
                {Object.keys(dirty).filter(k=>dirty[k]).length === 0
                  ? <div style={{padding:"12px 4px", textAlign:"center", opacity:.6}}>No changes</div>
                  : Object.keys(dirty).filter(k=>dirty[k]).map(f => (
                    <div key={f} style={{...S.searchResult, justifyContent:"space-between"}} className="tree-row">
                      <span style={{color:"#e5c07b", fontSize:12}}>{f}</span>
                      <span style={{color:"#e5c07b", fontSize:11}}>M</span>
                    </div>
                  ))
                }
              </div>
            </>
          )}
        </div>
      )}

      {/* ── Editor area ── */}
      <div style={S.editorArea}>

        {/* Title bar */}
        <div style={S.titleBar}>
          <span style={S.titleLogo}>⚡ Maths Coder</span>
          <div style={S.titleMenu}>
            {["File","Edit","View","Run","Terminal","Help"].map(m => (
              <span key={m} style={S.menuItem} className="menu-item">{m}</span>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div style={S.tabBar}>
          {openTabs.map(tab => (
            <div
              key={tab}
              style={{ ...S.tab, ...(tab===activeTab ? S.tabActive : S.tabInactive) }}
              onClick={() => setActiveTab(tab)}
              className="tab-hover"
            >
              <span style={{color: fileColor(tab), marginRight:5, flexShrink:0, opacity:.85}}><IconFile/></span>
              {dirty[tab] && <IconDot/>}
              <span style={S.tabName}>{tab}</span>
              <span
                style={S.tabClose}
                className="tab-close"
                onClick={e => closeTab(tab,e)}
              >✕</span>
            </div>
          ))}
          {activeTab && (
            <button
              style={{ ...S.saveBtn, ...(savedFlash ? S.saveBtnFlash : {}) }}
              onClick={saveFile}
              title="Save (Ctrl+S)"
            >
              <IconSave/>
              <span style={{marginLeft:5}}>Save</span>
            </button>
          )}
        </div>

        {/* Editor / Welcome */}
        <div style={S.monacoWrap}>
          {activeTab ? (
            <Editor
              height="100%"
              theme="vs-dark"
              language={getLang(activeTab)}
              value={contentMap[activeTab] || ""}
              onChange={updateContent}
              onMount={e => { editorRef.current = e; }}
              options={{
                fontSize: 13.5,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontLigatures: true,
                minimap: { enabled: true, scale: 0.8 },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "line",
                cursorBlinking: "smooth",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
                padding: { top: 12 },
                bracketPairColorization: { enabled: true },
                guides: { bracketPairs: true },
                overviewRulerBorder: false,
                renderWhitespace: "boundary",
                wordWrap: "off",
              }}
            />
          ) : (
            <Welcome onOpen={openFile} />
          )}
        </div>

        {/* Status bar */}
        <div style={S.statusBar}>
          <div style={S.statusLeft}>
            <span style={S.statusItem}><IconBranch/><span style={{marginLeft:4}}>main</span></span>
            <span style={S.statusItem}><IconError/><span style={{marginLeft:4}}>0</span><span style={{marginLeft:8}}>⚠ 0</span></span>
          </div>
          <div style={S.statusCenter}>
            <span style={{opacity:.7, fontSize:11}}>{status}</span>
          </div>
          <div style={S.statusRight}>
            {activeTab && <><span style={S.statusItem}>{getLang(activeTab).toUpperCase()}</span><span style={S.statusItem}>UTF-8</span><span style={S.statusItem}>LF</span></>}
            <span style={S.statusItem}>Ln 1, Col 1</span>
            <span style={{...S.statusItem, background:"#1f6feb", padding:"0 10px", height:"100%", display:"flex", alignItems:"center", cursor:"pointer"}}>⚡ Maths Coder</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────
function Welcome({ onOpen }) {
  const recents = ["index.js", "App.jsx", "README.md"];
  return (
    <div style={W.root}>
      <div style={W.inner}>
        <div style={W.logo}>⚡</div>
        <h1 style={W.title}>Maths Coder</h1>
        <p style={W.sub}>A lightweight GitHub editor. Open a file to get started.</p>
        <div style={W.grid}>
          <div style={W.col}>
            <div style={W.colTitle}>Recent</div>
            {recents.map(f => (
              <div key={f} style={W.link} onClick={() => onOpen(f)} className="tree-row">
                <span style={{color: fileColor(f), marginRight:6}}><IconFile/></span>{f}
              </div>
            ))}
          </div>
          <div style={W.col}>
            <div style={W.colTitle}>Help</div>
            <div style={W.link}><span style={{marginRight:6}}>📖</span>Documentation</div>
            <div style={W.link}><span style={{marginRight:6}}>⌨️</span>Keyboard Shortcuts</div>
            <div style={W.link}><span style={{marginRight:6}}>🐛</span>Report Issue</div>
          </div>
        </div>
        <div style={W.hint}>Ctrl+S to save · Ctrl+P to open file</div>
      </div>
    </div>
  );
}
const W = {
  root:    { flex:1, display:"flex", alignItems:"center", justifyContent:"center", background:"#0d1117" },
  inner:   { textAlign:"center", maxWidth:480 },
  logo:    { fontSize:48, marginBottom:8 },
  title:   { fontSize:28, fontWeight:700, color:"#e6edf3", margin:"0 0 8px", fontFamily:"'JetBrains Mono', monospace" },
  sub:     { color:"#8b949e", fontSize:13.5, margin:"0 0 32px" },
  grid:    { display:"flex", gap:40, justifyContent:"center", marginBottom:24 },
  col:     { textAlign:"left" },
  colTitle:{ color:"#8b949e", fontSize:11, letterSpacing:"0.1em", marginBottom:10, textTransform:"uppercase" },
  link:    { color:"#58a6ff", fontSize:13, cursor:"pointer", marginBottom:8, display:"flex", alignItems:"center" },
  hint:    { color:"#30363d", fontSize:11, letterSpacing:"0.08em" },
};

// ─── Activity Button ──────────────────────────────────────────────────────────
function ActivityBtn({ active, onClick, title, children }) {
  return (
    <div
      title={title}
      onClick={onClick}
      style={{
        width:48, height:48, display:"flex", alignItems:"center", justifyContent:"center",
        cursor:"pointer", color: active ? "#e6edf3" : "#8b949e",
        borderLeft: active ? "2px solid #1f6feb" : "2px solid transparent",
        transition:"all .15s",
      }}
      className="activity-btn"
    >
      {children}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
  root:         { display:"flex", height:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow:"hidden" },
  activityBar:  { width:48, background:"#161b22", display:"flex", flexDirection:"column", justifyContent:"space-between", borderRight:"1px solid #21262d", flexShrink:0, zIndex:10 },
  activityTop:  { display:"flex", flexDirection:"column" },
  activityBottom:{ display:"flex", flexDirection:"column" },
  sidebar:      { width:240, background:"#161b22", borderRight:"1px solid #21262d", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 },
  sidebarHeader:{ padding:"8px 12px 4px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  sidebarTitle: { fontSize:10.5, fontWeight:700, color:"#8b949e", letterSpacing:"0.1em" },
  editorArea:   { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  titleBar:     { height:30, background:"#161b22", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", paddingLeft:12, gap:16, flexShrink:0 },
  titleLogo:    { fontSize:12, fontWeight:700, color:"#e6edf3", fontFamily:"'JetBrains Mono', monospace", letterSpacing:".03em" },
  titleMenu:    { display:"flex", gap:0 },
  menuItem:     { fontSize:12, color:"#8b949e", padding:"0 10px", cursor:"pointer", height:30, display:"flex", alignItems:"center" },
  tabBar:       { display:"flex", alignItems:"stretch", background:"#0d1117", borderBottom:"1px solid #21262d", height:35, overflowX:"auto", flexShrink:0 },
  tab:          { display:"flex", alignItems:"center", padding:"0 10px", cursor:"pointer", position:"relative", fontSize:12.5, minWidth:0, flexShrink:0, gap:2, whiteSpace:"nowrap" },
  tabActive:    { background:"#0d1117", color:"#e6edf3", borderBottom:"1px solid #1f6feb" },
  tabInactive:  { background:"#161b22", color:"#8b949e", borderBottom:"1px solid transparent" },
  tabName:      { maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  tabClose:     { marginLeft:6, opacity:0, fontSize:10, lineHeight:1, padding:"1px 2px", borderRadius:3, transition:"opacity .15s" },
  saveBtn:      { marginLeft:"auto", marginRight:8, padding:"0 12px", background:"transparent", border:"1px solid #30363d", borderRadius:5, color:"#8b949e", cursor:"pointer", display:"flex", alignItems:"center", fontSize:12, transition:"all .15s", flexShrink:0 },
  saveBtnFlash: { background:"#1a7f37", borderColor:"#1a7f37", color:"white" },
  monacoWrap:   { flex:1, overflow:"hidden", display:"flex", flexDirection:"column" },
  statusBar:    { height:22, background:"#1f6feb", display:"flex", alignItems:"center", paddingLeft:0, flexShrink:0, fontSize:11 },
  statusLeft:   { display:"flex", alignItems:"center", gap:0, paddingLeft:8 },
  statusCenter: { flex:1, textAlign:"center", color:"rgba(255,255,255,.8)" },
  statusRight:  { display:"flex", alignItems:"center", height:"100%", gap:0 },
  statusItem:   { color:"rgba(255,255,255,.85)", padding:"0 8px", display:"flex", alignItems:"center", height:"100%", whiteSpace:"nowrap" },
  treeRow:      { display:"flex", alignItems:"center", padding:"2px 8px 2px 0", cursor:"pointer", fontSize:13, height:24, userSelect:"none", whiteSpace:"nowrap", overflow:"hidden" },
  chevron:      { width:16, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#8b949e" },
  folderIcon:   { marginRight:5, fontSize:13, flexShrink:0 },
  fileIcon:     { marginRight:6, flexShrink:0, display:"flex", alignItems:"center" },
  treeName:     { fontSize:13, overflow:"hidden", textOverflow:"ellipsis" },
  fileTree:     { overflowY:"auto", flex:1 },
  repoSection:  { borderBottom:"1px solid #21262d", paddingBottom:4 },
  repoHeader:   { display:"flex", alignItems:"center", padding:"6px 12px", cursor:"pointer", color:"#8b949e", fontSize:11 },
  input:        { width:"100%", padding:"5px 8px", background:"#0d1117", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:12, boxSizing:"border-box", outline:"none" },
  smallBtn:     { padding:"5px 8px", background:"#21262d", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:11.5, cursor:"pointer", width:"100%" },
  select:       { width:"100%", padding:"5px 8px", background:"#0d1117", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:12, outline:"none" },
  searchBox:    { display:"flex", alignItems:"center", gap:6, background:"#0d1117", border:"1px solid #30363d", borderRadius:5, padding:"5px 8px" },
  searchInput:  { background:"none", border:"none", outline:"none", color:"#e6edf3", fontSize:12.5, width:"100%" },
  searchResult: { display:"flex", alignItems:"center", padding:"4px 4px", cursor:"pointer", borderRadius:4, fontSize:12.5, color:"#8b949e" },
};

// ─── Global CSS ───────────────────────────────────────────────────────────────
const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { overflow: hidden; }
  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #484f58; }

  .activity-btn:hover { color: #e6edf3 !important; background: rgba(255,255,255,.05); }
  .tree-row:hover { background: rgba(255,255,255,.06) !important; color: #e6edf3; }
  .menu-item:hover { background: rgba(255,255,255,.07); color: #e6edf3 !important; }
  .tab-hover:hover .tab-close { opacity: 0.6 !important; }
  .tab-hover .tab-close:hover { opacity: 1 !important; background: rgba(255,255,255,.1); }
  button:hover { filter: brightness(1.15); }

  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
`;
