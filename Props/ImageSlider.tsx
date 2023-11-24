import React, { useState, useEffect } from 'react';
import { View, Image, Dimensions, Animated, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler'

interface imagesResponse {
  coverImg: string,
  isVideo: boolean
}

interface ImageSliderProps {
  images: imagesResponse[]; // Array of image URLs
  onIndexChanged: (index: number) => void;
}

const { width } = Dimensions.get('window');

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onIndexChanged }) => {
  let scrollX = new Animated.Value(0)

  let position = Animated.divide(scrollX, width);

  const [currentIndex, setCurrentIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const scrollViewWidth = event.nativeEvent.layoutMeasurement.width;
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / scrollViewWidth);
    setCurrentIndex(index);

    Animated.event(
      [{ nativeEvent: { contentOffset: { x: scrollX } } }],
      {useNativeDriver: false}
    )
  }

  useEffect(() => {
    onIndexChanged(currentIndex)
  }, [currentIndex])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View
      
        style={styles.image}
        >
        <ScrollView
          horizontal={true}
          pagingEnabled={true}
          showsHorizontalScrollIndicator={false}
          
          onScroll={onScroll}
          scrollEventThrottle={16}
          >
          {images.map((obj, i) => {
            return (
              <Image
                key={i}
                style={styles.image}
                source={{ uri: obj.coverImg }}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {},
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 5,
    marginTop: 10,
  },
  image: {
    aspectRatio: 1.6,
    height: 225,
    resizeMode: 'cover',
  },
});

export default ImageSlider;

