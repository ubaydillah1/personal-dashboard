export type LinkPreview = {
  url: string;
  kind: "youtube" | "shopping" | "link";
  title: string;
  subtitle: string;
};

const urlPattern = /https?:\/\/[^\s<>"')\]]+/g;
const trailingPunctuationPattern = /[.,!?;:]+$/;

function cleanUrl(value: string) {
  return value.replace(trailingPunctuationPattern, "");
}

function getShortPath(url: URL) {
  const path = `${url.pathname}${url.search}`;
  if (path === "/" || path.length === 0) return url.hostname.replace(/^www\./, "");
  return path.length > 36 ? `${path.slice(0, 33)}...` : path;
}

function isShopping(hostname: string) {
  return hostname.includes("shopee.") || hostname.includes("tokopedia.") || hostname.includes("amazon.");
}

export function isYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");
    return hostname === "youtu.be" || hostname === "youtube.com" || hostname.endsWith(".youtube.com");
  } catch {
    return false;
  }
}

function toPreview(value: string): LinkPreview | null {
  try {
    const url = new URL(value);
    const hostname = url.hostname.replace(/^www\./, "");

    if (isYoutubeUrl(value)) {
      return {
        url: value,
        kind: "youtube",
        title: "YouTube",
        subtitle: getShortPath(url),
      };
    }

    if (isShopping(hostname)) {
      return {
        url: value,
        kind: "shopping",
        title: hostname,
        subtitle: getShortPath(url),
      };
    }

    return {
      url: value,
      kind: "link",
      title: hostname,
      subtitle: getShortPath(url),
    };
  } catch {
    return null;
  }
}

export function getLinkPreview(value: string) {
  return toPreview(cleanUrl(value));
}

export function findLinkPreviews(value: string) {
  const urls = new Set(value.match(urlPattern)?.map(cleanUrl) ?? []);
  return [...urls].map(toPreview).filter((preview): preview is LinkPreview => Boolean(preview));
}

export function findFirstLinkPreview(value: string) {
  const [url] = value.match(urlPattern)?.map(cleanUrl) ?? [];
  return url ? toPreview(url) : null;
}
