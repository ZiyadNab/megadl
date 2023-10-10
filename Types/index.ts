import React from 'react';
import {
    StyleProp,
    TextProps,
    TextStyle,
    TouchableOpacityProps,
    ViewProps,
    ViewStyle
} from 'react-native';
  
export type APIResponseTypes = {
    result: Boolean,
    data: {
        id: string,
        title: string,
        stats: [
            {
                type: string,
                value: number
            }
        ],
        coverImg: string,
        video: [
            {
                url: string,
                coverImg: string,
                qualities: [
                    {
                        url: string,
                        quality: string
                    }
                ]
            }
        ],
        images: [],
        audio: {
            title: string,
            url: string,
            author: string,
            duration: number
        },
        author: {
            userId: string,
            username: string,
            avatarUrl: string
        }
    }
    
}