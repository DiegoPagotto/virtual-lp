import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import { StyleSheet, View } from 'react-native';
import { useEffect } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

const Stack = createStackNavigator();

export default function App() {
    useEffect(() => {
        ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.LANDSCAPE
        );
    }, []);

    return (
        <View style={styles.container}>
            <NavigationContainer theme={darkTheme}>
                <Stack.Navigator
                    initialRouteName="Login"
                    screenOptions={{
                        cardStyle: { backgroundColor: 'transparent' },
                        headerStyle: { backgroundColor: '#000000' },
                        headerTintColor: '#ffffff',
                        headerShown: false,
                    }}
                >
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Profile" component={ProfileScreen} />
                </Stack.Navigator>
            </NavigationContainer>
        </View>
    );
}

const darkTheme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        ...DefaultTheme.colors,
        primary: 'white',
        background: 'black',
        card: 'black',
        text: 'white',
        border: 'gray',
        notification: 'white',
    },
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },
});
