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
        combined: [
            {
                url: string,
                coverImg: string,
                isVideo: boolean,
                qualities: [
                    {
                        url: string,
                        quality: string
                    }
                ]
            }
        ],
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