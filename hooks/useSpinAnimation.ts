import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

export const useSpinAnimation = (isPlaying: boolean) => {
    const rotateAnim = useRef(new Animated.Value(0)).current;
    const lastValue = useRef(0);
    const animationRef = useRef<Animated.CompositeAnimation | null>(null);

    useEffect(() => {
        const listenerId = rotateAnim.addListener(({ value }) => {
            lastValue.current = value;
        });

        if (isPlaying) {
            animationRef.current = Animated.loop(
                Animated.timing(rotateAnim, {
                    toValue: lastValue.current + 1,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            animationRef.current.start();
        } else {
            animationRef.current?.stop();
        }

        return () => {
            rotateAnim.removeListener(listenerId);
            animationRef.current?.stop();
        };
    }, [isPlaying]);

    const spinInterpolate = rotateAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return {
        spinStyle: {
            transform: [{ rotate: spinInterpolate }],
        },
    };
};
