import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

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
    playSong: (uri: string) => void;
    getTracksForAlbum: (albumId: string) => void;
};

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
    const [track, setTrack] = useState<Track | null>(null);
    const [albumTracks, setAlbumTracks] = useState<any[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(50);

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
                setTrack(item);
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
        } catch (err) {
            console.error('Error playing song:', err);
        }
    };

    const getTracksForAlbum = async (albumId: string) => {
        try {
            const res = await axios.get(
                `https://api.spotify.com/v1/albums/${albumId}/tracks`,
                { headers }
            );
            setAlbumTracks(res.data.items); // Store album tracks
        } catch (err) {
            console.error('Error fetching album tracks:', err);
        }
    };

    useEffect(() => {
        fetchPlayerState();
        const interval = setInterval(fetchPlayerState, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <SpotifyPlayerContext.Provider
            value={{
                track,
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
            }}
        >
            {children}
        </SpotifyPlayerContext.Provider>
    );
};
