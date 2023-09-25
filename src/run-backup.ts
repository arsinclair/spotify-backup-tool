import "dotenv/config";
import { ValidateEnvironmnetVariables } from "./validate-env.js";
import { getClient } from "./auth.js";

const {
    SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET,
    SPOTIFY_USERNAME,
    SPOTIFY_PASSWORD
} = ValidateEnvironmnetVariables();

const client = await getClient({
    spotifyClientId: SPOTIFY_CLIENT_ID,
    spotifyClientSecret: SPOTIFY_CLIENT_SECRET,
    spotifyUserName: SPOTIFY_USERNAME,
    spotifyUserPassword: SPOTIFY_PASSWORD
});

const playlists = await client.currentUser.playlists.playlists();

console.log(playlists.items.map(x => ({
    name: x.name,
    description: x.description,
    tracks: x.tracks?.total
})));