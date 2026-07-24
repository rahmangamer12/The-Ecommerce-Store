"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePrefs } from "@/components/providers/prefs-provider";

type Msg = { role: "user" | "assistant"; content: string };

/** Render assistant text, turning markdown links into real (clickable) links.
 *  Internal links (/products/…, /categories/…) navigate in-app. */
function RichText({ content }: { content: string }) {
  const parts: React.ReactNode[] = [];
  const re = /\[([^\]]+)\]\((\/[^\s)]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(content)) !== null) {
    if (m.index > last) parts.push(content.slice(last, m.index));
    parts.push(
      <Link
        key={key++}
        href={m[2]}
        className="font-semibold text-gold-strong underline underline-offset-2 hover:opacity-80"
      >
        {m[1]}
      </Link>,
    );
    last = m.index + m[0].length;
  }
  if (last < content.length) parts.push(content.slice(last));
  return <>{parts}</>;
}

// Floating AI store assistant. Renders nothing unless AI is configured (the
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
  const loadingRef = useRef(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = useCallback(
    async (preset?: string) => {
      const text = (preset ?? input).trim();
      if (!text || loadingRef.current) return;
      loadingRef.current = true;
      let next: Msg[] = [];
      setMessages((m) => {
        next = [...m, { role: "user" as const, content: text }];
        return next;
      });
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
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [input, t],
  );

  // "Ask AI about this product" buttons anywhere on the site open the chat
  // with their question pre-sent.
  useEffect(() => {
    function onAsk(e: Event) {
      const q = (e as CustomEvent<{ question?: string }>).detail?.question;
      if (!q) return;
      setOpen(true);
      send(q);
    }
    window.addEventListener("velcarro:ask-ai", onAsk);
    return () => window.removeEventListener("velcarro:ask-ai", onAsk);
  }, [send]);

  if (!enabled) return null;

  const quickQuestions = [t("ai.quickFind"), t("ai.quickShip"), t("ai.quickTrack")];

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
                  {m.role === "assistant" ? <RichText content={m.content} /> : m.content}
                </div>
              </div>
            ))}
            {/* Quick questions — only while the chat is fresh */}
            {messages.length === 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-1">
                {quickQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => send(q)}
                    className="rounded-full border border-border bg-paper px-3 py-1.5 text-xs text-ink-soft transition-colors hover:border-gold hover:text-gold-strong"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
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
                onClick={() => send()}
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
