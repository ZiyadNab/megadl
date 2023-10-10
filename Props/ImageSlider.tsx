import React, { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import Swiper from 'react-native-swiper';

interface ImageSliderProps {
  images: string[]; // Array of image URLs
  onIndexChanged: (index: number) => void;
}

const ImageSlider: React.FC<ImageSliderProps> = ({ images, onIndexChanged }) => {
  return (
    <Swiper style={styles.wrapper} onIndexChanged={onIndexChanged} showsButtons={false}>
      {images.map((image, index) => (
        <View style={styles.slide} key={index}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>
      ))}
    </Swiper>
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
    height: 200,
    resizeMode: 'cover',
  },
});

export default ImageSlider;
