"use client";

import { Link2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ShareButtons({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  function copyLink() {
    const url = typeof window !== "undefined" ? window.location.origin + path : path;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    });
  }

  const enc = encodeURIComponent;
  const shareUrl = typeof window !== "undefined" ? window.location.href : path;

  const networks = [
    { label: "X", href: `https://twitter.com/intent/tweet?text=${enc(title)}&url=${enc(shareUrl)}` },
    { label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${enc(shareUrl)}` },
    { label: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc(shareUrl)}` },
  ];

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted">Share</span>
      {networks.map((n) => (
        <a
          key={n.label}
          href={n.href}
          target="_blank"
          rel="noopener noreferrer"
          className="grid h-9 w-9 place-items-center rounded-full border border-border text-xs font-semibold transition-colors hover:border-gold hover:text-gold-strong"
        >
          {n.label.charAt(0)}
        </a>
      ))}
      <button
        onClick={copyLink}
        className="grid h-9 w-9 place-items-center rounded-full border border-border transition-colors hover:border-gold hover:text-gold-strong"
        aria-label="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
