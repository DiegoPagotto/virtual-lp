import { useState } from 'react';
import { View, Button, StyleSheet, Alert } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import React from 'react';

const SPOTIFY_CLIENT_ID = 'CLIENT_ID_HERE'; // Replace with your Spotify client ID
const SPOTIFY_CLIENT_SECRET = 'CLIENT_SECRET_HERE'; // Replace with your Spotify client secret

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default function LoginScreen({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);

    const SPOTIFY_REDIRECT_URI = AuthSession.makeRedirectUri({
        scheme: 'virtuallp',
        path: 'spotify-auth',
    });

    console.log('Using redirect URI:', SPOTIFY_REDIRECT_URI);

    const handleLogin = async () => {
        try {
            setIsLoading(true);

            const queryParams = new URLSearchParams({
                response_type: 'code',
                client_id: SPOTIFY_CLIENT_ID,
                redirect_uri: SPOTIFY_REDIRECT_URI,
                scope: 'user-read-private user-read-email',
                show_dialog: 'true',
            }).toString();

            const authUrl = `https://accounts.spotify.com/authorize?${queryParams}`;

            const result = await WebBrowser.openAuthSessionAsync(
                authUrl,
                SPOTIFY_REDIRECT_URI
            );

            if (result.type === 'success') {
                const codeMatch = result.url.match(/code=([^&]+)/);
                if (!codeMatch) {
                    Alert.alert('Error', 'Authorization code not found');
                    return;
                }

                const authorizationCode = codeMatch[1];

                const tokenResponse = await fetch(
                    'https://accounts.spotify.com/api/token',
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            Authorization:
                                'Basic ' +
                                btoa(
                                    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
                                ),
                        },
                        body: new URLSearchParams({
                            grant_type: 'authorization_code',
                            code: authorizationCode,
                            redirect_uri: SPOTIFY_REDIRECT_URI,
                        }).toString(),
                    }
                );

                const tokenData = await tokenResponse.json();

                if (!tokenResponse.ok) {
                    console.error(tokenData);
                    Alert.alert(
                        'Token Error',
                        tokenData.error_description || 'Failed to get token'
                    );
                    return;
                }

                console.log('Token Data:', tokenData);

                navigation.navigate('Profile', {
                    accessToken: tokenData.access_token,
                });
            }
        } catch (error) {
            Alert.alert('Error', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Button
                title="Login with Spotify"
                onPress={handleLogin}
                disabled={isLoading}
            />
        </View>
    );
}
