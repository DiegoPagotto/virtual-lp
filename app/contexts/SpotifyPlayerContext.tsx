import React, {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
} from 'react';
import axios from 'axios';
import Constants from 'expo-constants';

type Track = any;

type SpotifyPlayerContextType = {
    track: Track | null;
    albumTracks: any[];
    isPlaying: boolean;
    volume: number;
    fetchPlayerState: () => void;
    togglePlayback: () => void;
    skip: () => void;
    rewind: () => void;
    changeVolume: (value: number) => void;
    playSong: (uri: string) => Promise<void>;
    getTracksForAlbum: (albumId: string) => void;
    rfidCardState: RFIDCardState;
};

export type RFIDCardState = {
    card: string;
    cardPresent: boolean;
    mode: string;
};

const ESP32_URL = Constants.expoConfig!.extra!.ESP32_URL;

export const SpotifyPlayerContext =
    createContext<SpotifyPlayerContextType | null>(null);

export const useSpotifyPlayer = () => {
    const context = useContext(SpotifyPlayerContext);
    if (!context)
        throw new Error(
            'useSpotifyPlayer must be used within SpotifyPlayerProvider'
        );
    return context;
};

export const SpotifyPlayerProvider: React.FC<{
    token: string;
    children: React.ReactNode;
}> = ({ token, children }) => {
    const track = useRef<Track | null>(null);
    const [albumTracks, setAlbumTracks] = useState<any[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);
    const [rfidCardState, setRfidCardState] = useState<RFIDCardState>({
        card: '',
        cardPresent: false,
        mode: '',
    });

    useEffect(() => {
        const pollRFIDCard = async () => {
            try {
                const res = await axios.get(`${ESP32_URL}/getCard`);
                if (res.data) {
                    setRfidCardState({
                        card: res.data.card,
                        cardPresent: res.data.cardPresent,
                        mode: res.data.mode,
                    });
                }
            } catch (err) {
                console.error('Error fetching RFID card:', err);
            }
        };

        pollRFIDCard();
        const interval = setInterval(pollRFIDCard, 1000);
        return () => clearInterval(interval);
    }, []);

    const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const fetchPlayerState = async () => {
        try {
            const res = await axios.get(
                'https://api.spotify.com/v1/me/player',
                { headers }
            );
            if (res.data) {
                const { is_playing, item, device } = res.data;
                track.current = item;
                setIsPlaying(is_playing);
                if (device?.volume_percent !== undefined)
                    setVolume(device.volume_percent);

                if (item?.album?.id) {
                    getTracksForAlbum(item.album.id);
                }
            }
        } catch (err) {
            console.error('Error fetching player state:', err);
        }
    };

    const togglePlayback = async () => {
        try {
            const url = isPlaying
                ? 'https://api.spotify.com/v1/me/player/pause'
                : 'https://api.spotify.com/v1/me/player/play';
            await axios.put(url, {}, { headers });
            setIsPlaying(!isPlaying);
        } catch (err) {
            console.error('Error toggling playback:', err);
        }
    };

    const skip = async () => {
        try {
            await axios.post(
                'https://api.spotify.com/v1/me/player/next',
                {},
                { headers }
            );
        } catch (err) {
            console.error('Error skipping track:', err);
        }
    };

    const rewind = async () => {
        try {
            await axios.post(
                'https://api.spotify.com/v1/me/player/previous',
                {},
                { headers }
            );
        } catch (err) {
            console.error('Error rewinding track:', err);
        }
    };

    const changeVolume = async (value: number) => {
        try {
            if (volume === value || value === 0) return;
            setVolume(value);
            await axios.put(
                `https://api.spotify.com/v1/me/player/volume?volume_percent=${value}`,
                {},
                { headers }
            );
        } catch (err) {
            console.error('Error changing volume:', err);
        }
    };

    const playSong = async (uri: string) => {
        try {
            await axios.put(
                'https://api.spotify.com/v1/me/player/play',
                { uris: [uri] },
                { headers }
            );

            while (track.current.uri !== uri) {
                console.log('Waiting for song to play...');
                await new Promise((resolve) => setTimeout(resolve, 1000));
                await fetchPlayerState();
            }
        } catch (err) {
            console.error('Error playing song:', err);
            throw err;
        }
    };

    const getTracksForAlbum = async (albumId: string) => {
        try {
            const res = await axios.get(
                `https://api.spotify.com/v1/albums/${albumId}/tracks`,
                { headers }
            );
            setAlbumTracks(res.data.items);
        } catch (err) {
            console.error('Error fetching album tracks:', err);
        }
    };

    useEffect(() => {
        fetchPlayerState();
        const interval = setInterval(fetchPlayerState, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SpotifyPlayerContext.Provider
            value={{
                track: track.current,
                albumTracks,
                isPlaying,
                volume,
                fetchPlayerState,
                togglePlayback,
                skip,
                rewind,
                changeVolume,
                playSong,
                getTracksForAlbum,
                rfidCardState,
            }}
        >
            {children}
        </SpotifyPlayerContext.Provider>
    );
};
