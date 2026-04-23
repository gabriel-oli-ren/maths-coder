import { useEffect, useState, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 16, color = "currentColor", strokeWidth = 1.8, ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" {...props}>
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
);

const IconGitHub   = () => <Icon d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />;
const IconFolder   = () => <Icon d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />;
const IconFile     = () => <Icon d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z M13 2v7h7" />;
const IconSearch   = () => <Icon d="M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0" />;
const IconSave     = () => <Icon d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z M17 21v-8H7v8 M7 3v5h8" />;
const IconChevron  = ({ right }) => <Icon d={right ? "M9 18l6-6-6-6" : "M6 9l6 6 6-6"} size={12} />;
const IconDot      = () => <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", background:"#e5c07b", marginRight:4 }} />;
const IconBranch   = () => <Icon d="M6 3v12 M18 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M18 9a9 9 0 0 1-9 9" size={13} />;
const IconError    = () => <Icon d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M15 9l-6 6 M9 9l6 6" size={13} />;
const IconBot      = () => <Icon d={["M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z","M3 14v7a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-7","M8 14v4","M16 14v4","M12 14v4"]} size={16} />;
const IconSend     = () => <Icon d="M22 2L11 13 M22 2L15 22 8.5 13 2 9.5z" size={15} />;
const IconStop     = () => <Icon d="M8 8h8v8H8z M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z" size={15} />;
const IconCopy     = () => <Icon d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2 M8 4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2z" size={13} />;
const IconInsert   = () => <Icon d="M12 5v14 M5 12l7 7 7-7" size={13} />;
const IconKey      = () => <Icon d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" size={15} />;
const IconX        = () => <Icon d="M18 6 6 18 M6 6l12 12" size={13} />;
const IconSettings = () => <Icon d={["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z","M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"]} size={15} />;
const IconSparkle  = () => <Icon d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" size={15} />;

// ─── File extension → language ─────────────────────────────────────────────
const langMap = { js:"javascript", jsx:"javascript", ts:"typescript", tsx:"typescript", py:"python", md:"markdown", json:"json", css:"css", html:"html", sh:"shell", yml:"yaml", yaml:"yaml" };
const getLang = (name) => langMap[(name||"").split(".").pop()] || "plaintext";

const fileColor = (name) => {
  const ext = (name||"").split(".").pop();
  const map = { js:"#f0db4f", jsx:"#61dafb", ts:"#3178c6", tsx:"#61dafb", py:"#4b8bbe", md:"#9ecbff", json:"#e5c07b", css:"#2196f3", html:"#e34c26", sh:"#89d185" };
  return map[ext] || "#abb2bf";
};

// ─── Default file tree ─────────────────────────────────────────────────────
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

// ─── Markdown-like code block renderer ───────────────────────────────────
function MessageContent({ text, onInsert, onCopy }) {
  const parts = [];
  const codeBlockRe = /```(\w*)\n?([\s\S]*?)```/g;
  let last = 0, m;
  while ((m = codeBlockRe.exec(text)) !== null) {
    if (m.index > last) parts.push({ type: "text", content: text.slice(last, m.index) });
    parts.push({ type: "code", lang: m[1] || "plaintext", content: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push({ type: "text", content: text.slice(last) });

  return (
    <div>
      {parts.map((p, i) =>
        p.type === "text" ? (
          <span key={i} style={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{p.content}</span>
        ) : (
          <div key={i} style={CS.codeBlock}>
            <div style={CS.codeBlockHeader}>
              <span style={CS.codeLang}>{p.lang}</span>
              <div style={{ display:"flex", gap:4 }}>
                {onInsert && (
                  <button style={CS.codeAction} onClick={() => onInsert(p.content)} title="Insert into editor">
                    <IconInsert /> <span style={{ fontSize: 10, marginLeft: 3 }}>Insert</span>
                  </button>
                )}
                <button style={CS.codeAction} onClick={() => { navigator.clipboard.writeText(p.content); onCopy?.(); }} title="Copy">
                  <IconCopy /> <span style={{ fontSize: 10, marginLeft: 3 }}>Copy</span>
                </button>
              </div>
            </div>
            <pre style={CS.codePre}><code>{p.content}</code></pre>
          </div>
        )
      )}
    </div>
  );
}

// ─── Typing indicator ──────────────────────────────────────────────────────
function TypingDots() {
  return (
    <div style={CS.typingDots}>
      {[0,1,2].map(i => <span key={i} style={{ ...CS.dot, animationDelay: `${i * 0.18}s` }} />)}
    </div>
  );
}

// ─── AI Chat Panel ─────────────────────────────────────────────────────────
function AIChat({ contentMap, activeTab, onInsert }) {
  const [messages, setMessages]       = useState([
    { role: "assistant", content: "Hey! I'm your AI coding assistant. I can see all your open files and the active editor. Ask me anything — explain code, fix bugs, refactor, write new code, or anything else." }
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [apiKey, setApiKey]           = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [model, setModel]             = useState("anthropic/claude-3.5-sonnet");

  // Hydrate from localStorage only on the client (avoids Next.js SSR crash)
  useEffect(() => {
    const savedKey   = localStorage.getItem("openrouter_key");
    const savedModel = localStorage.getItem("openrouter_model");
    if (savedKey)   setApiKey(savedKey);
    if (savedModel) setModel(savedModel);
  }, []);
  const [copiedIdx, setCopiedIdx]     = useState(null);
  const [streamText, setStreamText]   = useState("");
  const abortRef                      = useRef(null);
  const bottomRef                     = useRef(null);
  const inputRef                      = useRef(null);

  const MODELS = [
    { id: "anthropic/claude-3.5-sonnet",   label: "Claude 3.5 Sonnet" },
    { id: "anthropic/claude-3-haiku",      label: "Claude 3 Haiku (fast)" },
    { id: "openai/gpt-4o",                 label: "GPT-4o" },
    { id: "openai/gpt-4o-mini",            label: "GPT-4o Mini" },
    { id: "google/gemini-pro-1.5",         label: "Gemini Pro 1.5" },
    { id: "meta-llama/llama-3.1-70b-instruct", label: "Llama 3.1 70B" },
    { id: "deepseek/deepseek-coder",       label: "DeepSeek Coder" },
  ];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, streamText, loading]);

  const buildSystemPrompt = () => {
    const files = Object.entries(contentMap);
    let context = `You are an expert coding assistant embedded inside "Maths Coder", a GitHub-based code editor. You have full visibility into the user's open files.\n\n`;
    if (activeTab) {
      context += `## Currently Active File: ${activeTab}\n\`\`\`${getLang(activeTab)}\n${contentMap[activeTab] || "(empty)"}\n\`\`\`\n\n`;
    }
    if (files.length > 1) {
      context += `## Other Open Files:\n`;
      files.filter(([n]) => n !== activeTab).forEach(([name, content]) => {
        const preview = (content || "").split("\n").slice(0, 40).join("\n");
        context += `### ${name}\n\`\`\`${getLang(name)}\n${preview}${(content||"").split("\n").length > 40 ? "\n... (truncated)" : ""}\n\`\`\`\n\n`;
      });
    }
    if (files.length === 0) context += "No files are currently open.\n\n";
    context += `When providing code, always use fenced code blocks with the correct language tag. Be concise and direct. If asked to modify a file, show only the changed section unless a full rewrite is needed.`;
    return context;
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!apiKey) { setShowSettings(true); return; }

    const userMsg = { role: "user", content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamText("");

    const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }));

    abortRef.current = new AbortController();
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": window.location.href,
          "X-Title": "Maths Coder AI",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: buildSystemPrompt() }, ...apiMessages],
          stream: true,
          max_tokens: 4096,
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        for (const line of chunk.split("\n")) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") break;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content || "";
            full += delta;
            setStreamText(full);
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: full }]);
      setStreamText("");
    } catch (e) {
      if (e.name !== "AbortError") {
        setMessages(prev => [...prev, { role: "assistant", content: `⚠️ Error: ${e.message}` }]);
        setStreamText("");
      }
    } finally {
      setLoading(false);
      abortRef.current = null;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const stopGeneration = () => {
    abortRef.current?.abort();
    if (streamText) {
      setMessages(prev => [...prev, { role: "assistant", content: streamText + "\n\n*(stopped)*" }]);
      setStreamText("");
    }
    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const saveSettings = () => {
    localStorage.setItem("openrouter_key", apiKey);
    localStorage.setItem("openrouter_model", model);
    setShowSettings(false);
  };

  const clearChat = () => {
    setMessages([{ role: "assistant", content: "Chat cleared! I can still see all your open files. How can I help?" }]);
  };

  // quick prompts based on active file
  const quickPrompts = [
    "Explain this file",
    "Find bugs",
    "Refactor this",
    "Write tests",
    "Add comments",
    "Optimize performance",
  ];

  return (
    <div style={CS.root}>
      {/* Header */}
      <div style={CS.header}>
        <div style={CS.headerLeft}>
          <div style={CS.botIcon}><IconBot /></div>
          <div>
            <div style={CS.headerTitle}>AI Assistant</div>
            <div style={CS.headerSub}>{MODELS.find(m2 => m2.id === model)?.label || model}</div>
          </div>
        </div>
        <div style={{ display:"flex", gap:2 }}>
          <button style={CS.iconBtn} onClick={clearChat} title="Clear chat">
            <IconX />
          </button>
          <button style={CS.iconBtn} onClick={() => setShowSettings(s => !s)} title="Settings">
            <IconSettings />
          </button>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={CS.settingsPanel}>
          <div style={CS.settingsTitle}><IconKey /> API Key & Model</div>
          <input
            style={CS.settingsInput}
            type="password"
            placeholder="OpenRouter API key (sk-or-...)"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
          />
          <select style={CS.settingsSelect} value={model} onChange={e => setModel(e.target.value)}>
            {MODELS.map(m2 => <option key={m2.id} value={m2.id}>{m2.label}</option>)}
          </select>
          <div style={{ display:"flex", gap:6 }}>
            <button style={CS.settingsSave} onClick={saveSettings}>Save</button>
            <button style={CS.settingsCancel} onClick={() => setShowSettings(false)}>Cancel</button>
          </div>
          <div style={CS.settingsHint}>
            Get your API key at <a href="https://openrouter.ai/keys" target="_blank" rel="noreferrer" style={{ color:"#58a6ff" }}>openrouter.ai/keys</a>
          </div>
        </div>
      )}

      {/* File context badge */}
      {activeTab && (
        <div style={CS.contextBadge}>
          <span style={{ color: fileColor(activeTab), marginRight: 5, display:"flex" }}><IconFile /></span>
          <span style={{ color:"#8b949e", fontSize: 10 }}>Context: </span>
          <span style={{ marginLeft: 4, color:"#cdd6f4", fontSize: 10 }}>{activeTab}</span>
          {Object.keys(contentMap).length > 1 && (
            <span style={{ marginLeft:4, color:"#484f58", fontSize:10 }}>+{Object.keys(contentMap).length - 1} more</span>
          )}
        </div>
      )}

      {/* Messages */}
      <div style={CS.messages}>
        {messages.map((msg, i) => (
          <div key={i} style={msg.role === "user" ? CS.userBubbleWrap : CS.assistantBubbleWrap}>
            {msg.role === "assistant" && (
              <div style={CS.avatarBot}><IconSparkle /></div>
            )}
            <div style={msg.role === "user" ? CS.userBubble : CS.assistantBubble}>
              <MessageContent
                text={msg.content}
                onInsert={msg.role === "assistant" ? onInsert : null}
                onCopy={msg.role === "assistant" ? () => { setCopiedIdx(i); setTimeout(() => setCopiedIdx(null), 1500); } : null}
              />
              {copiedIdx === i && <span style={CS.copiedFlash}>Copied!</span>}
            </div>
            {msg.role === "user" && (
              <div style={CS.avatarUser}>U</div>
            )}
          </div>
        ))}

        {/* Streaming */}
        {loading && streamText && (
          <div style={CS.assistantBubbleWrap}>
            <div style={CS.avatarBot}><IconSparkle /></div>
            <div style={CS.assistantBubble}>
              <MessageContent text={streamText} onInsert={onInsert} />
            </div>
          </div>
        )}
        {loading && !streamText && (
          <div style={CS.assistantBubbleWrap}>
            <div style={CS.avatarBot}><IconSparkle /></div>
            <div style={{ ...CS.assistantBubble, padding:"10px 14px" }}>
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick prompts */}
      {messages.length <= 1 && (
        <div style={CS.quickPrompts}>
          {quickPrompts.map(q => (
            <button key={q} style={CS.quickBtn} onClick={() => { setInput(q); setTimeout(() => inputRef.current?.focus(), 50); }}>
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input area */}
      <div style={CS.inputArea}>
        <textarea
          ref={inputRef}
          style={CS.textarea}
          placeholder={apiKey ? "Ask anything about your code… (Enter to send, Shift+Enter for newline)" : "Add your OpenRouter API key in settings to start chatting →"}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          onInput={e => {
            e.target.style.height = "auto";
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
          }}
        />
        <div style={CS.inputActions}>
          {!apiKey && (
            <button style={CS.apiKeyBtn} onClick={() => setShowSettings(true)}>
              <IconKey /> API Key
            </button>
          )}
          {loading ? (
            <button style={CS.stopBtn} onClick={stopGeneration}>
              <IconStop />
            </button>
          ) : (
            <button style={{ ...CS.sendBtn, opacity: (!input.trim() || !apiKey) ? 0.4 : 1 }} onClick={sendMessage} disabled={!input.trim() || !apiKey}>
              <IconSend />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Chat styles ──────────────────────────────────────────────────────────
const CS = {
  root:              { width: 320, background:"#0d1117", borderRight:"1px solid #21262d", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 },
  header:            { padding:"10px 12px", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", justifyContent:"space-between", background:"#161b22", flexShrink:0 },
  headerLeft:        { display:"flex", alignItems:"center", gap:8 },
  botIcon:           { width:28, height:28, borderRadius:"50%", background:"linear-gradient(135deg, #1f6feb, #58a6ff)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  headerTitle:       { fontSize:12, fontWeight:700, color:"#e6edf3", letterSpacing:".03em" },
  headerSub:         { fontSize:10, color:"#484f58", marginTop:1 },
  iconBtn:           { background:"none", border:"none", color:"#8b949e", cursor:"pointer", padding:4, borderRadius:4, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s" },
  settingsPanel:     { background:"#161b22", borderBottom:"1px solid #21262d", padding:"10px 12px", display:"flex", flexDirection:"column", gap:6, flexShrink:0 },
  settingsTitle:     { fontSize:11, color:"#8b949e", display:"flex", alignItems:"center", gap:5, marginBottom:2 },
  settingsInput:     { width:"100%", padding:"6px 8px", background:"#0d1117", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:11.5, outline:"none", boxSizing:"border-box" },
  settingsSelect:    { width:"100%", padding:"5px 8px", background:"#0d1117", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:11.5, outline:"none" },
  settingsSave:      { flex:1, padding:"5px 10px", background:"#1f6feb", border:"none", borderRadius:5, color:"white", fontSize:11.5, cursor:"pointer", fontWeight:600 },
  settingsCancel:    { flex:1, padding:"5px 10px", background:"#21262d", border:"1px solid #30363d", borderRadius:5, color:"#8b949e", fontSize:11.5, cursor:"pointer" },
  settingsHint:      { fontSize:10, color:"#484f58" },
  contextBadge:      { display:"flex", alignItems:"center", padding:"4px 12px", background:"#0d1117", borderBottom:"1px solid #21262d", flexShrink:0 },
  messages:          { flex:1, overflowY:"auto", padding:"10px 10px", display:"flex", flexDirection:"column", gap:10 },
  userBubbleWrap:    { display:"flex", gap:6, justifyContent:"flex-end", alignItems:"flex-start" },
  assistantBubbleWrap:{ display:"flex", gap:6, justifyContent:"flex-start", alignItems:"flex-start" },
  avatarBot:         { width:22, height:22, borderRadius:"50%", background:"linear-gradient(135deg,#1f6feb,#58a6ff)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 },
  avatarUser:        { width:22, height:22, borderRadius:"50%", background:"#21262d", border:"1px solid #30363d", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:10, color:"#8b949e", marginTop:1 },
  userBubble:        { background:"#1f6feb", color:"white", borderRadius:"12px 12px 2px 12px", padding:"8px 12px", fontSize:12.5, maxWidth:"80%", lineHeight:1.5 },
  assistantBubble:   { background:"#161b22", border:"1px solid #21262d", color:"#e6edf3", borderRadius:"12px 12px 12px 2px", padding:"8px 12px", fontSize:12.5, maxWidth:"calc(100% - 30px)", lineHeight:1.5 },
  copiedFlash:       { fontSize:10, color:"#3fb950", marginTop:4, display:"block" },
  quickPrompts:      { padding:"8px 10px", borderTop:"1px solid #21262d", display:"flex", flexWrap:"wrap", gap:5, flexShrink:0 },
  quickBtn:          { padding:"4px 8px", background:"#161b22", border:"1px solid #21262d", borderRadius:12, color:"#8b949e", fontSize:10.5, cursor:"pointer", transition:"all .15s", whiteSpace:"nowrap" },
  inputArea:         { padding:"8px 10px", borderTop:"1px solid #21262d", background:"#0d1117", display:"flex", gap:6, alignItems:"flex-end", flexShrink:0 },
  textarea:          { flex:1, background:"#161b22", border:"1px solid #30363d", borderRadius:8, color:"#e6edf3", fontSize:12, padding:"8px 10px", outline:"none", resize:"none", fontFamily:"inherit", lineHeight:1.5, minHeight:36, maxHeight:120, overflowY:"auto" },
  inputActions:      { display:"flex", gap:5, alignItems:"center", flexShrink:0 },
  sendBtn:           { width:32, height:32, background:"#1f6feb", border:"none", borderRadius:8, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s", flexShrink:0 },
  stopBtn:           { width:32, height:32, background:"#da3633", border:"none", borderRadius:8, color:"white", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s", flexShrink:0 },
  apiKeyBtn:         { padding:"5px 8px", background:"#21262d", border:"1px solid #30363d", borderRadius:6, color:"#8b949e", fontSize:10.5, cursor:"pointer", display:"flex", alignItems:"center", gap:4, whiteSpace:"nowrap" },
  codeBlock:         { background:"#0d1117", border:"1px solid #30363d", borderRadius:6, overflow:"hidden", margin:"6px 0", fontSize:11 },
  codeBlockHeader:   { background:"#161b22", padding:"4px 8px", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", justifyContent:"space-between" },
  codeLang:          { fontSize:10, color:"#8b949e", fontFamily:"'JetBrains Mono', monospace", textTransform:"uppercase" },
  codeAction:        { background:"none", border:"none", color:"#58a6ff", cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", padding:"2px 4px", borderRadius:3 },
  codePre:           { padding:"8px 10px", overflowX:"auto", fontFamily:"'JetBrains Mono', monospace", fontSize:11, color:"#e6edf3", lineHeight:1.5, whiteSpace:"pre", margin:0 },
  typingDots:        { display:"flex", gap:4, alignItems:"center" },
  dot:               { width:6, height:6, borderRadius:"50%", background:"#484f58", animation:"bounce 1s infinite ease-in-out", display:"inline-block" },
};

// ─── Toggle tree node ─────────────────────────────────────────────────────
const toggleNode = (nodes, target) =>
  nodes.map(n => n.name === target
    ? { ...n, open: !n.open }
    : n.children ? { ...n, children: toggleNode(n.children, target) } : n
  );

// ─── Main Component ───────────────────────────────────────────────────────
export default function Home() {
  const [token, setToken]           = useState("");
  const [repo, setRepo]             = useState("");
  const [repos, setRepos]           = useState([]);
  const [tree, setTree]             = useState(defaultTree);
  const [openTabs, setOpenTabs]     = useState([]);
  const [activeTab, setActiveTab]   = useState(null);
  const [contentMap, setContentMap] = useState({});
  const [shaMap, setShaMap]         = useState({});
  const [dirty, setDirty]           = useState({});
  const [panel, setPanel]           = useState("explorer");
  const [searchQ, setSearchQ]       = useState("");
  const [status, setStatus]         = useState("Ready");
  const [savedFlash, setSavedFlash] = useState(false);
  const [repoOpen, setRepoOpen]     = useState(false);
  const [showChat, setShowChat]     = useState(true);
  const editorRef                   = useRef(null);

  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("gh_token");
    if (stored) {
      setToken(stored);
      fetch("https://api.github.com/user", { headers: { Authorization: `Bearer ${stored}` } })
        .then(r => r.ok ? r.json() : null)
        .then(u => { if (u) setUser(u); })
        .catch(() => {});
    }
  }, []);

  const login  = () => { window.location.href = "/api/login"; };
  const logout = () => { localStorage.removeItem("gh_token"); setToken(""); setUser(null); setRepos([]); setRepo(""); };

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

  const saveFile = useCallback(async () => {
    if (!activeTab) return;
    setStatus("Saving…");
    try {
      await fetch("/api/file", {
        method: "POST",
        headers: { "Content-Type":"application/json", Authorization: token },
        body: JSON.stringify({ repo, path: activeTab, content: contentMap[activeTab], sha: shaMap[activeTab] })
      });
      setDirty(p => ({ ...p, [activeTab]: false }));
      setStatus(`Saved ${activeTab}`);
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1200);
    } catch { setStatus("Save failed"); }
  }, [activeTab, contentMap, shaMap, repo, token]);

  // Ctrl+S
  useEffect(() => {
    const handler = (e) => { if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); saveFile(); } };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [saveFile]);

  const closeTab = (file, e) => {
    e?.stopPropagation();
    const idx  = openTabs.indexOf(file);
    const next = openTabs.filter(t => t !== file);
    setOpenTabs(next);
    setDirty(p => { const d = {...p}; delete d[file]; return d; });
    if (activeTab === file) setActiveTab(next[Math.max(0, idx-1)] || null);
  };

  const toggleFolder = (path) => setTree(prev => toggleNode(prev, path));

  const renderTree = (nodes, depth = 0) =>
    nodes.map(node => (
      <div key={node.name}>
        <div
          style={{ ...S.treeRow, paddingLeft: 10 + depth*14, background: node.name === activeTab ? "rgba(31,111,235,.15)" : undefined }}
          onClick={() => node.type === "folder" ? toggleFolder(node.name) : openFile(node.name)}
          className="tree-row"
        >
          {node.type === "folder"
            ? <><span style={S.chevron}><IconChevron right={!node.open}/></span><span style={S.folderIcon}>📁</span><span style={S.treeName}>{node.name}</span></>
            : <><span style={{...S.fileIcon, color: fileColor(node.name)}}><IconFile/></span><span style={S.treeName}>{node.name}</span></>
          }
        </div>
        {node.type === "folder" && node.open && node.children && renderTree(node.children, depth + 1)}
      </div>
    ));

  const filteredFiles = ["README.md","index.js","App.jsx","styles.css","package.json"].filter(f => f.toLowerCase().includes(searchQ.toLowerCase()));

  // Insert code at cursor in editor
  const insertIntoEditor = (code) => {
    if (editorRef.current) {
      const editor = editorRef.current;
      const selection = editor.getSelection();
      editor.executeEdits("ai-insert", [{ range: selection, text: code }]);
      editor.focus();
    }
  };

  return (
    <div style={S.root}>
      <style>{CSS}</style>

      {/* ── AI Chat Panel (left) ── */}
      {showChat && (
        <AIChat
          contentMap={contentMap}
          activeTab={activeTab}
          onInsert={insertIntoEditor}
        />
      )}

      {/* ── Activity Bar ── */}
      <div style={S.activityBar}>
        <div style={S.activityTop}>
          <ActivityBtn active={showChat} onClick={() => setShowChat(s => !s)} title="AI Assistant">
            <IconBot />
          </ActivityBtn>
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
          {user
            ? <div title={`Signed in as ${user.login} — click to sign out`} onClick={logout} style={{width:48,height:48,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",borderLeft:"2px solid transparent"}}>
                <img src={user.avatar_url} alt={user.login} style={{width:26,height:26,borderRadius:"50%",border:"2px solid #1f6feb"}}/>
              </div>
            : <ActivityBtn onClick={login} title="Sign in with GitHub">
                <IconGitHub/>
              </ActivityBtn>
          }
        </div>
      </div>

      {/* ── File Explorer Sidebar ── */}
      {panel && (
        <div style={S.sidebar}>
          {panel === "explorer" && (
            <>
              <div style={S.sidebarHeader}>
                <span style={S.sidebarTitle}>EXPLORER</span>
              </div>
              <div style={S.repoSection}>
                {!token ? (
                  <div style={{padding:"10px 12px"}}>
                    <button style={{...S.smallBtn, display:"flex", alignItems:"center", justifyContent:"center", gap:6, background:"#238636", borderColor:"#2ea043", color:"white", fontWeight:600}} onClick={login}>
                      <IconGitHub/> Sign in with GitHub
                    </button>
                    <div style={{fontSize:10, color:"#484f58", marginTop:6, textAlign:"center"}}>Connect GitHub to browse repos</div>
                  </div>
                ) : (
                  <>
                    {user && (
                      <div style={{padding:"8px 12px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #21262d"}}>
                        <img src={user.avatar_url} alt={user.login} style={{width:24,height:24,borderRadius:"50%"}}/>
                        <div style={{flex:1, minWidth:0}}>
                          <div style={{fontSize:12, color:"#e6edf3", fontWeight:600, overflow:"hidden", textOverflow:"ellipsis"}}>{user.login}</div>
                          <div style={{fontSize:10, color:"#8b949e"}}>GitHub</div>
                        </div>
                        <button onClick={logout} style={{background:"none",border:"none",color:"#8b949e",cursor:"pointer",fontSize:10,padding:"2px 4px"}}>Sign out</button>
                      </div>
                    )}
                    <div style={S.repoHeader} onClick={() => setRepoOpen(o=>!o)}>
                      <IconChevron right={!repoOpen}/>
                      <span style={{marginLeft:4, fontSize:11, color:"#8b949e", letterSpacing:"0.08em"}}>REPOSITORY</span>
                    </div>
                    {repoOpen && (
                      <div style={{padding:"6px 8px", display:"flex", flexDirection:"column", gap:4}}>
                        <button style={S.smallBtn} onClick={loadRepos}>Load repos</button>
                        {repos.length > 0 && (
                          <select style={S.select} onChange={e => setRepo(e.target.value)}>
                            <option>Select repo…</option>
                            {repos.map(r => <option key={r.full_name} value={r.full_name}>{r.full_name}</option>)}
                          </select>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
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
              <span style={S.tabClose} className="tab-close" onClick={e => closeTab(tab,e)}>✕</span>
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
            <span
              style={{...S.statusItem, background: showChat ? "#1a7f37" : "#1f6feb", padding:"0 10px", height:"100%", display:"flex", alignItems:"center", cursor:"pointer", gap:4, transition:"background .2s"}}
              onClick={() => setShowChat(s => !s)}
              title="Toggle AI Chat"
            >
              <IconSparkle /> {showChat ? "AI On" : "AI Off"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome Screen ────────────────────────────────────────────────────────
function Welcome({ onOpen }) {
  const recents = ["index.js", "App.jsx", "README.md"];
  return (
    <div style={W.root}>
      <div style={W.inner}>
        <div style={W.logo}>⚡</div>
        <h1 style={W.title}>Maths Coder</h1>
        <p style={W.sub}>A lightweight GitHub editor with AI. Open a file to get started.</p>
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
            <div style={W.link}><span style={{marginRight:6}}>🤖</span>AI Assistant (left panel)</div>
          </div>
        </div>
        <div style={W.hint}>Ctrl+S to save · AI chat on the left · Ctrl+P to open file</div>
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

// ─── Activity Button ───────────────────────────────────────────────────────
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

// ─── Styles ────────────────────────────────────────────────────────────────
const S = {
  root:          { display:"flex", height:"100vh", background:"#0d1117", color:"#e6edf3", fontFamily:"-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", overflow:"hidden" },
  activityBar:   { width:48, background:"#161b22", display:"flex", flexDirection:"column", justifyContent:"space-between", borderRight:"1px solid #21262d", flexShrink:0, zIndex:10 },
  activityTop:   { display:"flex", flexDirection:"column" },
  activityBottom:{ display:"flex", flexDirection:"column" },
  sidebar:       { width:220, background:"#161b22", borderRight:"1px solid #21262d", display:"flex", flexDirection:"column", overflow:"hidden", flexShrink:0 },
  sidebarHeader: { padding:"8px 12px 4px", display:"flex", alignItems:"center", justifyContent:"space-between" },
  sidebarTitle:  { fontSize:10.5, fontWeight:700, color:"#8b949e", letterSpacing:"0.1em" },
  editorArea:    { flex:1, display:"flex", flexDirection:"column", overflow:"hidden" },
  titleBar:      { height:30, background:"#161b22", borderBottom:"1px solid #21262d", display:"flex", alignItems:"center", paddingLeft:12, gap:16, flexShrink:0 },
  titleLogo:     { fontSize:12, fontWeight:700, color:"#e6edf3", fontFamily:"'JetBrains Mono', monospace", letterSpacing:".03em" },
  titleMenu:     { display:"flex", gap:0 },
  menuItem:      { fontSize:12, color:"#8b949e", padding:"0 10px", cursor:"pointer", height:30, display:"flex", alignItems:"center" },
  tabBar:        { display:"flex", alignItems:"stretch", background:"#0d1117", borderBottom:"1px solid #21262d", height:35, overflowX:"auto", flexShrink:0 },
  tab:           { display:"flex", alignItems:"center", padding:"0 10px", cursor:"pointer", position:"relative", fontSize:12.5, minWidth:0, flexShrink:0, gap:2, whiteSpace:"nowrap" },
  tabActive:     { background:"#0d1117", color:"#e6edf3", borderBottom:"1px solid #1f6feb" },
  tabInactive:   { background:"#161b22", color:"#8b949e", borderBottom:"1px solid transparent" },
  tabName:       { maxWidth:120, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" },
  tabClose:      { marginLeft:6, opacity:0, fontSize:10, lineHeight:1, padding:"1px 2px", borderRadius:3, transition:"opacity .15s" },
  saveBtn:       { marginLeft:"auto", marginRight:8, padding:"0 12px", background:"transparent", border:"1px solid #30363d", borderRadius:5, color:"#8b949e", cursor:"pointer", display:"flex", alignItems:"center", fontSize:12, transition:"all .15s", flexShrink:0 },
  saveBtnFlash:  { background:"#1a7f37", borderColor:"#1a7f37", color:"white" },
  monacoWrap:    { flex:1, overflow:"hidden", display:"flex", flexDirection:"column" },
  statusBar:     { height:22, background:"#1f6feb", display:"flex", alignItems:"center", paddingLeft:0, flexShrink:0, fontSize:11 },
  statusLeft:    { display:"flex", alignItems:"center", gap:0, paddingLeft:8 },
  statusCenter:  { flex:1, textAlign:"center", color:"rgba(255,255,255,.8)" },
  statusRight:   { display:"flex", alignItems:"center", height:"100%", gap:0 },
  statusItem:    { color:"rgba(255,255,255,.85)", padding:"0 8px", display:"flex", alignItems:"center", height:"100%", whiteSpace:"nowrap" },
  treeRow:       { display:"flex", alignItems:"center", padding:"2px 8px 2px 0", cursor:"pointer", fontSize:13, height:24, userSelect:"none", whiteSpace:"nowrap", overflow:"hidden" },
  chevron:       { width:16, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", color:"#8b949e" },
  folderIcon:    { marginRight:5, fontSize:13, flexShrink:0 },
  fileIcon:      { marginRight:6, flexShrink:0, display:"flex", alignItems:"center" },
  treeName:      { fontSize:13, overflow:"hidden", textOverflow:"ellipsis" },
  fileTree:      { overflowY:"auto", flex:1 },
  repoSection:   { borderBottom:"1px solid #21262d", paddingBottom:4 },
  repoHeader:    { display:"flex", alignItems:"center", padding:"6px 12px", cursor:"pointer", color:"#8b949e", fontSize:11 },
  input:         { width:"100%", padding:"5px 8px", background:"#0d1117", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:12, boxSizing:"border-box", outline:"none" },
  smallBtn:      { padding:"5px 8px", background:"#21262d", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:11.5, cursor:"pointer", width:"100%" },
  select:        { width:"100%", padding:"5px 8px", background:"#0d1117", border:"1px solid #30363d", borderRadius:5, color:"#e6edf3", fontSize:12, outline:"none" },
  searchBox:     { display:"flex", alignItems:"center", gap:6, background:"#0d1117", border:"1px solid #30363d", borderRadius:5, padding:"5px 8px" },
  searchInput:   { background:"none", border:"none", outline:"none", color:"#e6edf3", fontSize:12.5, width:"100%" },
  searchResult:  { display:"flex", alignItems:"center", padding:"4px 4px", cursor:"pointer", borderRadius:4, fontSize:12.5, color:"#8b949e" },
};

// ─── Global CSS ────────────────────────────────────────────────────────────
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
  @keyframes bounce {
    0%, 60%, 100% { transform: translateY(0); }
    30% { transform: translateY(-5px); }
  }
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&display=swap');
`;
