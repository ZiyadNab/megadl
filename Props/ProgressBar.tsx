import React, { useState, useRef, useCallback, useEffect, useImperativeHandle } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface ProgressProps {
    height: number;
}

type ProgressRefProps = {
    startProgress: (val: number) => void;
}

const Progress = React.forwardRef<ProgressRefProps, ProgressProps>(({ height }, ref) => {

    const [newWidth, setNewWidth] = useState(0)
    const width = useSharedValue(0)
    const backgroundColor = useSharedValue('#FFFF6C')
    const [downloadProgress, setDownloadProgress] = useState(0)
    const [opacity, setOpacity] = useState(0)

    const startProgress = useCallback((val: number) => {
        width.value = withTiming(val * newWidth / 100)
        setDownloadProgress(val)

        if (val === 100) {
            backgroundColor.value = withTiming('#FFFF6C')
            width.value = withTiming(0)
            setOpacity(0)
        } else {
            backgroundColor.value = withTiming('#C3FF91')
            setOpacity(1)
        }
    }, [newWidth]);

    useImperativeHandle(ref, () => ({ startProgress }), [
        startProgress,
    ]);

    const animatedBackground = useAnimatedStyle(() => {
        return {
            backgroundColor: backgroundColor.value,
        };
    });

    return (
        <Animated.View
            onLayout={e => {
                const v = e.nativeEvent.layout.width
                setNewWidth(v)
            }}
            style={[{
                height,
                width: '100%',
                borderRadius: height / 4,
                overflow: 'hidden',
                top: 0,
            }, animatedBackground]}
        >
            <Animated.View
                style={[
                    {
                        height,
                        borderRadius: height / 4,
                        backgroundColor: '#74FF00',
                        width: width,
                        position: 'absolute',
                        left: 0,
                        top: 0,
                    },
                ]}
            />

            <View>
                <Text style={{textAlign: 'center', color: 'white', opacity: opacity }}>{downloadProgress.toFixed(0)}%</Text>
            </View>
        </Animated.View>
    );
})

export default Progress;
