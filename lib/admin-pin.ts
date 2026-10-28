import { createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_PIN_COOKIE = "mobile_gallary_admin_pin";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getPinSecret() {
  const pin = process.env.ADMIN_ACCESS_PIN;
  const sessionSecret = process.env.ADMIN_PIN_SESSION_SECRET;

  if (!pin || !/^\d{4}$/.test(pin)) {
    throw new Error("ADMIN_ACCESS_PIN must be configured as exactly four digits.");
  }
  if (!sessionSecret || sessionSecret.length < 32) {
    throw new Error("ADMIN_PIN_SESSION_SECRET must be configured with at least 32 characters.");
  }

  return { pin, sessionSecret };
}

export function assertAdminPinConfigured() {
  getPinSecret();
}

function signPayload(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function verifyAdminPin(candidate: string) {
  const { pin } = getPinSecret();
  if (!/^\d{4}$/.test(candidate)) return false;

  const expectedBuffer = Buffer.from(pin);
  const candidateBuffer = Buffer.from(candidate);
  return expectedBuffer.length === candidateBuffer.length &&
    timingSafeEqual(expectedBuffer, candidateBuffer);
}

export function createAdminPinSession() {
  const { sessionSecret } = getPinSecret();
  const payload = Buffer.from(JSON.stringify({
    expiresAt: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
  })).toString("base64url");
  return `${payload}.${signPayload(payload, sessionSecret)}`;
}

export function verifyAdminPinSession(token: string | undefined) {
  if (!token) return false;
  let sessionSecret: string;
  try {
    ({ sessionSecret } = getPinSecret());
  } catch {
    return false;
  }
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;

  const expectedSignature = Buffer.from(signPayload(payload, sessionSecret));
  const actualSignature = Buffer.from(signature);
  if (
    expectedSignature.length !== actualSignature.length ||
    !timingSafeEqual(expectedSignature, actualSignature)
  ) {
    return false;
  }

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as {
      expiresAt?: number;
    };
    return typeof session.expiresAt === "number" &&
      session.expiresAt > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export const adminPinSessionDuration = SESSION_DURATION_SECONDS;

export function getAdminRequestKey(ipAddress: string | undefined) {
  const { sessionSecret } = getPinSecret();
  if (!ipAddress || ipAddress.length > 64 || !/^[a-fA-F0-9:.]+$/.test(ipAddress)) {
    throw new Error("A valid request IP address is unavailable.");
  }
  return createHmac("sha256", sessionSecret).update(ipAddress).digest("hex");
}
