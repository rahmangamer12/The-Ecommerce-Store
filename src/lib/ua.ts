// Lightweight user-agent parser (no dependency). Good enough to break visitors
// down by device type, browser and OS for the admin analytics page.

export type UaInfo = {
  device: "mobile" | "tablet" | "desktop";
  browser: string;
  os: string;
};

export function parseUserAgent(ua: string | null | undefined): UaInfo {
  const s = ua ?? "";

  // Device type
  let device: UaInfo["device"] = "desktop";
  if (/iPad|Tablet|PlayBook|Silk|Kindle|(Android(?!.*Mobile))/i.test(s)) {
    device = "tablet";
  } else if (
    /Mobi|iPhone|iPod|Android.*Mobile|Windows Phone|BlackBerry|IEMobile|Opera Mini/i.test(s)
  ) {
    device = "mobile";
  }

  // OS
  let os = "Unknown";
  if (/iPhone|iPad|iPod/i.test(s)) os = "iOS";
  else if (/Android/i.test(s)) os = "Android";
  else if (/Windows NT/i.test(s)) os = "Windows";
  else if (/Mac OS X/i.test(s)) os = "macOS";
  else if (/CrOS/i.test(s)) os = "ChromeOS";
  else if (/Linux/i.test(s)) os = "Linux";

  // Browser (order matters — check the more specific ones first)
  let browser = "Unknown";
  if (/Edg[A-Z]?\//i.test(s)) browser = "Edge";
  else if (/OPR\/|Opera/i.test(s)) browser = "Opera";
  else if (/SamsungBrowser/i.test(s)) browser = "Samsung Internet";
  else if (/CriOS/i.test(s)) browser = "Chrome";
  else if (/FxiOS/i.test(s)) browser = "Firefox";
  else if (/Firefox\//i.test(s)) browser = "Firefox";
  else if (/Chrome\//i.test(s) && !/Chromium/i.test(s)) browser = "Chrome";
  else if (/Safari\//i.test(s)) browser = "Safari";

  return { device, browser, os };
}
