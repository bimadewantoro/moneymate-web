"use client";

import { useState, useEffect, useCallback } from "react";
import { Key, Plus, Trash2, Copy, Check, Terminal, AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface ApiKeyItem {
  id: string;
  name: string;
  created_at: number;
  last_used_at: number | null;
}

export function ApiKeySettings() {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [keyName, setKeyName] = useState("MCP Agent");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyPlaintext, setNewKeyPlaintext] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/keys");
      if (!res.ok) throw new Error("Failed to load API keys");
      const data = await res.json();
      setKeys(data.keys || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load API keys.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyName.trim()) return;

    try {
      setIsGenerating(true);
      setError(null);
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: keyName.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create API key");

      setNewKeyPlaintext(data.key);
      setKeyName("MCP Agent");
      fetchKeys();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to generate key");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this API key? External agents using it will be disconnected.")) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to revoke API key");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete API key");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCopy = () => {
    if (!newKeyPlaintext) return;
    navigator.clipboard.writeText(newKeyPlaintext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (timestamp: number) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
    }).format(new Date(timestamp));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
            <Key className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Personal Access Tokens (MCP)
            </h3>
            <p className="text-sm text-slate-500">
              Connect external AI assistants (Claude, Cursor, Agents) to your account
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setNewKeyPlaintext(null);
            setShowCreateModal(true);
          }}
          className="inline-flex items-center gap-2 px-3.5 py-2 brand-gradient text-white rounded-xl hover:shadow-md transition-all text-sm font-medium shrink-0"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-8 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading API keys...</span>
        </div>
      ) : keys.length === 0 ? (
        <div className="p-6 bg-slate-50 rounded-xl text-center border border-dashed border-slate-200">
          <Key className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="font-medium text-slate-700 text-sm">No API keys created yet</p>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Generate an API key to allow local agents or Claude Desktop to manage your budgets and transactions.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
          {keys.map((key) => (
            <div
              key={key.id}
              className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-900 text-sm truncate">{key.name}</p>
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                    ••••••••
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                  <span>Created {formatDate(key.created_at)}</span>
                  <span>•</span>
                  <span>
                    Last used:{" "}
                    {key.last_used_at ? (
                      <span className="text-slate-600 font-medium">
                        {formatDate(key.last_used_at)}
                      </span>
                    ) : (
                      "Never"
                    )}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(key.id)}
                disabled={deletingId === key.id}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Revoke Key"
              >
                {deletingId === key.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal for Generating & Displaying Key ── */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="p-6">
          <div className="mb-4">
            <DialogTitle>
              {newKeyPlaintext ? "API Key Generated" : "Generate API Key"}
            </DialogTitle>
            <DialogDescription className="mt-1">
              {newKeyPlaintext
                ? "Make sure to copy your Personal Access Token now. You won't be able to see it again!"
                : "Enter a descriptive name for where you will use this key (e.g. Claude Desktop, Cursor)."}
            </DialogDescription>
          </div>

          {newKeyPlaintext ? (
            <div className="space-y-4 pt-2">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-amber-800 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Store this key safely. Anyone with this key can access and manage your financial records.
                </span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={newKeyPlaintext}
                  className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:outline-none select-all text-slate-800"
                />
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 brand-gradient text-white rounded-xl text-xs font-medium hover:shadow-md transition-all shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-2">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  Claude Desktop Config Example
                </div>
                <pre className="p-3 bg-slate-900 text-slate-100 rounded-xl text-[11px] font-mono overflow-x-auto">
{`{
  "mcpServers": {
    "moneymate": {
      "command": "npm",
      "args": ["run", "mcp"],
      "cwd": "${typeof window !== 'undefined' ? window.location.origin : '/path/to/moneymate-web'}",
      "env": {
        "MONEYMATE_MCP_API_KEY": "${newKeyPlaintext}"
      }
    }
  }
}`}
                </pre>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyPlaintext(null);
                  }}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Key Name
                </label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="e.g. Claude Desktop, Work Laptop"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !keyName.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2 brand-gradient text-white rounded-xl text-sm font-medium hover:shadow-md transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate Key"
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
