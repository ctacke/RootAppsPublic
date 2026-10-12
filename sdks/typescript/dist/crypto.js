"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIGNATURE_TOLERANCE_SECONDS = exports.SIGNATURE_VERSION = void 0;
exports.signBody = signBody;
exports.verifySignature = verifySignature;
const node_crypto_1 = require("node:crypto");
exports.SIGNATURE_VERSION = "v1";
exports.SIGNATURE_TOLERANCE_SECONDS = 300;
function signBody(secret, timestampSeconds, rawBody) {
    const mac = (0, node_crypto_1.createHmac)("sha256", secret).update(`${timestampSeconds}.${rawBody}`).digest("hex");
    return `${exports.SIGNATURE_VERSION}=${mac}`;
}
function verifySignature(secret, timestampHeader, signatureHeader, rawBody, nowSeconds = Math.floor(Date.now() / 1000), toleranceSeconds = exports.SIGNATURE_TOLERANCE_SECONDS) {
    if (!timestampHeader || !signatureHeader)
        return { ok: false, reason: "missing signature headers" };
    if (!/^\d+$/.test(timestampHeader))
        return { ok: false, reason: "invalid timestamp" };
    const timestamp = Number(timestampHeader);
    if (Math.abs(nowSeconds - timestamp) > toleranceSeconds) {
        return { ok: false, reason: "timestamp outside tolerance" };
    }
    const expected = Buffer.from(signBody(secret, timestamp, rawBody));
    const actual = Buffer.from(signatureHeader);
    if (expected.length !== actual.length || !(0, node_crypto_1.timingSafeEqual)(expected, actual)) {
        return { ok: false, reason: "signature mismatch" };
    }
    return { ok: true };
}
//# sourceMappingURL=crypto.js.map