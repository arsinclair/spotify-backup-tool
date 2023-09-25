import puppeteer from "puppeteer";
import { delay } from "./utils.js";
import { SpotifyApi } from "@spotify/web-api-ts-sdk";

const scopes = [
    "playlist-read-private",
    "playlist-read-collaborative",
    "user-follow-read",
    "user-library-read"
].join(" ");

const getAuthCode = async ({ spotifyClientId, spotifyUserName, spotifyUserPassword }: GetClientProps) => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    const queryString = new URLSearchParams({
        "client_id": spotifyClientId,
        "redirect_uri": "http://localhost:3000",
        "response_type": "code",
        "scope": scopes
    });
    await page.goto("https://accounts.spotify.com/authorize?" + queryString);

    const userNameHandle = await page.waitForSelector("#login-username");
    const passwordHandle = await page.waitForSelector("#login-password");
    const loginButtonHandle = await page.waitForSelector("#login-button");

    await userNameHandle?.type(spotifyUserName);
    await passwordHandle?.type(spotifyUserPassword);
    await loginButtonHandle?.click();

    // Capture the redirect chain
    const client = await page.target().createCDPSession();
    await client.send("Network.enable");

    const redirectPromise = new Promise<string>(async (resolve) => {
        client.on("Network.requestWillBeSent", async (e) => {
            if (e.request.url.startsWith("http://localhost:3000")) {
                resolve(e.request.url);
            }
        });
    });

    const agreeButton = await Promise.race([
        page.waitForSelector("[data-testid=\"auth-accept\"]"),
        delay(2000)
    ]);
    await agreeButton?.click();

    try {
        const result: string | void = await Promise.race([redirectPromise, delay(5000)]);
        if (result) {
            const url = new URL(result);
            const code = url.searchParams.get("code");

            if (code) return code;
        }
        throw new Error("Failed to retrieve a user auth code from Spotify.");
    }
    finally {
        await browser.close();
    }
};

type SpotifyAuthTokenResponse = {
    access_token: string;
    token_type: "Bearer";
    expires_in: number;
    refresh_token: string;
    scope: string;
};

interface GetClientProps {
    spotifyClientId: string;
    spotifyClientSecret: string;
    spotifyUserName: string;
    spotifyUserPassword: string;
}

const getAuthToken = async (props: GetClientProps) => {
    const authCode = await getAuthCode(props);

    const body = new URLSearchParams({
        "grant_type": "authorization_code",
        "redirect_uri": "http://localhost:3000",
        "code": encodeURIComponent(authCode)
    });

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Authorization": "Basic " + btoa(`${props.spotifyClientId}:${props.spotifyClientSecret}`),
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: body.toString()
    });
    if (response.ok) {
        return await response.json() as SpotifyAuthTokenResponse;
    }

    throw new Error("Failed to retrieve a user auth token from Spotify.");
};

export const getClient = async (props: GetClientProps) => {
    const token = await getAuthToken(props);
    return SpotifyApi.withAccessToken(props.spotifyClientId, token);
};