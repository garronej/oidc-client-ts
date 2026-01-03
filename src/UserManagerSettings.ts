// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.

import { type OidcClientSettings, OidcClientSettingsStore } from "./OidcClientSettings";
import { WebStorageStateStore } from "./WebStorageStateStore";
import { InMemoryWebStorage } from "./InMemoryWebStorage";

export const DefaultSilentRequestTimeoutInSeconds = 10;

/**
 * The settings used to configure the {@link UserManager}.
 *
 * @public
 */
export interface UserManagerSettings extends OidcClientSettings {
    stateUrlParamValue: string;

    /** The methods window.location method used to redirect (default: "assign") */
    redirectMethod?: "replace" | "assign";
    /** The methods target window being redirected (default: "self") */
    redirectTarget?: "top" | "self";

    /** The target to pass while calling postMessage inside iframe for callback (default: window.location.origin) */
    iframeNotifyParentOrigin?: string;

    /** The script origin to check during 'message' callback execution while performing silent auth via iframe (default: window.location.origin) */
    iframeScriptOrigin?: string;

    /** The URL for the page containing the code handling the silent renew */
    silent_redirect_uri?: string;
    /** Number of seconds to wait for the silent renew to return before assuming it has failed or timed out (default: 10) */
    silentRequestTimeoutInSeconds?: number;
    /** Flag to validate user.profile.sub in silent renew calls (default: true) */
    validateSubOnSilentRenew?: boolean;
    /** Flag to control if id_token is included as id_token_hint in silent renew calls (default: false) */
    includeIdTokenInSilentRenew?: boolean;

    /**
     * Storage object used to persist User for currently authenticated user (default: window.sessionStorage, InMemoryWebStorage iff no window).
     *  E.g. `userStore: new WebStorageStateStore({ store: window.localStorage })`
     */
    userStore?: WebStorageStateStore;
}

/**
 * The settings with defaults applied of the {@link UserManager}.
 * @see {@link UserManagerSettings}
 *
 * @public
 */
export class UserManagerSettingsStore extends OidcClientSettingsStore {
    public readonly redirectMethod: "replace" | "assign";
    public readonly redirectTarget: "top" | "self";

    public readonly iframeNotifyParentOrigin: string | undefined;
    public readonly iframeScriptOrigin: string | undefined;

    public readonly silent_redirect_uri: string;
    public readonly silentRequestTimeoutInSeconds: number;
    public readonly validateSubOnSilentRenew: boolean;
    public readonly includeIdTokenInSilentRenew: boolean;

    public readonly userStore: WebStorageStateStore;

    public constructor(args: UserManagerSettings) {
        const {
            redirectMethod = "assign",
            redirectTarget = "self",

            iframeNotifyParentOrigin = args.iframeNotifyParentOrigin,
            iframeScriptOrigin = args.iframeScriptOrigin,

            requestTimeoutInSeconds,
            silent_redirect_uri = args.redirect_uri,
            silentRequestTimeoutInSeconds,
            validateSubOnSilentRenew = true,
            includeIdTokenInSilentRenew = false,
            userStore,
        } = args;

        super(args);

        this.redirectMethod = redirectMethod;
        this.redirectTarget = redirectTarget;

        this.iframeNotifyParentOrigin = iframeNotifyParentOrigin;
        this.iframeScriptOrigin = iframeScriptOrigin;

        this.silent_redirect_uri = silent_redirect_uri;
        this.silentRequestTimeoutInSeconds = silentRequestTimeoutInSeconds || requestTimeoutInSeconds || DefaultSilentRequestTimeoutInSeconds;
        this.validateSubOnSilentRenew = validateSubOnSilentRenew;
        this.includeIdTokenInSilentRenew = includeIdTokenInSilentRenew;

        if (userStore) {
            this.userStore = userStore;
        }
        else {
            const store = typeof window !== "undefined" ? window.sessionStorage : new InMemoryWebStorage();
            this.userStore = new WebStorageStateStore({ store });
        }
    }
}
