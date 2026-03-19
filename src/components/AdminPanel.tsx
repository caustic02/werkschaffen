"use client";

import { useState, useEffect, useCallback } from "react";
import { CLOUD_NODES, CLOUD_LINKS, type CloudNode, type CloudLink } from "@/lib/cloud-data";

export default function AdminPanel() {
  const [open, setOpen] = useState(false);
  const [nodes, setNodes] = useState<CloudNode[]>(CLOUD_NODES);
  const [linksText, setLinksText] = useState("");

  useEffect(() => {
    try {
      const storedNodes = localStorage.getItem("ws13_c");
      if (storedNodes) setNodes(JSON.parse(storedNodes));

      const storedLinks = localStorage.getItem("ws13_l");
      if (storedLinks) {
        setLinksText(JSON.stringify(JSON.parse(storedLinks), null, 2));
      } else {
        setLinksText(JSON.stringify(CLOUD_LINKS, null, 2));
      }
    } catch {
      /* ignore */
    }
  }, []);

  const updateNodeDesc = useCallback((id: string, desc: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, desc } : n))
    );
  }, []);

  const save = useCallback(() => {
    try {
      localStorage.setItem("ws13_c", JSON.stringify(nodes));
      localStorage.setItem("ws13_l", linksText);
      window.location.reload();
    } catch {
      /* ignore */
    }
  }, [nodes, linksText]);

  const reset = useCallback(() => {
    localStorage.removeItem("ws13_c");
    localStorage.removeItem("ws13_l");
    window.location.reload();
  }, []);

  const handleTrigger = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <>
      <button
        className="ws-admin-trigger"
        onClick={handleTrigger}
        aria-label="Open admin panel"
        tabIndex={-1}
      />
      <div className={`ws-admin-panel ${open ? "open" : ""}`}>
        <div className="ws-admin-header">
          <span className="ws-admin-title">Cloud Editor</span>
          <button className="ws-admin-close" onClick={() => setOpen(false)}>
            Close
          </button>
        </div>

        {nodes.map((node) => (
          <div key={node.id} className="ws-admin-node">
            <p className="ws-admin-node-label">
              {node.label} ({node.fontSize}px / {node.fontWeight})
            </p>
            <textarea
              className="ws-admin-textarea"
              value={node.desc}
              onChange={(e) => updateNodeDesc(node.id, e.target.value)}
            />
          </div>
        ))}

        <div className="ws-admin-node">
          <p className="ws-admin-node-label">Links (JSON)</p>
          <textarea
            className="ws-admin-textarea"
            style={{ minHeight: 200 }}
            value={linksText}
            onChange={(e) => setLinksText(e.target.value)}
          />
        </div>

        <div className="ws-admin-actions">
          <button className="ws-admin-btn primary" onClick={save}>
            Save & Reload
          </button>
          <button className="ws-admin-btn secondary" onClick={reset}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </>
  );
}
