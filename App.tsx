import React, { useCallback, useEffect, useRef, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Image, Dimensions, FlatList, Keyboard, ScrollView } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetRefProps } from './Props/BottomSheet';
import Toast from 'react-native-toast-message';
import axios from 'axios'
import { APIResponseTypes } from './Types'
import { download } from './Props/FileDownloader'
import ImageSlider from './Props/ImageSlider';

export default function App() {
  const [mediaIndexing, setMediaIndexing] = useState<number>(0)
  const ref = useRef<BottomSheetRefProps>(null);
  const [url, setURL] = useState<string>('')
  const [data, setData] = useState<APIResponseTypes | null>(null)
  const [sourceImg, changeSourceImg] = useState(require('./assets/url/paste.png'))
  const screenWidth = Dimensions.get('window').width;
  const buttonWidth = Math.min(screenWidth / 1, 100);

  function reactiveInputHandler(e: string | string[]) {

    // Pop down the bottom sheet
    ref.current?.scrollTo(0);

    // Change icon
    if (e.includes('youtube') || e.includes('youtu.be')) changeSourceImg(require('./assets/url/youtube.png'))
    else if (e.includes('instagram')) changeSourceImg(require('./assets/url/instagram.png'))
    else if (e.includes('twitter')) changeSourceImg(require('./assets/url/twitter.png'))
    else if (e.includes('tiktok')) changeSourceImg(require('./assets/url/tiktok.png'))
    else if (e === '') changeSourceImg(require('./assets/url/paste.png'))
    else changeSourceImg(require('./assets/url/notv.png'))

  }

  const downloadBtn = async () => {

    if (url) {

      const urlPattern = /^(http[s]?:\/\/)(www\.)?[^\s$.?#].[^\s]*$/;
      if (urlPattern.test(url)) {

        // Request the given URL
        await axios.get(`http://192.168.52.170:8080/api/v1/dl?url=${url}`)
          .then(async res => {

            // Set the data to the state
            setData(res.data)

            // Pop up the bottom sheet
            ref.current?.hasData(true)
            ref.current?.scrollTo(-440)

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

  };

  useEffect(() => {

    if (data?.result) {

    } else {


    }
  }, [data])

  Keyboard.addListener('keyboardDidShow', () => {
    ref.current?.scrollTo(0);
  })

  if (!data) {
    ref.current?.hasData(false)
    ref.current?.scrollTo(0);
  }

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar style="light" />

        <Toast />

        <View style={styles.dlMainGrapperUI}>
          <View>
            <Text style={styles.headerText}>MEGA DOWNLOAD</Text>
          </View>

          <View style={styles.inputCountainer}>
            <TextInput style={styles.urlTextInput}
              placeholder='Paste a URL'
              placeholderTextColor={"white"}
              onChangeText={(val) => {
                reactiveInputHandler(val)
                setURL(val)
              }} />

            <Image style={styles.inputPlatformImage} source={sourceImg} />
          </View>

          <TouchableOpacity style={styles.TouchableOpacityButton} onPress={() => downloadBtn()}>
            <Text style={styles.buttonText}>Download</Text>
          </TouchableOpacity>

          <BottomSheet ref={ref}>
            {data !== null ? (
              <View style={{ flex: 1 }}>
                {/* Media Channel Icon */}
                <View style={{ flexDirection: 'row' }}>
                  <View>
                    <Image style={{ aspectRatio: 1, height: 50, borderRadius: 25, marginHorizontal: 20 }} source={{ uri: data.data.author.avatarUrl }} />
                  </View>
                  <Text style={{ fontSize: 20, marginLeft: -10, fontWeight: '500' }}>{data.data.author.username}</Text>
                  <View>
                    <Image style={{ aspectRatio: 1, height: 15, borderRadius: 25, left: 3.5, top: 6.5 }} source={require('./assets/testResponse/verified.png')} />
                  </View>
                  <View>
                    <Image style={{ aspectRatio: 1, height: 50, borderRadius: 25, alignSelf: 'flex-end', marginRight: -140 }} source={require('./assets/url/youtube.png')} />
                  </View>
                </View>

                <Text style={{ fontSize: 10, marginTop: -25, marginBottom: 20, marginLeft: 90, fontWeight: '300' }}>13.9M Subscribers   •   1.6K Videos</Text>

                <View style={styles.responseSheet}>

                  {/* Media Cover */}
                  <View style={styles.mediaHandle}>
                    <View style={styles.mediaImageHandle}>

                      {data.data.images.length ? (
                        <ImageSlider onIndexChanged={(i) => (setMediaIndexing(i))} images={data?.data.images}/>
                      ) : data.data.coverImg !== null ? (
                        <Image source={{ uri: data.data.coverImg }} style={styles.mediaImage}/>
                      ) : (
                        data?.data.video ? (
                          data?.data.video.map((i, e) => (
                            <Image source={{ uri: i.coverImg }} style={styles.mediaImage}/>
                          ))
                        ) : (
                          <Text style={{ justifyContent: 'center', textAlign: 'center', color: 'black' }}>No images has been found :/</Text>
                        )
                      )}

                    </View>

                    <Text style={{ color: 'black', marginTop: 2, fontWeight: '300', fontSize: 10 }}>
                      {data?.data.stats.map((e, index) => (
                        <Text key={index}>
                          {`${e.value} ${e.type}`} {index !== data.data.stats.length - 1 && '\t\t\t•\t\t\t'}
                        </Text>
                      ))}
                    </Text>
                  </View>

                  {/* Qualities */}
                  <Text style={{ color: 'black', marginTop: 10 }}>Choose your quality to download!</Text>
                  <View style={styles.qualitiesHandle}>

                    {data.data.images.length ? (
                      <TouchableOpacity key={mediaIndexing} style={[styles.Qualities, { width: 320 }]} onPress={() => download(data.data.images[mediaIndexing], data?.data.id)}>
                        <Text style={styles.QualitiesText}>Download Image</Text>
                      </TouchableOpacity>
                    ) : data?.data.video[mediaIndexing].qualities ? (
                      data?.data.video[mediaIndexing].qualities.map((a, index) => (
                        <TouchableOpacity key={index} style={[styles.Qualities, { width: 100 }]} onPress={() => download(a.url, data?.data.id)}>
                          <Text style={styles.QualitiesText}>{a.quality}</Text>
                        </TouchableOpacity>
                      ))
                    ) : (
                      <TouchableOpacity key={mediaIndexing} style={[styles.Qualities, { width: 320 }]} onPress={() => download(data?.data.video[mediaIndexing].url, data?.data.id)}>
                        <Text style={styles.QualitiesText}>Download Video</Text>
                      </TouchableOpacity>
                    )}

                  </View>

                  <View style={{ marginTop: 10 }}>
                    <TouchableOpacity disabled={data?.data.audio ? data?.data.audio.url === undefined || data?.data.audio.url === '' : true} onPress={() => (download(data?.data.audio.url, data?.data.audio.title))} style={{ width: 320, backgroundColor: 'lightgreen', paddingVertical: 10, borderRadius: 3, alignItems: 'center', }}>
                      <Text style={styles.QualitiesText}>Download MP3</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ) : null}
          </BottomSheet>
        </View>
      </View>
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

  mediaHandle: {
    alignItems: 'center',
  },

  mediaImageHandle: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 5,
    marginTop: 10,
    aspectRatio: 1.6,
    height: 200,
    zIndex: 5
  },

  mediaImage: {
    resizeMode: 'repeat'
  },

  qualitiesHandle: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },

  Qualities: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightblue',
    paddingVertical: 10,
    borderRadius: 3,
    marginHorizontal: 5,

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
    color: 'white',
    fontSize: 17,
    paddingHorizontal: 25,
  },
});
