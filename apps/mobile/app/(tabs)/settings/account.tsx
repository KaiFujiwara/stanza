import { deleteAccountUseCase } from "@/application/usecases";
import { ScreenHeader } from "@/components/shared/ScreenHeader";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AccountScreen() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

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
        title="アカウント連携"
        showBackButton
        onBackPress={() => router.back()}
      />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
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
