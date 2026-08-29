"use client";

import { useState } from "react";
import {
  Bot,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";

export function McpTutorial() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"claude" | "hermes" | "inspector">("claude");
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const domain = typeof window !== "undefined" ? window.location.origin : "https://moneymate.bimd.top";

  const claudeConfig = `{
  "mcpServers": {
    "moneymate": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/inspector",
        "--transport",
        "http",
        "--server-url",
        "${domain}/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_API_KEY_HERE"
      ]
    }
  }
}`;

  const hermesConfig = `{
  "mcpServers": {
    "moneymate": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/inspector",
        "--transport",
        "http",
        "--server-url",
        "${domain}/api/mcp",
        "--header",
        "Authorization: Bearer YOUR_API_KEY_HERE"
      ]
    }
  }
}`;

  const inspectorCommand = `npx @modelcontextprotocol/inspector@latest --transport http --server-url ${domain}/api/mcp --header "Authorization: Bearer YOUR_API_KEY_HERE"`;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 overflow-hidden">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Bot className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-slate-900">
                MCP Integration Tutorial
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-700 uppercase tracking-wide">
                Streamable HTTP
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Learn how to connect your MoneyMate data to Claude Desktop, Hermes, and AI agents
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-all shrink-0"
        >
          {isOpen ? (
            <>
              Hide Guide <ChevronUp className="w-4 h-4" />
            </>
          ) : (
            <>
              Quick Setup Guide <ChevronDown className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="mt-6 pt-6 border-t border-slate-100 space-y-6">
          {/* 3 Step Workflow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2.5">
                1
              </div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">
                Generate an API Key
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Click <strong>&ldquo;Generate New Key&rdquo;</strong> in the Personal Access Tokens section below. Copy and store your key safely.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2.5">
                2
              </div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">
                Configure Your AI Client
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paste the configuration snippet below into your client&apos;s config file (e.g. <code>claude_desktop_config.json</code>).
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center mb-2.5">
                3
              </div>
              <h4 className="font-semibold text-slate-800 text-sm mb-1">
                Ask Questions in Natural Language
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Ask Claude or Hermes: <em>&ldquo;What is my spending breakdown for this month?&rdquo;</em> or <em>&ldquo;Record a Rp 50.000 Coffee expense&rdquo;</em>.
              </p>
            </div>
          </div>

          {/* Client Configuration Tabs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
                <button
                  onClick={() => setActiveTab("claude")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "claude"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Claude Desktop
                </button>
                <button
                  onClick={() => setActiveTab("hermes")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "hermes"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Hermes Agent
                </button>
                <button
                  onClick={() => setActiveTab("inspector")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    activeTab === "inspector"
                      ? "bg-white text-slate-900 shadow-xs font-semibold"
                      : "hover:text-slate-900"
                  }`}
                >
                  MCP Inspector CLI
                </button>
              </div>

              {activeTab === "claude" && (
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  ~/Library/Application Support/Claude/claude_desktop_config.json
                </span>
              )}
            </div>

            {activeTab === "claude" && (
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {claudeConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(claudeConfig, "claude")}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  {copied === "claude" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === "hermes" && (
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {hermesConfig}
                </pre>
                <button
                  onClick={() => copyToClipboard(hermesConfig, "hermes")}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  {copied === "hermes" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Config</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {activeTab === "inspector" && (
              <div className="relative">
                <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto leading-relaxed">
                  {inspectorCommand}
                </pre>
                <button
                  onClick={() => copyToClipboard(inspectorCommand, "inspector")}
                  className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                >
                  {copied === "inspector" ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Command</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Capabilities summary */}
          <div className="p-4 bg-emerald-50/60 border border-emerald-100 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Zero Setup Required:</strong> External AI agents authenticate directly via standard Bearer tokens over Streamable HTTP.
              </span>
            </div>
            <a
              href="https://modelcontextprotocol.io"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline shrink-0"
            >
              Learn more about MCP <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
