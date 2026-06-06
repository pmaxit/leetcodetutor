const decodeBase64Url = (input) => {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
  const base64 = normalized + padding;

  if (typeof globalThis.atob === "function") {
    return globalThis.atob(base64);
  }

  return Buffer.from(base64, "base64").toString("utf8");
};

export const decodeJwtPayload = (token) => {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  try {
    const json = decodeBase64Url(parts[1]);
    return JSON.parse(json);
  } catch (_error) {
    return null;
  }
};

export const isJwtExpired = (token, nowMs = Date.now()) => {
  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.exp !== "number") return true;
  return payload.exp * 1000 <= nowMs;
};
