import open from "open";
import { saveAuth } from "./auth";

const LOGIN_TIMEOUT_MS = 5 * 60 * 1000;

type OAUTHState = {
  nonce: string;
  port: number;
};

function toBase64Url(input: Uint8Array | string) {
  if (typeof input === "string") {
    return Buffer.from(input, "utf8").toString("base64url");
  }

  return Buffer.from(input).toString("base64url");
}

async function createPkceChallenge(verifier: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );
  return toBase64Url( new Uint8Array(digest))
}

function encodeState(state:OAUTHState) {
    return toBase64Url(JSON.stringify(state));
}

function decodeState(state: string){
    const [encode] = state.split(".");
    if(!encode){
        throw new Error("Invalid state")
    }
    return JSON.parse(Buffer.from(encode,"base64url").toString()) as OAUTHState;
}

function getErrorMessage(error: unknown){
    return error instanceof Error ? error.message : String(error);
}

export async function performLogin() {
    const clerkFrontendApi = process.env.CLERK_FRONTEND_API;
    const clientId = process.env.CLERK_OAUTH_CLIENT_ID;
    const apiUrl = process.env.API_URL ?? "http://localhost:3000";

    if(!clerkFrontendApi) throw new Error("CLERK_FRONTEND_API is not set");
    if(!clientId) throw new Error("CLERK_OAUTH_CLIENT_ID is not set");

    const nonce = crypto.randomUUID();
    const codeVerifier = toBase64Url(crypto.getRandomValues(new Uint8Array(32)));
    const codeChallenge = await createPkceChallenge(codeVerifier);

    let settled = false;

    return new Promise<{token: string}>((resolve, reject)=> {
        const server = Bun.serve({
            port: 0,
            async fetch(req) {
                const url = new URL(req.url);

                if(url.pathname !== "/callback"){
                    return new Response("Not found", {status: 404});
                }

                const error = url.searchParams.get("error");

                if(error){
                    const msg = url.searchParams.get("error_description") ?? error;
                    settled = true;
                    reject( new Error(msg));
                    setTimeout(() => server.stop(),500);
                    return new Response(`Authentication failed: ${msg}`, {status:400})
                }

                const code = url.searchParams.get("code");
                const state = url.searchParams.get("state");

                if (!code || !state){
                    settled = true;
                    reject( new Error("Missing code or state"));
                    setTimeout(() => server.stop(),500);
                    return new Response(`Bad request`, {status:400})
                }

                // verify nonce from state
                try {
                    const payload = decodeState(state);
                    if(payload.nonce !== nonce) throw new Error("state mismatch")
                } catch (error) {
                    settled = true;
                    reject( error);
                    setTimeout(() => server.stop(),500);
                    return new Response(`invalid state`, {status:400})
                }

                try {
                    const redirectUri = `${apiUrl}/auth/callback`;

                    const tokenRes = await fetch(`${clerkFrontendApi}/oauth/token`, {
                        method: "POST",
                        headers: {"Content-Type": "application/x-www-form-urlencoded"},
                        body: new URLSearchParams({
                            grant_type: "authorization_code",
                            code,
                            redirect_uri: redirectUri,
                            client_id: clientId,
                            code_verifier: codeVerifier
                        })
                    });

                    if (!tokenRes.ok) {
                        const details = await tokenRes.text();
                        throw new Error(details || "failed to exchange authorization code")
                    }

                    const tokenData =(await tokenRes.json()) as {access_token: string};
                    settled = true;
                    saveAuth({token: tokenData.access_token});
                    resolve({token: tokenData.access_token});
                    setTimeout(() => server.stop(),500);
                    return new Response(`Authenticated! you can close the tab.`)
                } catch (error) {
                    settled = true;
                    reject( error);
                    const message = getErrorMessage(error)
                    setTimeout(() => server.stop(),500);
                    return new Response(`Authentication failed: ${message}`, {status:400})
                }
            }
        })

        // build state with port and nonce
        const port  = server.port;
        if (typeof port !== "number") {
            server.stop();
            reject( new Error("failed to start callback error"));
            return;
        }

        const state = encodeState({port, nonce});
        const redirectUri = `${apiUrl}/auth/callback`;

        const authorizeUrl =new URL(`${clerkFrontendApi}/oauth/authorize`);
        authorizeUrl.searchParams.set("response_type","code");
        authorizeUrl.searchParams.set("client_id",clientId);
        authorizeUrl.searchParams.set("redirect_uri",redirectUri);
        authorizeUrl.searchParams.set("scope","openid email profile");
        authorizeUrl.searchParams.set("state",state);
        authorizeUrl.searchParams.set("prompt","login");
        authorizeUrl.searchParams.set("code_challenge",codeChallenge);
        authorizeUrl.searchParams.set("code_challenge_method","S256");

       
        open(authorizeUrl.toString()).catch((error) => {
            if (!settled) {
                settled = true;
                server.stop();
                reject(new Error(`Failed to open browser: ${getErrorMessage(error)}`));
            }
        });

        setTimeout(()=>{
            if(!settled){
                settled = true; 
                server.stop();
                reject( new Error("Login timmed out"));
            }
        },LOGIN_TIMEOUT_MS)
    });

}