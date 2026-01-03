// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import type { OidcClientSettingsStore } from "./OidcClientSettings";
import type { UserProfile } from "./User";

/**
 * Protocol claims that could be removed by default from profile.
 * Derived from the following sets of claims:
 * - {@link https://datatracker.ietf.org/doc/html/rfc7519.html#section-4.1}
 * - {@link https://openid.net/specs/openid-connect-core-1_0.html#IDToken}
 * - {@link https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken}
 *
 * @internal
 */
const DefaultProtocolClaims = [
    "nbf",
    "jti",
    "auth_time",
    "nonce",
    "acr",
    "amr",
    "azp",
    "at_hash", // https://openid.net/specs/openid-connect-core-1_0.html#CodeIDToken
] as const;

/**
 * Protocol claims that should never be removed from profile.
 * "sub" is needed internally and others should remain required as per the OIDC specs.
 *
 * @internal
 */
const InternalRequiredProtocolClaims = ["sub", "iss", "aud", "exp", "iat"];

/**
 * @internal
 */
export class ClaimsService {
    public constructor(
        protected readonly _settings: OidcClientSettingsStore,
    ) {}

    public filterProtocolClaims(claims: UserProfile): UserProfile {
        const result = { ...claims };

        if (this._settings.filterProtocolClaims) {
            let protocolClaims;
            if (Array.isArray(this._settings.filterProtocolClaims)) {
                protocolClaims = this._settings.filterProtocolClaims;
            } else {
                protocolClaims = DefaultProtocolClaims;
            }

            for (const claim of protocolClaims) {
                if (!InternalRequiredProtocolClaims.includes(claim)) {
                    delete result[claim];
                }
            }
        }

        return result;
    }

}
