import { useState } from "react";
import axios from "axios";
import qs from 'query-string'
import { sha256} from 'crypto-js';


const PlaylistGenerator = ({mood}) => {

    const [playlist, setPlaylist] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
    const SPOTIFY_REDIRECT_URI = 'http://localhost:5173/';
    const SPOTIFY_AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
    const SPOTIFY_TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
    const SPOTIFY_API_ENDPOINT = 'https://api.spotify.com/v1/playlists';
   
const generateRandomString = (length) => {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };

    const getCodeChallenge = (codeVerifier) => {
        return sha256(codeVerifier).toString();
    };

    const generateCodeChallenge = () => {
        const codeVerifier = generateRandomString(128);
        return {
            codeVerifier,
            codeChallenge: getCodeChallenge(codeVerifier),
        };
    };

    const handleAuthorize = async () => {
        const { codeVerifier, codeChallenge } = generateCodeChallenge();

        const queryParams = qs.stringify({
            client_id: SPOTIFY_CLIENT_ID,
            response_type: 'code',
            redirect_uri: SPOTIFY_REDIRECT_URI,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge,
            state: generateRandomString(16),
            scope: 'playlist-modify-public', // Add additional scopes if needed
        });

        const authUrl = `${SPOTIFY_AUTH_ENDPOINT}?${queryParams}`;

        window.location.href = authUrl;
    };

    const handleGeneratePlaylist = async () => {
        setLoading(true);
        setError(null);

        try {
            // Extract the authorization code from the URL query parameters
            const params = qs.parse(window.location.search);
            const code = params.code;

            // Exchange the authorization code for an access token
            const tokenResponse = await axios.post(
                SPOTIFY_TOKEN_ENDPOINT,
                qs.stringify({
                    client_id: SPOTIFY_CLIENT_ID,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: SPOTIFY_REDIRECT_URI,
                    code_verifier: localStorage.getItem('codeVerifier'),
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            const accessToken = tokenResponse.data.access_token;

            // Use the access token to generate the playlist
            const playlistResponse = await axios.post(
                SPOTIFY_API_ENDPOINT,
                {
                    mood: mood,
                    // Add additional parameters for playlist generation
                },
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            setPlaylist(playlistResponse.data);
        } catch (error) {
            setError(error.message);
        }

        setLoading(false);
    };

    return (
        <div>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error}</p>}
            {playlist && (
                <div>
                    <h2>Generated Playlist</h2>
                    {/* Display playlist details here */}
                </div>
            )}
            {!loading && !playlist && (
                <div>
                    <button onClick={handleAuthorize}>Authorize Spotify</button>
                    <button onClick={handleGeneratePlaylist}>Generate Playlist</button>
                </div>
            )}
        </div>
    );
};


export default PlaylistGenerator;