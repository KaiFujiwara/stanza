import { deleteAccountUseCase, linkAppleAccountUseCase, linkGoogleAccountUseCase } from "@/application/usecases";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { MaterialIcons, AntDesign } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase/client";
import { toUserMessage } from "@/lib/errors";

export default function AccountScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [connectedProviders, setConnectedProviders] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLinkingApple, setIsLinkingApple] = useState(false);
  const [isLinkingGoogle, setIsLinkingGoogle] = useState(false);

  useEffect(() => {
    loadUserIdentities();
  }, []);

  const loadUserIdentities = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        setConnectedProviders([]);
        return;
      }

      // ユーザーの認証プロバイダーを取得
      const providers = user.identities?.map(identity => identity.provider) || [];
      setConnectedProviders(providers);
    } catch (error) {
      console.error('Failed to load user identities:', error);
      setConnectedProviders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLinkApple = async () => {
    if (connectedProviders.includes('apple')) {
      Alert.alert("既に連携済み", "Appleアカウントは既に連携されています。");
      return;
    }

    try {
      setIsLinkingApple(true);
      await linkAppleAccountUseCase.execute();
      // リンク成功 - プロバイダー情報を再読み込み
      await loadUserIdentities();
      Alert.alert("連携成功", "Appleアカウントを連携しました。");
    } catch (error) {
      console.error('[AccountScreen] Apple linking error:', error);
      const errorInfo = toUserMessage(error);
      Alert.alert("連携エラー", errorInfo.userMessage);
    } finally {
      setIsLinkingApple(false);
    }
  };

  const handleLinkGoogle = async () => {
    if (connectedProviders.includes('google')) {
      Alert.alert("既に連携済み", "Googleアカウントは既に連携されています。");
      return;
    }

    try {
      setIsLinkingGoogle(true);
      await linkGoogleAccountUseCase.execute();
      // リンク成功 - プロバイダー情報を再読み込み
      await loadUserIdentities();
      Alert.alert("連携成功", "Googleアカウントを連携しました。");
    } catch (error) {
      console.error('[AccountScreen] Google linking error:', error);
      const errorInfo = toUserMessage(error);
      Alert.alert("連携エラー", errorInfo.userMessage);
    } finally {
      setIsLinkingGoogle(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "アカウントを削除",
      "本当にアカウントを削除しますか？\n\nこの操作は取り消せません。すべてのデータ（プロジェクト、フレーズ、タグなど）が完全に削除されます。",
      [
        {
          text: "キャンセル",
          style: "cancel",
        },
        {
          text: "削除する",
          style: "destructive",
          onPress: async () => {
            // 二重確認
            Alert.alert(
              "最終確認",
              "本当によろしいですか？この操作は取り消せません。",
              [
                {
                  text: "キャンセル",
                  style: "cancel",
                },
                {
                  text: "削除する",
                  style: "destructive",
                  onPress: async () => {
                    try {
                      setIsDeleting(true);
                      await deleteAccountUseCase.execute();
                      // 削除成功 - ログイン画面に強制遷移
                      router.replace('/login');
                    } catch (error) {
                      setIsDeleting(false);
                      Alert.alert(
                        "エラー",
                        "アカウントの削除に失敗しました。しばらく経ってから再度お試しください。",
                        [{ text: "OK" }]
                      );
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader
        title="アカウント"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* 連携中のアカウント */}
          <View className="mb-8">
            <Text className="text-base font-bold text-gray-900 mb-3">連携アカウント</Text>

            {isLoading ? (
              <View className="bg-white rounded-lg border border-gray-200 p-4 items-center">
                <ActivityIndicator size="small" color="#6B7280" />
              </View>
            ) : (
              <View>
                {/* Apple */}
                <TouchableOpacity
                  onPress={handleLinkApple}
                  disabled={connectedProviders.includes('apple') || isLinkingApple}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center mb-3"
                  activeOpacity={connectedProviders.includes('apple') ? 1 : 0.6}
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                    connectedProviders.includes('apple') ? 'bg-black' : 'bg-gray-100'
                  }`}>
                    {isLinkingApple ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <AntDesign
                        name="apple"
                        size={24}
                        color={connectedProviders.includes('apple') ? '#FFFFFF' : '#9CA3AF'}
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Apple</Text>
                    <Text className={`text-sm ${
                      connectedProviders.includes('apple') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {connectedProviders.includes('apple') ? '連携済み' : '未連携'}
                    </Text>
                  </View>
                  {connectedProviders.includes('apple') ? (
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  ) : (
                    <MaterialIcons name="add-circle-outline" size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>

                {/* Google */}
                <TouchableOpacity
                  onPress={handleLinkGoogle}
                  disabled={connectedProviders.includes('google') || isLinkingGoogle}
                  className="bg-white rounded-lg border border-gray-200 p-4 flex-row items-center"
                  activeOpacity={connectedProviders.includes('google') ? 1 : 0.6}
                >
                  <View className={`w-12 h-12 rounded-full items-center justify-center mr-3 ${
                    connectedProviders.includes('google') ? 'bg-white border-2 border-gray-200' : 'bg-gray-100'
                  }`}>
                    {isLinkingGoogle ? (
                      <ActivityIndicator size="small" color="#4285F4" />
                    ) : (
                      <AntDesign
                        name="google"
                        size={24}
                        color={connectedProviders.includes('google') ? '#4285F4' : '#9CA3AF'}
                      />
                    )}
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">Google</Text>
                    <Text className={`text-sm ${
                      connectedProviders.includes('google') ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {connectedProviders.includes('google') ? '連携済み' : '未連携'}
                    </Text>
                  </View>
                  {connectedProviders.includes('google') ? (
                    <MaterialIcons name="check-circle" size={24} color="#10B981" />
                  ) : (
                    <MaterialIcons name="add-circle-outline" size={24} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* アカウント削除 */}
          <View>
            <Text className="text-base font-bold text-gray-900 mb-3">アカウント管理</Text>
            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-white rounded-lg border-2 border-red-200 p-4 flex-row items-center"
              activeOpacity={0.6}
            >
              <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mr-3">
                {isDeleting ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <MaterialIcons name="delete-forever" size={28} color="#EF4444" />
                )}
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold text-gray-900 mb-1">
                  アカウントを削除
                </Text>
                <Text className="text-sm text-gray-600">
                  すべてのデータが削除されます
                </Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
            </TouchableOpacity>
            <View className="mt-3 bg-red-50 rounded-lg p-3 border border-red-200">
              <Text className="text-xs text-red-700 leading-5">
                ⚠️ アカウントを削除すると、すべてのプロジェクト、フレーズ、タグなどのデータが完全に削除されます。この操作は取り消せません。
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
