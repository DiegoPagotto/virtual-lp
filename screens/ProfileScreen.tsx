import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

export default function ProfileScreen({ route }) {
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

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {user && (
                <>
                    <Text style={styles.title}>
                        Hello, {user.display_name || 'Spotify User'}!
                    </Text>
                    <Text>Email: {user.email}</Text>
                    <Text>Country: {user.country}</Text>
                    <Text>Account type: {user.product}</Text>
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
});
