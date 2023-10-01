import React, { useCallback, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Modal } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetRefProps } from './Props/BottomSheet';

export default function App() {
  const [sourceImg, changeSourceImg] = useState(require('./assets/url/paste.png'))

    function reactiveInputHandler(e: string | string[]) {

        // Change icon
        if(e.includes('youtube')) changeSourceImg(require('./assets/url/youtube.png'))
        else if(e.includes('instagram')) changeSourceImg(require('./assets/url/instagram.png'))
        else if(e.includes('twitter')) changeSourceImg(require('./assets/url/twitter.png'))
        else if(e.includes('tiktok')) changeSourceImg(require('./assets/url/tiktok.png'))
        else if(e === '') changeSourceImg(require('./assets/url/paste.png'))
        else changeSourceImg(require('./assets/url/notv.png'))
    
      }

      const ref = useRef<BottomSheetRefProps>(null);

      const onPress = useCallback(() => {
        const isActive = ref?.current?.isActive();
        if (isActive) {
          ref?.current?.scrollTo(0);
        } else {
          ref?.current?.scrollTo(-200);
        }
      }, []);
  

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="light" />
        
        <View style={styles.dlMainGrapperUI}>
          <View>
            <Text style={styles.headerText}>MEGA DOWNLOAD</Text>
          </View>

          <View style={styles.inputCountainer}>
            <TextInput style={styles.urlTextInput} 
              placeholder='Insert a url' 
              placeholderTextColor={"#000000"} 
              onChangeText={reactiveInputHandler} />

            <Image style={styles.inputPlatformImage} source={sourceImg}/>
        </View>

          <TouchableOpacity style={styles.TouchableOpacityButton} onPress={() => onPress}>
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>

          <BottomSheet ref={ref}>
            <View style={{ flex: 1 }} />
          </BottomSheet>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    
  },

  // Modal

  modalBase: {
    flex: 1,
    justifyContent: "center",
    
  },

  modalView: {
    top: '15%',
    height: '75%',
    backgroundColor: "#454545",
    borderRadius: 20,
    padding: 0,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },

  modalInnerUi: {
    padding: 5,
    margin: 5,
    display: 'flex',
    flex: 1,
    
  },

  closeImageModal: {
    width: 30,
    height: 30,
    marginBottom: 10,
    left: '94%'
  },

  userProfileImage: {
    width: 50,
    height: 50,
    overflow: 'hidden',
    borderRadius: 75,
    backgroundColor: 'white',
    marginHorizontal: 20
  },

  mediaImageCoverHolder: {
    backgroundColor: 'black',
    width: 350,
    height: '40%',
    borderRadius: 10,
    overflow: 'hidden',
  },

  mediaImageCover: {
    width: '100%',
    height: '100%',
  },

  // dlMainGrapperUI
  
  dlMainGrapperUI: {
    width: '100%',
    alignItems: 'center'
  },

  // Header text

  headerText: {
    marginTop: '50%',
    color: "white",
    fontSize: 25,
    letterSpacing: 10,
    fontFamily: ''
  },

  // Input

  inputPlatformImage: {
    width: 25,
    height: 25,
    borderRadius: 5,
    padding: 17,
    margin: 2
  },

  inputCountainer: {
    width: '80%',
    maxWidth: 750,
    margin: 10,
    padding: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#454545',
    backgroundColor: '#454545',
    borderWidth: 2,
    borderRadius: 10,
    
  },

  urlTextInput: {
    flex: 1,
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    color: "#000000",
  },

  // Button

  TouchableOpacityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#068FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '50%',
    maxWidth: 500
  },

  buttonText: {
    color: 'black',
    fontSize: 17,
    paddingHorizontal: 25,
  },

});
