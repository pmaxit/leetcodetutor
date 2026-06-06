import { describe, expect, it } from "vitest";
import { decodeJwtPayload, isJwtExpired } from "../client/src/utils/authToken.js";

const createJwt = (payload) => {
  const encode = (value) =>
    Buffer.from(JSON.stringify(value), "utf8")
      .toString("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

  const header = encode({ alg: "HS256", typ: "JWT" });
  const body = encode(payload);
  return `${header}.${body}.signature`;
};

describe("auth token utilities", () => {
  it("decodes a valid JWT payload", () => {
    const token = createJwt({ sub: "123", exp: 32503680000 });
    expect(decodeJwtPayload(token)).toMatchObject({ sub: "123", exp: 32503680000 });
  });

  it("returns null for malformed JWTs", () => {
    expect(decodeJwtPayload("not-a-jwt")).toBeNull();
  });

  it("reports true for expired tokens", () => {
    const expired = createJwt({ exp: Math.floor(Date.now() / 1000) - 60 });
    expect(isJwtExpired(expired)).toBe(true);
  });

  it("reports false for non-expired tokens", () => {
    const valid = createJwt({ exp: Math.floor(Date.now() / 1000) + 3600 });
    expect(isJwtExpired(valid)).toBe(false);
  });

  it("treats tokens without exp as expired", () => {
    const tokenWithoutExp = createJwt({ sub: "abc" });
    expect(isJwtExpired(tokenWithoutExp)).toBe(true);
  });
});
