import { Dimensions, StyleSheet, View, Text } from 'react-native';
import React, { useCallback, useImperativeHandle, useState } from 'react';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Extrapolate,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MAX_TRANSLATE_Y = -440;

type BottomSheetProps = {
  children?: React.ReactNode | [React.ReactNode];
};

export type BottomSheetRefProps = {
  scrollTo: (destination: number) => void;
  isActive: () => boolean;
  hasData: (val: boolean) => void;
  pos: () => number;
  backgroundColor: (color: string) => void
};

const BottomSheet = React.forwardRef<BottomSheetRefProps, BottomSheetProps>(
  ({ children }, ref) => {
    const [bottomSheetBackground, setBottomSheetBackground] = useState<string>('#ffffff')
    const translateY = useSharedValue(0);
    const active = useSharedValue(false);
    const data = useSharedValue(false);

    const scrollTo = useCallback((destination: number) => {
      'worklet';
      active.value = destination !== 0;

      translateY.value = withSpring(destination, { damping: 15 });
    }, []);

    const isActive = useCallback(() => {
      return active.value;
    }, []);

    const backgroundColor = useCallback((color: string) => {
      setBottomSheetBackground(color)
    }, []);

    const hasData = useCallback((val: boolean) => {
      data.value = val;
    }, []);

    const pos = useCallback(() => {
      return translateY.value;
    }, []);

    useImperativeHandle(ref, () => ({ scrollTo, isActive, hasData, pos, backgroundColor }), [
      scrollTo,
      isActive,
      hasData,
      pos,
      backgroundColor
    ]);

    
    const context = useSharedValue({ y: 0 });
    const gesture = Gesture.Pan()
      // .manualActivation(true)
      .onStart(() => {
        context.value = { y: translateY.value };
      })
      .onUpdate((event) => {
        if(data.value){
          translateY.value = event.translationY + context.value.y;
          translateY.value = Math.max(translateY.value, MAX_TRANSLATE_Y);
        }
      })
      .onEnd(() => {
        if (translateY.value > -SCREEN_HEIGHT / 3) {
          scrollTo(0);
        } else if (translateY.value < -SCREEN_HEIGHT / 3) {
          scrollTo(MAX_TRANSLATE_Y);
        }
      });

    const rBottomSheetStyle = useAnimatedStyle(() => {
      const borderRadius = interpolate(
        translateY.value,
        [MAX_TRANSLATE_Y + 100, MAX_TRANSLATE_Y],
        [25, 10],
        Extrapolate.CLAMP
      );

      return {
        borderRadius,
        transform: [{ translateY: translateY.value }],
      };
    });

    return (
      <GestureDetector gesture={gesture}>
        <Animated.View style={[styles.bottomSheetContainer, rBottomSheetStyle, { backgroundColor: bottomSheetBackground }]}>
          <View style={styles.line} />
          {children}
        </Animated.View>
      </GestureDetector>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'absolute',
    top: SCREEN_HEIGHT,
    borderRadius: 25,
  },
  line: {
    width: 75,
    height: 4,
    backgroundColor: 'grey',
    alignSelf: 'center',
    marginVertical: 15,
    borderRadius: 2,
  },
});

export default BottomSheet;