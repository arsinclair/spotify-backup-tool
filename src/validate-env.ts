type ExcludeUndefinedProps<T> = {
    [K in keyof T]: string;
};

export const ValidateEnvironmnetVariables = () => {
    const variables = {
        SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
        SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
        SPOTIFY_USERNAME: process.env.SPOTIFY_USERNAME,
        SPOTIFY_PASSWORD: process.env.SPOTIFY_PASSWORD
    };

    for (const variable of Object.entries(variables)) {
        if (!variable[1]) {
            throw new Error(`Environment variable ${variable[0]} is not set.`);
        }
    }

    return variables as ExcludeUndefinedProps<typeof variables>;
};