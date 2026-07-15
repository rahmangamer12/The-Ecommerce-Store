"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/components/providers/prefs-provider";

type Msg = { role: "user" | "assistant"; content: string };

// Floating store assistant. Renders nothing unless AI is configured (the
// LongCat key is set), so the store is unaffected when it's off.
export function AssistantWidget({ enabled }: { enabled: boolean }) {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  // The first message is always the greeting; send() drops it (index 0) before
  // calling the API so it isn't treated as conversation history.
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: t("ai.greeting") },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  if (!enabled) return null;

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1) }),
      });
      const data = (await res.json()) as { reply?: string; error?: string };
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content: data.reply ?? data.error ?? t("ai.error"),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: t("ai.network") },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Launcher button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close assistant" : "Open shopping assistant"}
        className={cn(
          "fixed bottom-4 right-4 z-40 grid h-14 w-14 place-items-center rounded-full bg-gold text-white shadow-gold transition-transform hover:scale-105 hover:bg-gold-strong",
          open && "scale-0 opacity-0",
        )}
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-4 right-4 z-50 flex h-[70vh] max-h-[560px] w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-luxe-lg">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 border-b border-border bg-ink px-4 py-3 text-paper">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-white">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold leading-tight">{t("ai.title")}</p>
                <p className="text-[11px] leading-tight text-paper/60">{t("ai.subtitle")}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="grid h-8 w-8 place-items-center rounded-full hover:bg-paper/10"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
              >
                <div
                  className={cn(
                    "max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-br-sm bg-gold text-white"
                      : "rounded-bl-sm bg-paper-2 text-ink",
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-paper-2 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted" />
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border p-3">
            <div className="flex items-center gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder={t("ai.placeholder")}
                className="h-11 flex-1 rounded-full border border-border bg-paper px-4 text-sm focus:border-gold focus-visible:outline-none"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send"
                className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-white transition-colors hover:bg-gold-strong disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted">
              {t("ai.disclaimer")}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
