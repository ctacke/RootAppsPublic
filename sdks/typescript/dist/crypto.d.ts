export declare const SIGNATURE_VERSION = "v1";
export declare const SIGNATURE_TOLERANCE_SECONDS = 300;
export declare function signBody(secret: string, timestampSeconds: number, rawBody: string): string;
export type VerifyResult = {
    ok: true;
} | {
    ok: false;
    reason: string;
};
export declare function verifySignature(secret: string, timestampHeader: string | undefined, signatureHeader: string | undefined, rawBody: string, nowSeconds?: number, toleranceSeconds?: number): VerifyResult;
//# sourceMappingURL=crypto.d.ts.map