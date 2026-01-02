import React, { useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { signInWithGoogle } from '@/lib/supabase/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
      // 認証成功後、AuthProviderの onAuthStateChange が発火してルーティングが更新される
      router.replace('/(tabs)/projects');
    } catch (error) {
      console.error('[LoginScreen] Google sign-in error:', error);
      Alert.alert(
        'ログインエラー',
        error instanceof Error ? error.message : 'Googleログインに失敗しました'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white justify-center items-center px-8">
      {/* タイトル画像 */}
      <Image
        source={require('../assets/images/title.png')}
        className="w-64 h-32 mb-16"
        resizeMode="contain"
      />

      {/* Google Sign-in ボタン */}
      <Pressable
        onPress={handleGoogleSignIn}
        disabled={isLoading}
        className={`flex-row items-center justify-center bg-white border border-gray-300 rounded-lg px-6 py-3 shadow-sm ${
          isLoading ? 'opacity-50' : ''
        }`}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#4285F4" />
        ) : (
          <>
            {/* Googleロゴ */}
            <View className="w-5 h-5 mr-3">
              <Text className="text-base">🔍</Text>
            </View>
            <Text className="text-gray-700 font-semibold text-base">
              Googleでログイン
            </Text>
          </>
        )}
      </Pressable>

      {/* 説明テキスト */}
      <Text className="mt-8 text-gray-500 text-sm text-center">
        歌詞制作に特化したメモアプリ{'\n'}
        Googleアカウントでログインして始めましょう
      </Text>
    </View>
  );
}
