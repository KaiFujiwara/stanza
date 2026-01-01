import { ScreenHeader } from "@/components/shared/ScreenHeader";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VersionScreen() {
  const router = useRouter();
  const appName = Constants.expoConfig?.extra?.appName || "Stanza";
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <ScreenHeader title="バージョン情報" showBackButton onBackPress={() => router.back()} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6">
          {/* アプリアイコン */}
          <View className="items-center mb-8">
            <Image
              source={require("../../../assets/images/icon.png")}
              className="w-24 h-24 rounded-3xl mb-4"
              resizeMode="cover"
            />
            <Text className="text-2xl font-bold text-gray-900 mb-1">{appName}</Text>
            <Text className="text-base text-gray-500">歌詞制作をサポート</Text>
          </View>

          {/* バージョン情報 */}
          <View className="bg-gray-50 rounded-lg p-4 mb-6">
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium text-gray-600">バージョン</Text>
              <Text className="text-sm font-bold text-gray-900">{appVersion}</Text>
            </View>
          </View>

          {/* フッター */}
          <View className="mt-8 items-center">
            <Text className="text-xs text-gray-400">
              © {appName}. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
