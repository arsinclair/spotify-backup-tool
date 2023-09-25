Spotify Backup Tool

===

1. Create a new Spotify Application and copy the Application ID and Application Secret;
2. Create an `.env` file and add the following variables:

```
SPOTIFY_CLIENT_ID="<application id>"
SPOTIFY_CLIENT_SECRET="<application secret>"
SPOTIFY_USERNAME="<spotify username or email>"
SPOTIFY_PASSWORD="<spotify password>"
```

3. Run `pnpm run-backup`