export function formatLinkedIn(url: string) {
  try {
    const u = new URL(url);
    const match = u.pathname.match(/\/in\/[^/]+/);
    return match ? match[0] : u.hostname + u.pathname;
  } catch {
    return url;
  }
}

export function formatPortfolio(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}