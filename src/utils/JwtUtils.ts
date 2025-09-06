import { Logger } from "./Logger";
import type { JwtClaims } from "../Claims";
import { CryptoUtils } from "./CryptoUtils";

export interface JwtDecodeOptions {
    header?: boolean;
}

export interface JwtHeader {
    typ?: string;
    alg?: string;
    kid?: string;
}

export interface JwtPayload {
    iss?: string;
    sub?: string;
    aud?: string[] | string;
    exp?: number;
    nbf?: number;
    iat?: number;
    jti?: string;
}

export class InvalidTokenError extends Error {}

InvalidTokenError.prototype.name = "InvalidTokenError";

function b64DecodeUnicode(str: string) {
    return decodeURIComponent(
        atob(str).replace(/(.)/g, (m, p) => {
            let code = (p as string).charCodeAt(0).toString(16).toUpperCase();
            if (code.length < 2) {
                code = "0" + code;
            }
            return "%" + code;
        }),
    );
}

function base64UrlDecode(str: string) {
    let output = str.replace(/-/g, "+").replace(/_/g, "/");
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += "==";
            break;
        case 3:
            output += "=";
            break;
        default:
            throw new Error("base64 string is not of the correct length");
    }

    try {
        return b64DecodeUnicode(output);
    } catch (err) {
        return atob(output);
    }
}

function jwtDecode<T = JwtHeader>(
    token: string,
    options: JwtDecodeOptions & { header: true }
): T;
function jwtDecode<T = JwtPayload>(
    token: string,
    options?: JwtDecodeOptions
): T;
function jwtDecode<T = JwtHeader | JwtPayload>(
    token: string,
    options?: JwtDecodeOptions,
): T {
    if (typeof token !== "string") {
        throw new InvalidTokenError(
            "Invalid token specified: must be a string",
        );
    }

    options ||= {};

    const pos = options.header === true ? 0 : 1;
    const part = token.split(".")[pos];

    if (typeof part !== "string") {
        throw new InvalidTokenError(
            `Invalid token specified: missing part #${pos + 1}`,
        );
    }

    let decoded: string;
    try {
        decoded = base64UrlDecode(part);
    } catch (e) {
        throw new InvalidTokenError(
            `Invalid token specified: invalid base64 for part #${pos + 1} (${
                (e as Error).message
            })`,
        );
    }

    try {
        return JSON.parse(decoded) as T;
    } catch (e) {
        throw new InvalidTokenError(
            `Invalid token specified: invalid json for part #${pos + 1} (${
                (e as Error).message
            })`,
        );
    }
}

/**
 * @internal
 */
export class JwtUtils {
    // IMPORTANT: doesn't validate the token
    public static decode(token: string): JwtClaims {
        try {
            return jwtDecode<JwtClaims>(token);
        } catch (err) {
            Logger.error("JwtUtils.decode", err);
            throw err;
        }
    }

    public static async generateSignedJwt(
        header: object,
        payload: object,
        privateKey: CryptoKey,
    ): Promise<string> {
        const encodedHeader = CryptoUtils.encodeBase64Url(
            new TextEncoder().encode(JSON.stringify(header)),
        );
        const encodedPayload = CryptoUtils.encodeBase64Url(
            new TextEncoder().encode(JSON.stringify(payload)),
        );
        const encodedToken = `${encodedHeader}.${encodedPayload}`;

        const signature = await window.crypto.subtle.sign(
            {
                name: "ECDSA",
                hash: { name: "SHA-256" },
            },
            privateKey,
            new TextEncoder().encode(encodedToken),
        );

        const encodedSignature = CryptoUtils.encodeBase64Url(
            new Uint8Array(signature),
        );
        return `${encodedToken}.${encodedSignature}`;
    }
}
