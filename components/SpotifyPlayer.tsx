import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useSpotifyPlayer } from '../contexts/SpotifyPlayerContext';

export const SpotifyPlayer: React.FC = () => {
    const {
        track,
        isPlaying,
        volume,
        togglePlayback,
        skip,
        rewind,
        changeVolume,
    } = useSpotifyPlayer();

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
                    title={isPlaying ? '⏸️ Pause' : '▶️ Play'}
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
                onValueChange={changeVolume}
                step={1}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { alignItems: 'center', padding: 20 },
    title: { fontSize: 18, fontWeight: 'bold', color: 'white' },
    subtitle: { fontSize: 14, marginTop: 4, color: 'gray' },
    controls: { flexDirection: 'row', marginTop: 20, gap: 10 },
});
