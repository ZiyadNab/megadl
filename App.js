import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { Image } from 'expo-image'
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Dimensions, Keyboard } from 'react-native'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import BottomSheet, { BottomSheetRefProps } from './Props/BottomSheet'
import Toast from 'react-native-toast-message'
import axios from 'axios'
import Downloadables from './Props/FileDownloader'
import ImageSlider from './Props/ImageSlider'
import * as Clipboard from 'expo-clipboard'
import { ALERT_TYPE, Dialog, AlertNotificationRoot, IConfigDialog } from 'react-native-alert-notification'

export default function App() {
  const [clipboardString, setClipboardString] = useState('');
  const [mediaIndexing, setMediaIndexing] = useState(0);
  const bottomSheetRef = useRef(null);
  const [url, setURL] = useState('');
  const [data, setData] = useState(null);
  const [sourceImg, changeSourceImg] = useState(require('./assets/url/paste.png'));
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = Math.min(screenWidth / 1, 100);

  function reactiveInputHandler(e) {

    // Pop down the bottom sheet
    bottomSheetRef.current?.scrollTo(0)

    // Change icon
    if (e.includes('youtube') || e.includes('youtu.be')) changeSourceImg(require('./assets/url/youtube.png'))
    else if (e.includes('instagram')) changeSourceImg(require('./assets/url/instagram.png'))
    else if (e.includes('twitter')) changeSourceImg(require('./assets/url/twitter.png'))
    else if (e.includes('tiktok')) changeSourceImg(require('./assets/url/tiktok.png'))
    else if (e === '') changeSourceImg(require('./assets/url/paste.png'))
    else changeSourceImg(require('./assets/url/notv.png'))

  }

  const downloadBtn = async () => {
    Keyboard.dismiss()
    setMediaIndexing(0)

    if (url) {
      
      const urlPattern = /^(http[s]?:\/\/)(www\.)?[^\s$.?#].[^\s]*$/;
      if (urlPattern.test(url)) {

        // Request the given URL
        await axios.get(`https://fnbrmena.com/api/v1/dl?url=${url}`)
          .then(async res => {

            // Set the data to the state
            const combined = await combineImagesWithVideos(res.data)
            res.data.data.combined = combined
            setData(res.data)

            // Pop up the bottom sheet
            await bottomSheetRef.current?.hasData(true)
            await bottomSheetRef.current?.scrollTo(-450)

            Toast.show({
              type: 'success',
              text1: 'Success',
              text2: 'You may now download your media!',
              visibilityTime: 5000,
              autoHide: true
            })

          }).catch(err => {
            Toast.show({
              type: 'error',
              text1: 'Errored',
              text2: err.response.data.error ? err.response.data.error : "Please try again later since there was an error.",
              visibilityTime: 5000,
              autoHide: true
            })
          })

      } else {

        Toast.show({
          type: 'error',
          text1: 'Errored',
          text2: "The given input is not a URL, please provide a such.",
          visibilityTime: 5000,
          autoHide: true
        })
      }
    } else {

      Toast.show({
        type: 'info',
        text1: 'You left something',
        text2: "You left the input field empty, please enter a URL.",
        visibilityTime: 5000,
        autoHide: true
      })
    }

  }

  async function RHSIconPlatform() {
    if (clipboardString === '') {
      const clipboardText = await Clipboard.getStringAsync()
      setClipboardString(clipboardText)
      reactiveInputHandler(clipboardText)
      setURL(clipboardText)

    } else {
      setClipboardString('')
      reactiveInputHandler('')
      setURL('')
    }
  }

  async function combineImagesWithVideos(data) {
    let combinedMedia = [];

    if (data.data.video.length > 0) {
      const videoCoverImgs = data.data.video.map(videoObj => {
        return { ...videoObj, isVideo: true };
      })
      combinedMedia = combinedMedia.concat(videoCoverImgs);
    }

    if (data.data.images.length > 0) {
      const standaloneImages = data.data.images.map((url) => ({
        coverImg: url,
        isVideo: false,
      }))
      combinedMedia = combinedMedia.concat(standaloneImages);
    }

    return combinedMedia
  }

  useEffect(() => {

    if (data?.result) {

    } else {


    }
  }, [data])

  Keyboard.addListener('keyboardDidShow', () => {
    bottomSheetRef.current?.scrollTo(0);
  })

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <AlertNotificationRoot>
        <View style={styles.container}>
          <StatusBar style="light" />

          <Toast />

          <View style={styles.dlMainGrapperUI}>

            <Text style={[styles.headerText, { marginTop: 150, alignItems: 'center' }]}>MEGA DOWNLOAD</Text>

            <View style={styles.inputCountainer}>
              <TextInput style={styles.urlTextInput}
                placeholder='Paste a URL'
                value={clipboardString}
                placeholderTextColor={"white"}
                onChangeText={(val) => {
                  reactiveInputHandler(val)
                  setURL(val)
                  setClipboardString(val)

                }} />

              <TouchableOpacity onPress={RHSIconPlatform}>
                <Image style={styles.inputPlatformImage} source={sourceImg} />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row' }}>
              <TouchableOpacity style={styles.DownlaodTouchableOpacityButton} onPress={() => downloadBtn()}>
                <Text style={styles.buttonText}>Download</Text>
              </TouchableOpacity>

              {/* <TouchableOpacity style={styles.AppIconTouchableOpacityButton}>
                <Image source={require('./assets/gear.png')} style={{width: 25, height: 25}}/>
              </TouchableOpacity> */}
            </View>

            <BottomSheet ref={bottomSheetRef}>
              {data !== null ? (
                <View style={{ flex: 1 }}>

                  <View style={styles.responseSheet}>

                    {/* Media Cover */}
                    <View style={styles.mediaImageHandle}>
                      <ImageSlider images={data.data.combined} onIndexChanged={(index) => setMediaIndexing(index)} />
                    </View>

                    <Text style={{ color: 'black', marginTop: 10, fontWeight: '300', fontSize: 10 }}>
                      {data?.data.stats.map((e, index) => (
                        <Text key={index}>
                          {`${e.value} ${e.type}`} {index !== data.data.stats.length - 1 && '\t\t\t•\t\t\t'}
                        </Text>
                      ))}
                    </Text>

                    {/* Qualities */}
                    <Text style={{ color: 'black', marginTop: 10 }}>Choose your quality to download!</Text>
                    <Downloadables data={data} mediaIndexing={mediaIndexing}/> 

                  </View>
                </View>
              ) : null}
            </BottomSheet>
          </View>
        </View>
      </AlertNotificationRoot>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',

  },

  // Modal

  responseSheet: {
    alignItems: 'center',
  },

  mediaImageHandle: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 5,
    marginTop: 10,
    aspectRatio: 1.6,
    height: 225,
    resizeMode: 'cover',
    marginBottom: 2,
    shadowOffset: { width: 10, height: 10 },
    shadowColor: 'black',
    shadowOpacity: 1,
    elevation: 10,
    backgroundColor: "#0000",

  },

  mediaImage: {
    resizeMode: 'cover',
    width: '100%',
    height: '100%'
  },

  QualitiesText: {
    color: 'white',
    fontSize: 17,
    paddingHorizontal: 25,
  },

  // dlMainGrapperUI

  dlMainGrapperUI: {
    width: '100%',
    alignItems: 'center'
  },

  // Header text

  headerText: {
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
    borderWidth: 5,
    borderRadius: 10,
  },

  urlTextInput: {
    flex: 1,
    width: '100%',
    height: 40,
    paddingHorizontal: 10,
    color: "white",
  },

  // Button

  DownlaodTouchableOpacityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#068FFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    width: '50%',
    marginRight: 5,
    maxWidth: 500
  },

  AppIconTouchableOpacityButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#474747',
    borderRadius: 10,
    width: '12%',
    maxWidth: 500
  },

  buttonText: {
    color: 'white',
    fontSize: 17,
    paddingHorizontal: 25,
  },
});
