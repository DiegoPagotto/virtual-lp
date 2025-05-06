// SpotifyPlayer.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import axios from 'axios';

type Props = {
    token: string;
};

export const SpotifyPlayer: React.FC<Props> = ({ token }) => {
    const [track, setTrack] = useState<any>(null);
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
                {
                    headers,
                }
            );
            if (res.data) {
                const { is_playing, item, device } = res.data;
                setTrack(item);
                setIsPlaying(is_playing);
                if (device?.volume_percent !== undefined) {
                    setVolume(device.volume_percent);
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

    useEffect(() => {
        fetchPlayerState();
        const interval = setInterval(fetchPlayerState, 1000);
        return () => clearInterval(interval);
    }, []);

    if (!track) return <Text>Loading...</Text>;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{track.name}</Text>
            <Text style={styles.subtitle}>
                {track.artists.map((a: any) => a.name).join(', ')} -{' '}
                {track.album.name}
            </Text>

            <View style={styles.controls}>
                <Button title="⏮️" onPress={rewind} />
                <Button
                    title={isPlaying ? '⏸️' : '▶️'}
                    onPress={togglePlayback}
                />
                <Button title="⏭️" onPress={skip} />
            </View>

            <Text style={styles.subtitle}>Volume: {volume}</Text>
            <Slider
                style={{ width: 200, height: 40 }}
                minimumValue={0}
                maximumValue={100}
                value={volume}
                onValueChange={setVolume}
                onSlidingComplete={changeVolume}
                step={1}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    subtitle: { fontSize: 14, marginTop: 4, color: 'gray', maxWidth: 200 },
    controls: { flexDirection: 'row', marginTop: 20, gap: 10 },
});
