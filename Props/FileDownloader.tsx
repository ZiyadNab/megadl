import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import * as Notifications from 'expo-notifications';

const sendNotification = async (message: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Download Status',
      body: message,
    },
    trigger: null, // Send immediately
  })
};

const callback = (downloadProgress: FileSystem.DownloadProgressData) => {
  
  const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
  sendNotification(`Downloading ${Math.round(progress * 100)}%`);
};

export const download = async (uri: string, filename: string) => {
  await Notifications.requestPermissionsAsync()
  console.log(uri)

  const splitUrl = uri.split('.');
  const fileExtension = splitUrl[splitUrl.length - 1];
  
  const downloadResumable = FileSystem.createDownloadResumable(
    uri,
    `${FileSystem.documentDirectory}${filename}.jpeg`,
    {},
    callback
  );

  const downloadedFile: FileSystem.FileSystemDownloadResult | undefined = await downloadResumable.downloadAsync();
  if(downloadedFile) perm(downloadedFile)
}

const perm = async (downloadedFile: FileSystem.FileSystemDownloadResult) => {
  const checkPermissionStatus = await MediaLibrary.getPermissionsAsync()
  if(checkPermissionStatus.granted){
    try {
      
      const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
      const album = await MediaLibrary.getAlbumAsync('Download');
      if (album == null) {
        await MediaLibrary.createAlbumAsync('Download', asset, false);
      } else {
        await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
      }

      return true
    } catch (e) {
      return false
    }
  }else{
    MediaLibrary.requestPermissionsAsync()
    .then(async p => {
      if(p.granted){
        
        try {
          const asset = await MediaLibrary.createAssetAsync(downloadedFile.uri);
          const album = await MediaLibrary.getAlbumAsync('Download');
          if (album == null) {
            await MediaLibrary.createAlbumAsync('Download', asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
          }
    
          return true
        } catch (e) {
          return false
        }

      }else{
        
      }
    })
  }
}
