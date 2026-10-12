import { createHmac, timingSafeEqual } from "node:crypto";

export const SIGNATURE_VERSION = "v1";
export const SIGNATURE_TOLERANCE_SECONDS = 300;

export function signBody(secret: string, timestampSeconds: number, rawBody: string): string {
  const mac = createHmac("sha256", secret).update(`${timestampSeconds}.${rawBody}`).digest("hex");
  return `${SIGNATURE_VERSION}=${mac}`;
}

export type VerifyResult = { ok: true } | { ok: false; reason: string };

export function verifySignature(
  secret: string,
  timestampHeader: string | undefined,
  signatureHeader: string | undefined,
  rawBody: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
  toleranceSeconds: number = SIGNATURE_TOLERANCE_SECONDS
): VerifyResult {
  if (!timestampHeader || !signatureHeader) return { ok: false, reason: "missing signature headers" };

  if (!/^\d+$/.test(timestampHeader)) return { ok: false, reason: "invalid timestamp" };
  const timestamp = Number(timestampHeader);
  if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
    return { ok: false, reason: "timestamp outside tolerance" };
  }

  const expected = Buffer.from(signBody(secret, timestamp, rawBody));
  const actual = Buffer.from(signatureHeader);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    return { ok: false, reason: "signature mismatch" };
  }
  return { ok: true };
}
