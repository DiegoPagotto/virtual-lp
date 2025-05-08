import { useState, useRef } from 'react';
import { Animated } from 'react-native';

const useFlipAnimation = () => {
    const [currentSide, setCurrentSide] = useState<'A' | 'B'>('A');
    const [nextSide, setNextSide] = useState<'A' | 'B'>('B');
    const flipAnim = useRef(new Animated.Value(0)).current;
    const isFlipping = useRef(false);

    const flip = () => {
        if (isFlipping.current) return;
        isFlipping.current = true;

        const newSide = currentSide === 'A' ? 'B' : 'A';
        setNextSide(newSide);

        Animated.timing(flipAnim, {
            toValue: 90,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            setCurrentSide(newSide);

            flipAnim.setValue(270);
            Animated.timing(flipAnim, {
                toValue: 360,
                duration: 250,
                useNativeDriver: true,
            }).start(() => {
                flipAnim.setValue(0);
                isFlipping.current = false;
            });
        });
    };

    const getFlipStyle = () => {
        return {
            transform: [
                {
                    rotateY: flipAnim.interpolate({
                        inputRange: [0, 360],
                        outputRange: ['0deg', '360deg'],
                    }),
                },
            ],
            backfaceVisibility: 'hidden' as const,
        };
    };

    return {
        currentSide,
        flip,
        flipStyle: getFlipStyle(),
    };
};

export default useFlipAnimation;
