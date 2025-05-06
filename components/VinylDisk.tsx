import React, { useContext } from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { SpotifyPlayerContext } from '../contexts/SpotifyPlayerContext';

const { width, height } = Dimensions.get('window');
const DISK_SIZE = Math.min(width, height * 0.95);

const VinylDisk = () => {
    const context = useContext(SpotifyPlayerContext);

    if (!context) {
        throw new Error('SpotifyPlayerContext is null.');
    }

    const { track } = context;

    const albumImage = track?.album?.images?.[0]?.url;

    return (
        <View style={styles.container}>
            <View
                style={[
                    styles.disk,
                    {
                        width: DISK_SIZE,
                        height: DISK_SIZE,
                        borderRadius: DISK_SIZE / 2,
                    },
                ]}
            >
                {albumImage && (
                    <Image
                        source={{ uri: albumImage }}
                        style={styles.albumArt}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
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
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: '#000',
    },
});

export default VinylDisk;
