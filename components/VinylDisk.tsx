import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const DISK_SIZE = Math.min(width, height * 0.95);

const VinylDisk = () => {
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
                <Image
                    source={{
                        uri: 'https://universalmusic.vtexassets.com/arquivos/ids/185314/cd%20metallica-ride-the-lightning-importado-cd%20metallica-ride-the-lightning-impo-00042283814028-00004228381402.jpg?v=638482831030130000',
                    }}
                    style={styles.albumArt}
                />
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
