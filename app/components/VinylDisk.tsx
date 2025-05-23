import React, { useContext, useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    Dimensions,
    Animated,
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from 'react-native';
import { SpotifyPlayerContext } from '../contexts/SpotifyPlayerContext';
import { useSpinAnimation } from '../hooks/useSpinAnimation';
import useFlipAnimation from '../hooks/useFlipAnimation';

const { width, height } = Dimensions.get('window');
const DISK_SIZE = Math.min(width, height * 0.95);

interface VinylDiskProps {
    setLoading: (loading: boolean) => void;
}

const VinylDisk: React.FC<VinylDiskProps> = ({ setLoading }) => {
    const context = useContext(SpotifyPlayerContext);
    const { currentSide, flip, flipStyle } = useFlipAnimation();

    if (!context) {
        throw new Error('SpotifyPlayerContext is null.');
    }

    const { track, isPlaying, albumTracks, playSong } = context;
    const albumImage = track?.album?.images?.[0]?.url;

    const { spinStyle } = useSpinAnimation(isPlaying);

    const sideA = albumTracks.slice(0, Math.ceil(albumTracks.length / 2));
    const sideB = albumTracks.slice(Math.ceil(albumTracks.length / 2));

    const handleSongClick = (songUri: string) => {
        setLoading(true);
        playSong(songUri)
            .catch((error) => {
                console.error('Error playing song:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const renderSongs = (tracks: any[]) => {
        return tracks.map((song: any, index: number) => {
            const angle = (360 / tracks.length) * index;
            const angleRad = (angle * Math.PI) / 180;
            const radius = DISK_SIZE * 0.35;

            const x = radius * Math.sin(angleRad);
            const y = -radius * Math.cos(angleRad);

            const textRotation = angle;

            const isCurrentSong = song.uri === track?.uri;

            return (
                <TouchableOpacity
                    key={song.id}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={[
                        styles.partition,
                        {
                            transform: [
                                { translateX: x },
                                { translateY: y },
                                { rotate: `${textRotation}deg` },
                            ],
                        },
                    ]}
                    onPress={() => handleSongClick(song.uri)}
                >
                    <Text
                        style={[
                            styles.songTitle,
                            {
                                transform: [{ rotate: `${-textRotation}deg` }],
                                color: isCurrentSong ? '#FFD700' : '#fff',
                                borderWidth: isCurrentSong ? 2 : 0,
                                borderColor: isCurrentSong
                                    ? '#FFD700'
                                    : 'transparent',
                                backgroundColor: isCurrentSong
                                    ? 'rgba(255, 215, 0, 0.3)'
                                    : 'rgba(0,0,0,0.7)',
                            },
                        ]}
                        adjustsFontSizeToFit={true}
                        numberOfLines={2}
                    >
                        {song.name}
                    </Text>
                </TouchableOpacity>
            );
        });
    };

    return (
        <>
            <View style={styles.container}>
                <Animated.View
                    style={[
                        styles.disk,
                        {
                            width: DISK_SIZE,
                            height: DISK_SIZE,
                            borderRadius: DISK_SIZE / 2,
                        },
                        {
                            transform: [
                                ...spinStyle.transform,
                                ...flipStyle.transform,
                            ],
                        },
                    ]}
                >
                    {albumImage && (
                        <Image
                            source={{ uri: albumImage }}
                            style={styles.albumArt}
                        />
                    )}

                    <Text style={[styles.sideIndicator, { color: '#3893e8' }]}>
                        SIDE {currentSide}
                    </Text>

                    {albumTracks.length > 0 && (
                        <View style={styles.partitionsContainer}>
                            {currentSide === 'A'
                                ? renderSongs(sideA)
                                : renderSongs(sideB)}
                        </View>
                    )}
                </Animated.View>

                <TouchableOpacity style={styles.flipButton} onPress={flip}>
                    <Text style={styles.flipButtonText}>
                        SIDE {currentSide === 'A' ? 'B' : 'A'}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disk: {
        backgroundColor: '#111',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 8,
        borderColor: '#333',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 4,
        elevation: 5,
    },
    albumArt: {
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#000',
    },
    partitionsContainer: {
        position: 'absolute',
        width: DISK_SIZE,
        height: DISK_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    partition: {
        position: 'absolute',
        width: 100,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    songTitle: {
        fontSize: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },

    sideIndicator: {
        position: 'absolute',
        top: 10,
        fontWeight: 'bold',
        fontSize: 16,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: 10,
        borderRadius: 10,
    },
    flipButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#333',
        borderRadius: 20,
    },
    flipButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default VinylDisk;
