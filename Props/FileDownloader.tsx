import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import * as Notifications from 'expo-notifications';
import url from 'url'
import path from 'path'
import { ALERT_TYPE, Dialog, AlertNotificationRoot } from 'react-native-alert-notification';
import Toast from 'react-native-toast-message';

export const download = async (uri: string, filename: string) => {
  const notiPermissions = await Notifications.getPermissionsAsync()
  const checkPermissionStatus = await MediaLibrary.getPermissionsAsync()
  if(!notiPermissions.granted || !checkPermissionStatus.granted){
    FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()

    Dialog.show({
      type: ALERT_TYPE.WARNING,
      title: 'PERMISSIONS REQUIRED!',
      textBody: 'To be able to download, we must have access to Notifications and Storage permissions!',
      button: 'Grant Access',
      async onPressButton() {
        if(!notiPermissions.granted) await Notifications.requestPermissionsAsync()
        if(!checkPermissionStatus.granted) await MediaLibrary.requestPermissionsAsync()
        Dialog.hide()
      },
    })
  }else{

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
      `${FileSystem.documentDirectory}${filename}${path.extname(fileType.pathname || '')}`,
      {},
      async (downloadProgress: FileSystem.DownloadProgressData) => {
        
        if(downloadProgress.totalBytesWritten === downloadProgress.totalBytesExpectedToWrite){
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
    if(downloadedFile) perm(downloadedFile)
  }
}

const perm = async (downloadedFile: FileSystem.FileSystemDownloadResult) => {
  try {
      
    const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
    const album = await MediaLibrary.getAlbumAsync('Download');

    if (album == null) {
      await MediaLibrary.createAlbumAsync('Download', asset, true);
    } else {
      await MediaLibrary.addAssetsToAlbumAsync(asset, album, true);
    }

    // Delete the downloaded file after adding it to the media library.
    await FileSystem.deleteAsync(asset.uri);

    return true
  } catch (e) {
    return false
  }
}
