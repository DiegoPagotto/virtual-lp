import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import VinylDisk from '../components/VinylDisk';
import { SpotifyPlayer } from '../components/SpotifyPlayer';

import { RouteProp } from '@react-navigation/native';
import { SpotifyPlayerProvider } from '../contexts/SpotifyPlayerContext';

type ProfileScreenRouteProp = RouteProp<
    { params: { accessToken: string } },
    'params'
>;

export default function ProfileScreen({
    route,
}: {
    route: ProfileScreenRouteProp;
}) {
    interface UserProfile {
        display_name?: string;
        email?: string;
        country?: string;
        product?: string;
    }

    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const { accessToken } = route.params;

    useEffect(() => {
        console.log('Access Token:', accessToken);
        const fetchUserProfile = async () => {
            try {
                const response = await fetch('https://api.spotify.com/v1/me', {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                });
                const data = await response.json();
                setUser(data);
            } catch (error) {
                console.error('Error fetching user profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [accessToken]);

    return (
        <SpotifyPlayerProvider token={accessToken}>
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" />
                </View>
            )}
            <View style={styles.container}>
                <View>
                    <SpotifyPlayer />
                </View>
                <View>
                    <VinylDisk setLoading={setLoading} />
                </View>
            </View>
        </SpotifyPlayerProvider>
    );
}

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        zIndex: 5,
    },
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        padding: 20,
        color: 'white',
        backgroundColor: '#121212',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: 'white',
    },
    text: {
        color: 'white',
    },
});
