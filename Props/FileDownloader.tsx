import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import React, { useState, useRef, useCallback, useEffect, useImperativeHandle } from 'react';
import * as Notifications from 'expo-notifications';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import url from 'url'
import path from 'path'
import { APIResponseTypes } from '../Types/index'
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';
import Toast from 'react-native-toast-message';
import Progress from './ProgressBar'

interface ProgressRef {
  startProgress: (value: number) => void;
}

interface DownloadablesProps {
  data: APIResponseTypes;
  mediaIndexing: number;
}

const Downloadables: React.FC<DownloadablesProps> = ({ data, mediaIndexing }) => {

  const progressRef = useRef<ProgressRef | null>(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const download = async (uri: string, filename: string) => {
    setIsDownloading(true)
    const notificationPermissions = await Notifications.getPermissionsAsync()
    const mediaLibraryPermission = await MediaLibrary.getPermissionsAsync()
    if (!notificationPermissions.granted || !mediaLibraryPermission.granted) {

      Dialog.show({
        type: ALERT_TYPE.WARNING,
        title: 'PERMISSIONS REQUIRED!',
        textBody: 'To be able to download, we must have access to Notifications and Storage permissions!',
        button: 'Grant Access',
        async onPressButton() {
          if (!notificationPermissions.granted) await Notifications.requestPermissionsAsync()
          if (!mediaLibraryPermission.granted) await MediaLibrary.requestPermissionsAsync()
          Dialog.hide()
        },
      })
    } else {

      Toast.show({
        type: 'info',
        text1: 'DOWNLOADING!',
        text2: "Your media in now being downloaded.",
        visibilityTime: 1500,
        autoHide: true
      })

      const fileType = url.parse(uri)
      const downloadResumable = FileSystem.createDownloadResumable(
        uri,
        `${FileSystem.cacheDirectory}${filename}${path.extname(fileType.pathname || '')}`,
        {},
        async (downloadProgress: FileSystem.DownloadProgressData) => {
          progressRef.current?.startProgress((downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite) * 100)

          if (downloadProgress.totalBytesWritten === downloadProgress.totalBytesExpectedToWrite) {
            setIsDownloading(false)
            Toast.hide()
            Toast.show({
              type: 'success',
              text1: 'DOWNLOADED!',
              text2: "Your media has been downloaded.",
              visibilityTime: 5000,
              autoHide: true
            })
          }
        }
      );

      const downloadedFile: FileSystem.FileSystemDownloadResult | undefined = await downloadResumable.downloadAsync();
      if (downloadedFile) perm(downloadedFile)
    }
  }

  const perm = async (downloadedFile: FileSystem.FileSystemDownloadResult) => {
    try {

      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      // const album = await MediaLibrary.getAlbumAsync('megadl');

      // if (album == null) {
      //   await MediaLibrary.createAlbumAsync('megadl', asset, false);
      // } else {
      //   await MediaLibrary.addAssetsToAlbumAsync(asset, album, false);
      // }

      // Delete cached file
      await FileSystem.deleteAsync(downloadedFile.uri)

    } catch (e) {
      console.log(e)
    }
  }

  return (
    <View>
      <View style={styles.qualitiesHandle}>
        {data.data.combined[mediaIndexing] && (
          <>
            {data.data.combined[mediaIndexing].isVideo &&
              data.data.combined[mediaIndexing].qualities ? (
              data.data.combined[mediaIndexing].qualities.map((a, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.Qualities, { width: 100 }]}
                  onPress={() => download(a.url, data.data.id)}
                  disabled={isDownloading}
                >
                  <Text style={styles.QualitiesText}>{a.quality}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <TouchableOpacity
                style={[styles.Qualities, { width: 320 }]}
                onPress={() => download(
                  data.data.combined[mediaIndexing].isVideo
                    ? data?.data.combined[mediaIndexing].url
                    : data.data.combined[mediaIndexing].coverImg,
                  data.data.id
                )}
                disabled={isDownloading}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.QualitiesText}>
                    {data.data.combined[mediaIndexing].isVideo ? 'Download Video' : 'Download Image'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <View style={{ width: 320, marginHorizontal: 5, paddingVertical: 5 }}>
        <TouchableOpacity disabled={isDownloading ? true : data?.data.audio ? data?.data.audio.url === undefined || data?.data.audio.url === '' : true} onPress={() => (download(data?.data.audio.url, data?.data.audio.title))} style={{ width: 320, backgroundColor: '#9798FC', paddingVertical: 10, borderRadius: 3, alignItems: 'center', }}>
          <Text style={styles.QualitiesText}>Download MP3</Text>
        </TouchableOpacity>

        <View style={{ paddingVertical: 5 }}>
          <Progress ref={progressRef} height={20} />
        </View>
      </View>


    </View>
  );
}

const styles = StyleSheet.create({

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

});

export default Downloadables;