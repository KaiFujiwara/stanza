import React, { useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { signInWithGoogle, signInAnonymously } from '@/lib/supabase/auth';
import { toUserMessage } from '@/lib/errors';
import { AntDesign } from '@expo/vector-icons';
import Constants from 'expo-constants';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const isDevelopment = __DEV__; // React Nativeの組み込み定数
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // 認証成功後、indexにリダイレクト（AuthProviderが認証状態を判定してprojectsに遷移）
      router.replace('/');
    } catch (error) {
      const errorInfo = toUserMessage(error);
      Alert.alert('ログインエラー', errorInfo.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnonymousSignIn = async () => {
    try {
      setIsLoading(true);
      await signInAnonymously();
      // 認証成功後、indexにリダイレクト（AuthProviderが認証状態を判定してprojectsに遷移）
      router.replace('/');
    } catch (error) {
      const errorInfo = toUserMessage(error);
      Alert.alert('ログインエラー', errorInfo.userMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* タイトル画像 */}
      <Image
        source={require('../assets/images/title.png')}
        className="w-64 h-32 mb-4"
        resizeMode="contain"
      />

      {/* 説明テキスト */}
      <Text className="mb-12 text-gray-600 text-sm text-center leading-5">
        歌詞制作に特化したメモアプリ
        {isDevelopment
          ? '\n開発モード：匿名ログインで始めます'
          : '\nGoogleアカウントでログインして始めましょう'}
      </Text>

      {/* Google Sign-in ボタン（本番環境のみ） */}
      {!isDevelopment && (
        <Pressable
          onPress={handleGoogleSignIn}
          disabled={isLoading}
          className={`w-full flex-row items-center justify-center bg-white border-2 border-gray-300 rounded-full px-6 py-4 ${
            isLoading ? 'opacity-50' : 'active:bg-gray-50'
          }`}
          style={{ maxWidth: 320 }}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#4285F4" />
          ) : (
            <>
              {/* Googleロゴ */}
              <AntDesign name="google" size={22} color="#4285F4" />
              <Text className="ml-3 text-gray-900 font-semibold text-lg">
                Googleでログイン
              </Text>
            </>
          )}
        </Pressable>
      )}

      {/* 開発環境用：匿名ログインボタン */}
      {isDevelopment && (
        <Pressable
          onPress={handleAnonymousSignIn}
          disabled={isLoading}
          className={`w-full mt-4 flex-row items-center justify-center bg-gray-100 border-2 border-gray-300 rounded-full px-6 py-4 ${
            isLoading ? 'opacity-50' : 'active:bg-gray-200'
          }`}
          style={{ maxWidth: 320 }}
        >
          <Text className="text-gray-700 font-semibold text-lg">
            匿名でログイン（開発用）
          </Text>
        </Pressable>
      )}
    </View>
  );
}
